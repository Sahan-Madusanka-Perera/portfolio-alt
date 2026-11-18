// The particle portrait, in raw WebGL2: one draw call, every motion in the vertex shader.
// Three.js would cost the first viewport ~150 KB of script to parse on a phone; this is ~5 KB.
//
// What the shader does to each point, in order:
//   assemble  points fly in from a scattered cloud, staggered by a per-point random delay
//   breathe   a slow sub-millimetre drift so the figure is never quite still
//   part      the pointer (or the visitor's hand) pushes points aside like sand, lighting them
//   dissolve  scrolling away lifts the figure off as drifting dust

import type { PortraitData } from "./data";

export type PortraitTheme = { ink: [number, number, number]; accent: [number, number, number]; additive: boolean };

const VERT = /* glsl */ `#version 300 es
precision highp float;
layout(location = 0) in vec3 aPos;
layout(location = 1) in float aLum;

uniform mat4 uMVP;
uniform float uTime;
uniform float uAssemble;
uniform vec3 uPointer;   // xy in model space, z = strength 0..1
uniform float uScroll;
uniform float uSize;
uniform float uDpr;
uniform float uDepth;

out float vLum;
out float vAlpha;
out float vGlow;

vec3 hash3(float n) {
  return fract(sin(vec3(n, n + 1.0, n + 2.0) * vec3(43758.5453, 22578.1459, 19642.3490)));
}

void main() {
  vec3 r = hash3(float(gl_VertexID) * 0.1031);
  vec3 p = vec3(aPos.xy, aPos.z * uDepth);

  // Assemble: from a shell around the figure, each point on its own clock.
  vec3 dir = normalize(r * 2.0 - 1.0 + 1e-4);
  vec3 from = p * 0.35 + dir * (1.4 + r.z * 1.2);
  float t = clamp((uAssemble - r.x * 0.45) / 0.55, 0.0, 1.0);
  float e = 1.0 - pow(1.0 - t, 4.0);
  p = mix(from, p, e);

  // Breathe.
  float ph = r.y * 6.2831;
  p += 0.0045 * vec3(sin(uTime * 0.7 + ph), cos(uTime * 0.53 + ph * 1.3), sin(uTime * 0.41 + ph * 0.7));

  // Part like sand around the pointer.
  vec2 d = p.xy - uPointer.xy;
  float dist2 = dot(d, d);
  float f = exp(-dist2 / 0.0065) * uPointer.z * e;
  p.xy += normalize(d + 1e-5) * f * (0.05 + r.z * 0.035);
  p.z += f * 0.1;

  // Dissolve upwards as the hero scrolls away; the lower body goes first.
  float start = r.x * 0.5 + (1.0 - (aPos.y * 0.5 + 0.5)) * -0.2;
  float s = smoothstep(start, start + 0.45, uScroll);
  p += vec3((r.y - 0.5) * 0.9, 0.55 + r.z * 0.9, (r.x - 0.5) * 0.8) * s * s;

  gl_Position = uMVP * vec4(p, 1.0);
  float size = uSize * uDpr * (0.65 + 0.55 * aLum) * (1.0 + f * 0.8);
  gl_PointSize = size / gl_Position.w;

  vLum = aLum;
  vAlpha = e * (1.0 - s);
  vGlow = f;
}`;

