import React, { useState } from 'react';
import { X, Calendar, MapPin, Building, AlertCircle } from 'lucide-react';
import { Event } from '../types';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveEvent: (event: Omit<Event, 'id' | 'peopleCount' | 'createdAt'>) => void;
  existingEvents: Event[];
}

const POPULAR_CITIES = [
  'Chennai, Tamil Nadu',
  'Bengaluru, Karnataka',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'New Delhi, Delhi NCR',
  'Coimbatore, Tamil Nadu'
];

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  onSaveEvent,
  existingEvents
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [city, setCity] = useState('');
  const [venue, setVenue] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setErrorMsg('Please enter an event name.');
      return;
    }

    // Duplicate event check
    const isDuplicate = existingEvents.some(
      (evt) => evt.title.toLowerCase().trim() === trimmedTitle.toLowerCase()
    );

    if (isDuplicate) {
      setErrorMsg(`An event titled "${trimmedTitle}" already exists. Duplicate events are not permitted.`);
      return;
    }

    const fullLocation = [venue.trim(), city.trim()].filter(Boolean).join(', ');

    onSaveEvent({
      title: trimmedTitle,
      date,
      location: fullLocation || city || 'In-Person Event',
      description: description.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-lg p-6 sm:p-8 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Title */}
        <h3 className="text-2xl font-black text-[#111111] mb-1">
          Create Event Space
        </h3>
        <p className="text-xs text-neutral-600 mb-6 font-medium">
          Set up a dedicated hub for your hackathon, summit, or conference.
        </p>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Event Title */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Google Buildathon 2026"
              className="w-full neo-input p-2.5 text-sm font-bold"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Event Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full neo-input pl-9 p-2.5 text-sm"
              />
            </div>
          </div>

          {/* City & Quick Chips */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              City / Region
            </label>
            <div className="relative mb-2">
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Chennai, Tamil Nadu"
                className="w-full neo-input pl-9 p-2.5 text-sm"
              />
            </div>

            {/* Quick 1-tap chips */}
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCity(c)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#111111] transition-all ${
                    city === c ? 'bg-neo-yellow text-[#111111]' : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {c.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Specific Venue / Hall
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Chennai Trade Centre, Hall 3"
                className="w-full neo-input pl-9 p-2.5 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
              Description / Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hackathon goals, booth topics, agenda..."
              rows={2}
              className="w-full neo-input p-2.5 text-sm"
            />
          </div>

          {/* Action buttons */}
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
              Create Event
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
