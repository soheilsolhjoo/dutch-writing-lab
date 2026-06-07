import React, { createContext, useContext, useState, useEffect } from 'react';

type ApiMode = 'free' | 'gcp';
type Theme = 'light' | 'dark';

interface ApiContextType {
  apiMode: ApiMode;
  setApiMode: (mode: ApiMode) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  gcpProjectId: string;
  setGcpProjectId: (id: string) => void;
  githubToken: string;
  setGithubToken: (token: string) => void;
  gistId: string;
  setGistId: (id: string) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isConfigured: boolean;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiMode, setApiModeState] = useState<ApiMode>(() => {
    return (localStorage.getItem('apiMode') as ApiMode) || 'free';
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

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const isConfigured = apiMode === 'free' ? apiKey.trim() !== '' : gcpProjectId.trim() !== '';

  return (
    <ApiContext.Provider
      value={{
        apiMode, setApiMode,
        apiKey, setApiKey,
        gcpProjectId, setGcpProjectId,
        githubToken, setGithubToken,
        gistId, setGistId,
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