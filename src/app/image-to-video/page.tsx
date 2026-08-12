"use client";

import { useState, useRef } from "react";

export default function ImageToVideoPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoResult, setVideoResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setVideoResult(null);
    }
  };

  const handleGenerate = () => {
    if (!imagePreview) return;
    setIsGenerating(true);
    
    // Simulate generation time (connecting to an API like fal.ai)
    setTimeout(() => {
      // Use a placeholder video/animation for the result
      setVideoResult("generated");
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="h-full bg-[#09090B] flex flex-col overflow-y-auto">
      <header className="px-6 py-5 border-b border-[#27272A] shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-white">Image to Video Studio</h1>
          <p className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest mt-0.5">
            Animate Static Images via Motion Models
          </p>
        </div>
        <div className="text-xs text-[#A1A1AA] bg-[#111113] border border-[#27272A] px-3 py-1.5 rounded-xl font-medium">
          Powered by fal.ai engine
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left: Input Config */}
          <div className="md:col-span-1 bg-[#111113] border border-[#27272A] rounded-xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest block">Reference Image</label>
              <div 
                className="aspect-square w-full rounded-xl border border-dashed border-[#27272A] bg-[#09090B] flex flex-col items-center justify-center cursor-pointer hover:border-[#D92A2A]/50 transition-all relative overflow-hidden group"
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Upload preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-xs font-semibold text-white">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 p-4 text-center text-[#A1A1AA] group-hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span className="text-xs font-medium">Click to upload image</span>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#71717A] uppercase tracking-widest block">Motion Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the motion (e.g. 'cinematic slow motion pan, smoke effects')..."
                className="w-full h-32 bg-[#09090B] border border-[#27272A] rounded-xl p-4 text-xs text-white placeholder-[#71717A] outline-none focus:border-[#D92A2A]/40 transition-all resize-none"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !imagePreview}
              className="w-full py-3 bg-[#D92A2A] hover:bg-[#D92A2A]/90 disabled:opacity-40 text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Generate Video
                </>
              )}
            </button>
          </div>

          {/* Right: Output Player */}
          <div className="md:col-span-2 bg-[#111113] border border-[#27272A] rounded-xl p-6 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
            {!videoResult && !isGenerating && (
              <div className="text-center flex flex-col items-center gap-3 text-[#A1A1AA] max-w-sm">
                <div className="w-14 h-14 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-center mb-1 text-[#D92A2A]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                </div>
                <h3 className="text-base font-semibold text-white">Video Result Canvas</h3>
                <p className="text-xs text-[#A1A1AA]">Upload an image and provide a motion prompt to generate an AI video animation.</p>
              </div>
            )}

            {isGenerating && (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-2 border-[#27272A]"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-[#D92A2A] border-t-transparent animate-spin"></div>
                </div>
                <div className="text-xs font-semibold text-[#A1A1AA] animate-pulse">Rendering via fal.ai models...</div>
              </div>
            )}

            {videoResult && !isGenerating && (
              <div className="absolute inset-0 w-full h-full bg-[#09090B] flex items-center justify-center">
                {/* Simulated video playback visual */}
                <div className="relative w-full h-full group flex items-center justify-center">
                  {imagePreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Video result" className="w-full h-full object-contain animate-[pulse_3s_ease-in-out_infinite] scale-105" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-16 h-16 bg-[#D92A2A] hover:bg-[#D92A2A]/90 rounded-full flex items-center justify-center text-white transition-all transform hover:scale-110">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </button>
                  </div>
                  
                  {/* Fake player controls */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                    <div className="flex items-center gap-4 text-white">
                      <button><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></button>
                      <div className="flex-1 h-1.5 bg-[#27272A] rounded-full overflow-hidden">
                        <div className="h-full bg-[#D92A2A] w-[45%]"></div>
                      </div>
                      <span className="text-xs font-mono text-[#A1A1AA]">0:02 / 0:05</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
