import { useState, useEffect } from 'react';
import { Plus, Settings, Info, Github } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { VideoPlayer } from './components/VideoPlayer';
import { ImportModal } from './components/ImportModal';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { M3UEntry } from './utils/m3uParser';
import { motion } from 'motion/react';

export default function App() {
  const [entries, setEntries] = useState<M3UEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<M3UEntry | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [settings, setSettings] = useState({
    autoPlay: true,
    useProxyByDefault: false
  });

  // Load saved playlist and settings from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('fluxtv_playlist');
    if (savedPlaylist) {
      try {
        setEntries(JSON.parse(savedPlaylist));
      } catch (e) {
        console.error('Failed to load saved playlist', e);
      }
    }

    const savedSettings = localStorage.getItem('fluxtv_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('fluxtv_settings', JSON.stringify(newSettings));
  };

  const handleClearAllData = () => {
    setEntries([]);
    setCurrentEntry(null);
    localStorage.removeItem('fluxtv_playlist');
    localStorage.removeItem('fluxtv_settings');
    setSettings({ autoPlay: true, useProxyByDefault: false });
  };

  const handleImport = (newEntries: M3UEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('fluxtv_playlist', JSON.stringify(newEntries));
    if (newEntries.length > 0) {
      setCurrentEntry(newEntries[0]);
    }
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your playlist?')) {
      setEntries([]);
      setCurrentEntry(null);
      localStorage.removeItem('fluxtv_playlist');
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-200 overflow-hidden font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <Sidebar 
        entries={entries} 
        onSelect={setCurrentEntry} 
        currentEntry={currentEntry} 
        onClear={handleClear}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-950/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
            {currentEntry && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-zinc-400">Now Playing:</span>
                <span className="text-sm font-bold text-white truncate max-w-[200px] md:max-w-md">
                  {currentEntry.name}
                </span>
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Import Playlist</span>
            </button>
            
            <div className="w-px h-6 bg-zinc-800 mx-2" />
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => setIsAboutOpen(true)}
              className="p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <Info size={20} />
            </button>
          </div>
        </header>

        {/* Player Area */}
        <div className="flex-1 min-h-0 relative">
          <VideoPlayer entry={currentEntry} autoPlay={settings.autoPlay} forceProxy={settings.useProxyByDefault} />
          
          {entries.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md space-y-6"
              >
                <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto border border-zinc-800 shadow-2xl">
                  <Plus size={48} className="text-emerald-500" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white">Welcome to Flux TV</h2>
                  <p className="text-zinc-500">
                    Import an M3U playlist from a URL or upload a file to start watching your favorite streams.
                  </p>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-3 rounded-full font-bold transition-all active:scale-95"
                >
                  Get Started
                </button>
              </motion.div>
            </div>
          )}
        </div>

        {/* Footer / Status */}
        <footer className="h-8 border-t border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-zinc-600">
          <div className="flex items-center gap-4">
            <span>Status: Online</span>
            <span>HLS Support: Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <span>v1.0.0</span>
            <Github size={12} />
          </div>
        </footer>
      </main>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onImport={handleImport}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClearData={handleClearAllData}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
