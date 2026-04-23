import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Swords, 
  Download, 
  RefreshCw, 
  History, 
  Maximize2, 
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Image as ImageIcon,
  Grid3X3,
  Box,
  Map as MapIcon,
  Layers,
  RotateCw,
  Move
} from 'lucide-react';
import { generateMap, generateObject } from './services/geminiService';

interface MapTile {
  id: string;
  url: string;
  prompt: string;
}

interface PlacedObject {
  id: string;
  objectId: string;
  url: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'maps' | 'objects'>('maps');
  
  // Map States
  const [mapPrompt, setMapPrompt] = useState('');
  const [isGeneratingMap, setIsGeneratingMap] = useState(false);
  const [mapHistory, setMapHistory] = useState<MapTile[]>([]);
  const [activeMap, setActiveMap] = useState<MapTile | null>(null);
  const [showOverlayGrid, setShowOverlayGrid] = useState(false);

  // Object States
  const [objectPrompt, setObjectPrompt] = useState('');
  const [isGeneratingObject, setIsGeneratingObject] = useState(false);
  const [objectHistory, setObjectHistory] = useState<MapTile[]>([]);
  
  // Placed Objects State
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [draggingObjectId, setDraggingObjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleGenerateMap = async () => {
    if (!mapPrompt.trim()) return;
    
    setIsGeneratingMap(true);
    try {
      const imageUrl = await generateMap(mapPrompt);
      const newTile: MapTile = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: mapPrompt
      };
      setMapHistory(prev => [newTile, ...prev]);
      setActiveMap(newTile);
    } catch (error) {
      console.error('Map generation failed:', error);
    } finally {
      setIsGeneratingMap(false);
    }
  };

