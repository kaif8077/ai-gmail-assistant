import React, { useState, useEffect } from 'react';

const Popup = () => {
  const [emailData, setEmailData] = useState(null);
  const [generatedReply, setGeneratedReply] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tone, setTone] = useState('professional');
  const [language, setLanguage] = useState('english');
  const [activeTab, setActiveTab] = useState('reply');
  const [customInstructions, setCustomInstructions] = useState('');

  const quickReplies = [
    "Thanks for your email! I'll review and get back to you soon.",
    "Noted with thanks. I'll take necessary action.",
    "Let's schedule a meeting to discuss this further.",
    "Could you please share more details about this?",
    "I appreciate your help on this matter."
  ];

  // Load email when popup opens
  useEffect(() => {
    loadCurrentEmail();
  }, []);

  const loadCurrentEmail = () => {
    setError('');
    setLoading(true);

    // First check if we're on Gmail
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab || !currentTab.url || !currentTab.url.includes('mail.google.com')) {
        setError('Please open Gmail first');
        setLoading(false);
        return;
      }

      // Try to get email
      chrome.runtime.sendMessage({ action: 'getEmail' }, (response) => {
        setLoading(false);

        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          setError('Please refresh the Gmail page');
          return;
        }

        if (response && response.body && response.body.length > 50) {
          setEmailData(response);
          setError('');
          console.log('Email loaded:', response.subject);
        } else if (response && response.body && response.body.length < 50) {
          setError('Please open a full email (not preview)');
        } else {
          setError('No email detected. Please click on any email to open it.');
        }
      });
    });
  };

  const generateReply = () => {
    if (!emailData) {
      setError('No email loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError('');

    console.log('Generating reply for:', emailData.subject);

    chrome.runtime.sendMessage({
      action: 'generateReply',
      email: emailData,
      tone: tone,
      language: language,
      customInstructions: customInstructions
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        setError('Extension error: ' + chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }

      console.log('Response received:', response);

      if (response && response.reply) {
        setGeneratedReply(response.reply);
      } else if (response && response.error) {
        setError('Backend error: ' + response.error);
      } else {
        setError('Failed to generate reply. Please try again.');
      }
      setLoading(false);
    });
  };

  const generateSummary = () => {
    if (!emailData) {
      setError('No email loaded. Please refresh and try again.');
      return;
    }

    setLoading(true);
    setError('');

    chrome.runtime.sendMessage({
      action: 'summarizeEmail',
      email: emailData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        setError('Extension error: ' + chrome.runtime.lastError.message);
        setLoading(false);
        return;
      }

      if (response && response.summary) {
        setSummary(response.summary);
      } else if (response && response.error) {
        setError('Backend error: ' + response.error);
      } else {
        setError('Failed to summarize email. Please try again.');
      }
      setLoading(false);
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedReply);
      alert('✓ Reply copied to clipboard!');
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const autoInsertToGmail = () => {
    if (!generatedReply) {
      setError('Please generate a reply first');
      return;
    }

    chrome.runtime.sendMessage({
      action: 'insertReply',
      reply: generatedReply
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        setError('Failed to insert reply');
        return;
      }

      if (response && response.success) {
        alert('✓ Reply inserted automatically! Gmail compose will open.');
      } else {
        setError('Please make sure you are on an email in Gmail');
      }
    });
  };

  const useQuickReply = (reply) => {
    setGeneratedReply(reply);
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">
          <span className="icon">🤖</span>
          AI Gmail Assistant
        </h1>
        <button onClick={loadCurrentEmail} className="refresh-btn" title="Refresh">
          🔄
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button
            onClick={loadCurrentEmail}
            style={{
              marginLeft: '10px',
              padding: '4px 8px',
              fontSize: '11px',
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Retry
          </button>
        </div>
      )}

      {emailData && (
        <div className="email-preview">
          <div className="preview-header">📧 Current Email</div>
          <div className="preview-content">
            <div><strong>From:</strong> {emailData.sender || 'Unknown'}</div>
            <div><strong>Subject:</strong> {emailData.subject || 'No Subject'}</div>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'reply' ? 'active' : ''}`}
          onClick={() => setActiveTab('reply')}
        >
          ✉️ Generate Reply
        </button>
        <button
          className={`tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('summary');
            if (!summary && emailData) generateSummary();
          }}
        >
          📝 Summarize
        </button>
      </div>

      {activeTab === 'reply' && (
        <div className="reply-section">
          <div className="control-group">
            <label className="control-label">🎭 Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="select">
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="short">Short & Quick</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">🌐 Language</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="select">
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
              <option value="hinglish">Hinglish (Mix)</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">💡 Custom Instructions (Optional)</label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="e.g., Mention the deadline, Be more formal..."
              className="input"
            />
          </div>

          <button
            onClick={generateReply}
            disabled={loading || !emailData}
            className="btn-primary"
          >
            {loading ? '✨ Generating...' : '🚀 Generate Reply'}
          </button>

          <div className="quick-replies">
            <label className="control-label">⚡ Quick Replies</label>
            <div className="quick-buttons">
              {quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => useQuickReply(reply)}
                  className="btn-quick"
                >
                  {reply.length > 35 ? reply.slice(0, 35) + '...' : reply}
                </button>
              ))}
            </div>
          </div>

          {generatedReply && (
            <div className="reply-container">
              <label className="control-label">✍️ Generated Reply</label>
              <textarea
                value={generatedReply}
                onChange={(e) => setGeneratedReply(e.target.value)}
                className="textarea"
                rows="6"
                placeholder="Your generated reply will appear here..."
              />
              <div className="reply-actions">
                <button onClick={copyToClipboard} className="btn-secondary">
                  📋 Copy
                </button>
                <button onClick={autoInsertToGmail} className="btn-primary" style={{ background: '#34a853' }}>
                  🚀 Auto Insert Reply
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'summary' && (
        <div className="summary-section">
          {loading && !summary && (
            <div className="loading">
              <div className="spinner"></div>
              <p>Analyzing email...</p>
            </div>
          )}

          {summary && (
            <div className="summary-container">
              <div className="summary-header">📌 Key Points</div>
              <div className="summary-content">
                {summary.split('\n').map((point, idx) => (
                  <p key={idx} className="summary-point">
                    {point.trim()}
                  </p>
                ))}
              </div>
              <button
                onClick={generateSummary}
                disabled={loading}
                className="btn-secondary"
                style={{ marginTop: '12px' }}
              >
                🔄 Regenerate Summary
              </button>
            </div>
          )}

          {!summary && !loading && (
            <div className="empty-state">
              <p>Click the summarize button above to analyze this email</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Popup;