
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera, Upload, X, Loader2, RefreshCcw, Leaf, Image as ImageIcon } from 'lucide-react';
import { analyzePlant } from '../services/aiService';
import { DiagnosisResult, Language } from '../types';

interface ScannerProps {
  lang: Language;
  onResult: (result: Partial<DiagnosisResult>) => void;
  onBack: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ lang, onResult, onBack }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
          track.stop();
          console.debug('Camera track stopped:', track.label);
      });
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopCamera();
    
    // Define a set of progressive constraints to avoid OverconstrainedError
    const constraintSets = [
      { video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } } },
      { video: { facingMode: { ideal: facingMode } } },
      { video: true }
    ];

    let lastError = null;

    for (const constraints of constraintSets) {
      try {
        console.debug('Attempting to start camera with constraints:', constraints);
        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(newStream);
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
        setError(null);
        return; // Success!
      } catch (err) {
        console.warn('Constraint set failed:', constraints, err);
        lastError = err;
      }
    }

    // If all attempts failed, show user-friendly message
    console.error('All camera constraint attempts failed:', lastError);
    if (lastError instanceof DOMException && lastError.name === 'NotAllowedError') {
      setError('📷 Camera access needed. Please allow camera access to scan plants.');
    } else if (lastError instanceof DOMException && lastError.name === 'NotReadableError') {
      setError('📷 Camera is busy. Please close other apps using the camera.');
    } else {
      setError('📷 Unable to access camera. Please check your device settings.');
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    // Small timeout to ensure previous components finished cleanup
    const timer = setTimeout(() => {
      startCamera();
    }, 100);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, [facingMode]);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Use actual video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    
    const imageB64 = canvas.toDataURL('image/jpeg', 0.85);
    processImage(imageB64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setError('Please upload an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const b64 = event.target?.result as string;
      processImage(b64);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (imageB64: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
        const { result, error: aiError } = await analyzePlant(imageB64, lang);
        if (aiError) throw new Error(aiError);
        if (result) {
            stopCamera();
            onResult({ ...result, imageUrl: imageB64 });
        }
    } catch (err: any) {
        setError(err.message || "Analysis failed. Please try again.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col text-white animate-in fade-in duration-300">
      {/* Header Overlay */}
      <div className="p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
            onClick={() => { stopCamera(); onBack(); }} 
            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
            <h2 className="text-sm font-black uppercase tracking-widest text-[var(--primary-400)]">Smart Scanner</h2>
            <p className="text-[10px] text-white/60 font-medium">Point at plant leaves</p>
        </div>
        <button 
            onClick={toggleCamera}
            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl hover:bg-white/20 transition-all"
        >
          <RefreshCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-slate-950">
        {!error && !isAnalyzing && (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="w-full h-full object-cover scale-x-[-1]"
            style={facingMode === 'environment' ? { transform: 'scaleX(1)' } : {}}
          />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--primary-950)]/80 backdrop-blur-lg z-20 p-10 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 border-4 border-[var(--primary-500)]/30 rounded-full animate-ping absolute inset-0"></div>
              <div className="w-24 h-24 bg-[var(--primary-500)] rounded-full flex items-center justify-center relative">
                <Leaf className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-black mb-2">Analyzing Sample...</h3>
            <p className="text-[var(--primary-300)]/60 text-sm font-medium max-w-xs">
               identifying species and health markers.
            </p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCcw className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Camera Access</h3>
              <p className="text-slate-600 mb-6">{error}</p>
              <button 
                onClick={() => { setError(null); startCamera(); }} 
                className="bg-[var(--primary-600)] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[var(--primary-700)] transition-colors w-full"
              >
                Try Again
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="mt-3 text-[var(--primary-600)] font-medium hover:text-[var(--primary-700)] transition-colors"
              >
                Or Upload Photo Instead
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shutter Bar */}
      <div className="p-10 pb-16 flex items-center justify-around bg-gradient-to-t from-black/90 to-transparent">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-2 group"
        >
          <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-all border border-white/5">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50 group-hover:text-white">Gallery</span>
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload}
        />

        <button 
          onClick={handleCapture}
          disabled={isAnalyzing}
          className="w-20 h-20 rounded-full border-[4px] border-white/30 flex items-center justify-center p-1 group active:scale-95 transition-all"
        >
          <div className="w-full h-full bg-white rounded-full group-hover:scale-95 transition-transform shadow-2xl"></div>
        </button>

        <div className="w-16"></div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Scanner;
