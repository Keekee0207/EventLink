import React, { useState } from 'react';
import { User, Briefcase, Phone, Mail, Lock, FileText, Scan, ArrowRight, ShieldCheck, AlertCircle, LogIn } from 'lucide-react';
import { UserProfile, UserAccount } from '../types';
import { LinkedinIcon } from './Icons';
import { LinkedInQrScannerModal } from './LinkedInQrScannerModal';
import { registerUser, loginUser } from '../services/authService';

interface RegistrationModalProps {
  isOpen: boolean;
  onRegisterSuccess: (profile: UserProfile) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onRegisterSuccess
}) => {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrScanOpen, setIsQrScanOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setErrorMsg('Please enter your email and password to sign in.');
        return;
      }
      setIsSubmitting(true);
      const res = await loginUser(email, password);
      setIsSubmitting(false);
      if (res.success && res.user) {
        onRegisterSuccess(res.user);
      } else {
        setErrorMsg(res.message || 'Login failed. Please verify your credentials.');
      }
      return;
    }

    // Registration Mode
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!role.trim()) {
      setErrorMsg('Please enter your professional role or designation.');
      return;
    }

    const resolvedEmail = email.trim() || `${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}@eventlink.app`;
    const resolvedPassword = password.trim() || 'eventlink123';

    setIsSubmitting(true);
    const res = await registerUser({
      name: name.trim(),
      role: role.trim(),
      company: company.trim() || 'Independent',
      phone: phone.trim(),
      linkedin: linkedin.trim(),
      email: resolvedEmail,
      password: resolvedPassword,
      bio: bio.trim() || 'Networking at in-person conferences and hackathons.'
    });
    setIsSubmitting(false);

    if (res.success && res.user) {
      onRegisterSuccess(res.user);
    } else {
      setErrorMsg(res.message || 'Registration failed. An account may already exist.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
        <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-xl p-6 sm:p-8 relative my-8">
          
          {/* Header */}
          <div className="mb-4 pb-4 border-b-2 border-[#111111]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-neo-purple rounded-xl border-2 border-[#111111] shadow-neo-sm flex items-center justify-center font-black text-white text-lg">
                  EL
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#111111]">
                  Register Your Profile
                </h2>
              </div>

              {/* Mode Switcher */}
              <div className="flex border-2 border-[#111111] rounded-xl overflow-hidden bg-white shadow-neo-sm">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  className={`px-3 py-1 text-xs font-black transition-colors ${
                    mode === 'register' ? 'bg-neo-yellow text-[#111111]' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  className={`px-3 py-1 text-xs font-black transition-colors ${
                    mode === 'login' ? 'bg-neo-purple text-white' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Sign In
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              {mode === 'register'
                ? 'Create your digital attendee profile and digital business card. Strict duplicate prevention ensures unique attendee records.'
                : 'Sign in to access your personal event network and saved contacts.'}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-neo-coral/15 border-2 border-neo-coral rounded-2xl flex items-start space-x-2 text-xs font-bold text-red-900 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-neo-coral shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {mode === 'register' ? (
              <>
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

                {/* Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="e.g. alex@venture.com"
                        className="w-full neo-input pl-9 p-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 4 characters"
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

                {/* LinkedIn Profile with QR Scanner Button */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black uppercase text-neutral-700">
                      LinkedIn Profile URL
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsQrScanOpen(true)}
                      className="text-[11px] font-black text-neo-purple hover:underline flex items-center"
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

                {/* Bio */}
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Short Bio / What You Are Looking For
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Building mobile AI apps, seeking co-founders, or exploring investment opportunities..."
                    className="w-full neo-input p-2.5 text-sm"
                  />
                </div>
              </>
            ) : (
              /* Sign In Form */
              <div className="space-y-4 py-2">
                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. alex@venture.com"
                      className="w-full neo-input pl-9 p-2.5 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your account password"
                      className="w-full neo-input pl-9 p-2.5 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Pill */}
            <div className="p-3 rounded-2xl bg-neo-mint/20 border-2 border-[#111111] flex items-center space-x-2 text-xs font-medium text-neutral-800">
              <ShieldCheck className="w-4 h-4 text-neo-mint shrink-0" />
              <span>
                User accounts are isolated. You only view and manage your own contacts and events with duplicate protection.
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full neo-btn bg-neo-yellow text-[#111111] py-3 text-base font-black flex items-center justify-center space-x-2"
              >
                <span>
                  {mode === 'register' ? 'Register Profile & Enter EventLink' : 'Sign In to Your Workspace'}
                </span>
                <ArrowRight className="w-4 h-4 ml-1 stroke-[3]" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* QR Code Camera Scanner Modal */}
      <LinkedInQrScannerModal
        isOpen={isQrScanOpen}
        onClose={() => setIsQrScanOpen(false)}
        onScanSuccess={(url) => {
          setLinkedin(url);
          setIsQrScanOpen(false);
        }}
      />
    </>
  );
};
