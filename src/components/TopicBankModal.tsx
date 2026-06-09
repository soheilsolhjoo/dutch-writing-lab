import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { generateTopics } from '../services/gemini';
import { type HistoryItem } from './HistoryModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (topic: string) => void;
  history: HistoryItem[];
  level: string;
  onTopicPush: () => void; // Callback to push changes to cloud
}

export const TopicBankModal: React.FC<Props> = ({ isOpen, onClose, onSelect, history, level, onTopicPush }) => {
  const { customTopics, setCustomTopics, geminiModel, apiMode, apiKey, gcpProjectId } = useApi();
  const [newTopic, setNewTopic] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newTopic.trim() && !customTopics.includes(newTopic.trim())) {
      setCustomTopics([newTopic.trim(), ...customTopics]);
      setNewTopic('');
      setTimeout(onTopicPush, 0); // Sync after state update
    }
  };

  const handleDelete = (topicToDelete: string) => {
    if (window.confirm("Delete this topic from the bank?")) {
      setCustomTopics(customTopics.filter(t => t !== topicToDelete));
      setTimeout(onTopicPush, 0); // Sync after state update
    }
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      alert("Please configure your API Key in Settings first.");
      return;
    }
    setGenerating(true);
    try {
      const newTopics = await generateTopics(level, geminiModel, apiMode, { apiKey, gcpProjectId });
      const uniqueNewTopics = newTopics.filter(t => !customTopics.includes(t));
      if (uniqueNewTopics.length > 0) {
        setCustomTopics([...uniqueNewTopics, ...customTopics]);
        alert(`Successfully added ${uniqueNewTopics.length} new topics!`);
        setTimeout(onTopicPush, 0); // Sync after state update
      } else {
        alert("Generated topics were already in your bank. Try again!");
      }
    } catch (err: any) {
      alert("Failed to generate topics: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📚 Topic Bank</h2>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '5px 10px' }}>Close</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={newTopic} 
            onChange={(e) => setNewTopic(e.target.value)} 
            placeholder="Type a custom topic..." 
            style={{ flexGrow: 1 }}
          />
          <button onClick={handleAdd} className="btn-primary" style={{ padding: '8px 16px' }}>Add</button>
          <button onClick={handleGenerate} className="btn-secondary" style={{ padding: '8px 16px' }} disabled={generating}>
            {generating ? '⏳ Generating...' : '✨ Generate via AI'}
          </button>
        </div>

        <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customTopics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>Your topic bank is empty.</p>
          ) : (
            customTopics.map((topic, index) => {
              const historyMatches = history.filter(h => h.topic === topic);
              return (
                <div key={index} className="card" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <p style={{ marginBottom: '8px', fontWeight: '500' }}>{topic}</p>
                    {historyMatches.length > 0 && (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {historyMatches.map(h => (
                          <span key={h.id} style={{ fontSize: '0.8em', background: 'var(--success)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>
                            History: {h.level}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => { onSelect(topic); onClose(); }} 
                      className="btn-primary" 
                      style={{ padding: '6px 12px' }}
                    >
                      Select
                    </button>
                    <button 
                      onClick={() => handleDelete(topic)} 
                      className="btn-secondary" 
                      style={{ padding: '6px 12px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};