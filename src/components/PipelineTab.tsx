import React, { useState } from 'react';
import { ArrowUpDown, MessageSquare, Phone, Sparkles, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { Person, Event } from '../types';
import { generateFollowUpMessage } from '../services/geminiService';

interface PipelineTabProps {
  people: Person[];
  events: Event[];
  onToggleRelationship: (person: Person) => void;
  onDeleteContact: (id: string) => void;
}

export const PipelineTab: React.FC<PipelineTabProps> = ({
  people,
  events,
  onToggleRelationship,
  onDeleteContact
}) => {
  const [selectedPersonForAi, setSelectedPersonForAi] = useState<Person | null>(null);
  const [draftedMessage, setDraftedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const inboundPeople = people.filter((p) => p.relationshipType === 'inbound');
  const outboundPeople = people.filter((p) => p.relationshipType === 'outbound');

  const getEventTitle = (eventId: string) => {
    return events.find((e) => e.id === eventId)?.title || 'Event';
  };

  const handleGenerateAiFollowUp = async (person: Person) => {
    setSelectedPersonForAi(person);
    setIsGenerating(true);
    setCopied(false);

    try {
      const eventTitle = getEventTitle(person.eventId);
      const message = await generateFollowUpMessage(person, eventTitle);
      setDraftedMessage(message);
    } catch {
      setDraftedMessage(`Hi ${person.name}, it was great meeting you! Would love to stay in touch.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(draftedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendViaWhatsApp = (person: Person, message: string) => {
    const cleanNumber = person.contactNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-[#111111]">
          Inbound vs. Outbound Relationship Pipeline
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
          Prevent post-event lead decay. Track warm inbound connections against dormant outbound leads, and generate personalized AI follow-ups.
        </p>
      </div>

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* INBOUND COLUMN */}
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border-[3px] border-[#111111] shadow-neo">
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#111111]">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-neo-mint border-2 border-[#111111]" />
              <h3 className="font-black text-xl text-[#111111]">Inbound Column</h3>
              <span className="neo-pill bg-neo-mint text-[#111111] px-2.5 py-0.5 text-xs">
                {inboundPeople.length} Active
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Reciprocal & Warm
            </span>
          </div>

          <div className="space-y-3">
            {inboundPeople.length === 0 ? (
              <p className="text-xs text-neutral-400 font-medium text-center py-8">
                No active inbound connections yet.
              </p>
            ) : (
              inboundPeople.map((person) => (
                <div key={person.id} className="neo-card p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-base text-[#111111]">{person.name}</h4>
                      <p className="text-xs text-neo-purple font-bold">{person.designation}</p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-1">
                        Met at: {getEventTitle(person.eventId)}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleRelationship(person)}
                      className="neo-btn bg-white px-2 py-1 text-[10px] text-neutral-700 hover:bg-neutral-100"
                      title="Move to Outbound"
                    >
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      <span>Move Outbound</span>
                    </button>
                  </div>

                  {person.description && (
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-1">
                      {person.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* OUTBOUND COLUMN */}
        <div className="bg-[#FAF6EE] p-5 sm:p-6 rounded-3xl border-[3px] border-[#111111] shadow-neo">
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#111111]">
            <div className="flex items-center space-x-2">
              <span className="w-3.5 h-3.5 rounded-full bg-neo-coral border-2 border-[#111111]" />
              <h3 className="font-black text-xl text-[#111111]">Outbound Column</h3>
              <span className="neo-pill bg-neo-coral text-white px-2.5 py-0.5 text-xs">
                {outboundPeople.length} Follow-Up Needed
              </span>
            </div>
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Dormant Leads
            </span>
          </div>

          <div className="space-y-3">
            {outboundPeople.length === 0 ? (
              <p className="text-xs text-neutral-400 font-medium text-center py-8">
                No dormant outbound leads. All contacts are nurtured!
              </p>
            ) : (
              outboundPeople.map((person) => (
                <div key={person.id} className="neo-card p-4 bg-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-black text-base text-[#111111]">{person.name}</h4>
                      <p className="text-xs text-neo-purple font-bold">{person.designation}</p>
                      <p className="text-[11px] text-neutral-500 font-mono mt-1">
                        Met at: {getEventTitle(person.eventId)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleGenerateAiFollowUp(person)}
                        className="neo-btn bg-neo-yellow text-[#111111] px-2.5 py-1 text-[10px] font-black"
                        title="Draft Follow-Up with Gemini"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        <span>AI Pitch</span>
                      </button>

                      <button
                        onClick={() => onToggleRelationship(person)}
                        className="neo-btn bg-white px-2 py-1 text-[10px] text-neutral-700 hover:bg-neutral-100"
                        title="Mark as Inbound"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {person.description && (
                    <p className="text-xs text-neutral-600 mt-2 line-clamp-1">
                      {person.description}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* AI Message Drafting Modal */}
      {selectedPersonForAi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-lg p-6 sm:p-8 relative">
            <div className="flex items-center space-x-2 mb-2">
              <span className="p-2 rounded-xl bg-neo-yellow border-2 border-[#111111] shadow-neo-sm">
                <Sparkles className="w-5 h-5 text-[#111111]" />
              </span>
              <h3 className="text-xl font-black text-[#111111]">
                Gemini Re-engagement Pitch
              </h3>
            </div>

            <p className="text-xs text-neutral-600 mb-4 font-medium">
              Personalized follow-up message tailored for <strong>{selectedPersonForAi.name}</strong> referencing your conversation at {getEventTitle(selectedPersonForAi.eventId)}.
            </p>

            {isGenerating ? (
              <div className="py-8 text-center">
                <Loader2 className="w-8 h-8 text-neo-purple animate-spin mx-auto mb-2" />
                <p className="text-xs font-bold text-neutral-700">Synthesizing follow-up message with Gemini...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF6EE] border-2 border-[#111111] font-medium text-sm text-neutral-800">
                  {draftedMessage}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleCopyMessage}
                    className="neo-btn bg-white text-[#111111] px-4 py-2 text-xs flex items-center"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 mr-1 text-green-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedPersonForAi(null)}
                      className="neo-btn bg-white text-neutral-600 px-4 py-2 text-xs"
                    >
                      Close
                    </button>

                    {selectedPersonForAi.contactNumber && (
                      <button
                        onClick={() => handleSendViaWhatsApp(selectedPersonForAi, draftedMessage)}
                        className="neo-btn bg-neo-mint text-[#111111] px-4 py-2 text-xs font-black flex items-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5 mr-1" />
                        <span>Send WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
