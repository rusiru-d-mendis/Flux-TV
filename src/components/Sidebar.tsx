import React, { useState } from 'react';
import { Search, Tv, AlertTriangle, Trash2, Copy, Check } from 'lucide-react';
import { M3UEntry } from '../utils/m3uParser';
import { cn } from '../utils/cn';

interface SidebarProps {
  entries: M3UEntry[];
  onSelect: (entry: M3UEntry) => void;
  currentEntry: M3UEntry | null;
  onClear: () => void;
}

const ChannelItem = ({ 
  entry, 
  onSelect, 
  isActive 
}: { 
  entry: M3UEntry; 
  onSelect: (entry: M3UEntry) => void; 
  isActive: boolean;
}) => {
  const [copied, setCopied] = useState(false);
  const isHttp = entry.url.startsWith('http:');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(entry.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={() => onSelect(entry)}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left group relative",
        isActive 
          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 border border-transparent"
      )}
    >
      <div className="relative flex-shrink-0 w-10 h-10 bg-zinc-900 rounded overflow-hidden border border-zinc-800">
        {entry.logo ? (
          <img 
            src={entry.logo} 
            alt="" 
            className="w-full h-full object-contain p-1"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/tv/40/40';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-700">
            <Tv size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{entry.name}</p>
          {isHttp && (
            <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
          )}
        </div>
        {entry.group && (
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold truncate">
            {entry.group}
          </p>
        )}
      </div>
      
      <button
        onClick={handleCopy}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded bg-zinc-950/80 text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-white transition-all"
        title="Copy Stream URL"
      >
        {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
      </button>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ entries, onSelect, currentEntry, onClear }) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const groups = Array.from(new Set(entries.map(e => e.group).filter(Boolean))) as string[];
  
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = !selectedGroup || entry.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-800 w-80">
      <div className="p-4 border-b border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-500 mb-2">
          <Tv size={24} />
          <h1 className="text-xl font-bold tracking-tight text-white">StreamPlay</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          <input
            type="text"
            placeholder="Search channels..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {groups.length > 0 && (
          <select
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 px-3 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value || null)}
          >
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-zinc-600">
            <p className="text-sm">No channels found</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredEntries.map((entry, idx) => (
              <ChannelItem 
                key={`${entry.url}-${idx}`}
                entry={entry}
                onSelect={onSelect}
                isActive={currentEntry?.url === entry.url}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
        <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
          {filteredEntries.length} Channels
        </div>
        {entries.length > 0 && (
          <button 
            onClick={onClear}
            className="p-1.5 text-zinc-600 hover:text-red-500 transition-colors"
            title="Clear Playlist"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  );
};
