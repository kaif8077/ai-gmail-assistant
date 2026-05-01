// Background service worker for Chrome extension
const BACKEND_URL = 'http://localhost:5000/api';

chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Gmail Assistant installed successfully');
  chrome.storage.sync.set({
    defaultTone: 'professional',
    defaultLanguage: 'english',
    enabled: true
  });
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received:', request.action);
  
  if (request.action === 'generateReply') {
    // Make API call from background script
    fetch(`${BACKEND_URL}/generate-reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: request.email,
        tone: request.tone,
        language: request.language,
        customInstructions: request.customInstructions || ''
      })
    })
    .then(async response => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API call failed');
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ reply: data.reply });
    })
    .catch(error => {
      console.error('API Error:', error);
      sendResponse({ error: error.message });
    });
    
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'summarizeEmail') {
    // Make API call from background script
    fetch(`${BACKEND_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: request.email
      })
    })
    .then(async response => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API call failed');
      }
      return response.json();
    })
    .then(data => {
      sendResponse({ summary: data.summary });
    })
    .catch(error => {
      console.error('API Error:', error);
      sendResponse({ error: error.message });
    });
    
    return true; // Keep channel open for async response
  }
  
  if (request.action === 'getEmail') {
    // Forward to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getEmail' }, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
  
  if (request.action === 'insertReply') {
    // Forward to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { 
        action: 'insertReply', 
        reply: request.reply 
      }, (response) => {
        sendResponse(response);
      });
    });
    return true;
  }
});