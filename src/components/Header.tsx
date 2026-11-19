import React from 'react';
import { CalendarDays, Search, Kanban, QrCode, Settings, Plus, User } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  activeTab: 'events' | 'search' | 'pipeline' | 'qr';
  setActiveTab: (tab: 'events' | 'search' | 'pipeline' | 'qr') => void;
  onOpenCreateEvent: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  eventsCount: number;
  peopleCount: number;
  userProfile: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateEvent,
  onOpenSettings,
  onOpenProfile,
  eventsCount,
  peopleCount,
  userProfile
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FFFDF8] border-b-[3px] border-[#111111] shadow-[0_4px_0_#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('events')}>
            <div className="w-12 h-12 bg-neo-purple rounded-2xl border-[2.5px] border-[#111111] shadow-neo-sm flex items-center justify-center font-black text-xl text-white transform -rotate-2">
              EL
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl font-black tracking-tight text-[#111111]">Event</span>
                <span className="bg-neo-yellow text-[#111111] px-2 py-0.5 rounded-lg border-2 border-[#111111] shadow-neo-sm font-black text-2xl transform rotate-1 inline-block">
                  Link
                </span>
              </div>
              <p className="text-[10px] font-mono tracking-widest text-neutral-600 font-bold uppercase hidden sm:block">
                Smart Networking & Relationship OS
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-[#FAF6EE] p-1.5 rounded-2xl border-[2.5px] border-[#111111] shadow-neo-sm">
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'events'
                  ? 'bg-neo-yellow text-[#111111] border-2 border-[#111111] shadow-neo-sm'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Events</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#111111] text-white rounded-full text-[10px] font-mono">
                {eventsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'search'
                  ? 'bg-neo-purple text-white border-2 border-[#111111] shadow-neo-sm'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Contacts</span>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-black bg-neo-yellow text-[#111111] border border-[#111111]">
                AI
              </span>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-neo-coral text-white border-2 border-[#111111] shadow-neo-sm'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Pipeline CRM</span>
              <span className="ml-1 px-1.5 py-0.2 bg-[#111111] text-white rounded-full text-[10px] font-mono">
                {peopleCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'qr'
                  ? 'bg-neo-mint text-[#111111] border-2 border-[#111111] shadow-neo-sm'
                  : 'text-neutral-700 hover:text-[#111111]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span className="hidden sm:inline">P2P QR</span>
            </button>
          </nav>

          {/* Action Buttons & User Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onOpenCreateEvent}
              className="neo-btn bg-neo-yellow text-[#111111] px-3.5 py-2 text-xs sm:text-sm"
              title="Add New Event"
            >
              <Plus className="w-4 h-4 mr-1 stroke-[3]" />
              <span className="hidden sm:inline">Add Event</span>
            </button>

            {/* User Profile Badge */}
            <button
              onClick={onOpenProfile}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl bg-white border-[2.5px] border-[#111111] shadow-neo-sm hover:bg-[#FAF6EE] transition-all text-[#111111]"
              title="My Registered Profile"
            >
              <div className="w-7 h-7 rounded-xl bg-neo-mint border border-[#111111] flex items-center justify-center font-black text-xs uppercase">
                {userProfile.name ? userProfile.name.substring(0, 2) : 'ME'}
              </div>
              <span className="hidden md:inline font-black text-xs line-clamp-1 max-w-[90px]">
                {userProfile.name || 'Profile'}
              </span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-2 sm:p-2.5 rounded-2xl bg-white border-[2.5px] border-[#111111] shadow-neo-sm hover:bg-neutral-100 transition-all text-[#111111]"
              title="Settings & API"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
