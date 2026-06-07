import { useState } from 'react';
import { ApiProvider, useApi } from './context/ApiContext';
import { SettingsModal } from './components/SettingsModal';
import { AboutModal } from './components/AboutModal';
import { HistoryModal, type HistoryItem } from './components/HistoryModal';
import { Phase1 } from './components/Phase1';
import { Phase2 } from './components/Phase2';
import type { GenerationResult, AuditResult } from './services/gemini';
import './index.css';

function AppContent() {
  const { theme, setTheme, githubToken, gistId, setGistId } = useApi();
  const [activeTab, setActiveTab] = useState<'phase1' | 'phase2'>('phase1');
  
  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // Phase 1 State
  const [phase1Level, setPhase1Level] = useState('B2');
  const [phase1Topic, setPhase1Topic] = useState('');
  const [phase1Instructions, setPhase1Instructions] = useState('');
  const [phase1Result, setPhase1Result] = useState<GenerationResult | null>(null);

  // Phase 2 State
  const [phase2TargetLevel, setPhase2TargetLevel] = useState('B2');
  const [phase2Result, setPhase2Result] = useState<AuditResult | null>(null);
  const [phase2InputText, setPhase2InputText] = useState('');

  const [syncing, setSyncing] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handlePushToCloud = async () => {
    if (!githubToken) {
      alert("Please configure your GitHub PAT in Cloud Settings first.");
      setIsSettingsOpen(true);
      return;
    }
    
    setSyncing(true);
    try {
      const localData = localStorage.getItem('dutchLabHistory') || '[]';
      const content = { "dutch_lab_history.json": { content: localData } };
      
      let response;
      if (gistId) {
        // Update existing Gist
        response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({ files: content })
        });
      } else {
        // Create new Gist
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            description: "Dutch Writing Lab History Backup",
            public: false,
            files: content
          })
        });
      }

      if (!response.ok) throw new Error("GitHub API Error");
      
      const data = await response.json();
      if (!gistId) {
        setGistId(data.id); // Save the newly created Gist ID
      }
      alert("Successfully pushed history to GitHub Cloud!");
    } catch (err) {
      console.error(err);
      alert("Failed to push to cloud. Check your GitHub PAT and internet connection.");
    } finally {
      setSyncing(false);
    }
  };

  const handlePullFromCloud = async () => {
    if (!githubToken) {
      alert("Please configure your GitHub PAT in Cloud Settings first.");
      setIsSettingsOpen(true);
      return;
    }

    setSyncing(true);
    try {
      let targetGistId = gistId;

      // Auto-discovery logic: If Gist ID is missing, search for it
      if (!targetGistId) {
        const listResponse = await fetch(`https://api.github.com/gists`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          }
        });
        
        if (!listResponse.ok) throw new Error("Failed to list Gists");
        
        const gists = await listResponse.json();
        const foundGist = gists.find((g: any) => g.files["dutch_lab_history.json"]);
        
        if (foundGist) {
          targetGistId = foundGist.id;
          setGistId(targetGistId); // Save for future use
        } else {
          alert("No Dutch Writing Lab history found on your GitHub account. Try pushing from your other device first!");
          setSyncing(false);
          return;
        }
      }

      const response = await fetch(`https://api.github.com/gists/${targetGistId}`, {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
        }
      });
      
      if (!response.ok) throw new Error("GitHub API Error");
      
      const data = await response.json();
      const fileContent = data.files["dutch_lab_history.json"]?.content;
      
      if (fileContent) {
        localStorage.setItem('dutchLabHistory', fileContent);
        alert("Successfully pulled history from GitHub Cloud!");
      } else {
        alert("No history file found in that Gist.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to pull from cloud. Check your token and internet connection.");
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    setPhase1Level(item.level);
    setPhase1Topic(item.topic);
    setPhase1Result(item.result);
    setActiveTab('phase1');
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/favicon.png" alt="Study Monitor Icon" style={{ width: '32px', height: '32px' }} />
          <h1>Dutch Writing Lab</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="settings-btn" onClick={toggleTheme} title="Toggle Dark Mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="settings-btn" onClick={() => setIsAboutOpen(true)}>
            ℹ️ About
          </button>
          <button className="settings-btn" onClick={() => setIsHistoryOpen(true)}>
            📚 History
          </button>
          <button className="settings-btn" onClick={handlePullFromCloud} disabled={syncing}>
            {syncing ? '⏳...' : '☁️ Pull'}
          </button>
          <button className="settings-btn" onClick={() => setIsSettingsOpen(true)}>
            ⚙️ Cloud Settings
          </button>
        </div>
      </header>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'phase1' ? 'active' : ''}`}
          onClick={() => setActiveTab('phase1')}
        >
          Phase 1: Generate Master Text
        </button>
        <button 
          className={`tab ${activeTab === 'phase2' ? 'active' : ''}`}
          onClick={() => setActiveTab('phase2')}
        >
          Phase 2: Review & Audit
        </button>
      </div>

      <main className="app-main">
        {activeTab === 'phase1' ? (
          <Phase1 
            level={phase1Level} setLevel={setPhase1Level}
            topic={phase1Topic} setTopic={setPhase1Topic}
            instructions={phase1Instructions} setInstructions={setPhase1Instructions}
            result={phase1Result} setResult={setPhase1Result} 
            handlePushToCloud={handlePushToCloud}
          />
        ) : (
          <Phase2 
            targetLevel={phase2TargetLevel} setTargetLevel={setPhase2TargetLevel}
            result={phase2Result} setResult={setPhase2Result}
            inputText={phase2InputText} setInputText={setPhase2InputText}
          />
        )}
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} onLoad={handleLoadHistory} />
    </div>
  );
}

function App() {
  return (
    <ApiProvider>
      <AppContent />
    </ApiProvider>
  );
}

export default App;