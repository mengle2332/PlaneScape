import React, { useState, useRef } from 'react';
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
  Grid3X3
} from 'lucide-react';
import { generateMap } from './services/geminiService';

interface MapTile {
  id: string;
  url: string;
  prompt: string;
}

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tiles, setTiles] = useState<MapTile[]>([]);
  const [activeTile, setActiveTile] = useState<MapTile | null>(null);
  const [showOverlayGrid, setShowOverlayGrid] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const imageUrl = await generateMap(prompt);
      const newTile: MapTile = {
        id: Math.random().toString(36).substr(2, 9),
        url: imageUrl,
        prompt: prompt
      };
      setTiles(prev => [newTile, ...prev]);
      setActiveTile(newTile);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const removeTile = (id: string) => {
    setTiles(prev => {
      const filtered = prev.filter(t => t.id !== id);
      if (activeTile?.id === id) {
        setActiveTile(filtered[0] || null);
      }
      return filtered;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-gold/30">
      {/* Header / Logo */}
      <header className="p-6 border-b border-white/5 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="relative flex flex-col items-center justify-center group cursor-default">
          <div className="relative flex items-center justify-center">
            <Globe className="w-16 h-16 text-gold/20 animate-pulse-slow absolute" />
            <Swords className="w-12 h-12 text-white/10 absolute rotate-45 group-hover:rotate-0 transition-transform duration-700" />
            <h1 className="text-4xl font-display font-bold tracking-tighter text-white relative z-10 drop-shadow-[0_0_15px_rgba(197,160,89,0.5)]">
              Plane<span className="text-gold">Scape</span>
            </h1>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-neutral-500 uppercase tracking-widest">
          <Sparkles size={14} className="text-gold" />
          <span>AI Cartography Engine</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-neutral-900 border border-white/5 rounded-2xl p-6 shadow-2xl">
            <label className="block text-xs font-mono uppercase tracking-widest text-neutral-500 mb-4">
              Map Manifestation
            </label>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., An ancient overgrown forest temple with glowing runes and a central stone altar..."
                className="w-full h-32 bg-neutral-800 border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-gold/50 focus:border-gold outline-none transition-all resize-none"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-4 bg-gold hover:bg-gold/90 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {isGenerating ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles size={20} />
                )}
                {isGenerating ? 'Manifesting...' : 'Generate Map'}
              </button>
            </div>
          </div>

          <div className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 max-h-[400px] flex flex-col">
            <h3 className="text-sm font-mono uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
              <History size={14} /> Manifestation History
            </h3>
            <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 custom-scrollbar">
              {tiles.map(tile => (
                <motion.div
                  layoutId={tile.id}
                  key={tile.id}
                  onClick={() => setActiveTile(tile)}
                  className={`aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group relative ${activeTile?.id === tile.id ? 'border-gold ring-2 ring-gold/20' : 'border-white/10 hover:border-gold/50'}`}
                >
                  <img src={tile.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon size={16} className="text-white" />
                  </div>
                </motion.div>
              ))}
              {tiles.length === 0 && (
                <div className="col-span-3 py-8 text-center border-2 border-dashed border-white/5 rounded-xl text-neutral-600 text-xs italic">
                  No history yet
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Canvas Area */}
        <section className="lg:col-span-8 flex flex-col gap-4">
          <div className="relative bg-neutral-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl min-h-[600px] flex items-center justify-center group">
            {/* Background Dot Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-10 z-0" 
                 style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
            />
            
            <AnimatePresence mode="wait">
              {activeTile ? (
                <motion.div
                  key={activeTile.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full h-full flex items-center justify-center p-4 relative"
                >
                  <div className="relative max-w-full max-h-full">
                    <img 
                      src={activeTile.url} 
                      alt="" 
                      className="w-full h-full object-contain rounded-lg shadow-2xl relative z-0" 
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Toggleable White Grid Overlay */}
                    {showOverlayGrid && (
                      <div className="absolute inset-0 pointer-events-none z-10 rounded-lg overflow-hidden" 
                           style={{ 
                             backgroundImage: `
                               linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
                             `,
                             backgroundSize: '40px 40px' 
                           }} 
                      />
                    )}
                  </div>
                  
                  <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button 
                      onClick={() => setShowOverlayGrid(!showOverlayGrid)}
                      className={`p-3 rounded-xl backdrop-blur-md shadow-lg border transition-all active:scale-95 ${showOverlayGrid ? 'bg-gold text-neutral-950 border-gold' : 'bg-neutral-900/80 text-white border-white/10 hover:bg-neutral-800'}`}
                      title="Toggle Tactical Grid"
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button 
                      onClick={() => removeTile(activeTile.id)}
                      className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md shadow-lg transition-all active:scale-95"
                      title="Delete Manifestation"
                    >
                      <Trash2 size={18} />
                    </button>
                    <a 
                      href={activeTile.url} 
                      download={`planescape-${activeTile.id}.png`}
                      className="p-3 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-xl backdrop-blur-md shadow-lg border border-white/10 transition-all active:scale-95"
                      title="Download Map"
                    >
                      <Download size={18} />
                    </a>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-neutral-900/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-lg">
                      <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Active Manifestation</p>
                      <p className="text-sm italic text-neutral-300">"{activeTile.prompt}"</p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-neutral-700 flex flex-col items-center gap-4 p-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-neutral-800/50 flex items-center justify-center border border-white/5">
                    <Plus size={48} strokeWidth={1} className="text-neutral-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-medium text-neutral-500">No Active Map</h3>
                    <p className="text-sm text-neutral-600 max-w-xs mt-2">Enter a prompt in the sidebar to manifest a new top-down D&D battle map.</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center justify-between text-xs font-mono text-neutral-500 uppercase tracking-widest px-2">
            <div className="flex items-center gap-4">
              <span>Coordinate System: Active</span>
              <span className="text-neutral-700">|</span>
              <span>Scale: 5ft per square</span>
            </div>
            {activeTile && (
              <span className="text-gold/50">ID: {activeTile.id}</span>
            )}
          </div>
        </section>
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
          width: 4px;
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
