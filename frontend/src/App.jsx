import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster, toast } from "sonner";

import ExecutiveHeader from "./components/news/ExecutiveHeader";
import TimelineConsole from "./components/news/TimelineConsole";
import GridArchiveExplorer from "./components/news/GridArchiveExplorer";
import NewsTicker from "./components/news/NewsTicker";
import EditorialFooter from "./components/news/EditorialFooter";
import { NEWS_PULSE } from "./constants/testIds/newsPulse";

// Dynamic API fallback integration for production matching local endpoints
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const NewsPulseApp = () => {
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState(null);
  const [activeTopicId, setActiveTopicId] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [lastTriggered, setLastTriggered] = useState(null);

  const fetchTopics = useCallback(async () => {
    try {
      setTopicsLoading(true);
      const res = await axios.get(`${API}/topics`);
      setTopics(res.data || []);
      setTopicsError(null);
    } catch (e) {
      setTopicsError("Unable to reach the wire");
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const fetchArticles = useCallback(async (topicId) => {
    try {
      setArticlesLoading(true);
      const res = await axios.get(`${API}/topics/${topicId}/articles`);
      setArticles(res.data || []);
    } catch (e) {
      setArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  }, []);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === activeTopicId) || null,
    [topics, activeTopicId]
  );

  const handleSelectTopic = useCallback((topic) => {
    setActiveTopicId(topic.id);
    fetchArticles(topic.id);
    
    setTimeout(() => {
      const el = document.querySelector(`[data-testid="${NEWS_PULSE.archiveExplorer}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 120); 
  }, [fetchArticles]);

  const handleBackToIndex = useCallback(() => {
    setActiveTopicId(null);
    setArticles([]);
    
    setTimeout(() => {
      const el = document.querySelector(`[data-testid="${NEWS_PULSE.timelineConsole}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }, []);

  const handleTriggerPipeline = useCallback(async () => {
    try {
      setTriggering(true);
      const res = await axios.post(`${API}/pipeline/trigger`);
      setLastTriggered(res.data?.triggered_at || new Date().toISOString());
      toast.success("PIPELINE TRIGGERED · WIRE REFRESHED");
      setTimeout(() => { fetchTopics(); }, 4000);
    } catch (e) {
      toast.error("PIPELINE FAILED · CHECK SIGNAL");
    } finally {
      setTriggering(false);
    }
  }, [fetchTopics]);

  const totalArticles = useMemo(() => topics.reduce((s, t) => s + (t.article_count || 0), 0), [topics]);

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="bottom-right" toastOptions={{ className: "!font-mono !text-[11px] !border-2 !border-black !rounded-none !bg-white !text-black" }} />
      <ExecutiveHeader onTrigger={handleTriggerPipeline} triggering={triggering} lastTriggered={lastTriggered} totalArticles={totalArticles} />
      <NewsTicker topics={topics} />
      {topicsLoading ? (
        <div className="max-w-[1400px] mx-auto px-8 py-32 text-center font-mono text-[12px] uppercase opacity-60">⟶ COMPOSING THE EDITION · STAND BY</div>
      ) : topicsError ? (
        <div className="max-w-[1400px] mx-auto px-8 py-32 text-center">
          <div className="inline-block border-2 border-black p-8 bg-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="font-mono text-[24px] font-black mb-2">The wire fell silent.</div>
            <button onClick={fetchTopics} className="mt-4 bg-black text-white px-4 py-2 text-xs font-mono">RETRY WIRE</button>
          </div>
        </div>
      ) : (
        <>
          <TimelineConsole topics={topics} activeTopicId={activeTopicId} onSelect={handleSelectTopic} />
          {activeTopic && <GridArchiveExplorer topic={activeTopic} articles={articles} loading={articlesLoading} onBack={handleBackToIndex} />}
        </>
      )}
      <EditorialFooter />
    </div>
  );
};

export default function App() { return ( <BrowserRouter><Routes><Route path="/" element={<NewsPulseApp />} /></Routes></BrowserRouter> ); }