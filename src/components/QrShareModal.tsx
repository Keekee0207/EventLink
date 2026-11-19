import React, { useState, useEffect, useRef } from 'react';
import { X, QrCode, Scan, User, Check, Sparkles, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { UserProfile, Event, Person } from '../types';
import { getUserProfile, saveUserProfile } from '../services/storageService';

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  onImportContactFromQr: (contact: Partial<Person>) => void;
}

export const QrShareModal: React.FC<QrShareModalProps> = ({
  isOpen,
  onClose,
  events,
  onImportContactFromQr
}) => {
  const [tab, setTab] = useState<'share' | 'scan'>('share');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [scanSuccessMsg, setScanSuccessMsg] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      setProfile(getUserProfile());
    }
  }, [isOpen]);

  // Generate dynamic QR code from user profile
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'eventlink_profile',
      name: profile.name,
      designation: `${profile.role} • ${profile.company}`,
      phone: profile.phone,
      linkedin: profile.linkedin,
      description: profile.bio
    });

    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: {
        dark: '#111111',
        light: '#FFFDF8'
      }
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [profile]);

  // Handle live camera QR scanner
  useEffect(() => {
    if (tab === 'scan' && isOpen) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            if (data.name) {
              onImportContactFromQr({
                name: data.name,
                designation: data.designation || '',
                contactNumber: data.phone || '',
                linkedinUrl: data.linkedin || '',
                description: data.description || 'Imported via EventLink P2P QR Beam'
              });
              setScanSuccessMsg(`Successfully imported ${data.name}!`);
              setTimeout(() => {
                scanner.clear();
                onClose();
              }, 1500);
            }
          } catch {
            alert('Scanned QR code is not in EventLink format.');
          }
        },
        (error) => {
          // ignore scan frame errors
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [tab, isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setIsEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-md p-6 sm:p-8 relative">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Tab Switcher */}
        <div className="flex bg-[#FAF6EE] p-1.5 rounded-2xl border-2 border-[#111111] mb-6">
          <button
            onClick={() => setTab('share')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'share'
                ? 'bg-neo-yellow text-[#111111] border-2 border-[#111111] shadow-neo-sm'
                : 'text-neutral-600'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>My Profile QR</span>
          </button>

          <button
            onClick={() => setTab('scan')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'scan'
                ? 'bg-neo-mint text-[#111111] border-2 border-[#111111] shadow-neo-sm'
                : 'text-neutral-600'
            }`}
          >
            <Scan className="w-4 h-4" />
            <span>Scan Attendee QR</span>
          </button>
        </div>

        {tab === 'share' ? (
          <div>
            {!isEditingProfile ? (
              <div className="text-center">
                {/* Dynamic QR Frame */}
                <div className="p-4 bg-white rounded-3xl border-[3px] border-[#111111] shadow-neo inline-block mb-4">
                  {qrDataUrl && <img src={qrDataUrl} alt="My QR Code" className="w-56 h-56 mx-auto rounded-xl" />}
                </div>

                <h4 className="font-black text-xl text-[#111111]">{profile.name}</h4>
                <p className="text-xs font-bold text-neo-purple">{profile.role} • {profile.company}</p>
                <p className="text-[11px] text-neutral-500 mt-2 font-medium">
                  Have another attendee scan this QR code with their EventLink camera to instantly beam your contact.
                </p>

                <div className="mt-5 flex justify-center space-x-3">
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="neo-btn bg-white text-[#111111] px-4 py-2 text-xs font-bold"
                  >
                    Edit My Info
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <h4 className="font-black text-lg text-[#111111] mb-2">Edit Digital Business Card</h4>
                
                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-black uppercase text-neutral-700">Role</label>
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full neo-input p-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase text-neutral-700">Company</label>
                    <input
                      type="text"
                      value={profile.company}
                      onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                      className="w-full neo-input p-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700">Phone</label>
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase text-neutral-700">LinkedIn URL</label>
                  <input
                    type="text"
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    className="w-full neo-input p-2 text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="neo-btn bg-white px-3 py-1.5 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="neo-btn bg-neo-yellow text-[#111111] px-4 py-1.5 text-xs font-black"
                  >
                    Save & Update QR
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <h4 className="font-black text-lg text-[#111111]">Point Camera at QR Code</h4>
              <p className="text-xs text-neutral-500 font-medium">
                Hold phone steady over an EventLink profile QR code.
              </p>
            </div>

            <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-[#111111]" />

            {scanSuccessMsg && (
              <div className="mt-4 p-3 bg-green-100 border-2 border-green-600 rounded-xl text-green-900 font-black text-xs text-center flex items-center justify-center space-x-1">
                <Check className="w-4 h-4" />
                <span>{scanSuccessMsg}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
