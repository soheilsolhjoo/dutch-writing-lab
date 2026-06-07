import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>ℹ️ About</h2>
        <div style={{ marginTop: '20px', lineHeight: '1.6' }}>
          <p><strong>Made by Soheil Solhjoo (2026)</strong></p>
          <p style={{ marginTop: '15px' }}>
            The Dutch Writing Lab is an open-source, client-side application designed to help you practice and perfect your Dutch writing using the CEFR framework and active recall techniques.
          </p>
          <p style={{ marginTop: '15px' }}>
            For setup instructions and to view the source code, please visit the repository:
          </p>
          <p style={{ marginTop: '15px' }}>
            <a href="https://github.com/soheilsolhjoo/dutch-writing-lab" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
              View on GitHub
            </a>
          </p>
        </div>
        <div className="modal-actions" style={{ marginTop: '30px' }}>
          <button onClick={onClose} className="btn-primary">Close</button>
        </div>
      </div>
    </div>
  );
};