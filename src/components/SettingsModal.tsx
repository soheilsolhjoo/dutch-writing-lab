import React, { useState, useEffect } from 'react';
import { useApi } from '../context/ApiContext';
import { fetchAvailableModels, type GeminiModel } from '../services/gemini';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { 
    geminiModel, setGeminiModel,
    apiKey, setApiKey, 
    githubToken, setGithubToken,
    gistId, setGistId,
    paragraphCount, setParagraphCount,
    wordCount, setWordCount
  } = useApi();
  
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localGithubToken, setLocalGithubToken] = useState(githubToken);
  const [localGistId, setLocalGistId] = useState(gistId);
  const [localParagraphCount, setLocalParagraphCount] = useState(paragraphCount);
  const [localWordCount, setLocalWordCount] = useState(wordCount);
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>([]);

  useEffect(() => {
    if (localApiKey) {
      fetchAvailableModels(localApiKey).then(models => {
        if (models.length > 0) {
          setAvailableModels(models);
        }
      });
    }
  }, [localApiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiModel(localGeminiModel);
    setApiKey(localApiKey);
    setGithubToken(localGithubToken);
    setGistId(localGistId);
    setParagraphCount(localParagraphCount);
    setWordCount(localWordCount);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>⚙️ Cloud Settings</h2>
        
        <h3 style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Text Generation Limits</h3>
        <div className="controls-row" style={{ marginTop: '15px' }}>
          <div className="form-group flex-grow">
            <label htmlFor="paragraphCount">Paragraphs</label>
            <input
              id="paragraphCount"
              type="text"
              value={localParagraphCount}
              onChange={(e) => setLocalParagraphCount(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
          <div className="form-group flex-grow">
            <label htmlFor="wordCount">Words</label>
            <input
              id="wordCount"
              type="text"
              value={localWordCount}
              onChange={(e) => setLocalWordCount(e.target.value)}
              placeholder="e.g. 100-250"
            />
          </div>
        </div>

        <h3 style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Gemini API Settings</h3>
        
        <div className="form-group" style={{ marginTop: '15px' }}>
          <label htmlFor="geminiModel">Model Selection</label>
          <input 
            id="geminiModel"
            type="text"
            list="models-list"
            value={localGeminiModel}
            onChange={(e) => setLocalGeminiModel(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="e.g. gemini-3.5-flash"
          />
          <datalist id="models-list">
            {availableModels.length > 0 ? (
              availableModels.map(model => (
                <option key={model.name} value={model.name}>{model.displayName}</option>
              ))
            ) : (
              <>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash</option>
                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              </>
            )}
          </datalist>
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">Gemini API Key</label>
          <div className="help-text">
            You can generate a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.
          </div>
          <input
            id="apiKey"
            type="password"
            value={localApiKey}
            onChange={(e) => setLocalApiKey(e.target.value)}
            placeholder="AIzaSy..."
          />
        </div>

        <h3 style={{ marginTop: '30px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>GitHub Cloud Sync</h3>
        <div className="help-text" style={{ marginTop: '10px' }}>
          Optional: Add a GitHub Personal Access Token (with 'gist' scope) to sync your history to the cloud. If you leave Gist ID empty, the app will create a new one on your first push.
        </div>
        <div className="form-group">
          <label htmlFor="githubToken">GitHub PAT</label>
          <input
            id="githubToken"
            type="password"
            value={localGithubToken}
            onChange={(e) => setLocalGithubToken(e.target.value)}
            placeholder="ghp_..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="gistId">Gist ID (leave blank to auto-create)</label>
          <input
            id="gistId"
            type="text"
            value={localGistId}
            onChange={(e) => setLocalGistId(e.target.value)}
            placeholder="e.g. 1234abcd..."
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
};