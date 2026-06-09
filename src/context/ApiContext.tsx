import React, { createContext, useContext, useState, useEffect } from 'react';

type ApiMode = 'free' | 'gcp';
type Theme = 'light' | 'dark';

interface ApiContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  gcpProjectId: string;
  setGcpProjectId: (id: string) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  gistId: string;
  setGistId: (id: string) => void;
  paragraphCount: string;
  setParagraphCount: (count: string) => void;
  wordCount: string;
  setWordCount: (count: string) => void;
  customTopics: string[];
  setCustomTopics: (topics: string[]) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isConfigured: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiMode, setApiModeState] = useState<ApiMode>(() => {
    return (localStorage.getItem('apiMode') as ApiMode) || 'free';
  });
  const [geminiModel, setGeminiModelState] = useState<string>(() => {
    return localStorage.getItem('geminiModel') || 'gemini-3.5-flash';
  });
  const [apiKey, setApiKeyState] = useState<string>(() => {
    return localStorage.getItem('apiKey') || '';
  });
  const [gcpProjectId, setGcpProjectIdState] = useState<string>(() => {
    return localStorage.getItem('gcpProjectId') || '';
  });
  const [githubToken, setGithubTokenState] = useState<string>(() => {
    return localStorage.getItem('githubToken') || '';
  });
  const [gistId, setGistIdState] = useState<string>(() => {
    return localStorage.getItem('gistId') || '';
  });
  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'light';
  });
  const [paragraphCount, setParagraphCountState] = useState<string>(() => {
    return localStorage.getItem('paragraphCount') || '5';
  });
  const [wordCount, setWordCountState] = useState<string>(() => {
    return localStorage.getItem('wordCount') || '100-250';
  });
  const [customTopics, setCustomTopicsState] = useState<string[]>(() => {
    const saved = localStorage.getItem('customTopics');
    return saved ? JSON.parse(saved) : [
      "Do you agree or disagree: It is better to make mistakes and learn from them than to avoid making mistakes altogether?",
      "Some people prefer to live in a small town. Others prefer to live in a big city. Which place would you prefer to live in?",
      "Do you agree or disagree: Technology has made children less creative than they were in the past.",
      "Some people believe that university education should be free for everyone. Others think that students should pay higher education fees. Discuss both views.",
      "Do you agree or disagree: The best way to increase a country's economic growth is to invest in education.",
      "What is the most important characteristic a good leader must have?",
      "Do you agree or disagree: It is more important to keep your old friends than it is to make new friends."
    ];
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [theme]);

  const setApiMode = (mode: ApiMode) => {
    setApiModeState(mode);
    localStorage.setItem('apiMode', mode);
  };

  const setGeminiModel = (model: string) => {
    setGeminiModelState(model);
    localStorage.setItem('geminiModel', model);
  };

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem('apiKey', key);
  };

  const setGcpProjectId = (id: string) => {
    setGcpProjectIdState(id);
    localStorage.setItem('gcpProjectId', id);
  };

  const setGithubToken = (token: string) => {
    setGithubTokenState(token);
    localStorage.setItem('githubToken', token);
  };

  const setGistId = (id: string) => {
    setGistIdState(id);
    localStorage.setItem('gistId', id);
  };

  const setParagraphCount = (count: string) => {
    setParagraphCountState(count);
    localStorage.setItem('paragraphCount', count);
  };

  const setWordCount = (count: string) => {
    setWordCountState(count);
    localStorage.setItem('wordCount', count);
  };

  const setCustomTopics = (topics: string[]) => {
    setCustomTopicsState(topics);
    localStorage.setItem('customTopics', JSON.stringify(topics));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isConfigured = apiMode === 'free' ? apiKey.trim() !== '' : gcpProjectId.trim() !== '';

  return (
    <ApiContext.Provider
      value={{
        apiMode, setApiMode,
        geminiModel, setGeminiModel,
        apiKey, setApiKey,
        gcpProjectId, setGcpProjectId,
        githubToken, setGithubToken,
        gistId, setGistId,
        paragraphCount, setParagraphCount,
        wordCount, setWordCount,
        customTopics, setCustomTopics,
        theme, setTheme,
        isConfigured,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};