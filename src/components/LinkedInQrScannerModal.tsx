import React, { useEffect, useRef, useState } from 'react';
import { X, Scan, Upload, Check } from 'lucide-react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';

interface LinkedInQrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (url: string) => void;
}

export const LinkedInQrScannerModal: React.FC<LinkedInQrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess
}) => {
  const [successMsg, setSuccessMsg] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSuccessMsg('');
      const scanner = new Html5QrcodeScanner(
        'linkedin-qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          let cleanUrl = decodedText.trim();
          if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            if (cleanUrl.includes('linkedin.com')) {
              cleanUrl = 'https://' + cleanUrl;
            }
          }

          setSuccessMsg(`Extracted LinkedIn: ${cleanUrl}`);
          onScanSuccess(cleanUrl);

          setTimeout(() => {
            scanner.clear().catch(() => {});
            onClose();
          }, 1200);
        },
        () => {
          // Ignore frame scan failures
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const html5QrCode = new Html5Qrcode('linkedin-file-reader-hidden');
        const decoded = await html5QrCode.scanFile(file, true);
        let cleanUrl = decoded.trim();
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
          if (cleanUrl.includes('linkedin.com')) {
            cleanUrl = 'https://' + cleanUrl;
          }
        }
        setSuccessMsg(`Extracted LinkedIn: ${cleanUrl}`);
        onScanSuccess(cleanUrl);
        setTimeout(() => onClose(), 1000);
      } catch (err) {
        alert('Could not decode QR code from image. Please ensure image is clear.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="neo-card-flat bg-[#FFFDF8] w-full max-w-md p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full border-2 border-[#111111] bg-white hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="p-2 rounded-xl bg-neo-purple text-white border-2 border-[#111111] shadow-neo-sm">
            <Scan className="w-5 h-5" />
          </span>
          <h3 className="text-xl font-black text-[#111111]">
            Scan LinkedIn QR Code
          </h3>
        </div>

        <p className="text-xs text-neutral-600 mb-4 font-medium">
          Point camera at the attendee LinkedIn profile QR code or upload an image of their QR code.
        </p>

        {/* Camera Box */}
        <div id="linkedin-qr-reader" className="overflow-hidden rounded-2xl border-2 border-[#111111] bg-black mb-4" />
        <div id="linkedin-file-reader-hidden" className="hidden" />

        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border-2 border-green-700 rounded-xl text-green-900 font-bold text-xs flex items-center space-x-2">
            <Check className="w-4 h-4 shrink-0 text-green-700" />
            <span className="line-clamp-1">{successMsg}</span>
          </div>
        )}

        {/* File upload option */}
        <div className="pt-2 border-t-2 border-[#111111] flex items-center justify-between">
          <label className="neo-btn bg-white text-[#111111] px-4 py-2 text-xs flex items-center cursor-pointer hover:bg-neutral-100">
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            <span>Upload QR Image</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={onClose}
            className="neo-btn bg-white text-neutral-600 px-4 py-2 text-xs"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
