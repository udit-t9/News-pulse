import React from "react";
import { NEWS_PULSE } from "../../constants/testIds/newsPulse";
import { ArrowLeft, ExternalLink, ImageOff } from "lucide-react";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).toUpperCase();
  } catch { return ""; }
};

const ArticleCard = ({ article, index, topicLabel }) => {
  const [imgError, setImgError] = React.useState(false);

  const cleanDescription = (rawText) => {
    if (!rawText) return "";
    return rawText.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  };

  // Force verify image URL string is readable
  const hasValidImage = article.image && typeof article.image === "string" && article.image.startsWith("http");

  return (
    <article data-testid={`${NEWS_PULSE.articleCardPrefix}${index}`} className="fade-up grid grid-cols-12 gap-8 py-12 border-ink-b-2" style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}>
      <div className="col-span-12 md:col-span-1">
        <div className="font-mono text-[11px] tracking-mono uppercase opacity-60 mb-1">NO.</div>
        <div className="font-serif font-black text-[44px] leading-none">{(index + 1).toString().padStart(2, "0")}</div>
      </div>

      <div className="col-span-12 md:col-span-7">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="font-mono text-[10px] font-bold tracking-mono uppercase border-2 border-black px-2 py-1">[{article.source}]</span>
          <span className="font-mono text-[10px] tracking-mono uppercase opacity-60">// {topicLabel}</span>
          {article.published && <span className="font-mono text-[10px] tracking-mono uppercase opacity-60">· {formatDate(article.published)}</span>}
        </div>

        <a data-testid={`${NEWS_PULSE.articleLinkPrefix}${index}`} href={article.link} target="_blank" rel="noopener noreferrer" className="group block">
          <h3 className="font-serif font-black tracking-news leading-[1.02] text-[28px] md:text-[38px] text-black group-hover:underline decoration-[3px] underline-offset-[6px]">
            {article.title}
          </h3>
        </a>

        {article.description && (
          <p className="mt-5 font-serif text-[16px] leading-[1.85] text-[#1a1a1a]">
            {cleanDescription(article.description)}
          </p>
        )}

        <a href={article.link} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-mono text-[12px] font-bold tracking-mono uppercase border-b-2 border-black pb-1 hover:gap-3 transition-all">
          READ THE FILE <ExternalLink size={14} strokeWidth={2.5} />
        </a>
      </div>

      <div className="col-span-12 md:col-span-4 md:col-start-9">
        {hasValidImage && !imgError ? (
          <div>
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 bg-black" />
              <div className="relative border-2 border-black bg-white overflow-hidden">
                <img data-testid={`${NEWS_PULSE.articleImagePrefix}${index}`} src={article.image} alt={article.title} onError={() => setImgError(true)} className="editorial-image w-full h-[240px] object-cover block" loading="lazy" />
              </div>
            </div>
            <div className="mt-4 font-mono text-[10px] tracking-mono uppercase opacity-60 flex items-center justify-between">
              <span>WIRE_IMG_REF</span>
              <span>FULL SATURATION</span>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 bg-black" />
            <div className="relative border-2 border-black bg-[#f5f3ef] h-[240px] flex flex-col items-center justify-center dot-grid">
              <ImageOff size={28} strokeWidth={2} className="opacity-50 mb-2" />
              <span className="font-mono text-[10px] tracking-mono uppercase opacity-60">NO IMAGE · DISPATCH ONLY</span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

const GridArchiveExplorer = ({ topic, articles, loading, onBack }) => {
  return (
    <section data-testid={NEWS_PULSE.archiveExplorer} className="max-w-[1400px] mx-auto px-8 pb-24">
      <div className="flex items-center justify-between mb-8 pt-4">
        <button data-testid={NEWS_PULSE.returnToIndexBtn} onClick={onBack} className="inline-flex items-center gap-2 font-mono text-[12px] font-bold tracking-mono uppercase border-b-2 border-black pb-1 hover:gap-3 transition-all cursor-pointer">
          <ArrowLeft size={16} strokeWidth={2.5} /> RETURN TO INDEX
        </button>
        <div className="hidden md:flex items-center gap-6 font-mono text-[11px] tracking-mono uppercase">
          <span><span className="opacity-60">TRACK_</span><span className="font-bold">[{topic.code}]</span></span>
          <span><span className="opacity-60">DISPATCHES_</span><span className="font-bold">{(articles?.length || 0).toString().padStart(3, "0")}</span></span>
        </div>
      </div>

      <div className="border-t-2 border-b-2 border-black py-8 mb-2">
        <div className="font-mono text-[11px] tracking-mono uppercase opacity-60 mb-2">ARCHIVE / SECTION B / DISPATCHES</div>
        <h2 className="font-serif font-black tracking-news leading-[0.92] text-[48px] md:text-[80px]">{topic.label}</h2>
        <div className="flex items-center gap-6 mt-4 font-mono text-[11px] tracking-mono uppercase opacity-70">
          <span>SOURCE / WIRE LOGS</span>
          <span className="flex-1 h-[1px] bg-black opacity-40" />
          <span>SCROLL ↓ TO READ</span>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center font-mono text-[12px] tracking-mono uppercase opacity-60">⟶ FETCHING WIRE SIGNALS · STAND BY</div>
      ) : !articles || articles.length === 0 ? (
        <div className="py-24 text-center font-mono text-[12px] tracking-mono uppercase opacity-60">NO DISPATCHES IN THIS TRACK</div>
      ) : (
        <div>{articles.map((article, idx) => <ArticleCard key={article.id || idx} article={article} index={idx} topicLabel={topic.label} />)}</div>
      )}
    </section>
  );
};

export default GridArchiveExplorer;