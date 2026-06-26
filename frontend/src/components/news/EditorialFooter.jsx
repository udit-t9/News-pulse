import React from "react";

const EditorialFooter = () => (
  <footer className="border-t-2 border-black bg-black text-white mt-12">
    <div className="max-w-[1400px] mx-auto px-8 py-10 grid grid-cols-12 gap-8">
      <div className="col-span-12 md:col-span-5">
        <div className="font-serif font-black text-[36px] tracking-news">NEWS PULSE</div>
        <p className="mt-3 font-mono text-[11px] tracking-mono-tight uppercase opacity-70 max-w-md">
          An editorial terminal · composed in ink · printed on light. Wire signals refreshed directly from backend collection metrics.
        </p>
      </div>

      <div className="col-span-6 md:col-span-3">
        <div className="font-mono text-[10px] tracking-mono uppercase opacity-60 mb-3">COLOPHON</div>
        <ul className="space-y-1 font-mono text-[11px] tracking-mono-tight uppercase opacity-80">
          <li>TYPE / MERRIWEATHER</li>
          <li>MONO / IBM PLEX MONO</li>
          <li>GRID / 12 · GUTTER 24</li>
          <li>INK / TRUE BLACK</li>
        </ul>
      </div>

      <div className="col-span-6 md:col-span-4">
        <div className="font-mono text-[10px] tracking-mono uppercase opacity-60 mb-3">EDITORIAL NOTE</div>
        <p className="font-serif text-[13px] leading-[1.7] opacity-80">
          All headlines, summaries, and structural configurations are managed locally and remain the properties of their respective authors.
        </p>
      </div>
    </div>
    <div className="border-t border-white/20 py-3">
      <div className="max-w-[1400px] mx-auto px-8 flex items-center justify-between font-mono text-[10px] tracking-mono uppercase opacity-60">
        <span>© NEWS PULSE · EDITORIAL TERMINAL</span>
        <span>END OF FILE — RUN COMPLETE</span>
      </div>
    </div>
  </footer>
);

export default EditorialFooter;