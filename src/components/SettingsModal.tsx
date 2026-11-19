import React, { useState } from 'react';
import { X, Key, Download, Upload, RefreshCw, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { getApiKey, saveApiKey } from '../services/geminiService';
import { exportAllDataJson, importAllDataJson } from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataReload
}) => {
  const [apiKey, setApiKey] = useState(getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleExportData = () => {
    const json = exportAllDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eventlink_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text && importAllDataJson(text)) {
          alert('Backup restored successfully!');
          onDataReload();
          onClose();
        } else {
          alert('Invalid backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetSampleData = () => {
    if (confirm('Reset to default sample events and contacts?')) {
      localStorage.clear();
      onDataReload();
      onClose();
    }
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
          Settings & Configuration
        </h3>
        <p className="text-xs text-neutral-600 mb-6 font-medium">
          Manage Google Gemini AI connection and device data sovereignty.
        </p>

        {/* Gemini API Key Form */}
        <form onSubmit={handleSaveKey} className="mb-6 p-4 rounded-2xl bg-[#FAF6EE] border-2 border-[#111111]">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-neo-purple" />
            <label className="text-xs font-black uppercase text-[#111111]">
              Google Gemini API Key
            </label>
          </div>

          <p className="text-[11px] text-neutral-500 mb-3">
            Used for real-time voice scribing, business card understanding, and semantic search.
          </p>

          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full neo-input p-2.5 text-xs font-mono mb-3"
          />

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500">
              Key is stored exclusively in your browser's local storage.
            </span>

            <button
              type="submit"
              className="neo-btn bg-neo-yellow text-[#111111] px-4 py-1.5 text-xs font-black"
            >
              {savedSuccess ? 'Saved!' : 'Save Key'}
            </button>
          </div>
        </form>

        {/* 100% Local Storage Guarantee */}
        <div className="mb-6 p-3.5 rounded-2xl bg-neo-mint/20 border-2 border-[#111111] flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-neo-mint shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-800">
            <strong className="block font-black text-[#111111]">Zero Cloud Tracking</strong>
            Your events, contact numbers, and notes are stored strictly on this device. Cloud calls to Gemini are ephemeral and never logged.
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="space-y-3 pt-3 border-t-2 border-[#111111]">
          <h4 className="text-xs font-black uppercase text-neutral-700">Data Management</h4>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="neo-btn bg-white text-[#111111] px-3.5 py-2 text-xs flex items-center hover:bg-neutral-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export JSON Backup</span>
            </button>

            <label className="neo-btn bg-white text-[#111111] px-3.5 py-2 text-xs flex items-center hover:bg-neutral-50 cursor-pointer">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
            </label>

            <button
              onClick={handleResetSampleData}
              className="neo-btn bg-red-100 text-red-900 border-red-500 px-3.5 py-2 text-xs flex items-center hover:bg-red-200"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Reset Sample Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
