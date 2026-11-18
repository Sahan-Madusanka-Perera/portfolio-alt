"use client";

import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { useId, useMemo, useState } from "react";

type Result = { network: string; broadcast: string; mask: string; first: string; last: string; usable: string } | { error: string };

const toIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join(".");

export function calculateSubnet(input: string): Result {
  const match = input.trim().match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s*\/\s*(\d{1,2})$/);
  if (!match) return { error: "Write an address and prefix, like 192.168.10.37/26." };
  const octets = match.slice(1, 5).map(Number);
  const prefix = Number(match[5]);
  if (octets.some((o) => o > 255)) return { error: "Each part of the address is 0 to 255." };
  if (prefix > 32) return { error: "The prefix is 0 to 32." };
  const ip = ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const network = (ip & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const size = 2 ** (32 - prefix);
  // RFC 3021: a /31 has two usable addresses; a /32 is a single host.
  const usable = prefix >= 31 ? size : size - 2;
  const first = prefix >= 31 ? network : network + 1;
  const last = prefix >= 31 ? broadcast : broadcast - 1;
  return {
    network: `${toIp(network)}/${prefix}`,
    broadcast: prefix >= 31 ? "none" : toIp(broadcast),
    mask: toIp(mask),
    first: toIp(first >>> 0),
    last: toIp(last >>> 0),
    usable: usable.toLocaleString("en-GB"),
  };
}

// A subnet calculator in the spirit of SignalLab's subnetting lesson: type a CIDR, read the
// network, broadcast, mask and host range. Pure arithmetic, nothing leaves the page.
export function SubnetDemo() {
  const [value, setValue] = useState("192.168.10.37/26");
  const result = useMemo(() => calculateSubnet(value), [value]);
  const id = useId();

  const rows: [string, string][] =
    "error" in result
      ? []
      : [
          ["Network", result.network],
          ["Broadcast", result.broadcast],
          ["Subnet mask", result.mask],
          ["Host range", `${result.first} to ${result.last}`],
          ["Usable hosts", result.usable],
        ];

  return (
    <div className="flex h-full flex-col gap-6 rounded-[20px] bg-bg-2 p-6 ring-1 ring-inset ring-line sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[clamp(1.375rem,2vw,1.75rem)] font-light leading-[1.15] tracking-[-0.02em]">Split a network</h3>
        <a
          href="https://signal-lab-net.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-[0.875rem] text-fg-2 transition-colors hover:text-fg"
        >
          SignalLab
          <ArrowUpRightIcon aria-hidden size={12} />
        </a>
      </div>
      <div>
        <label htmlFor={id} className="text-[0.875rem] text-fg-2">
          IPv4 address and prefix
        </label>
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          spellCheck={false}
          autoComplete="off"
          inputMode="decimal"
          aria-describedby={`${id}-out`}
          aria-invalid={"error" in result}
          className="mt-2 h-12 w-full rounded-[14px] bg-bg px-4 font-mono text-[1rem] text-fg ring-1 ring-inset ring-line-2 outline-none transition-shadow focus:ring-accent"
        />
      </div>
      <div id={`${id}-out`} aria-live="polite" className="flex-1">
        {"error" in result ? (
          <p className="text-[0.9375rem] text-fg-2">{result.error}</p>
        ) : (
          <dl className="divide-y divide-line">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-[0.875rem] text-fg-2">{k}</dt>
                <dd className="text-right font-mono text-[0.875rem] text-fg tabular">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
