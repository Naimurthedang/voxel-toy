
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { AppState, SavedModel } from '../types';
import { Box, Bird, Cat, Rabbit, Users, Code2, Wand2, Hammer, FolderOpen, ChevronUp, FileJson, History, Play, Pause, Info, Wrench, Loader2, Camera, Video, Baby, Sparkles } from 'lucide-react';

interface UIOverlayProps {
  voxelCount: number;
  appState: AppState;
  currentBaseModel: string;
  customBuilds: SavedModel[];
  customRebuilds: SavedModel[];
  isAutoRotate: boolean;
  isInfoVisible: boolean;
  isGenerating: boolean;
  onDismantle: () => void;
  onRebuild: (type: string) => void;
  onNewScene: (type: string) => void;
  onSelectCustomBuild: (model: SavedModel) => void;
  onSelectCustomRebuild: (model: SavedModel) => void;
  onPromptCreate: () => void;
  onPromptMorph: () => void;
  onShowJson: () => void;
  onImportJson: () => void;
  onToggleRotation: () => void;
  onToggleInfo: () => void;
  onOpenImageEditor: () => void;
  onOpenVideoAnalysis: () => void;
  onOpenBabyHub: () => void;
}

const LOADING_MESSAGES = [
    "Thinking in 3D...",
    "Voxelizing concepts...",
    "Applying high-graphics textures...",
    "Reconstructing geometry...",
    "Fine-tuning aesthetic details...",
    "Readying the product visualization..."
];

