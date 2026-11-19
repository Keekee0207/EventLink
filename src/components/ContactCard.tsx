import React, { useState } from 'react';
import { Phone, MessageCircle, Mic, Image, Trash2, ArrowUpDown, Sparkles, Check } from 'lucide-react';
import { LinkedinIcon } from './Icons';
import { Person } from '../types';

interface ContactCardProps {
  person: Person;
  eventTitle?: string;
  onDeleteContact: (id: string) => void;
  onToggleRelationship: (person: Person) => void;
  onPreviewCard?: (cardUri: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  person,
  eventTitle = 'the event',
  onDeleteContact,
  onToggleRelationship,
  onPreviewCard
}) => {
  const [copied, setCopied] = useState(false);

  // Pre-filled WhatsApp message
  const whatsappUrl = () => {
    const cleanNumber = person.contactNumber.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hi ${person.name}! It was great connecting with you at ${eventTitle}. Let's stay in touch!`
    );
    return `https://wa.me/${cleanNumber}?text=${text}`;
  };

  const cleanLinkedInUrl = (url: string) => {
    if (!url) return '';
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = 'https://' + clean;
    }
    return clean;
  };

  return (
    <div className="neo-card p-5 flex flex-col justify-between relative bg-[#FFFDF8] group">
      
      {/* Top Header: Avatar + Relationship Badge + Delete */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {/* Avatar Icon / Initial */}
          <div className="w-12 h-12 rounded-2xl bg-neo-yellow border-2 border-[#111111] shadow-neo-sm flex items-center justify-center font-black text-lg text-[#111111] uppercase shrink-0">
            {person.name.substring(0, 2) || 'EL'}
          </div>

          <div>
            <h4 className="font-black text-lg text-[#111111] leading-tight line-clamp-1">
              {person.name}
            </h4>
            {person.designation && (
              <p className="text-xs font-bold text-neo-purple line-clamp-1 mt-0.5">
                {person.designation}
              </p>
            )}
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => {
            if (confirm(`Remove ${person.name} from contacts?`)) {
              onDeleteContact(person.id);
            }
          }}
          className="text-neutral-400 hover:text-neo-coral p-1 transition-colors"
          title="Delete Contact"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Description / Notes */}
      {person.description && (
        <p className="text-xs text-neutral-700 font-medium mb-3 line-clamp-2 bg-[#FAF6EE] p-2 rounded-xl border border-neutral-300">
          {person.description}
        </p>
      )}

      {/* Tags / Badges */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {/* Inbound / Outbound Switch Pill */}
        <button
          onClick={() => onToggleRelationship(person)}
          className={`neo-pill px-2.5 py-0.5 text-[10px] flex items-center space-x-1 cursor-pointer transition-all ${
            person.relationshipType === 'inbound'
              ? 'bg-neo-mint text-[#111111]'
              : 'bg-neo-coral text-white'
          }`}
          title="Click to switch between Inbound (active) and Outbound (dormant)"
        >
          <ArrowUpDown className="w-2.5 h-2.5 mr-1" />
          <span className="uppercase">{person.relationshipType}</span>
        </button>

        {/* Voice Scribe Badge */}
        {person.voiceTranscript && (
          <span className="neo-pill bg-neo-purple text-white px-2 py-0.5 text-[10px] flex items-center">
            <Mic className="w-2.5 h-2.5 mr-1" />
            <span>Voice Note</span>
          </span>
        )}

        {/* Business Card Badge */}
        {person.businessCardUri && (
          <button
            onClick={() => onPreviewCard && onPreviewCard(person.businessCardUri!)}
            className="neo-pill bg-neo-yellow text-[#111111] px-2 py-0.5 text-[10px] flex items-center hover:bg-yellow-300"
          >
            <Image className="w-2.5 h-2.5 mr-1" />
            <span>Card Photo</span>
          </button>
        )}

        {/* Skills */}
        {person.tags.slice(0, 3).map((tag, i) => (
          <span key={i} className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-200 text-neutral-800 border border-neutral-400">
            {tag}
          </span>
        ))}
      </div>

      {/* Quick Action Buttons (WhatsApp, Dial, LinkedIn) */}
      <div className="pt-3 border-t-2 border-[#111111] grid grid-cols-3 gap-2">
        {/* WhatsApp */}
        {person.contactNumber ? (
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn bg-neo-mint text-[#111111] py-1.5 text-xs flex items-center justify-center"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            <span>Chat</span>
          </a>
        ) : (
          <button disabled className="neo-btn bg-neutral-200 text-neutral-400 py-1.5 text-xs opacity-50 cursor-not-allowed">
            <MessageCircle className="w-3.5 h-3.5 mr-1" />
            <span>Chat</span>
          </button>
        )}

        {/* Call */}
        {person.contactNumber ? (
          <a
            href={`tel:${person.contactNumber}`}
            className="neo-btn bg-neo-yellow text-[#111111] py-1.5 text-xs flex items-center justify-center"
            title="Call Contact"
          >
            <Phone className="w-3.5 h-3.5 mr-1" />
            <span>Call</span>
          </a>
        ) : (
          <button disabled className="neo-btn bg-neutral-200 text-neutral-400 py-1.5 text-xs opacity-50 cursor-not-allowed">
            <Phone className="w-3.5 h-3.5 mr-1" />
            <span>Call</span>
          </button>
        )}

        {/* LinkedIn */}
        {person.linkedinUrl ? (
          <a
            href={cleanLinkedInUrl(person.linkedinUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="neo-btn bg-neo-purple text-white py-1.5 text-xs flex items-center justify-center"
            title="View LinkedIn Profile"
          >
            <LinkedinIcon className="w-3.5 h-3.5 mr-1" />
            <span>Profile</span>
          </a>
        ) : (
          <button disabled className="neo-btn bg-neutral-200 text-neutral-400 py-1.5 text-xs opacity-50 cursor-not-allowed">
            <LinkedinIcon className="w-3.5 h-3.5 mr-1" />
            <span>Profile</span>
          </button>
        )}
      </div>

    </div>
  );
};
