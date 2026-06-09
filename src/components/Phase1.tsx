import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { generateMasterText, type GenerationResult } from '../services/gemini';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TaggedText } from './TaggedText';
import { type HistoryItem } from './HistoryModal';

interface Phase1Props {
  level: string;
  setLevel: (lvl: string) => void;
  topic: string;
  setTopic: (t: string) => void;
  instructions: string;
  setInstructions: (inst: string) => void;
  result: GenerationResult | null;
  setResult: (res: GenerationResult | null) => void;
  handlePushToCloud: () => Promise<void>;
  onOpenTopicBank: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
}

export const Phase1: React.FC<Phase1Props> = ({ 
  level, setLevel, 
  topic, setTopic, 
  instructions, setInstructions, 
  result, setResult,
  handlePushToCloud,
  onOpenTopicBank,
  history,
  onLoadHistory
}) => {
  const { apiMode, geminiModel, apiKey, gcpProjectId, isConfigured, githubToken, paragraphCount, wordCount, customTopics, setCustomTopics } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Highlighting Toggles
  const [showConnectors, setShowConnectors] = useState(false);
  const [showVerbs, setShowVerbs] = useState(false);
  const [showIdioms, setShowIdioms] = useState(false);

  // Check for history matches when topic changes
  const [historyMatches, setHistoryMatches] = useState<HistoryItem[]>([]);
  useEffect(() => {
    if (topic.trim()) {
      setHistoryMatches(history.filter(h => h.topic === topic));
    } else {
      setHistoryMatches([]);
    }
  }, [topic, history]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setError(null);
    try {
      const res = await generateMasterText(level, topic, instructions, geminiModel, apiMode, { apiKey, gcpProjectId }, paragraphCount, wordCount);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to generate text.");
    } finally {
      setLoading(false);
    }
  };

  const downloadMd = () => {
    if (!result) return;
    const content = `# ${topic} (CEFR ${level})\n\n${result.rawText}\n\n## Vocabulary\n${result.vocabulary.map(v => `- **${v.word}**: ${v.farsi} (Context: *${v.context}*)`).join('\n')}\n\n## Dismantled Text\n${result.dismantledText}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `master_text_${level}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToHistory = async () => {
    if (!result) return;
    
    const savedHistory = localStorage.getItem('dutchLabHistory');
    let historyArray = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Check for duplicates (same topic and same content)
    const isDuplicate = historyArray.some((item: any) => 
      item.topic === topic && item.result.rawText === result.rawText
    );

    if (isDuplicate) {
      alert('This text is already in your history!');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      topic,
      result
    };
    
    historyArray.push(newItem);
    localStorage.setItem('dutchLabHistory', JSON.stringify(historyArray));
    
    if (githubToken) {
      await handlePushToCloud();
    } else {
      alert('Saved locally! (Provide a GitHub PAT in Cloud Settings to automatically sync to the cloud).');
    }
  };

  const handleSpeak = (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support text-to-speech.');
      return;
    }
    window.speechSynthesis.cancel(); // Stop any currently playing audio
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'nl-NL'; // Set language to Dutch
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveTopic = () => {
    if (topic.trim() && !customTopics.includes(topic.trim())) {
      setCustomTopics([topic.trim(), ...customTopics]);
      alert("Topic saved to bank!");
      setTimeout(handlePushToCloud, 0);
    }
  };

  return (
    <div className="phase-container">
      <h2>Phase 1: Generate Master Text</h2>
      {!isConfigured && <div className="warning">Please configure your API Key in the settings first.</div>}
      
      <div className="controls-row">
        <div className="form-group">
          <label>CEFR Level</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)}>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group flex-grow">
          <label>Topic (TOEFL Style)</label>
          <div className="input-with-btn">
            <input 
              type="text" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic..."
            />
            {!customTopics.includes(topic.trim()) && topic.trim() !== '' && (
              <button type="button" onClick={handleSaveTopic} className="btn-secondary" title="Save topic to bank">
                ⭐ Save
              </button>
            )}
            <button type="button" onClick={onOpenTopicBank} className="btn-secondary">
              📚 Topic Bank
            </button>
          </div>
          {historyMatches.length > 0 && (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: 'var(--warning-bg)', borderRadius: '6px', border: '1px solid var(--warning)' }}>
              <strong style={{ color: 'var(--warning-text)', display: 'block', marginBottom: '5px' }}>💡 Found in your History:</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                {historyMatches.map(match => (
                  <div key={match.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9em' }}>
                    <span>📄 {match.level} Level Essay (Generated {new Date(match.timestamp).toLocaleDateString()})</span>
                    <button 
                      onClick={() => onLoadHistory(match)}
                      className="btn-secondary"
                      style={{ padding: '2px 8px', fontSize: '0.85em' }}
                    >
                      Load
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Specific Instructions (Optional)</label>
        <textarea 
          value={instructions} 
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="e.g., Use specific vocabulary, write in the past perfect..."
          rows={3}
        />
      </div>

      <button 
        onClick={handleGenerate} 
        className="btn-primary generate-btn" 
        disabled={!isConfigured || loading || !topic}
      >
        {loading ? 'Generating...' : 'Generate Essay'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results-container">
          <div className="card">
            <h3>{topic}</h3>
            <h4>Text Analysis View (CEFR {level})</h4>
            
            <div className="toggles-row">
              <button 
                className={`toggle-btn btn-connector ${showConnectors ? 'active' : ''}`}
                onClick={() => setShowConnectors(!showConnectors)}
              >
                Show Connectors
              </button>
              <button 
                className={`toggle-btn btn-verb ${showVerbs ? 'active' : ''}`}
                onClick={() => setShowVerbs(!showVerbs)}
              >
                Show Verbs
              </button>
              <button 
                className={`toggle-btn btn-idiom ${showIdioms ? 'active' : ''}`}
                onClick={() => setShowIdioms(!showIdioms)}
              >
                Show Idioms/Expressions
              </button>
            </div>

            <div className="translation-grid">
              <div className="dutch-column">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0 }}>Dutch (Target)</h4>
                  <button 
                    onClick={() => handleSpeak(result.rawText)} 
                    className="btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.85em' }}
                  >
                    🔊 Listen
                  </button>
                </div>
                <TaggedText 
                  text={result.text} 
                  showConnectors={showConnectors} 
                  showVerbs={showVerbs} 
                  showIdioms={showIdioms} 
                />
              </div>
              <div className="farsi-column">
                <h4 style={{ marginBottom: '10px' }}>Farsi (Translation)</h4>
                <div className="farsi-text" dir="rtl">
                  {result.farsiTranslation?.map((para, idx) => (
                     <p key={idx}>{para}</p>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="result-actions">
              <button onClick={downloadMd} className="btn-secondary">Download Text as .md</button>
              <button onClick={handleSaveToHistory} className="btn-primary">💾 Save to History</button>
            </div>
          </div>

          <div className="card">
            <h3>Vocabulary</h3>
            <ul className="vocab-list">
              {result.vocabulary.map((item, idx) => (
                <li key={idx}>
                  <strong>{item.word}</strong> 
                  <button 
                    onClick={() => handleSpeak(item.word)} 
                    title="Listen to pronunciation"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '5px' }}
                  >
                    🔊
                  </button>
                  : <span dir="rtl">{item.farsi}</span>
                  <p className="context">"{item.context}"</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Dismantled Text (Active Recall)</h3>
            <div className="markdown-content dismantled">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.dismantledText}</ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};