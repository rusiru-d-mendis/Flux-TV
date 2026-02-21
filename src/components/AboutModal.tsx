import React from 'react';
import { X, Info, Github, ExternalLink, ShieldCheck, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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
                <Info size={20} className="text-emerald-500" />
                <h2 className="text-xl font-bold">About Flux TV</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20">
                  <Tv size={40} className="text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Flux TV v1.0.0</h3>
                  <p className="text-sm text-zinc-500">The modern way to watch IPTV</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">How it works</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Flux TV is a client-side M3U player. It parses your playlists and uses HLS.js for high-performance streaming.
                  </p>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-500">
                    <ShieldCheck size={16} />
                    <h4 className="text-xs font-bold uppercase tracking-widest">CORS & Privacy</h4>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Many streams block direct browser access. Flux TV includes a built-in proxy to bypass CORS restrictions and ensure your streams load reliably.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <Github size={18} />
                  GitHub
                </a>
                <a 
                  href="https://iptv-org.github.io/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors text-sm font-medium"
                >
                  <ExternalLink size={18} />
                  IPTV Sources
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
