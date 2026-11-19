import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { startListening, stopListening } from '../services/speechService';
import { parseVoiceTranscript } from '../services/geminiService';
import { ParsedContact } from '../types';

interface VoiceScribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractSuccess: (parsed: ParsedContact, rawTranscript: string) => void;
}

export const VoiceScribeModal: React.FC<VoiceScribeModalProps> = ({
  isOpen,
  onClose,
  onExtractSuccess
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleToggleRecord = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setErrorMsg('');
      const started = startListening(
        (text) => {
          setTranscript((prev) => (prev ? `${prev} ${text}` : text));
        },
        (err) => {
          setErrorMsg(err);
          setIsRecording(false);
        },
        () => {
          setIsRecording(false);
        }
      );
      if (started) {
        setIsRecording(true);
      }
    }
  };

  const handleProcessWithGemini = async () => {
    if (!transcript.trim()) {
      setErrorMsg('Please speak or type your conversation note first.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const parsed = await parseVoiceTranscript(transcript);
      onExtractSuccess(parsed, transcript);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Extraction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-lg p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="p-2 rounded-xl bg-neo-yellow border-2 border-[#111111] shadow-neo-sm">
            <Mic className="w-5 h-5 text-[#111111]" />
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#111111]">
            Voice Scribe Auto-Fill
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 mb-6 font-medium">
          Speak naturally about the person you met. Gemini AI and our on-device NLP engine extract their name, role, skills, and phone automatically.
        </p>

        {/* Microphone Button */}
        <div className="flex flex-col items-center justify-center py-6">
          <button
            onClick={handleToggleRecord}
            className={`w-24 h-24 rounded-full border-4 border-[#111111] flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-neo-coral animate-pulse shadow-[0_0_20px_#FF6B6B]'
                : 'bg-neo-yellow shadow-neo hover:scale-105 active:scale-95'
            }`}
          >
            {isRecording ? (
              <MicOff className="w-10 h-10 text-white stroke-[2.5]" />
            ) : (
              <Mic className="w-10 h-10 text-[#111111] stroke-[2.5]" />
            )}
          </button>

          <span className="mt-3 text-xs font-black uppercase tracking-wider text-neutral-700">
            {isRecording ? 'Listening... Tap to stop' : 'Tap to speak'}
          </span>
        </div>

        {/* Transcript Area */}
        <div className="mb-4">
          <label className="block text-xs font-black uppercase text-neutral-700 mb-1">
            Speech Transcript / Spoken Note:
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder='e.g., "I met Hari at the hackathon. He is an AI engineer building LLM agents, phone number 9876543210."'
            rows={3}
            className="w-full neo-input p-3 text-sm"
          />
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-100 border-2 border-red-500 text-red-800 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="neo-btn bg-white text-[#111111] px-5 py-2.5 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessWithGemini}
            disabled={isProcessing || !transcript.trim()}
            className="neo-btn bg-neo-purple text-white px-6 py-2.5 text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Processing Note...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Auto-Fill Contact Fields</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
