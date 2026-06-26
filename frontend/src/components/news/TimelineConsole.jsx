import React, { useMemo } from "react";
import { NEWS_PULSE } from "../../constants/testIds/newsPulse";
import { ChevronRight } from "lucide-react";

const formatRelative = (iso) => {
  if (!iso) return "—";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "JUST NOW";
    if (mins < 60) return `${mins}M AGO`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H AGO`;
    return `${Math.floor(hrs / 24)}D AGO`;
  } catch { return "—"; }
};

const TrackRow = ({ topic, index, isActive, onSelect, maxActivity }) => {
  const widthPct = Math.max(8, Math.round((topic.activity / (maxActivity || 1)) * 100));
  const delay = `${index * 0.08}s`;

  return (
    <div role="button" tabIndex={0}
         data-testid={`${NEWS_PULSE.topicTrackPrefix}${topic.id}`}
         data-active={isActive ? "true" : "false"}
         onClick={() => onSelect(topic)}
         className="track-row grid grid-cols-12 items-center gap-4 px-6 py-5 border-ink-b-2 cursor-pointer group">
      <div className="col-span-1 font-mono text-[11px] tracking-mono opacity-60">
        {(index + 1).toString().padStart(2, "0")}
      </div>

      <div className="col-span-3" data-testid={`${NEWS_PULSE.trackLabelPrefix}${topic.id}`}>
        <div className="font-mono text-[11px] tracking-mono opacity-60 mb-1">[{topic.code}]</div>
        <div className="font-serif font-black text-[18px] md:text-[22px] leading-tight tracking-news">{topic.label}</div>
      </div>

      <div className="col-span-6 relative h-12 border-l-2 border-r-2 border-black">
        <div className="absolute inset-0 grid grid-cols-12">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-r border-black/15 last:border-r-0" />
          ))}
        </div>
        <div data-testid={`${NEWS_PULSE.trackBarPrefix}${topic.id}`}
             className={`track-bar absolute top-2 bottom-2 left-0 ${isActive ? "fill-crosshatch" : "bg-black"}`}
             style={{ width: `${widthPct}%`, animationDelay: delay }} />
        {topic.latest_headline && (
          <div className="absolute inset-0 flex items-center px-3 pointer-events-none overflow-hidden">
            <span className="font-mono text-[10px] tracking-mono-tight uppercase truncate" style={{ color: "#fff", mixBlendMode: "difference" }}>
              {topic.latest_headline}
            </span>
          </div>
        )}
      </div>

      <div className="col-span-2 flex items-center justify-end gap-4">
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-mono opacity-60">CLUSTER</div>
          <div className="font-serif font-black text-[24px] leading-none">{topic.article_count}</div>
        </div>
        <div className="hidden md:block text-right min-w-[64px]">
          <div className="font-mono text-[10px] tracking-mono opacity-60">UPDATED</div>
          <div className="font-mono text-[11px] font-bold tracking-mono-tight">{formatRelative(topic.last_updated)}</div>
        </div>
        <ChevronRight size={18} strokeWidth={2.5} className="opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

const TimelineConsole = ({ topics, activeTopicId, onSelect }) => {
  const maxActivity = useMemo(() => Math.max(...topics.map((t) => t.activity), 0.0001), [topics]);
  const total = topics.reduce((s, t) => s + t.article_count, 0);

  return (
    <section data-testid={NEWS_PULSE.timelineConsole} className="max-w-[1400px] mx-auto px-8 pb-16">
      <div className="flex items-end justify-between mb-6 pt-2">
        <div>
          <div className="font-mono text-[11px] tracking-mono uppercase opacity-60 mb-2">// CONSOLE / 02</div>
          <h2 className="font-mono text-[14px] tracking-mono font-bold uppercase">ACTIVE TOPIC TRACKS</h2>
        </div>
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] tracking-mono uppercase">
          <span><span className="opacity-60">TRACKS_</span><span className="font-bold">{topics.length.toString().padStart(2, "0")}</span></span>
          <span><span className="opacity-60">SIGNALS_</span><span className="font-bold">{total.toString().padStart(3, "0")}</span></span>
          <span className="opacity-60">SCALE / RELATIVE-DENSITY</span>
        </div>
      </div>

      <div className="border-ink-2 shadow-brutal-lg bg-white">
        <div className="grid grid-cols-12 items-center gap-4 px-6 py-3 border-ink-b-2 bg-black text-white font-mono text-[10px] tracking-mono uppercase">
          <div className="col-span-1">IDX</div>
          <div className="col-span-3">TRACK / CODE</div>
          <div className="col-span-6">DURATION · CLUSTER ACTIVITY</div>
          <div className="col-span-2 text-right">METRICS</div>
        </div>
        {topics.map((topic, index) => (
          <TrackRow key={topic.id} topic={topic} index={index} isActive={activeTopicId === topic.id} onSelect={onSelect} maxActivity={maxActivity} />
        ))}
      </div>
    </section>
  );
};

export default TimelineConsole;