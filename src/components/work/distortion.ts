// One WebGL context for every work card. On hover the canvas moves into the card's media frame,
// draws that card's image and bends it around the pointer: a soft lens, a ripple that follows
// the pointer's speed, and a slight colour split along the direction of travel. When the pointer
// leaves, the effect eases out and the canvas hides, leaving the plain <img> underneath.

const VERT = `#version 300 es
in vec2 aPos;
out vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;        // canvas size, px
uniform vec2 uImg;        // image size, px
uniform vec2 uPointer;    // 0..1, y up
uniform vec2 uVel;        // pointer velocity, uv per frame
uniform float uHover;     // 0..1
uniform float uTime;
uniform float uRadius;    // corner radius, px
in vec2 vUv;
out vec4 outColor;

vec2 cover(vec2 uv) {
  float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
  vec2 scale = rs < ri ? vec2(rs / ri, 1.0) : vec2(1.0, ri / rs);
  return (uv - 0.5) * scale + 0.5;
}

float roundedBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 uv = vUv;
  vec2 aspect = vec2(uRes.x / uRes.y, 1.0);
  vec2 d = (uv - uPointer) * aspect;
  float dist = length(d);
  float lens = exp(-dist * dist / 0.05) * uHover;
  // Gentle zoom overall, stronger magnification under the pointer.
  uv = mix(uv, uPointer, lens * 0.12);
  uv = (uv - 0.5) * (1.0 - 0.035 * uHover) + 0.5;
  float speed = clamp(length(uVel) * 60.0, 0.0, 1.0);
  uv += normalize(d + 1e-5) / aspect * sin(dist * 34.0 - uTime * 5.0) * 0.004 * lens * (0.4 + speed);
  vec2 split = uVel * 2.4 * uHover;
  vec2 cuv = cover(uv);
  float r = texture(uTex, cover(uv + split)).r;
  vec4 g = texture(uTex, cuv);
  float b = texture(uTex, cover(uv - split)).b;
  vec4 color = vec4(r, g.g, b, 1.0);
  // Clip to the frame's rounded corners, antialiased.
  vec2 px = vUv * uRes;
  float sd = roundedBox(px - uRes * 0.5, uRes * 0.5, uRadius);
  float alpha = 1.0 - smoothstep(-1.0, 0.5, sd);
  outColor = color * alpha;
}`;

type Target = { host: HTMLElement; src: string; radius: number };

export class CardDistortion {
  private canvas = document.createElement("canvas");
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private tex: WebGLTexture;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private images = new Map<string, Promise<HTMLImageElement>>();
  private target: Target | null = null;
  private loadedSrc = "";
  private imgSize = [1, 1];
  private hover = 0;
  private hoverTo = 0;
  private pointer = [0.5, 0.5];
  private pointerTo = [0.5, 0.5];
  private vel = [0, 0];
  private frame = 0;
  private running = false;
  private start = performance.now();

  constructor() {
    const gl = this.canvas.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) throw new Error("no webgl2");
    this.gl = gl;
    Object.assign(this.canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      pointerEvents: "none",
      opacity: "0",
      transition: "opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
    } satisfies Partial<CSSStyleDeclaration>);
    this.canvas.setAttribute("aria-hidden", "true");

    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    this.program = program;
    for (const n of ["uTex", "uRes", "uImg", "uPointer", "uVel", "uHover", "uTime", "uRadius"]) this.u[n] = gl.getUniformLocation(program, n);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  private load(src: string) {
    let job = this.images.get(src);
    if (!job) {
      job = new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
      this.images.set(src, job);
    }
    return job;
  }

  /** Warm the image cache, e.g. when a card scrolls near. */
  prefetch(src: string) {
    this.load(src).catch(() => {});
  }

  async enter(host: HTMLElement, src: string, radius: number, clientX: number, clientY: number) {
    this.target = { host, src, radius };
    this.setPointer(clientX, clientY, true);
    try {
      const img = await this.load(src);
      if (this.target?.host !== host) return;
      const gl = this.gl;
      if (this.loadedSrc !== src) {
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        this.loadedSrc = src;
        this.imgSize = [img.naturalWidth || 1600, img.naturalHeight || 1000];
      }
      if (this.canvas.parentElement !== host) host.appendChild(this.canvas);
      this.resize();
      this.hoverTo = 1;
      this.canvas.style.opacity = "1";
      this.run();
    } catch {
      // The image failed: leave the plain one.
    }
  }

  move(clientX: number, clientY: number) {
    this.setPointer(clientX, clientY, false);
  }

  leave() {
    this.hoverTo = 0;
    this.canvas.style.opacity = "0";
  }

  private setPointer(clientX: number, clientY: number, snap: boolean) {
    const host = this.target?.host;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = 1 - (clientY - rect.top) / rect.height;
    this.pointerTo = [x, y];
    if (snap) this.pointer = [x, y];
  }

  private resize() {
    const host = this.target?.host;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  private run() {
    if (this.running) return;
    this.running = true;
    const tick = (now: number) => {
      this.hover += (this.hoverTo - this.hover) * 0.09;
      const px = this.pointer[0] + (this.pointerTo[0] - this.pointer[0]) * 0.14;
      const py = this.pointer[1] + (this.pointerTo[1] - this.pointer[1]) * 0.14;
      this.vel = [this.vel[0] * 0.85 + (px - this.pointer[0]) * 0.15, this.vel[1] * 0.85 + (py - this.pointer[1]) * 0.15];
      this.pointer = [px, py];
      this.draw(now);
      if (this.hoverTo === 0 && this.hover < 0.005) {
        this.running = false;
        return;
      }
      this.frame = requestAnimationFrame(tick);
    };
    this.frame = requestAnimationFrame(tick);
  }

  private draw(now: number) {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.uniform1i(this.u.uTex, 0);
    gl.uniform2f(this.u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform2f(this.u.uImg, this.imgSize[0], this.imgSize[1]);
    gl.uniform2f(this.u.uPointer, this.pointer[0], this.pointer[1]);
    gl.uniform2f(this.u.uVel, this.vel[0], this.vel[1]);
    gl.uniform1f(this.u.uHover, this.hover);
    gl.uniform1f(this.u.uTime, (now - this.start) / 1000);
    gl.uniform1f(this.u.uRadius, (this.target?.radius ?? 20) * dpr);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    cancelAnimationFrame(this.frame);
    this.canvas.remove();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

let shared: CardDistortion | null | undefined;

/** The shared instance, or null where WebGL2 is missing, the pointer is coarse or motion is reduced. */
export function getCardDistortion() {
  if (shared !== undefined) return shared;
  const ok =
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine) and (hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try {
    shared = ok ? new CardDistortion() : null;
  } catch {
    shared = null;
  }
  return shared;
}