export const UIOverlay: React.FC<UIOverlayProps> = (props) => {
  const isStable = props.appState === AppState.STABLE;
  const isDismantling = props.appState === AppState.DISMANTLING;
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  useEffect(() => {
    if (props.isGenerating) {
        const interval = setInterval(() => {
            setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }
  }, [props.isGenerating]);

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none select-none">
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="pointer-events-auto flex flex-col gap-2">
            <DropdownMenu icon={<FolderOpen size={20} />} label="Builds" color="indigo">
                <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">PRESETS</div>
                <DropdownItem onClick={() => props.onNewScene('Eagle')} icon={<Bird size={16}/>} label="Eagle" />
                <DropdownItem onClick={() => props.onNewScene('Rattle')} icon={<Baby size={16}/>} label="Baby Rattle" />
                <DropdownItem onClick={() => props.onNewScene('Cradle')} icon={<Box size={16}/>} label="Baby Cradle" />
                
                <div className="h-px bg-slate-100 my-1" />
                <DropdownItem onClick={props.onPromptCreate} icon={<Wand2 size={16}/>} label="AI Generation" highlight />
                
                {props.customBuilds.length > 0 && (
                    <>
                        <div className="h-px bg-slate-100 my-1" />
                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">YOURS</div>
                        {props.customBuilds.map((model, idx) => (
                            <DropdownItem key={idx} onClick={() => props.onSelectCustomBuild(model)} icon={<History size={16}/>} label={model.name} truncate />
                        ))}
                    </>
                )}
                <div className="h-px bg-slate-100 my-1" />
                <DropdownItem onClick={props.onImportJson} icon={<FileJson size={16}/>} label="Import JSON" />
            </DropdownMenu>

            <div className="flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm rounded-xl border border-slate-200 text-slate-500 font-bold w-fit mt-2">
                <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                    <Box size={16} strokeWidth={3} />
                </div>
                <div className="flex flex-col leading-none">
                    <span className="text-[10px] uppercase tracking-wider opacity-60">Voxels</span>
                    <span className="text-lg text-slate-800 font-extrabold font-mono">{props.voxelCount}</span>
                </div>
            </div>
        </div>

        {/* Tools Section */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
            <div className="flex gap-2">
                <TactileButton onClick={props.onOpenBabyHub} color="rose" icon={<Sparkles size={18} />} label="Smart Baby Hub" />
                <TactileButton onClick={props.onOpenImageEditor} color="amber" icon={<Camera size={18} />} label="AI Edit" compact />
                <TactileButton onClick={props.onOpenVideoAnalysis} color="emerald" icon={<Video size={18} />} label="Analyze" compact />
            </div>
            <div className="flex gap-2">
                <TactileButton onClick={props.onToggleInfo} color={props.isInfoVisible ? 'indigo' : 'slate'} icon={<Info size={18} />} label="Info" compact />
                <TactileButton onClick={props.onToggleRotation} color={props.isAutoRotate ? 'sky' : 'slate'} icon={props.isAutoRotate ? <Pause size={18} /> : <Play size={18} />} label="Cam" compact />
                <TactileButton onClick={props.onShowJson} color="slate" icon={<Code2 size={18} />} label="Share" />
            </div>
        </div>
      </div>

      {/* Loading */}
      {props.isGenerating && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <div className="bg-white/95 backdrop-blur-md border-2 border-indigo-100 px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 min-w-[300px]">
                  <Loader2 size={48} className="text-indigo-500 animate-spin" />
                  <div className="text-center">
                      <h3 className="text-lg font-extrabold text-slate-800">AI Architect at Work</h3>
                      <p className="text-slate-500 font-bold text-sm">{LOADING_MESSAGES[loadingMsgIndex]}</p>
                  </div>
              </div>
          </div>
      )}

      {/* Rebuild Controls */}
      <div className="absolute bottom-8 left-0 w-full flex justify-center items-end pointer-events-none">
        <div className="pointer-events-auto">
            {isStable && (
                 <div className="animate-in slide-in-from-bottom-10">
                     <BigActionButton onClick={props.onDismantle} icon={<Hammer size={32} />} label="DESTRUCT" color="rose" />
                 </div>
            )}
            {isDismantling && !props.isGenerating && (
                <div className="animate-in slide-in-from-bottom-10">
                     <DropdownMenu icon={<Wrench size={24} />} label="Morph Into..." color="emerald" direction="up" big>
                        <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">MORPH TARGETS</div>
                        <DropdownItem onClick={() => props.onRebuild('Cat')} icon={<Cat size={18}/>} label="Cyber Cat" />
                        <DropdownItem onClick={() => props.onRebuild('Rabbit')} icon={<Rabbit size={18}/>} label="Space Rabbit" />
                        <DropdownItem onClick={() => props.onRebuild('Twins')} icon={<Users size={18}/>} label="Twin Models" />
                        <div className="h-px bg-slate-100 my-1" />
                        <DropdownItem onClick={props.onPromptMorph} icon={<Wand2 size={18}/>} label="AI Morph" highlight />
                     </DropdownMenu>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const TactileButton = (p: any) => (
    <button onClick={p.onClick} className={`flex items-center gap-2 rounded-xl font-bold text-sm border-b-4 active:border-b-0 active:translate-y-1 transition-all ${p.compact ? 'p-2.5' : 'px-4 py-3'} ${p.color === 'slate' ? 'bg-slate-200 text-slate-600 border-slate-400' : p.color === 'rose' ? 'bg-rose-500 text-white border-rose-700 shadow-rose-200/50 shadow-lg' : p.color === 'sky' ? 'bg-sky-500 text-white border-sky-700' : p.color === 'emerald' ? 'bg-emerald-500 text-white border-emerald-700' : p.color === 'amber' ? 'bg-amber-400 text-amber-900 border-amber-600' : 'bg-indigo-500 text-white border-indigo-700'}`}>
        {p.icon} {!p.compact && p.label}
    </button>
);

const BigActionButton = (p: any) => (
    <button onClick={p.onClick} className="flex flex-col items-center justify-center w-32 h-32 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white shadow-xl border-b-8 border-rose-800 active:border-b-0 active:translate-y-2 transition-all">
        <div className="mb-2">{p.icon}</div>
        <div className="text-sm font-black uppercase tracking-wider">{p.label}</div>
    </button>
);

const DropdownMenu = (p: any) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className={`flex items-center gap-2 font-bold text-white shadow-lg rounded-2xl transition-all ${p.color === 'indigo' ? 'bg-indigo-500 border-indigo-800' : 'bg-emerald-500 border-emerald-800'} ${p.big ? 'px-8 py-4 text-lg border-b-6 active:border-b-0 active:translate-y-1' : 'px-4 py-3 text-sm border-b-4 active:border-b-0 active:translate-y-1'}`}>
                {p.icon} {p.label} <ChevronUp className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className={`absolute left-0 ${p.direction === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} w-56 max-h-[60vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-2 p-2 flex flex-col gap-1 z-50`}> {p.children} </div>}
        </div>
    );
}

const DropdownItem = (p: any) => (
    <button onClick={() => { p.onClick(); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold transition-colors text-left ${p.highlight ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-100'}`}>
        {p.icon} <span className={p.truncate ? "truncate" : ""}>{p.label}</span>
    </button>
);
