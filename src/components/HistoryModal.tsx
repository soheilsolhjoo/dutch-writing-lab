import React, { useState, useEffect } from 'react';
import { type GenerationResult } from '../services/gemini';

export interface HistoryItem {
  id: string;
  timestamp: number;
  level: string;
  topic: string;
  result: GenerationResult;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (item: HistoryItem) => void;
  onDeletePush: () => void; // Callback to push changes to cloud after deletion
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose, onLoad, onDeletePush }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dutchLabHistory');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Re-read from local storage every time modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dutchLabHistory');
      setHistory(saved ? JSON.parse(saved) : []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      const updated = history.filter(item => item.id !== id);
      setHistory(updated);
      localStorage.setItem('dutchLabHistory', JSON.stringify(updated));
      onDeletePush(); // Sync to cloud
    }
  };

  const filteredHistory = history
    .filter(item => 
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.level.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => 
      sortOrder === 'newest' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp
    );

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📚 Saved History</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '5px 10px' }}>Close</button>
        </div>
        
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Search by topic or level..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flexGrow: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            />
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        )}
        
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No saved texts yet. Generate and save a text to see it here.</p>
        ) : filteredHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No texts match your search.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {filteredHistory.map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                  <div style={{ marginTop: '5px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', fontSize: '0.8em', marginRight: '10px' }}>
                      {item.level}
                    </span>
                    {item.topic}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { onLoad(item); onClose(); }} className="btn-primary" style={{ padding: '6px 12px', width: '70px', textAlign: 'center' }}>
                    📖 Load
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-secondary" style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)', width: '70px', textAlign: 'center' }}>
                    ❌ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};