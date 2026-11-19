import React, { useState } from 'react';
import { User, Briefcase, Phone, Mail, FileText, Scan, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { LinkedinIcon } from './Icons';
import { LinkedInQrScannerModal } from './LinkedInQrScannerModal';

interface RegistrationModalProps {
  isOpen: boolean;
  onRegisterSuccess: (profile: UserProfile) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onRegisterSuccess
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!role.trim()) {
      alert('Please enter your professional role or designation.');
      return;
    }

    const profile: UserProfile = {
      name: name.trim(),
      role: role.trim(),
      company: company.trim() || 'Independent',
      phone: phone.trim(),
      linkedin: linkedin.trim(),
      email: email.trim(),
      bio: bio.trim() || 'Networking at in-person conferences and hackathons.'
    };

    onRegisterSuccess(profile);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-xl p-6 sm:p-8 relative my-8">
          
          {/* Header */}
          <div className="mb-6 pb-4 border-b-2 border-[#111111]">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-10 h-10 bg-neo-purple rounded-xl border-2 border-[#111111] shadow-neo-sm flex items-center justify-center font-black text-white text-lg">
                EL
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
                Register Your Profile
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              Welcome to EventLink. Set up your digital profile and business card before accessing the networking dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name & Role */}
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
                    placeholder="e.g. John Doe"
                    className="w-full neo-input pl-9 p-2.5 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Primary Role / Title *
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder, AI Engineer"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Company & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Company / Organization
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. DeepTech Labs"
                  className="w-full neo-input p-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                  Phone / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full neo-input pl-9 p-2.5 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full neo-input pl-9 p-2.5 text-sm"
                />
              </div>
            </div>

            {/* LinkedIn URL with Scan Button */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-black uppercase text-neutral-700">
                  LinkedIn Profile
                </label>
                <button
                  type="button"
                  onClick={() => setIsQrScanOpen(true)}
                  className="neo-btn bg-neo-yellow text-[#111111] px-2.5 py-1 text-[10px] font-black flex items-center"
                  title="Scan LinkedIn QR code with camera"
                >
                  <Scan className="w-3 h-3 mr-1" />
                  <span>Scan LinkedIn QR</span>
                </button>
              </div>

              <div className="relative">
                <LinkedinIcon className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full neo-input pl-9 p-2.5 text-sm"
                />
              </div>
            </div>

            {/* Bio / What they are looking for */}
            <div>
              <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                Short Bio / What You Are Looking For
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Building mobile AI apps, seeking co-founders, or exploring investment opportunities..."
                rows={2}
                className="w-full neo-input p-2.5 text-sm"
              />
            </div>

            {/* Privacy notice */}
            <div className="p-3 rounded-2xl bg-neo-mint/20 border-2 border-[#111111] flex items-center space-x-2 text-xs font-medium text-neutral-800">
              <ShieldCheck className="w-4 h-4 text-neo-mint shrink-0" />
              <span>Your profile data is stored strictly on this device. Zero cloud tracking.</span>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full neo-btn bg-neo-yellow text-[#111111] py-3 text-base font-black flex items-center justify-center space-x-2"
              >
                <span>Register Profile & Enter EventLink</span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* LinkedIn Scanner Modal */}
      <LinkedInQrScannerModal
        isOpen={isQrScanOpen}
        onClose={() => setIsQrScanOpen(false)}
        onScanSuccess={(url) => setLinkedin(url)}
      />
    </>
  );
};
