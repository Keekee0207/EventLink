import React from 'react';
import { Calendar, MapPin, Users, Trash2, ArrowRight, UserPlus } from 'lucide-react';
import { Event } from '../types';

interface EventCardProps {
  event: Event;
  contactCount: number;
  onSelectEvent: (event: Event) => void;
  onAddContactToEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  contactCount,
  onSelectEvent,
  onAddContactToEvent,
  onDeleteEvent
}) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="neo-card p-6 flex flex-col justify-between relative overflow-hidden group">
      
      {/* Top Tag & Delete */}
      <div className="flex items-center justify-between mb-4">
        <span className="neo-pill bg-neo-yellow text-[#111111] px-3 py-1 flex items-center space-x-1">
          <Calendar className="w-3.5 h-3.5 mr-1" />
          <span>{formattedDate}</span>
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete "${event.title}" and its contacts?`)) {
              onDeleteEvent(event.id);
            }
          }}
          className="text-neutral-400 hover:text-neo-coral transition-colors p-1"
          title="Delete Event"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Info */}
      <div className="cursor-pointer mb-6" onClick={() => onSelectEvent(event)}>
        <h3 className="text-xl sm:text-2xl font-black text-[#111111] group-hover:text-neo-purple transition-colors line-clamp-1 mb-2">
          {event.title}
        </h3>
        
        <div className="flex items-start text-xs sm:text-sm text-neutral-600 mb-3 font-medium">
          <MapPin className="w-4 h-4 mr-1 text-neo-purple shrink-0 mt-0.5" />
          <span className="line-clamp-1">{event.location || 'Location not specified'}</span>
        </div>

        {event.description && (
          <p className="text-xs text-neutral-600 line-clamp-2 font-normal">
            {event.description}
          </p>
        )}
      </div>

      {/* Footer Stats & Actions */}
      <div className="pt-4 border-t-2 border-[#111111] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="neo-pill bg-neo-purple text-white px-3 py-1 flex items-center">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            <span className="font-bold">{contactCount} Met</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onAddContactToEvent(event)}
            className="neo-btn bg-neo-yellow text-[#111111] px-3 py-1.5 text-xs"
            title="Add Person Met"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
            <span>Add</span>
          </button>

          <button
            onClick={() => onSelectEvent(event)}
            className="neo-btn bg-white text-[#111111] px-3 py-1.5 text-xs hover:bg-[#FAF6EE]"
          >
            <span>Open</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>
      </div>

    </div>
  );
};
