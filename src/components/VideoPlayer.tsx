import React, { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { Play, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { M3UEntry } from '../utils/m3uParser';

interface VideoPlayerProps {
  entry: M3UEntry | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ entry }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isMixedContent, setIsMixedContent] = useState(false);
  const [useProxy, setUseProxy] = useState(false);

  useEffect(() => {
    setError(null);
    setUseProxy(false);
    setLoading(false);
    
    if (entry?.url.startsWith('http:')) {
      setIsMixedContent(window.location.protocol === 'https:');
    } else {
      setIsMixedContent(false);
    }
  }, [entry]);

  useEffect(() => {
    if (!entry || !videoRef.current) return;

    const video = videoRef.current;
    const streamUrl = useProxy 
      ? `/api/proxy-manifest?url=${encodeURIComponent(entry.url)}` 
      : entry.url;

    setLoading(true);
    setError(null);

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported() && (entry.url.includes('.m3u8') || useProxy)) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(e => {
          console.error("Auto-play failed:", e);
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error("HLS Error:", data);
        if (data.fatal) {
          setLoading(false);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError(`Network error (${data.details}): The stream could not be reached. Check if the URL is correct and the stream is online.`);
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError("Media error: The stream format is incompatible or corrupted.");
              hls.recoverMediaError();
              break;
            default:
              setError(`Playback error: ${data.details || 'Unknown error'}`);
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Fallback for non-HLS or native support
      video.src = streamUrl;
      video.load();
      video.play().then(() => {
        setLoading(false);
      }).catch(e => {
        console.error("Native playback failed:", e);
        if (!entry.url.includes('.m3u8') && !useProxy) {
           // If it failed and it's not HLS, maybe it IS HLS but without extension? 
           // We already tried HLS.js if it was supported.
        }
        setLoading(false);
        setError("Playback failed. This stream might require a specific player or is currently unavailable.");
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [entry, useProxy]);

  if (!entry) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-zinc-500">
        <Play size={64} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Select a channel to start playing</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black group">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        controls
        playsInline
      />

      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={48} className="text-emerald-500 animate-spin" />
            <p className="text-zinc-300 text-sm font-medium">Loading stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 p-8 text-center z-20">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Playback Error</h3>
          <p className="text-zinc-400 max-w-md mb-6 text-sm">{error}</p>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            {isMixedContent && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs text-left">
                <strong>Mixed Content:</strong> Secure sites (HTTPS) block insecure (HTTP) streams.
              </div>
            )}
            
            {!useProxy && (
              <button 
                onClick={() => { setError(null); setUseProxy(true); }}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-full transition-all font-medium"
              >
                <RefreshCw size={18} />
                Try with Proxy
              </button>
            )}

            <button 
              onClick={() => { setError(null); setUseProxy(false); }}
              className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-full transition-all font-medium"
            >
              <RefreshCw size={18} />
              Retry Original
            </button>
          </div>
        </div>
      )}
      
      {/* Custom Overlay for Channel Info */}
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="flex items-center gap-4">
          {entry.logo && (
            <img 
              src={entry.logo} 
              alt={entry.name} 
              className="w-12 h-12 object-contain bg-white/10 rounded p-1"
              referrerPolicy="no-referrer"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{entry.name}</h2>
              {useProxy && (
                <span className="px-1.5 py-0.5 bg-emerald-500 text-zinc-950 text-[10px] font-bold rounded uppercase tracking-tighter">
                  Proxy Active
                </span>
              )}
            </div>
            {entry.group && (
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                {entry.group}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
