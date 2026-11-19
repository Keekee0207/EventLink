import React, { useState, useEffect } from 'react';
import { X, Mic, Image, User, Briefcase, Phone, Tag, FileText, Sparkles, Camera } from 'lucide-react';
import { LinkedinIcon } from './Icons';
import { Event, Person, ParsedContact } from '../types';
import { VoiceScribeModal } from './VoiceScribeModal';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveContact: (person: Omit<Person, 'id' | 'createdAt'>) => void;
  events: Event[];
  selectedEventId?: string;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  onSaveContact,
  events,
  selectedEventId
}) => {
  const [eventId, setEventId] = useState(selectedEventId || events[0]?.id || '');
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [relationshipType, setRelationshipType] = useState<'inbound' | 'outbound'>('inbound');
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [businessCardUri, setBusinessCardUri] = useState<string | null>(null);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  useEffect(() => {
    if (selectedEventId) {
      setEventId(selectedEventId);
    } else if (events.length > 0 && !eventId) {
      setEventId(events[0].id);
    }
  }, [selectedEventId, events]);

  if (!isOpen) return null;

  const handleVoiceExtractSuccess = (parsed: ParsedContact, transcript: string) => {
    if (parsed.name) setName(parsed.name);
    if (parsed.designation) setDesignation(parsed.designation);
    if (parsed.skills) setTagsInput(parsed.skills);
    if (parsed.description) setDescription(parsed.description);
    if (parsed.phone) setContactNumber(parsed.phone);
    setVoiceTranscript(transcript);
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessCardUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a contact name.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSaveContact({
      eventId: eventId || events[0]?.id || 'default',
      name: name.trim(),
      designation: designation.trim(),
      company: company.trim(),
      contactNumber: contactNumber.trim(),
      linkedinUrl: linkedinUrl.trim(),
      description: description.trim(),
      tags,
      relationshipType,
      voiceTranscript,
      businessCardUri,
      lastContactDate: new Date().toISOString(),
      callCount: 0,
      messageCount: 0
    });

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
        <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-xl p-6 sm:p-8 relative my-8">
          
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-[#111111]" />
          </button>

          {/* Header */}
          <h3 className="text-2xl font-black text-[#111111] mb-1">
            Add Person Met
          </h3>
          <p className="text-xs text-neutral-600 mb-6 font-medium">
            Capture contact details via voice auto-scribing, business card photo, or manual form.
          </p>

          {/* Fast Modality Actions Banner */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setIsVoiceModalOpen(true)}
              className="p-3 rounded-2xl bg-neo-yellow border-[2.5px] border-[#111111] shadow-neo-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 text-left"
            >
              <span className="p-2 bg-white rounded-xl border-2 border-[#111111] text-[#111111]">
                <Mic className="w-5 h-5 text-neo-purple" />
              </span>
              <div>
                <span className="block text-xs font-black text-[#111111] leading-tight">
                  Voice Scribe
                </span>
                <span className="text-[10px] text-neutral-700 font-bold">
                  Gemini Auto-Fill
                </span>
              </div>
            </button>

            <label className="p-3 rounded-2xl bg-neo-lilac/30 border-[2.5px] border-[#111111] shadow-neo-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 text-left cursor-pointer">
              <span className="p-2 bg-white rounded-xl border-2 border-[#111111] text-[#111111]">
                <Camera className="w-5 h-5 text-[#111111]" />
              </span>
              <div>
                <span className="block text-xs font-black text-[#111111] leading-tight">
                  Snap Business Card
                </span>
                <span className="text-[10px] text-neutral-700 font-bold">
                  Attach Photo
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCardImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Business card preview badge if uploaded */}
          {businessCardUri && (
            <div className="mb-4 p-3 bg-neutral-100 rounded-2xl border-2 border-[#111111] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={businessCardUri} alt="Card preview" className="w-12 h-10 object-cover rounded-lg border border-[#111111]" />
                <span className="text-xs font-bold text-neutral-800">Business Card Attached</span>
              </div>
              <button
                type="button"
                onClick={() => setBusinessCardUri(null)}
                className="text-xs text-red-600 font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Event Selection */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Event:
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full neo-input p-2.5 text-sm font-bold bg-white"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Hari"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Designation & LinkedIn */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Role / Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="AI Engineer • Startup"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  LinkedIn Profile URL
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Description & Notes */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Context & Conversation Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you talk about? Project ideas, collaborations, follow-up promises..."
                rows={2}
                className="w-full neo-input p-2.5 text-sm"
              />
            </div>

            {/* Skill Tags */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Skill Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="LLMs, Python, Flutter, Founder, Deep Tech"
                className="w-full neo-input p-2.5 text-sm"
              />
            </div>

            {/* Relationship Pipeline (Inbound vs Outbound) */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Initial Pipeline Column:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRelationshipType('inbound')}
                  className={`p-2.5 rounded-xl border-2 border-[#111111] text-xs font-black transition-all ${
                    relationshipType === 'inbound'
                      ? 'bg-neo-mint text-[#111111] shadow-neo-sm'
                      : 'bg-white text-neutral-600'
                  }`}
                >
                  Inbound (Active Warm Lead)
                </button>

                <button
                  type="button"
                  onClick={() => setRelationshipType('outbound')}
                  className={`p-2.5 rounded-xl border-2 border-[#111111] text-xs font-black transition-all ${
                    relationshipType === 'outbound'
                      ? 'bg-neo-coral text-white shadow-neo-sm'
                      : 'bg-white text-neutral-600'
                  }`}
                >
                  Outbound (Follow-Up Needed)
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="neo-btn bg-white text-[#111111] px-5 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="neo-btn bg-neo-yellow text-[#111111] px-6 py-2.5 text-sm font-black"
              >
                Save Contact
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* Voice Scribe Modal */}
      <VoiceScribeModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onExtractSuccess={handleVoiceExtractSuccess}
      />
    </>
  );
};