  const handleGenerateObject = async () => {
    if (!objectPrompt.trim()) return;
    
    setIsGeneratingObject(true);
    try {
      const imageUrl = await generateObject(objectPrompt);
      const newObject: MapTile = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: objectPrompt
      };
      setObjectHistory(prev => [newObject, ...prev]);
    } catch (error) {
      console.error('Object generation failed:', error);
    } finally {
      setIsGeneratingObject(false);
    }
  };

  const removeMap = (id: string) => {
    setMapHistory(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeMap?.id === id) {
        setActiveMap(filtered[0] || null);
      }
      return filtered;
    });
  };

  const removeObject = (id: string) => {
    setObjectHistory(prev => prev.filter(t => t.id !== id));
  };

  const placeObject = (object: MapTile) => {
    const newPlaced: PlacedObject = {
      id: Math.random().toString(36).substr(2, 9),
      objectId: object.id,
      url: object.url,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedObjects(prev => [...prev, newPlaced]);
    setActiveTab('maps');
  };

  const updatePlacedObject = (id: string, updates: Partial<PlacedObject>) => {
    setPlacedObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const removePlacedObject = (id: string) => {
    setPlacedObjects(prev => prev.filter(obj => obj.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-gold/30 flex flex-col">
      {/* Header / Logo */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50 h-24">
        <div className="flex items-center gap-8">
          <div className="relative flex flex-col items-center justify-center group cursor-default">
            <div className="relative flex items-center justify-center">
              <Globe className="w-16 h-16 text-gold/20 animate-pulse-slow absolute" />
              <Swords className="w-12 h-12 text-white/10 absolute rotate-45 group-hover:rotate-0 transition-transform duration-700" />
              <h1 className="text-4xl font-display font-bold tracking-tighter text-white relative z-10 drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
                Plane<span className="text-gold">Scape</span>
              </h1>
            </div>
          </div>

          <nav className="flex items-center gap-2 bg-neutral-900 border border-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('maps')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'maps' ? 'bg-gold text-neutral-950 font-bold' : 'text-neutral-500 hover:text-white'}`}
            >
              <MapIcon size={18} />
              Maps
            </button>
            <button
              onClick={() => setActiveTab('objects')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${activeTab === 'objects' ? 'bg-gold text-neutral-950 font-bold' : 'text-neutral-500 hover:text-white'}`}
            >
              <Box size={18} />
              Object Generator
            </button>
          </nav>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          <Sparkles size={14} className="text-gold" />
          <span>AI Cartography Engine</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === 'maps' ? (
            <motion.div
              key="maps-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              {/* Sidebar Left: Map History & Prompts */}
              <aside className="lg:col-span-3 border-r border-white/5 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 shadow-2xl">
                  <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4">
                    Map Manifestation
                  </label>
                  <div className="space-y-4">
                    <textarea
                      value={mapPrompt}
                      onChange={(e) => setMapPrompt(e.target.value)}
                      placeholder="e.g., An ancient overgrown forest temple..."
                      className="w-full h-32 bg-neutral-800 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all resize-none"
                    />
                    <button
                      onClick={handleGenerateMap}
                      disabled={isGeneratingMap || !mapPrompt.trim()}
                      className="w-full py-4 bg-gold hover:bg-gold/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      {isGeneratingMap ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                      {isGeneratingMap ? 'Manifesting...' : 'Generate Map'}
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
                    <History size={14} /> Map History
                  </h3>
                  <div className="grid grid-cols-2 gap-2 pr-2">
                    {mapHistory.map(tile => (
                      <div
                        key={tile.id}
                        onClick={() => setActiveMap(tile)}
                        className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group relative ${activeMap?.id === tile.id ? 'border-gold ring-2 ring-gold/20' : 'border-white/10 hover:border-gold/50'}`}
                      >
                        <img src={tile.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ImageIcon size={16} className="text-white" />
                        </div>
                      </div>
                    ))}
                    {mapHistory.length === 0 && (
                      <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-xl text-neutral-600 text-xs italic">
                        No history
                      </div>
                    )}
                  </div>
                </div>
              </aside>

              {/* Main Canvas Area */}
              <section className="lg:col-span-6 flex flex-col p-6 bg-neutral-950">
                <div 
                  ref={containerRef}
                  className="relative flex-1 bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center group"
                >
                  <div className="absolute inset-0 pointer-events-none opacity-10 z-0" 
                       style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                  />
                  
                  <AnimatePresence mode="wait">
                    {activeMap ? (
                      <motion.div
                        key={activeMap.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full h-full flex items-center justify-center p-4 relative"
                      >
                        <div className="relative max-w-full max-h-full">
                          <img 
                            src={activeMap.url} 
                            alt="" 
                            className="w-full h-full object-contain rounded-lg shadow-2xl relative z-0" 
                            referrerPolicy="no-referrer"
                          />
                          
                          {/* Placed Objects */}
                          <div className="absolute inset-0 overflow-hidden">
                            {placedObjects.map(obj => (
                              <motion.div
                                key={obj.id}
                                drag
                                dragMomentum={false}
                                onDragEnd={(_, info) => {
                                  // Simplified coordinate update
                                }}
                                style={{
                                  position: 'absolute',
                                  left: `${obj.x}%`,
                                  top: `${obj.y}%`,
                                  width: `${64 * obj.scale}px`,
                                  height: `${64 * obj.scale}px`,
                                  transform: `translate(-50%, -50%) rotate(${obj.rotation}deg)`,
                                  mixBlendMode: 'multiply', // Trick for "transparency" on white background
                                  cursor: 'move'
                                }}
                                className="group/obj"
                              >
                                <img src={obj.url} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-neutral-900 border border-white/10 p-1 rounded-lg flex items-center gap-1 opacity-0 group-hover/obj:opacity-100 transition-opacity whitespace-nowrap z-50">
                                  <button onClick={() => updatePlacedObject(obj.id, { rotation: obj.rotation + 45 })} className="p-1 hover:bg-neutral-800 rounded text-gold"><RotateCw size={14}/></button>
                                  <button onClick={() => updatePlacedObject(obj.id, { scale: Math.max(0.5, obj.scale - 0.1) })} className="p-1 hover:bg-neutral-800 rounded text-gold">-</button>
                                  <button onClick={() => updatePlacedObject(obj.id, { scale: Math.min(3, obj.scale + 0.1) })} className="p-1 hover:bg-neutral-800 rounded text-gold">+</button>
                                  <button onClick={() => removePlacedObject(obj.id)} className="p-1 hover:bg-neutral-800 rounded text-red-500"><Trash2 size={14}/></button>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {showOverlayGrid && (
                            <div className="absolute inset-0 pointer-events-none z-10 rounded-lg overflow-hidden" 
                                 style={{ background: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
                            />
                          )}
                        </div>
                        
                        {/* Map Controls */}
                        <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button 
                            onClick={() => setShowOverlayGrid(!showOverlayGrid)}
                            className={`p-3 rounded-xl backdrop-blur-md shadow-lg border transition-all active:scale-95 ${showOverlayGrid ? 'bg-gold text-neutral-950 border-gold' : 'bg-neutral-900/80 text-white border-white/10'}`}
                          >
                            <Grid3X3 size={18} />
                          </button>
                          <button onClick={() => removeMap(activeMap.id)} className="p-3 bg-red-500/80 text-white rounded-xl backdrop-blur-md shadow-lg"><Trash2 size={18} /></button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="text-neutral-700 flex flex-col items-center gap-4">
                        <Plus size={48} className="opacity-20" />
                        <p>No active map</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-2">
                  <span>Tactical Environment: Ready</span>
                  <span>Grid Scale: 1" = 5'</span>
                </div>
              </section>

              {/* Sidebar Right: Object Placement Library */}
              <aside className="lg:col-span-3 border-l border-white/5 p-6 bg-neutral-900/30 flex flex-col overflow-y-auto custom-scrollbar">
                <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                  <Box size={14} /> Object Library
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {objectHistory.map(obj => (
                    <div
                      key={obj.id}
                      className="group relative bg-neutral-900 border border-white/10 p-2 rounded-xl hover:border-gold/50 transition-all cursor-pointer overflow-hidden"
                      onClick={() => placeObject(obj)}
                    >
                      <div className="aspect-square bg-white rounded-lg overflow-hidden flex items-center justify-center p-1">
                        {/* Mock transparency for preview */}
                        <img src={obj.url} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                      </div>
                      <div className="mt-2 text-[10px] truncate opacity-50 px-1">{obj.prompt}</div>
                      <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Plus size={24} className="text-gold" />
                      </div>
                    </div>
                  ))}
                  {objectHistory.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-neutral-600 border border-dashed border-white/10 rounded-2xl">
                      <p className="text-xs italic">Generate objects in the<br/>"Object Generator" tab</p>
                    </div>
                  )}
                </div>
              </aside>
            </motion.div>
          ) : (
            <motion.div
              key="objects-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full max-w-7xl mx-auto p-8 flex flex-col gap-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 space-y-6 shadow-2xl">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">Object Manifestation</h2>
                    <p className="text-sm text-neutral-500">Create individual assets for your maps. Tables, torches, traps, etc. Generated on isolation for perfect placement.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <textarea
                      value={objectPrompt}
                      onChange={(e) => setObjectPrompt(e.target.value)}
                      placeholder="e.g., A heavy oak tavern table with spilled ale and bread..."
                      className="w-full h-40 bg-neutral-800 border border-white/10 rounded-2xl p-6 text-lg focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all resize-none shadow-inner"
                    />
                    <button
                      onClick={handleGenerateObject}
                      disabled={isGeneratingObject || !objectPrompt.trim()}
                      className="w-full py-5 bg-gold hover:bg-gold/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold text-lg rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg"
                    >
                      {isGeneratingObject ? <Loader2 className="animate-spin" /> : <Box size={24} />}
                      {isGeneratingObject ? 'Extracting Asset...' : 'Generate New Object'}
                    </button>
                  </div>
                </div>

                <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-8 min-h-[500px] flex flex-col">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500 mb-6 flex items-center gap-2">
                    <History size={16} /> Asset History
                  </h3>
                  <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
                    {objectHistory.map(obj => (
                      <div key={obj.id} className="group relative bg-white border border-white/10 p-2 rounded-2xl shadow-lg transition-transform hover:scale-105">
                        <img src={obj.url} className="w-full h-full object-contain mix-blend-multiply" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-2xl">
                          <button 
                            onClick={() => placeObject(obj)}
                            className="bg-gold text-neutral-950 px-4 py-2 rounded-lg font-bold text-xs uppercase"
                          >
                            Add to Library
                          </button>
                          <button 
                            onClick={() => removeObject(obj.id)}
                            className="text-red-400 p-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(197, 160, 89, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(197, 160, 89, 0.4);
        }
      `}} />
    </div>
  );
}
