
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Video, X, Search, Loader2, Baby, Info } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

export const VideoAnalysisModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const analyzeVideo = async () => {
    if (!videoFile) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const reader = new FileReader();
      
      const fileData = await new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(videoFile);
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [
          {
            parts: [
              { inlineData: { data: fileData, mimeType: videoFile.type } },
              { text: "Analyze this video for key moments. If it's a baby video, identify 'hit' moments or funny reactions. If it's a product video, explain the 3D art features and quality. Summarize clearly." }
            ]
          }
        ]
      });

      setAnalysis(response.text || "No analysis generated.");
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Ensure video size is within limits.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col h-[85vh] border-4 border-emerald-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-emerald-50 bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <Video className="text-emerald-600" size={28} />
            <h2 className="text-2xl font-black text-slate-800">Video Insight Explorer</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center w-full h-64 border-4 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-50 transition-colors">
                {videoPreview ? (
                  <video src={videoPreview} className="w-full h-full rounded-2xl object-cover" controls />
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Video size={48} className="text-slate-300" />
                    <span className="text-slate-400 font-bold">Select Baby or Product Video</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="video/*" onChange={handleFileChange} />
              </label>
              
              <button
                onClick={analyzeVideo}
                disabled={!videoFile || isAnalyzing}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-lg flex items-center justify-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search />}
                {isAnalyzing ? "Gemini Pro analyzing..." : "Analyze Moments"}
              </button>
            </div>

            <div className="bg-slate-50 rounded-3xl p-6 border-2 border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs tracking-tighter">
                <Info size={16} />
                AI Analysis Report
              </div>
              <div className="flex-1 text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                {analysis ? analysis : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center gap-4">
                    <Baby size={48} className="opacity-20" />
                    <p>Upload a video to see AI-generated <br/> insights and 'hit' moments.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
