import React from 'react';
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
}

export const HistoryModal: React.FC<Props> = ({ isOpen, onClose, onLoad }) => {
  const [history, setHistory] = React.useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('dutchLabHistory');
    return saved ? JSON.parse(saved) : [];
  });

  // Re-read from local storage every time modal opens
  React.useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('dutchLabHistory');
      setHistory(saved ? JSON.parse(saved) : []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('dutchLabHistory', JSON.stringify(updated));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📚 Saved History</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '5px 10px' }}>Close</button>
        </div>
        
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No saved texts yet. Generate and save a text to see it here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.sort((a, b) => b.timestamp - a.timestamp).map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{new Date(item.timestamp).toLocaleString()}</strong>
                  <div style={{ marginTop: '5px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', background: 'var(--primary-color)', color: 'white', borderRadius: '4px', fontSize: '0.8em', marginRight: '10px' }}>
                      {item.level}
                    </span>
                    {item.topic}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => { onLoad(item); onClose(); }} className="btn-primary" style={{ padding: '8px 16px' }}>
                    📖 Load
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="btn-secondary" style={{ padding: '8px 16px', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
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