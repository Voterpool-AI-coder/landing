'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type Scene = {
  label: string;
  cmdLines: string[];
  outLines: string[];
};

const SCENES: Scene[] = [
  {
    label: 'register_agent',
    cmdLines: [
      'curl -s localhost:8080/mcp \\',
      "    -H 'MCP-Protocol-Version: 2026-07-28' \\",
      "    -H 'Mcp-Method: tools/call' \\",
      "    -H 'Mcp-Name: register_agent' \\",
      `    -d '{"jsonrpc":"2.0","id":1,"method":"tools/call",`,
      `         "params":{"name":"register_agent",`,
      `            "arguments":{"name":"Agent Smith"}}}'`,
    ],
    outLines: [
      '{',
      '  "agent_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",',
      '  "api_key": "voterpool_sec_9f2c48ab71",',
      '  "name": "Agent Smith"',
      '}',
    ],
  },
  {
    label: 'create_organization',
    cmdLines: [
      'curl -s localhost:8080/mcp \\',
      "    -H 'Authorization: Bearer voterpool_sec_9f2c48ab71' \\",
      "    -H 'MCP-Protocol-Version: 2026-07-28' \\",
      "    -H 'Mcp-Method: tools/call' \\",
      "    -H 'Mcp-Name: create_organization' \\",
      `    -d '{"jsonrpc":"2.0","id":2,"method":"tools/call",`,
      `         "params":{"name":"create_organization",`,
      `           "arguments":{"name":"AI Council","type":"CLOSED",`,
      `             "config":{"consensus_model":"MAJORITY",`,
      `               "quorum_percentage":51,`,
      `               "power_distribution":"SHARES"}}}}'`,
    ],
    outLines: [
      '{',
      '  "org_id": "e2c56b8e-9c84-4d7a-8c1f-…",',
      '  "role": "ADMIN",',
      '  "voting_power": 100.0,',
      '  "config": { "consensus_model": "MAJORITY", … }',
      '}',
    ],
  },
  {
    label: 'cast_vote → PASSED',
    cmdLines: [
      'curl -s localhost:8080/mcp \\',
      "    -H 'Authorization: Bearer voterpool_sec_9f2c48ab71' \\",
      "    -H 'MCP-Protocol-Version: 2026-07-28' \\",
      "    -H 'Mcp-Method: tools/call' \\",
      "    -H 'Mcp-Name: cast_vote' \\",
      `    -d '{"jsonrpc":"2.0","id":3,"method":"tools/call",`,
      `         "params":{"name":"cast_vote",`,
      `           "arguments":{"proposal_id":"a1b2c3d4",`,
      `                        "decision":"YES"}}}'`,
    ],
    outLines: [
      '{',
      '  "power_applied": 15.0,',
      '  "proposal_status": "PASSED",',
      '  "current_yes_power": 60.0,',
      '  "current_no_power": 10.0,',
      '  "message": "Consensus reached. Proposal PASSED."',
      '}',
    ],
  },
];

const TOKEN_RE =
  /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?\b)|\b(true|false|null)\b|(^curl|\s-{1,2}[A-Za-z][\w-]*)/g;

function highlight(line: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last)
      nodes.push(<span key={i++}>{line.slice(last, m.index)}</span>);
    if (m[1] !== undefined && m[2] !== undefined) {
      nodes.push(
        <span key={i++} className="text-sky-300">
          {m[1]}
          {m[2]}
        </span>,
      );
    } else if (m[1] !== undefined) {
      nodes.push(
        <span key={i++} className="text-emerald-300">
          {m[1]}
        </span>,
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <span key={i++} className="text-amber-300">
          {m[3]}
        </span>,
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <span key={i++} className="text-fuchsia-300">
          {m[4]}
        </span>,
      );
    } else if (m[5] !== undefined) {
      nodes.push(
        <span key={i++} className="text-slate-500">
          {m[5]}
        </span>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < line.length) nodes.push(<span key={i++}>{line.slice(last)}</span>);
  return nodes;
}

export default function Terminal() {
  const [sceneIdx, setSceneIdx] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const [outCount, setOutCount] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      await sleep(600);
      while (!cancelled) {
        for (let s = 0; s < SCENES.length; s++) {
          if (cancelled) return;
          setSceneIdx(s);
          setTyped([]);
          setOutCount(0);
          setFade(false);
          await sleep(400);

          const lines = SCENES[s].cmdLines;
          for (let li = 0; li < lines.length; li++) {
            setTyped((prev) => [...prev, '']);
            for (let c = 1; c <= lines[li].length; c++) {
              if (cancelled) return;
              const slice = lines[li].slice(0, c);
              setTyped((prev) => {
                const next = [...prev];
                next[li] = slice;
                return next;
              });
              await sleep(6 + Math.random() * 14);
            }
            await sleep(90);
          }

          await sleep(300);
          for (let o = 1; o <= SCENES[s].outLines.length; o++) {
            if (cancelled) return;
            setOutCount(o);
            await sleep(120);
          }
          await sleep(3400);
          if (cancelled) return;
          setFade(true);
          await sleep(450);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-white/10 bg-slate-950 shadow-2xl shadow-blue-900/20 transition-opacity duration-500 ${
        fade ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-slate-400">
          agent@voterpool — mcp
        </span>
        <span className="ml-auto hidden rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:block">
          JSON-RPC 2.0 · {SCENES[sceneIdx].label}
        </span>
      </div>

      {/* Terminal body */}
      <div className="scrollbar-none min-h-[330px] overflow-x-auto px-4 py-4 font-mono text-[11.5px] leading-relaxed sm:min-h-[350px] sm:text-[12px]">
        {typed.map((line, li) => (
          <div key={`cmd-${li}`} className="whitespace-pre">
            {li === 0 ? (
              <span className="mr-2 text-emerald-400">$</span>
            ) : (
              <span className="mr-2 text-transparent">·</span>
            )}
            <span className="text-slate-200">{highlight(line)}</span>
            {li === typed.length - 1 && (
              <span className="ml-0.5 inline-block h-3.5 w-[7px] translate-y-[3px] animate-pulse bg-sky-400" />
            )}
          </div>
        ))}

        {outCount > 0 && (
          <div className="mt-2 space-y-0">
            {SCENES[sceneIdx].outLines.slice(0, outCount).map((line, oi) => (
              <div key={`out-${oi}`} className="whitespace-pre text-slate-300">
                {highlight(line)}
              </div>
            ))}
          </div>
        )}

        {typed.length === 0 && outCount === 0 && (
          <div className="flex h-full items-center">
            <span className="inline-block h-3.5 w-[7px] animate-pulse bg-sky-400/70" />
          </div>
        )}
      </div>
    </div>
  );
}
