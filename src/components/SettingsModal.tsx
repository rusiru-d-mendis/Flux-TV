import React from 'react';
import { X, Settings as SettingsIcon, Shield, PlayCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: {
    autoPlay: boolean;
    useProxyByDefault: boolean;
  };
  onUpdateSettings: (settings: any) => void;
  onClearData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdateSettings,
  onClearData
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <SettingsIcon size={20} className="text-emerald-500" />
                <h2 className="text-xl font-bold">Settings</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <PlayCircle size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Auto-play</p>
                      <p className="text-xs text-zinc-500">Start playback automatically</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, autoPlay: !settings.autoPlay })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${settings.autoPlay ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.autoPlay ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Shield size={20} className="text-zinc-400" />
                    <div>
                      <p className="text-sm font-medium text-white">Global Proxy</p>
                      <p className="text-xs text-zinc-500">Route all streams through proxy</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onUpdateSettings({ ...settings, useProxyByDefault: !settings.useProxyByDefault })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${settings.useProxyByDefault ? 'bg-emerald-600' : 'bg-zinc-800'}`}
                  >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.useProxyByDefault ? 'left-6' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <button
                  onClick={() => {
                    if (confirm('This will clear all saved playlists and settings. Continue?')) {
                      onClearData();
                      onClose();
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors text-sm font-medium"
                >
                  <Trash2 size={18} />
                  Clear All Application Data
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
