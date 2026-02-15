
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef, useState } from 'react';
import { VoxelEngine } from './services/VoxelEngine';
import { UIOverlay } from './components/UIOverlay';
import { JsonModal } from './components/JsonModal';
import { PromptModal } from './components/PromptModal';
import { ImageEditorModal } from './components/ImageEditorModal';
import { VideoAnalysisModal } from './components/VideoAnalysisModal';
import { BabySmartHub } from './components/BabySmartHub';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Generators } from './utils/voxelGenerators';
import { AppState, VoxelData, SavedModel } from './types';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<VoxelEngine | null>(null);
  
  const [appState, setAppState] = useState<AppState>(AppState.STABLE);
  const [voxelCount, setVoxelCount] = useState<number>(0);
  
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'view' | 'import'>('view');
  
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [promptMode, setPromptMode] = useState<'create' | 'morph'>('create');
  
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isVideoAnalysisOpen, setIsVideoAnalysisOpen] = useState(false);
  const [isBabyHubOpen, setIsBabyHubOpen] = useState(false);
  
  const [showWelcome, setShowWelcome] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [jsonData, setJsonData] = useState('');
  const [isAutoRotate, setIsAutoRotate] = useState(true);

  const [currentBaseModel, setCurrentBaseModel] = useState<string>('Eagle');
  const [customBuilds, setCustomBuilds] = useState<SavedModel[]>([]);
  const [customRebuilds, setCustomRebuilds] = useState<SavedModel[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new VoxelEngine(
      containerRef.current,
      (newState) => setAppState(newState),
      (count) => setVoxelCount(count)
    );

    engineRef.current = engine;
    engine.loadInitialModel(Generators.Eagle());

    const handleResize = () => engine.handleResize();
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => setShowWelcome(false), 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
      engine.cleanup();
    };
  }, []);

  const handleDismantle = () => engineRef.current?.dismantle();

  const handleNewScene = (type: string) => {
    const generator = (Generators as any)[type];
    if (generator && engineRef.current) {
      engineRef.current.loadInitialModel(generator());
      setCurrentBaseModel(type);
    }
  };

  const handleSelectCustomBuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.loadInitialModel(model.data);
          setCurrentBaseModel(model.name);
      }
  };

  const handleRebuild = (type: string) => {
    const generator = (Generators as any)[type];
    if (generator && engineRef.current) {
      engineRef.current.rebuild(generator());
    }
  };

  const handleSelectCustomRebuild = (model: SavedModel) => {
      if (engineRef.current) {
          engineRef.current.rebuild(model.data);
      }
  };

  const handleShowJson = () => {
    if (engineRef.current) {
      setJsonData(engineRef.current.getJsonData());
      setJsonModalMode('view');
      setIsJsonModalOpen(true);
    }
  };

  const handleImportClick = () => {
      setJsonModalMode('import');
      setIsJsonModalOpen(true);
  };

  const handleJsonImport = (jsonStr: string) => {
      try {
          const rawData = JSON.parse(jsonStr);
          const voxelData: VoxelData[] = rawData.map((v: any) => {
              let colorVal = v.color || v.c || '#CCCCCC';
              let colorInt = typeof colorVal === 'number' ? colorVal : parseInt(colorVal.replace('#', ''), 16);
              return { x: v.x, y: v.y, z: v.z, color: colorInt };
          });
          if (engineRef.current) {
              engineRef.current.loadInitialModel(voxelData);
              setCurrentBaseModel('Imported Build');
          }
      } catch (e) {
          alert("Failed to import JSON.");
      }
  };

  const handlePromptSubmit = async (prompt: string) => {
    if (!process.env.API_KEY) throw new Error("API Key not found");
    setIsGenerating(true);
    setIsPromptModalOpen(false);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const model = 'gemini-3-pro-preview';
        
        const systemContext = `
            ROLE: Expert 3D Voxel Architect.
            TASK: Generate a high-fidelity, aesthetic 3D voxel model based on the user's request.
            GRAPHICS: High quality, artistic, using a professional palette.
            OUTPUT: Valid JSON array of voxels.
        `;

        const response = await ai.models.generateContent({
            model,
            contents: `${systemContext}\n\nPrompt: "${prompt}"\nGenerate about 300-900 voxels. Centered at 0,0,0. Base at y=0. Return ONLY JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            x: { type: Type.INTEGER },
                            y: { type: Type.INTEGER },
                            z: { type: Type.INTEGER },
                            color: { type: Type.STRING, description: "Hex color code e.g. #FF5500" }
                        },
                        required: ["x", "y", "z", "color"]
                    }
                }
            }
        });

        if (response.text) {
            const rawData = JSON.parse(response.text);
            const voxelData: VoxelData[] = rawData.map((v: any) => ({
                x: v.x, y: v.y, z: v.z,
                color: parseInt(v.color.replace('#', ''), 16)
            }));

            if (engineRef.current) {
                if (promptMode === 'create') {
                    engineRef.current.loadInitialModel(voxelData);
                    setCustomBuilds(prev => [...prev, { name: prompt, data: voxelData }]);
                    setCurrentBaseModel(prompt);
                } else {
                    engineRef.current.rebuild(voxelData);
                    setCustomRebuilds(prev => [...prev, { name: prompt, data: voxelData, baseModel: currentBaseModel }]);
                }
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        setIsGenerating(false);
    }
  };

  const takeSnapshot = () => {
    if (engineRef.current) {
      return engineRef.current.takeScreenshot();
    }
    return '';
  };

  return (
    <div className="relative w-full h-screen bg-[#f0f2f5] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 z-0" />
      
      <UIOverlay 
        voxelCount={voxelCount}
        appState={appState}
        currentBaseModel={currentBaseModel}
        customBuilds={customBuilds}
        customRebuilds={customRebuilds.filter(r => r.baseModel === currentBaseModel)} 
        isAutoRotate={isAutoRotate}
        isInfoVisible={showWelcome}
        isGenerating={isGenerating}
        onDismantle={handleDismantle}
        onRebuild={handleRebuild}
        onNewScene={handleNewScene}
        onSelectCustomBuild={handleSelectCustomBuild}
        onSelectCustomRebuild={handleSelectCustomRebuild}
        onPromptCreate={() => { setPromptMode('create'); setIsPromptModalOpen(true); }}
        onPromptMorph={() => { setPromptMode('morph'); setIsPromptModalOpen(true); }}
        onShowJson={handleShowJson}
        onImportJson={handleImportClick}
        onToggleRotation={() => {
            const next = !isAutoRotate;
            setIsAutoRotate(next);
            engineRef.current?.setAutoRotate(next);
        }}
        onToggleInfo={() => setShowWelcome(!showWelcome)}
        onOpenImageEditor={() => setIsImageEditorOpen(true)}
        onOpenVideoAnalysis={() => setIsVideoAnalysisOpen(true)}
        onOpenBabyHub={() => setIsBabyHubOpen(true)}
      />

      <WelcomeScreen visible={showWelcome} />

      <JsonModal 
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        data={jsonData}
        isImport={jsonModalMode === 'import'}
        onImport={handleJsonImport}
      />

      <PromptModal
        isOpen={isPromptModalOpen}
        mode={promptMode}
        onClose={() => setIsPromptModalOpen(false)}
        onSubmit={handlePromptSubmit}
      />

      <ImageEditorModal 
        isOpen={isImageEditorOpen}
        onClose={() => setIsImageEditorOpen(false)}
        getSnapshot={takeSnapshot}
      />

      <VideoAnalysisModal 
        isOpen={isVideoAnalysisOpen}
        onClose={() => setIsVideoAnalysisOpen(false)}
      />

      <BabySmartHub
        isOpen={isBabyHubOpen}
        onClose={() => setIsBabyHubOpen(false)}
      />
    </div>
  );
};

export default App;
