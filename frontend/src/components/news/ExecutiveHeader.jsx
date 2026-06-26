import React, { useEffect, useState } from "react";
import { NEWS_PULSE } from "../../constants/testIds/newsPulse";
import { Loader2, Zap } from "lucide-react";

const formatTime = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch { return "—"; }
};

const ExecutiveHeader = ({ onTrigger, triggering, lastTriggered, totalArticles }) => {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const dateString = clock.toLocaleDateString("en-GB", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  }).toUpperCase();

  const timeString = clock.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });

  return (
    <header className="border-ink-b-2">
      <div className="border-ink-b-2 bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-8 py-2 flex items-center justify-between text-[11px] font-mono tracking-mono uppercase">
          <div className="flex items-center gap-6">
            <span data-testid={NEWS_PULSE.liveBadge} className="flex items-center">
              <span className="live-dot" />LIVE FEED
            </span>
            <span className="opacity-70">VOL. 01 · EDITION 042</span>
            <span className="hidden md:inline opacity-70">SOURCE / BBC NEWS · RSS WIRE</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="opacity-70">{dateString}</span>
            <span className="font-bold">{timeString} UTC</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pt-10 pb-8">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-[11px] tracking-mono uppercase border-ink-2 px-2 py-1">
                EDITORIAL TERMINAL
              </span>
              <span className="font-mono text-[11px] tracking-mono uppercase opacity-60">
                / SIGNAL — INK — DEPTH
              </span>
            </div>
            <h1 data-testid={NEWS_PULSE.appTitle} className="font-serif font-black tracking-news leading-[0.9] text-[55px] md:text-[90px] lg:text-[110px] text-black">
              NEWS PULSE
            </h1>
            <p className="mt-4 font-mono text-[12px] tracking-mono-tight uppercase opacity-70 max-w-xl">
              A real-time editorial feed of global topic clusters. Composed from live wire signals · curated for executive intake.
            </p>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col items-stretch lg:items-end gap-4">
            <button data-testid={NEWS_PULSE.triggerPipelineBtn} onClick={onTrigger} disabled={triggering}
                    className="btn-pipeline shadow-brutal px-7 py-5 font-mono text-[13px] font-bold tracking-mono uppercase disabled:opacity-60 disabled:cursor-not-allowed">
              <span className="inline-flex items-center gap-3">
                {triggering ? <Loader2 size={16} className="animate-spin" strokeWidth={2.5} /> : <Zap size={16} strokeWidth={2.5} />}
                {triggering ? "PIPELINE RUNNING…" : "TRIGGER PIPELINE"}
              </span>
            </button>

            <div className="border-ink-2 p-4 font-mono text-[11px] tracking-mono-tight uppercase w-full bg-white">
              <div className="flex items-center justify-between gap-4 border-ink-b-2 pb-2 mb-2">
                <span className="opacity-60">LAST RUN</span>
                <span className="font-bold">{formatTime(lastTriggered)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="opacity-60">ITEMS IN PIPELINE</span>
                <span className="font-bold text-[18px]">
                  {totalArticles?.toString().padStart(3, "0") ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-8 pb-4 flex items-center gap-6 text-[10px] font-mono tracking-mono uppercase opacity-70">
        <span className="flex-1 h-[2px] bg-black" />
        <span>SECTION A — TOPIC TRACKS</span>
        <span className="flex-1 h-[2px] bg-black" />
      </div>
    </header>
  );
};

export default ExecutiveHeader;