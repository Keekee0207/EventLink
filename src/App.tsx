import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Plus,
  ArrowLeft,
  Calendar,
  Users,
  MapPin,
  Sparkles,
  Search,
  Mic,
  Camera,
  QrCode,
  X,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Event, Person, UserProfile } from './types';
import {
  getEvents,
  saveEvents,
  getPeople,
  savePeople,
  getUserProfile,
  saveUserProfile,
  isUserRegistered
} from './services/storageService';
import { Header } from './components/Header';
import { EventCard } from './components/EventCard';
import { ContactCard } from './components/ContactCard';
import { AddEventModal } from './components/AddEventModal';
import { AddContactModal } from './components/AddContactModal';
import { SemanticSearchTab } from './components/SemanticSearchTab';
import { PipelineTab } from './components/PipelineTab';
import { QrShareModal } from './components/QrShareModal';
import { SettingsModal } from './components/SettingsModal';
import { RegistrationModal } from './components/RegistrationModal';

export function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile());
  const [isRegistered, setIsRegistered] = useState<boolean>(true); // initially check on mount
  const [activeTab, setActiveTab] = useState<'events' | 'search' | 'pipeline' | 'qr'>('events');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [previewCardUri, setPreviewCardUri] = useState<string | null>(null);

  // Local event contact filter
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Initial load
  useEffect(() => {
    reloadAllData();
    setIsRegistered(isUserRegistered());
  }, []);

  const reloadAllData = () => {
    setEvents(getEvents());
    setPeople(getPeople());
    setUserProfile(getUserProfile());
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const handleRegisterSuccess = (profile: UserProfile) => {
    saveUserProfile(profile);
    setUserProfile(profile);
    setIsRegistered(true);
    setIsProfileModalOpen(false);
    triggerConfetti();
  };

  // Event Handlers
  const handleSaveEvent = (newEventData: Omit<Event, 'id' | 'peopleCount' | 'createdAt'>) => {
    const newEvent: Event = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      peopleCount: 0,
      createdAt: new Date().toISOString()
    };
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveEvents(updated);
    triggerConfetti();
  };

  const handleDeleteEvent = (eventId: string) => {
    const updatedEvents = events.filter((e) => e.id !== eventId);
    const updatedPeople = people.filter((p) => p.eventId !== eventId);
    setEvents(updatedEvents);
    setPeople(updatedPeople);
    saveEvents(updatedEvents);
    savePeople(updatedPeople);
    if (selectedEvent?.id === eventId) {
      setSelectedEvent(null);
    }
  };

  // Contact Handlers
  const handleSaveContact = (newPersonData: Omit<Person, 'id' | 'createdAt'>) => {
    const newPerson: Person = {
      ...newPersonData,
      id: `person-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updatedPeople = [newPerson, ...people];
    setPeople(updatedPeople);
    savePeople(updatedPeople);

    // Update peopleCount on target event
    const updatedEvents = events.map((evt) => {
      if (evt.id === newPerson.eventId) {
        return { ...evt, peopleCount: evt.peopleCount + 1 };
      }
      return evt;
    });
    setEvents(updatedEvents);
    saveEvents(updatedEvents);

    triggerConfetti();
  };

  const handleDeleteContact = (personId: string) => {
    const target = people.find((p) => p.id === personId);
    const updatedPeople = people.filter((p) => p.id !== personId);
    setPeople(updatedPeople);
    savePeople(updatedPeople);

    if (target) {
      const updatedEvents = events.map((evt) => {
        if (evt.id === target.eventId && evt.peopleCount > 0) {
          return { ...evt, peopleCount: evt.peopleCount - 1 };
        }
        return evt;
      });
      setEvents(updatedEvents);
      saveEvents(updatedEvents);
    }
  };

  const handleToggleRelationship = (person: Person) => {
    const updatedPeople = people.map((p) => {
      if (p.id === person.id) {
        return {
          ...p,
          relationshipType: p.relationshipType === 'inbound' ? ('outbound' as const) : ('inbound' as const)
        };
      }
      return p;
    });
    setPeople(updatedPeople);
    savePeople(updatedPeople);
  };

  // Filter contacts for selected event
  const selectedEventContacts = selectedEvent
    ? people
        .filter((p) => p.eventId === selectedEvent.id)
        .filter((p) => {
          if (!contactSearchQuery.trim()) return true;
          const q = contactSearchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.designation.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
          );
        })
    : [];

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col font-sans">
      
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'qr') {
            setIsQrModalOpen(true);
            setActiveTab('events');
          }
        }}
        onOpenCreateEvent={() => setIsAddEventOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        eventsCount={events.length}
        peopleCount={people.length}
        userProfile={userProfile}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: EVENTS DASHBOARD */}
        {activeTab === 'events' && !selectedEvent && (
          <div>
            {/* Memphis Hero Banner */}
            <div className="neo-card p-6 sm:p-10 mb-8 bg-[#FFFDF8] relative overflow-hidden">
              
              {/* Memphis background decorative accents */}
              <div className="absolute top-4 right-4 hidden sm:flex items-center space-x-2 opacity-80 pointer-events-none">
                <div className="w-12 h-10 border-2 border-[#111111] grid grid-cols-2 grid-rows-2">
                  <div className="border-r border-b border-[#111111]" />
                  <div className="border-b border-[#111111] bg-neo-coral" />
                  <div className="border-r border-[#111111]" />
                  <div className="bg-neo-yellow" />
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-[#111111] bg-neo-mint" />
              </div>

              <div className="max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-neo-lilac/30 border-2 border-[#111111] shadow-neo-sm text-xs font-black uppercase mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-neo-purple" />
                  <span>Offline-Ready • Gemini Multimodal AI</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-[#111111] tracking-tight leading-tight mb-3">
                  Turn Event Handshakes Into Permanent Connections.
                </h1>

                <p className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed mb-6">
                  Capture contacts in seconds using Gemini Voice Auto-Scribe and business card photo snaps. Zero typing, 100% on-device data sovereignty.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsAddEventOpen(true)}
                    className="neo-btn bg-neo-yellow text-[#111111] px-5 py-2.5 text-sm font-black"
                  >
                    <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                    <span>Create Event Hub</span>
                  </button>

                  <button
                    onClick={() => setIsQrModalOpen(true)}
                    className="neo-btn bg-white text-[#111111] px-5 py-2.5 text-sm font-bold hover:bg-neutral-50"
                  >
                    <QrCode className="w-4 h-4 mr-1.5" />
                    <span>My Digital Card</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Events Grid Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-[#111111]">
                  Your Event Spaces
                </h2>
                <p className="text-xs text-neutral-600 font-medium">
                  Select an event to view attendees or capture new contacts.
                </p>
              </div>

              <button
                onClick={() => setIsAddEventOpen(true)}
                className="neo-btn bg-neo-yellow text-[#111111] px-3.5 py-1.5 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5 mr-1 stroke-[3]" />
                <span>New Event</span>
              </button>
            </div>

            {/* Events Grid */}
            {events.length === 0 ? (
              <div className="neo-card p-12 text-center bg-white">
                <Calendar className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="text-xl font-black text-[#111111]">No Events Created Yet</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
                  Create your first event space to start capturing people you meet at hackathons or conferences.
                </p>
                <button
                  onClick={() => setIsAddEventOpen(true)}
                  className="neo-btn bg-neo-yellow text-[#111111] px-6 py-2.5 text-sm font-black"
                >
                  Create Your First Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    contactCount={people.filter((p) => p.eventId === evt.id).length}
                    onSelectEvent={(e) => setSelectedEvent(e)}
                    onAddContactToEvent={(e) => {
                      setSelectedEvent(e);
                      setIsAddContactOpen(true);
                    }}
                    onDeleteEvent={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1 (SUB-VIEW): EVENT DETAILS & CONTACTS */}
        {activeTab === 'events' && selectedEvent && (
          <div>
            {/* Back Button & Event Banner */}
            <button
              onClick={() => setSelectedEvent(null)}
              className="neo-btn bg-white text-[#111111] px-3.5 py-1.5 text-xs font-bold mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Back to All Events</span>
            </button>

            <div className="neo-card p-6 sm:p-8 bg-[#FFFDF8] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="neo-pill bg-neo-yellow text-[#111111] px-3 py-1 text-xs inline-block mb-2">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black text-[#111111]">
                    {selectedEvent.title}
                  </h1>
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-neo-purple" />
                    <span>{selectedEvent.location}</span>
                  </p>
                </div>

                <button
                  onClick={() => setIsAddContactOpen(true)}
                  className="neo-btn bg-neo-yellow text-[#111111] px-5 py-3 text-sm font-black shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                  <span>Add Person Met</span>
                </button>
              </div>
            </div>

            {/* Filter and Search Inside Event */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-[#111111]">
                  People Met at this Event
                </h3>
                <span className="neo-pill bg-neo-purple text-white px-2.5 py-0.5 text-xs">
                  {selectedEventContacts.length}
                </span>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  placeholder="Filter by name, role, skill..."
                  className="w-full neo-input pl-9 p-2 text-xs"
                />
              </div>
            </div>

            {/* Contacts Grid */}
            {selectedEventContacts.length === 0 ? (
              <div className="neo-card p-12 text-center bg-white">
                <Users className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h4 className="text-lg font-black text-[#111111]">No Contacts Found</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
                  Speak a voice note or snap a business card to record someone you met at {selectedEvent.title}.
                </p>
                <button
                  onClick={() => setIsAddContactOpen(true)}
                  className="neo-btn bg-neo-yellow text-[#111111] px-5 py-2 text-xs font-black"
                >
                  <Plus className="w-4 h-4 mr-1 stroke-[3]" />
                  <span>Add First Contact</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {selectedEventContacts.map((person) => (
                  <ContactCard
                    key={person.id}
                    person={person}
                    eventTitle={selectedEvent.title}
                    onDeleteContact={handleDeleteContact}
                    onToggleRelationship={handleToggleRelationship}
                    onPreviewCard={(uri) => setPreviewCardUri(uri)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONVERSATIONAL SEMANTIC SEARCH */}
        {activeTab === 'search' && (
          <SemanticSearchTab people={people} />
        )}

        {/* TAB 3: PIPELINE CRM (INBOUND VS OUTBOUND) */}
        {activeTab === 'pipeline' && (
          <PipelineTab
            people={people}
            events={events}
            onToggleRelationship={handleToggleRelationship}
            onDeleteContact={handleDeleteContact}
          />
        )}

      </main>

      {/* Floating Action Button (FAB) on Mobile */}
      <button
        onClick={() => {
          if (selectedEvent) {
            setIsAddContactOpen(true);
          } else {
            setIsAddEventOpen(true);
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-neo-yellow border-[3px] border-[#111111] shadow-neo-lg flex items-center justify-center font-black text-2xl text-[#111111] hover:scale-110 active:scale-95 transition-all z-40 md:hidden"
        title="Add Event or Contact"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </button>

      {/* Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        onSaveEvent={handleSaveEvent}
        existingEvents={events}
      />

      <AddContactModal
        isOpen={isAddContactOpen}
        onClose={() => setIsAddContactOpen(false)}
        onSaveContact={handleSaveContact}
        events={events}
        existingPeople={people}
        selectedEventId={selectedEvent?.id}
      />

      <QrShareModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        events={events}
        onImportContactFromQr={(partialContact) => {
          const targetEventId = selectedEvent?.id || events[0]?.id || 'default';
          handleSaveContact({
            eventId: targetEventId,
            name: partialContact.name || 'Anonymous',
            designation: partialContact.designation || '',
            company: partialContact.company || '',
            contactNumber: partialContact.contactNumber || '',
            linkedinUrl: partialContact.linkedinUrl || '',
            description: partialContact.description || 'Scanned via EventLink P2P QR',
            tags: ['P2P QR'],
            relationshipType: 'inbound',
            voiceTranscript: null,
            businessCardUri: null,
            lastContactDate: new Date().toISOString(),
            callCount: 0,
            messageCount: 0
          });
        }}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataReload={reloadAllData}
      />

      {/* Mandatory Registration Onboarding Modal (or Edit Profile) */}
      <RegistrationModal
        isOpen={!isRegistered || isProfileModalOpen}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* Business Card Photo Preview Modal */}
      {previewCardUri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn" onClick={() => setPreviewCardUri(null)}>
          <div className="neo-card-flat bg-white max-w-lg w-full p-4 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewCardUri(null)}
              className="absolute top-3 right-3 p-1 rounded-full bg-white border-2 border-[#111111]"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="text-sm font-black uppercase text-neutral-700 mb-2">Scanned Business Card</h4>
            <img src={previewCardUri} alt="Business card preview" className="w-full rounded-xl border-2 border-[#111111]" />
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
