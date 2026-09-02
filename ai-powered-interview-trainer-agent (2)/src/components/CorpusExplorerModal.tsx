import React, { useState, useEffect } from 'react';
import { X, Search, BookOpen, Tag, CheckCircle2, Sparkles, Filter } from 'lucide-react';
import { CorpusItem } from '../types';

interface CorpusExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Section {
  title: string;
  category: string;
  items: {
    question: string;
    answer: string;
    keywords: string[];
  }[];
}

export const CorpusExplorerModal: React.FC<CorpusExplorerModalProps> = ({ isOpen, onClose }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCorpus();
    }
  }, [isOpen, selectedCategory, searchQuery]);

  const fetchCorpus = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('query', searchQuery.trim());

      const res = await fetch(`/api/corpus?${params.toString()}`);
      const data = await res.json();
      setSections(data.sections || []);
    } catch (err) {
      console.error('Failed to fetch corpus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = ['All', 'Backend', 'Data / Analytics', 'Behavioral', 'HR', 'AI / Machine Learning'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl max-h-[88vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">RAG Knowledge Base Corpus</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/30 text-blue-300 border border-blue-400/40">
                  Grounding Data
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Curated interview questions, model STAR answers & evaluation keywords injected into prompt context
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Q&A or keywords..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs">Searching knowledge base...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching Q&A entries found in corpus. Try adjusting your search query.
            </div>
          ) : (
            sections.map((sec, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {sec.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600">
                    {sec.category}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {sec.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-colors shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-blue-600 text-xs mt-0.5">Q:</span>
                        <h5 className="font-semibold text-slate-900 text-sm">{item.question}</h5>
                      </div>

                      <div className="flex items-start gap-2 text-xs text-slate-700 pl-4 border-l-2 border-blue-200 py-1 bg-slate-50/50 rounded-r-lg">
                        <span className="font-bold text-indigo-600 shrink-0">Model Answer:</span>
                        <p className="leading-relaxed whitespace-pre-line">{item.answer}</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {item.keywords.map((kw, kIdx) => (
                          <span
                            key={kIdx}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Total {sections.reduce((a, s) => a + s.items.length, 0)} reference items available</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
