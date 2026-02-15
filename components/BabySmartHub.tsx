
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Sparkles, X, Baby, Heart, Utensils, GraduationCap, Gamepad2, Search, Loader2, Activity, Star, UserCheck, Stethoscope, BookOpen, HeartPulse, Trophy, Smile, HandMetal, Camera, Gift, Brain, Globe, ShieldCheck, Zap } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

type HubTab = 'names' | 'horoscope' | 'bonding' | 'health' | 'education';

export const BabySmartHub: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<HubTab>('bonding');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Interaction states
  const [loveCount, setLoveCount] = useState(124);
  const [smileCount, setSmileCount] = useState(42);
  const [learningProgress, setLearningProgress] = useState(65);
  const [healthScore, setHealthScore] = useState(88);
  const [masteredCount, setMasteredCount] = useState(4);

  // Gemini Logic
  const handleAction = async (prompt: string, type: HubTab) => {
    setLoading(true);
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';
      
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              details: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              advice: { type: Type.STRING },
              metrics: {
                type: Type.OBJECT,
                properties: {
                    vitality: { type: Type.NUMBER },
                    joy: { type: Type.NUMBER },
                    growth: { type: Type.NUMBER }
                }
              }
            },
            required: ["title", "content"]
          }
        }
      });
      
      if (response.text) {
        const parsed = JSON.parse(response.text);
        setResult(parsed);
        if (parsed.metrics) {
            if (type === 'health') setHealthScore(parsed.metrics.vitality || 80);
            if (type === 'education') {
                setLearningProgress(prev => Math.min(100, prev + (parsed.metrics.growth || 5)));
                if (Math.random() > 0.7) setMasteredCount(prev => prev + 1);
            }
        }
      }
    } catch (err) {
      console.error(err);
      alert("AI Intelligence Error. Please check connection.");
    } finally {
      setLoading(false);
    }
  };

  const getNames = () => handleAction("Generate 10 unique, aesthetic baby names with their meanings and origins. Theme: Nature and Stars.", 'names');
  const getHoroscope = (sign: string) => handleAction(`Baby Horoscope for ${sign}. Focus on developmental milestones and personality.`, 'horoscope');
  const getHealthAdvice = (food: string, weight: string) => handleAction(`Pediatric nutrition plan for ${weight}kg baby eating ${food}. Include systematic vitality metrics.`, 'health');
  const getLifeLesson = (subject: string) => handleAction(`Create an engaging, sensory-focused educational lesson for a toddler about "${subject}". Include a story, a moral lesson, and 3 key takeaways. Focus on building essential life skills or foundational knowledge.`, 'education');

  const addLove = () => {
      setLoveCount(prev => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-indigo-900/40 backdrop-blur-2xl p-4 sm:p-8">
      <div className="bg-white/95 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] w-full max-w-6xl flex flex-col h-[90vh] border-[12px] border-white overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header with Dashboard feel */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50 gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-rose-400 to-pink-500 p-4 rounded-3xl text-white shadow-xl shadow-rose-200 animate-pulse">
              <Baby size={40} />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-800 tracking-tight">Smart Baby Hub</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Live Pediatric Intelligence v2.0</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-white p-3 rounded-3xl shadow-sm border border-slate-100">
              <HeaderStat icon={<Heart className="text-rose-500" fill="currentColor" />} value={loveCount} label="Kisses" />
              <div className="w-px h-10 bg-slate-100 mx-2" />
              <HeaderStat icon={<Smile className="text-amber-500" />} value={smileCount} label="Smiles" />
              <button onClick={onClose} className="ml-4 p-3 rounded-2xl bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500 transition-all">
                <X size={24} strokeWidth={3} />
              </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Enhanced Navigation */}
          <div className="w-24 sm:w-72 bg-slate-50/80 border-r border-slate-100 flex flex-col p-6 gap-3">
            <NavBtn icon={<HeartPulse />} label="Love Hub" active={activeTab === 'bonding'} onClick={() => { setActiveTab('bonding'); setResult(null); }} color="rose" />
            <NavBtn icon={<Stethoscope />} label="Health" active={activeTab === 'health'} onClick={() => { setActiveTab('health'); setResult(null); }} color="emerald" />
            <NavBtn icon={<GraduationCap />} label="Learning" active={activeTab === 'education'} onClick={() => { setActiveTab('education'); setResult(null); }} color="amber" />
            <NavBtn icon={<UserCheck />} label="Names" active={activeTab === 'names'} onClick={() => { setActiveTab('names'); setResult(null); }} color="sky" />
            <NavBtn icon={<Star />} label="Zodiac" active={activeTab === 'horoscope'} onClick={() => { setActiveTab('horoscope'); setResult(null); }} color="indigo" />
            
            <div className="mt-auto p-5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl text-white hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Mom Daily Quest</p>
                <p className="text-sm font-bold mb-3">Reach 150 kisses for a new model skin!</p>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-white h-full" style={{ width: `${(loveCount / 150) * 100}%` }}></div>
                </div>
            </div>
          </div>

          {/* Main Context Area */}
          <div className="flex-1 flex flex-col overflow-y-auto p-10 bg-white">
            {activeTab === 'bonding' && <SectionBonding loveCount={loveCount} onAddLove={addLove} smileCount={smileCount} onAddSmile={() => setSmileCount(s => s+1)} />}
            {activeTab === 'health' && <SectionHealth loading={loading} result={result} onAction={getHealthAdvice} score={healthScore} />}
            {activeTab === 'education' && <SectionEducation loading={loading} result={result} onAction={getLifeLesson} progress={learningProgress} mastered={masteredCount} />}
            {activeTab === 'names' && <SectionNames loading={loading} result={result} onAction={getNames} />}
            {activeTab === 'horoscope' && <SectionHoroscope loading={loading} result={result} onAction={getHoroscope} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeaderStat = ({ icon, value, label }: any) => (
    <div className="flex flex-col items-center px-4">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-lg font-black text-slate-800">{value}</span>
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</span>
    </div>
);

const NavBtn = ({ icon, label, active, onClick, color }: any) => {
    const colors: any = {
        rose: 'bg-rose-500 shadow-rose-200',
        emerald: 'bg-emerald-500 shadow-emerald-200',
        amber: 'bg-amber-500 shadow-amber-200',
        sky: 'bg-sky-500 shadow-sky-200',
        indigo: 'bg-indigo-500 shadow-indigo-200'
    };
    return (
        <button 
            onClick={onClick} 
            className={`flex items-center gap-4 p-4 rounded-[1.5rem] font-black transition-all group ${active ? `${colors[color]} text-white shadow-xl -translate-y-0.5` : 'text-slate-500 hover:bg-white hover:shadow-md'}`}
        >
            <span className={`${active ? 'scale-110' : 'opacity-60 group-hover:opacity-100'} transition-transform`}>{icon}</span>
            <span className="hidden sm:inline text-sm">{label}</span>
        </button>
    );
};

/* --- TAB SECTIONS --- */

const SectionBonding = ({ loveCount, onAddLove, smileCount, onAddSmile }: any) => (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex flex-col gap-2">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">Bonding & Love Hub</h3>
            <p className="text-slate-500 font-bold text-lg">Celebrate every moment of affection between Mom and Kid.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-rose-50 to-pink-100 p-8 rounded-[3rem] border-4 border-white shadow-2xl shadow-rose-100/50 flex flex-col items-center text-center gap-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-pink-500" />
                <div className="p-6 bg-white rounded-full text-rose-500 shadow-xl group-hover:scale-110 transition-transform duration-500">
                    <Heart size={64} fill="currentColor" className="animate-pulse" />
                </div>
                <div>
                    <h4 className="text-2xl font-black text-rose-800 mb-1">Affection Counter</h4>
                    <p className="text-rose-600/70 font-bold">Log every kiss and hug to strengthen the bond.</p>
                </div>
                <div className="flex gap-4 w-full">
                    <button onClick={onAddLove} className="flex-1 py-5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-3xl shadow-xl shadow-rose-200 border-b-[6px] border-rose-800 active:border-0 active:translate-y-1 transition-all flex flex-col items-center gap-1">
                        <span className="text-xl">Add Kiss</span>
                        <span className="text-xs opacity-80 uppercase">Mom & Kid</span>
                    </button>
                    <button onClick={onAddSmile} className="flex-1 py-5 bg-white hover:bg-slate-50 text-rose-500 font-black rounded-3xl shadow-xl border-b-[6px] border-slate-200 active:border-0 active:translate-y-1 transition-all flex flex-col items-center gap-1">
                        <span className="text-xl">Log Hug</span>
                        <span className="text-xs opacity-80 uppercase">Warmth</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-5 border-2 border-slate-100">
                    <div className="bg-amber-100 p-4 rounded-3xl text-amber-600">
                        <Smile size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Joy Milestones</p>
                        <p className="text-lg font-black text-slate-800">{smileCount} Laughs Recorded</p>
                    </div>
                </div>
                <div className="bg-slate-50 p-6 rounded-[2.5rem] flex items-center gap-5 border-2 border-slate-100">
                    <div className="bg-indigo-100 p-4 rounded-3xl text-indigo-600">
                        <Camera size={32} />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memory Lane</p>
                        <p className="text-lg font-black text-slate-800">12 AI Memories Ready</p>
                    </div>
                </div>
                <div className="bg-indigo-500 p-6 rounded-[2.5rem] flex items-center justify-between text-white shadow-xl shadow-indigo-100">
                    <div className="flex items-center gap-4">
                        <Gift />
                        <span className="font-bold">Weekly Bond Report</span>
                    </div>
                    <button className="px-4 py-2 bg-white/20 rounded-xl font-black text-xs hover:bg-white/30">View</button>
                </div>
            </div>
        </div>
    </div>
);

const SectionHealth = ({ loading, result, onAction, score }: any) => {
    const [food, setFood] = useState('Organic Peas');
    const [weight, setWeight] = useState('9.5');
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Pediatric Vitality Engine</h3>
                    <p className="text-slate-500 font-bold">Systematic approach to baby health & food selection.</p>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-4xl font-black text-emerald-500">{score}%</div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">Vitality Score</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Selection</label>
                        <div className="relative">
                            <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input value={food} onChange={e => setFood(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:outline-emerald-500 font-bold" />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Weight Log (KG)</label>
                        <div className="relative">
                            <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-slate-200 focus:outline-emerald-500 font-bold" />
                        </div>
                    </div>
                    <button onClick={() => onAction(food, weight)} disabled={loading} className="w-full py-5 bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-100 flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : <Stethoscope />}
                        AI Health Audit
                    </button>
                </div>

                <div className="lg:col-span-2">
                    {result ? <AIResult result={result} color="emerald" /> : (
                        <div className="h-full bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-300 p-10 text-center gap-4">
                            <HeartPulse size={64} className="opacity-20" />
                            <p className="font-black text-xl">Enter data for a full <br/>pediatric systematic engine report.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SectionEducation = ({ loading, result, onAction, progress, mastered }: any) => {
    const modules = [
        { category: "Core Subjects", items: [
            { id: 'math', label: 'Numbers & Math', icon: <Brain size={18} /> },
            { id: 'phonics', label: 'Letters & Phonics', icon: <Zap size={18} /> },
            { id: 'physics', label: 'Basic Physics', icon: <Globe size={18} /> },
            { id: 'space', label: 'Space & Stars', icon: <Star size={18} /> }
        ]},
        { category: "Life Skills", items: [
            { id: 'hygiene', label: 'Personal Hygiene', icon: <HandMetal size={18} /> },
            { id: 'nutrition', label: 'Healthy Eating', icon: <Utensils size={18} /> },
            { id: 'safety', label: 'Safety Basics', icon: <ShieldCheck size={18} /> },
            { id: 'routine', label: 'Daily Routine', icon: <HeartPulse size={18} /> }
        ]},
        { category: "Emotional Intel", items: [
            { id: 'empathy', label: 'Empathy & Love', icon: <Heart size={18} /> },
            { id: 'anger', label: 'Managing Anger', icon: <Activity size={18} /> },
            { id: 'sharing', label: 'Sharing is Caring', icon: <Gift size={18} /> },
            { id: 'resilience', label: 'Being Brave', icon: <Trophy size={18} /> }
        ]}
    ];

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Early Learning Journey</h3>
                    <p className="text-slate-500 font-bold">Comprehensive modules for a growing mind.</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-2xl font-black text-amber-500">{mastered}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase">Mastered</span>
                    </div>
                    <div className="w-32 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                        <div className="bg-amber-500 h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                {modules.map((m, idx) => (
                    <div key={idx} className="flex flex-col gap-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{m.category}</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {m.items.map(item => (
                                <button 
                                    key={item.id} 
                                    onClick={() => onAction(item.label)} 
                                    disabled={loading} 
                                    className="p-5 bg-white border-2 border-slate-100 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-100/50 rounded-3xl flex flex-col items-center text-center gap-3 transition-all hover:-translate-y-1 group"
                                >
                                    <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform">{item.icon}</div>
                                    <span className="font-black text-slate-700 text-xs sm:text-sm">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="animate-spin text-amber-500" size={64} />
                    <p className="font-black text-amber-600 animate-pulse">Building the lesson...</p>
                </div>
            )}
            {result && <AIResult result={result} color="amber" />}
        </div>
    );
};

const SectionNames = ({ loading, result, onAction }: any) => (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-sky-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-sky-100 flex flex-col sm:flex-row items-center gap-8">
            <div className="p-6 bg-white/20 rounded-full"><Sparkles size={48} /></div>
            <div className="flex-1 text-center sm:text-left">
                <h3 className="text-3xl font-black mb-2">AI Name Discovery</h3>
                <p className="font-bold opacity-90 text-lg mb-6">Find unique identities through our semantic aesthetic engine.</p>
                <button onClick={onAction} disabled={loading} className="px-10 py-4 bg-white text-sky-600 rounded-2xl font-black shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto sm:mx-0">
                    {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    Discover Names
                </button>
            </div>
        </div>
        {result && <AIResult result={result} color="sky" />}
    </div>
);

const SectionHoroscope = ({ loading, result, onAction }: any) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return (
        <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-2">
                <h3 className="text-3xl font-black text-slate-800 tracking-tight">Baby Zodiac Milestones</h3>
                <p className="text-slate-500 font-bold">Astrological guidance for modern parenting.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {signs.map(s => (
                    <button key={s} onClick={() => onAction(s)} disabled={loading} className="p-4 bg-white border-2 border-slate-100 hover:border-indigo-400 hover:bg-indigo-50 rounded-2xl font-black transition-all text-sm text-slate-600 hover:text-indigo-600">
                        {s}
                    </button>
                ))}
            </div>
            {loading && <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-500" size={64} /></div>}
            {result && <AIResult result={result} color="indigo" />}
        </div>
    );
};

/* --- SHARED RESULT COMPONENT --- */

const AIResult = ({ result, color }: any) => {
    const colorClasses: any = {
        rose: 'bg-rose-50/50 border-rose-100 text-rose-800',
        emerald: 'bg-emerald-50/50 border-emerald-100 text-emerald-800',
        amber: 'bg-amber-50/50 border-amber-100 text-amber-800',
        sky: 'bg-sky-50/50 border-sky-100 text-sky-800',
        indigo: 'bg-indigo-50/50 border-indigo-100 text-indigo-800'
    };
    const accentColors: any = {
        rose: 'bg-rose-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        sky: 'bg-sky-500',
        indigo: 'bg-indigo-500'
    };

    return (
        <div className={`p-10 rounded-[3rem] border-2 shadow-sm flex flex-col gap-6 animate-in zoom-in-95 duration-500 ${colorClasses[color]}`}>
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl text-white ${accentColors[color]} shadow-lg`}>
                    <Sparkles size={24} />
                </div>
                <h4 className="text-3xl font-black">{result.title}</h4>
            </div>
            
            <div className="text-slate-700 font-bold text-lg leading-relaxed whitespace-pre-wrap bg-white/40 p-6 rounded-[2rem] border border-white">
                {result.content}
            </div>

            {result.details && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {result.details.map((d: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 bg-white/80 p-5 rounded-3xl border border-white shadow-sm group hover:scale-102 transition-transform">
                            <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 ${accentColors[color]}`} />
                            <span className="text-sm font-black text-slate-600">{d}</span>
                        </div>
                    ))}
                </div>
            )}

            {result.advice && (
                <div className={`mt-4 p-8 rounded-[2rem] text-white font-black text-lg relative overflow-hidden shadow-xl ${accentColors[color]}`}>
                    <div className="relative z-10 flex items-center gap-4">
                        <Gift className="opacity-80" />
                        <span className="italic">" {result.advice} "</span>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 scale-150">
                        <Baby size={120} />
                    </div>
                </div>
            )}
        </div>
    );
};
