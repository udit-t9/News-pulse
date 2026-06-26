import React from "react";
import { NEWS_PULSE } from "../../constants/testIds/newsPulse";

const NewsTicker = ({ topics }) => {
  const items = topics.filter((t) => t.latest_headline).map((t) => `[${t.code}] ${t.latest_headline}`);
  if (items.length === 0) return null;
  const full = [...items, ...items, ...items]; // Loops ticker text array

  return (
    <div data-testid={NEWS_PULSE.ticker} className="border-t-2 border-b-2 border-black bg-white overflow-hidden">
      <div className="flex items-stretch">
        <div className="bg-black text-white px-4 py-2 font-mono text-[11px] font-bold tracking-mono uppercase flex items-center whitespace-nowrap">
          <span className="live-dot" />WIRE
        </div>
        <div className="flex-1 overflow-hidden py-2">
          <div className="ticker-track">
            {full.map((txt, i) => (
              <span key={i} className="font-mono text-[12px] tracking-mono-tight uppercase px-8 inline-flex items-center">
                <span className="opacity-40 mr-4">◆</span>{txt}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;