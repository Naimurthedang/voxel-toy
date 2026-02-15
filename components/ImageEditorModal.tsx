
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Camera, X, Wand2, Loader2, Download } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  getSnapshot: () => string;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, getSnapshot }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSnapshot(getSnapshot());
      setResultImage(null);
      setPrompt('');
    }
  }, [isOpen]);

  const handleEdit = async () => {
    if (!prompt.trim() || !snapshot) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = snapshot.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/png' } },
            { text: `Apply the following edit to this 3D model snapshot: ${prompt}. Make it look professional and high quality.` }
          ]
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setResultImage(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to edit image.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col h-[80vh] border-4 border-amber-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-amber-50 bg-amber-50/50">
          <div className="flex items-center gap-3">
            <Camera className="text-amber-600" size={28} />
            <h2 className="text-2xl font-black text-slate-800">AI Product Snap & Edit</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1 flex flex-col gap-4">
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Original Snapshot</h3>
            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-200">
              {snapshot && <img src={snapshot} className="w-full h-full object-cover" alt="Original" />}
            </div>
            <textarea
              placeholder="E.g. Add a retro filter, put this in a luxury showroom, remove the background..."
              className="w-full h-24 p-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:outline-none font-bold text-slate-700"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button
              onClick={handleEdit}
              disabled={isProcessing || !prompt.trim()}
              className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <Wand2 />}
              {isProcessing ? "Gemini is editing..." : "Generate Pro Edit"}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <h3 className="font-bold text-slate-500 uppercase text-xs tracking-widest">Edited Result</h3>
            <div className="aspect-video bg-slate-100 rounded-2xl overflow-hidden border-2 border-amber-200 flex items-center justify-center relative">
              {resultImage ? (
                <>
                  <img src={resultImage} className="w-full h-full object-cover" alt="Result" />
                  <a href={resultImage} download="ai_edit.png" className="absolute bottom-4 right-4 p-3 bg-white/90 rounded-full text-slate-800 shadow-md hover:scale-110 transition-transform">
                    <Download size={20} />
                  </a>
                </>
              ) : (
                <div className="text-slate-400 font-bold italic">Waiting for your vision...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
