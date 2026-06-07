import React, { useState } from 'react';
import { useApi } from '../context/ApiContext';
import { auditUserText, type AuditResult } from '../services/gemini';

interface Phase2Props {
  targetLevel: string;
  setTargetLevel: (lvl: string) => void;
  result: AuditResult | null;
  setResult: (res: AuditResult | null) => void;
  inputText: string;
  setInputText: (text: string) => void;
}

export const Phase2: React.FC<Phase2Props> = ({ 
  targetLevel, setTargetLevel,
  result, setResult, 
  inputText, setInputText 
}) => {
  const { apiMode, apiKey, gcpProjectId, isConfigured } = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'analysis' | 'clean'>('analysis');

  const handleAudit = async () => {
    if (!inputText) return;
    setLoading(true);
    setError(null);
    try {
      const res = await auditUserText(inputText, targetLevel, apiMode, { apiKey, gcpProjectId });
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to audit text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phase-container">
      <h2>Phase 2: Review & Audit</h2>
      {!isConfigured && <div className="warning">Please configure your API Key in the settings first.</div>}
      
      <div className="controls-row">
        <div className="form-group">
          <label>Target CEFR Level</label>
          <select value={targetLevel} onChange={(e) => setTargetLevel(e.target.value)}>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Your Dutch Text</label>
        <textarea 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your Dutch text here..."
          rows={10}
        />
      </div>

      <button 
        onClick={handleAudit} 
        className="btn-primary generate-btn" 
        disabled={!isConfigured || loading || !inputText}
      >
        {loading ? 'Auditing...' : 'Submit for Review'}
      </button>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results-container">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'analysis' ? 'active' : ''}`}
              onClick={() => setViewMode('analysis')}
            >
              Sentence-by-Sentence Analysis
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'clean' ? 'active' : ''}`}
              onClick={() => setViewMode('clean')}
            >
              Clean Corrected Text
            </button>
          </div>

          <div className="card audit-card">
            {viewMode === 'analysis' ? (
              <div className="sentence-analysis">
                {result.sentences.map((s, idx) => (
                  <div key={idx} className="sentence-block">
                    {s.isModified ? (
                      <>
                        <div className="original">
                          <span className="label">Original:</span>
                          <span className="text struck">{s.original}</span>
                        </div>
                        <div className="corrected">
                          <span className="label">Corrected:</span>
                          <span className="text green">{s.corrected}</span>
                        </div>
                        <div className="explanation">
                          <span className="label">Explanation:</span>
                          <span className="text">{s.explanation}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="correct-sentence">
                          <span className="label">✅ Correct:</span>
                          <span className="text">{s.original}</span>
                        </div>
                        <div className="explanation">
                          <span className="label">Note:</span>
                          <span className="text">{s.explanation}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="clean-text">
                {result.cleanText.split('\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};