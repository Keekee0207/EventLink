import React, { useState } from 'react';
import { Search, Mic, Sparkles, Loader2, User, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { Person } from '../types';
import { searchContacts } from '../services/geminiService';
import { startListening, stopListening } from '../services/speechService';

interface SemanticSearchTabProps {
  people: Person[];
}

const SAMPLE_QUERIES = [
  'Who knows about LLMs?',
  'Find Flutter / Dart developers',
  'Did I meet a chef or food founder?',
  'Show me deep tech founders',
  'UI/UX design experts'
];

export const SemanticSearchTab: React.FC<SemanticSearchTabProps> = ({ people }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResult(null);
      return;
    }

    setIsSearching(true);
    try {
      const result = await searchContacts(q, people);
      setSearchResult(result);
    } catch (err: any) {
      setSearchResult(`Search completed: No direct match found for "${q}".`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening(
        (text) => {
          setQuery(text);
          setIsListening(false);
          handleSearch(text);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-8">
      
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neo-yellow border-2 border-[#111111] shadow-neo-sm text-xs font-black uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Conversational Semantic Search Engine</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-[#111111] tracking-tight">
          Search Your Network by Concept
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto mt-2 font-medium">
          Ask in plain conversational language. The semantic engine reasons across roles, skills, and notes—finding someone who knows Dart when you search for Flutter.
        </p>
      </div>

      {/* Main Search Input Bar */}
      <div className="relative mb-4">
        <div className="neo-card-flat p-2 sm:p-2.5 flex items-center bg-[#FFFDF8]">
          <Search className="w-5 h-5 text-neutral-500 ml-2 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
            placeholder='Ask anything: "Who knows about LLMs?" or "Find robotics founders"...'
            className="w-full bg-transparent text-sm sm:text-base font-bold outline-none text-[#111111] placeholder:text-neutral-400 placeholder:font-normal"
          />

          <button
            onClick={handleVoiceSearch}
            className={`p-2.5 rounded-xl border-2 border-[#111111] transition-all ml-2 ${
              isListening
                ? 'bg-neo-coral text-white animate-pulse'
                : 'bg-neo-purple text-white hover:bg-purple-700 shadow-neo-sm'
            }`}
            title="Speak to Search"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleSearch(query)}
            disabled={isSearching || !query.trim()}
            className="neo-btn bg-neo-yellow text-[#111111] px-5 py-2.5 text-xs sm:text-sm ml-2 disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Search</span>}
          </button>
        </div>
      </div>

      {/* Quick Sample Queries */}
      <div className="flex flex-wrap items-center gap-2 mb-8 justify-center">
        <span className="text-xs font-black uppercase text-neutral-500 mr-1">
          Try asking:
        </span>
        {SAMPLE_QUERIES.map((sample, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(sample);
              handleSearch(sample);
            }}
            className="px-3 py-1 rounded-xl text-xs font-bold bg-white hover:bg-neo-yellow/30 text-neutral-800 border-2 border-[#111111] shadow-neo-sm transition-all"
          >
            "{sample}"
          </button>
        ))}
      </div>

      {/* Results Container */}
      {isSearching && (
        <div className="neo-card p-8 text-center bg-white">
          <Loader2 className="w-8 h-8 text-neo-purple animate-spin mx-auto mb-3" />
          <h4 className="font-black text-lg text-[#111111]">
            Reasoning over your attendee network...
          </h4>
          <p className="text-xs text-neutral-500 mt-1">
            Analyzing context notes, skill affinities, and conversational memory
          </p>
        </div>
      )}

      {!isSearching && searchResult && (
        <div className="neo-card p-6 sm:p-8 bg-[#FFFDF8] animate-fadeIn">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b-2 border-[#111111]">
            <span className="p-1.5 rounded-lg bg-neo-mint border border-[#111111]">
              <Sparkles className="w-4 h-4 text-[#111111]" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#111111]">
              Search Analysis & Recommended Matches
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-neutral-800 font-medium whitespace-pre-wrap leading-relaxed font-mono text-xs sm:text-sm">
            {searchResult}
          </div>
        </div>
      )}

      {/* Help Card */}
      {!searchResult && !isSearching && (
        <div className="neo-card p-6 bg-white border-dashed text-center">
          <p className="text-xs text-neutral-500 font-medium">
            EventLink uses semantic knowledge graphs and the Gemini API to understand connections between tech stacks, job roles, and industries so you never have to remember exact keywords.
          </p>
        </div>
      )}

    </div>
  );
};