const FRAG = /* glsl */ `#version 300 es
precision mediump float;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uAdditive;
uniform float uGain;
in float vLum;
in float vAlpha;
in float vGlow;
out vec4 outColor;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float disc = smoothstep(0.5, 0.12, d);
  if (disc <= 0.0) discard;
  vec3 color = mix(uInk, uAccent, clamp(vGlow * 1.2, 0.0, 0.8));
  // Dark page: bright points add light. Light page: dark ink where the photo is dark.
  float tone = mix(1.0 - vLum, vLum, uAdditive);
  float a = disc * vAlpha * (0.1 + 0.9 * tone) * uGain;
  a = max(a, disc * vAlpha * vGlow * 0.55);
  outColor = vec4(color * a, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`shader: ${log}`);
  }
  return shader;
}

// --- minimal column-major mat4 ---
type M4 = Float32Array;
const perspective = (fovy: number, aspect: number, near: number, far: number): M4 => {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
};
const multiply = (a: M4, b: M4): M4 => {
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + r] * b[c * 4 + k];
      out[c * 4 + r] = sum;
    }
  return out;
};
const modelMatrix = (scale: number, rx: number, ry: number, tz: number, ty: number): M4 => {
  const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
  // R = Ry * Rx, then scale, then translate.
  return new Float32Array([
    cy * scale, 0, -sy * scale, 0,
    sy * sx * scale, cx * scale, cy * sx * scale, 0,
    sy * cx * scale, -sx * scale, cy * cx * scale, 0,
    0, ty, tz, 1,
  ]);
};

const CAMERA_Z = 3.2;
const FOV = (30 * Math.PI) / 180;
const HALF = CAMERA_Z * Math.tan(FOV / 2);

export class PortraitGL {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private buffers: WebGLBuffer[] = [];
  private u: Record<string, WebGLUniformLocation | null> = {};
  private count: number;
  private frame = 0;
  private running = false;
  private start = performance.now();
  private assembleFrom = performance.now();
  private width = 1;
  private height = 1;
  private dpr = 1;
  private scale = 1;
  private offsetY = 0;
  // Smoothed state
  private tilt = { x: 0, y: 0 };
  private pointer = { x: 9, y: 9, z: 0 };
  private target = { x: 9, y: 9, z: 0, tx: 0, ty: 0 };
  private scroll = 0;
  private theme: PortraitTheme;
  private assembleMs: number;
  private reduced: boolean;
  private lastPointerAt = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    data: PortraitData,
    opts: { theme: PortraitTheme; assembleMs?: number; reduced?: boolean },
  ) {
    const gl = canvas.getContext("webgl2", { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: "high-performance" });
    if (!gl) throw new Error("no webgl2");
    this.gl = gl;
    this.theme = opts.theme;
    this.assembleMs = opts.assembleMs ?? 2200;
    this.reduced = Boolean(opts.reduced);
    this.count = data.count;

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`link: ${gl.getProgramInfoLog(program)}`);
    this.program = program;
    for (const name of ["uMVP", "uTime", "uAssemble", "uPointer", "uScroll", "uSize", "uDpr", "uDepth", "uInk", "uAccent", "uAdditive", "uGain"]) {
      this.u[name] = gl.getUniformLocation(program, name);
    }

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    const pos = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.SHORT, true, 0, 0);
    const lum = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, lum);
    gl.bufferData(gl.ARRAY_BUFFER, data.lum, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 1, gl.UNSIGNED_BYTE, true, 0, 0);
    gl.bindVertexArray(null);
    this.buffers = [pos, lum];
    if (this.reduced) this.assembleFrom = -1e9;
  }

  /** Canvas size in CSS pixels; DPR is capped at 2. */
  resize(width: number, height: number, dpr: number) {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.dpr = Math.min(dpr, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    const aspect = this.width / this.height;
    // Model spans x in [-0.75, 0.75], y in [-1, 1]. Fit with a little air.
    this.scale = Math.min(HALF * 0.96, (HALF * aspect * 0.96) / 0.75);
    this.offsetY = -HALF * 0.02;
    this.kick();
  }

  setTheme(theme: PortraitTheme) {
    this.theme = theme;
    this.kick();
  }

  /** Pointer in canvas NDC (-1..1, y up). Strength 0 hides the parting. */
  setPointer(ndcX: number, ndcY: number, strength = 1) {
    const aspect = this.width / this.height;
    this.target.x = (ndcX * HALF * aspect) / this.scale;
    this.target.y = (ndcY * HALF - this.offsetY) / this.scale;
    this.target.z = strength;
    this.target.tx = Math.max(-1, Math.min(1, ndcY)) * -0.12;
    this.target.ty = Math.max(-1, Math.min(1, ndcX)) * 0.22;
    this.lastPointerAt = performance.now();
    this.kick();
  }

  releasePointer() {
    this.target.z = 0;
    this.target.tx = 0;
    this.target.ty = 0;
    this.kick();
  }

  /** 0 while the hero fills the screen, 1 once it has scrolled away. */
  setScroll(progress: number) {
    this.scroll = Math.max(0, Math.min(1, progress));
    this.kick();
  }

  /** Restart the assemble animation (used when the loader leaves). */
  assemble(delayMs = 0) {
    if (this.reduced) return;
    this.assembleFrom = performance.now() + delayMs;
    this.kick();
  }

  play() {
    if (this.running) return;
    this.running = true;
    this.frame = requestAnimationFrame(this.tick);
  }

  pause() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  private kick() {
    if (this.reduced) this.draw(performance.now());
  }

  private tick = (now: number) => {
    if (!this.running) return;
    this.draw(now);
    this.frame = requestAnimationFrame(this.tick);
  };

  private draw(now: number) {
    const gl = this.gl;
    const k = this.reduced ? 1 : 0.08;
    // Without input for a while, the tilt drifts slowly back to centre.
    if (now - this.lastPointerAt > 2500) {
      this.target.tx *= 0.98;
      this.target.ty *= 0.98;
    }
    this.pointer.x += (this.target.x - this.pointer.x) * (this.reduced ? 1 : 0.18);
    this.pointer.y += (this.target.y - this.pointer.y) * (this.reduced ? 1 : 0.18);
    this.pointer.z += (this.target.z - this.pointer.z) * (this.reduced ? 1 : 0.1);
    this.tilt.x += (this.target.tx - this.tilt.x) * k * 0.6;
    this.tilt.y += (this.target.ty - this.tilt.y) * k * 0.6;

    const assemble = Math.max(0, Math.min(1, (now - this.assembleFrom) / this.assembleMs));
    const proj = perspective(FOV, this.width / this.height, 0.1, 20);
    const model = modelMatrix(this.scale, this.tilt.x, this.tilt.y, -CAMERA_Z, this.offsetY);
    const mvp = multiply(proj, model);

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.enable(gl.BLEND);
    if (this.theme.additive) gl.blendFunc(gl.ONE, gl.ONE);
    else gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // Point size scales with how much screen a model unit covers, so density looks the same
    // on a phone and a 27-inch screen.
    const pxPerUnit = (this.height / (2 * HALF)) * this.scale;
    const base = Math.max(1.4, Math.min(3.4, pxPerUnit / 190)) * CAMERA_Z * Math.sqrt(48000 / this.count);

    gl.uniformMatrix4fv(this.u.uMVP, false, mvp);
    gl.uniform1f(this.u.uTime, this.reduced ? 0 : (now - this.start) / 1000);
    gl.uniform1f(this.u.uAssemble, assemble);
    gl.uniform3f(this.u.uPointer, this.pointer.x, this.pointer.y, this.reduced ? 0 : this.pointer.z);
    gl.uniform1f(this.u.uScroll, this.reduced ? 0 : this.scroll);
    gl.uniform1f(this.u.uSize, base);
    gl.uniform1f(this.u.uDpr, this.dpr);
    gl.uniform1f(this.u.uDepth, 0.38);
    gl.uniform3fv(this.u.uInk, this.theme.ink);
    gl.uniform3fv(this.u.uAccent, this.theme.accent);
    gl.uniform1f(this.u.uAdditive, this.theme.additive ? 1 : 0);
    gl.uniform1f(this.u.uGain, this.theme.additive ? 0.62 : 0.9);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.POINTS, 0, this.count);
    gl.bindVertexArray(null);
  }

  destroy() {
    this.pause();
    const gl = this.gl;
    this.buffers.forEach((b) => gl.deleteBuffer(b));
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.program);
  }
}
