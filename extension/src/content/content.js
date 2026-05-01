// Better email content detection
function getEmailContent() {
  try {
    console.log('Looking for email content...');
    
    // Try multiple selectors for Gmail
    let emailBody = null;
    let selectors = [
      '.a3s',           // Classic Gmail
      '.ii.gt',         // Another Gmail selector
      '[role="presentation"]', // Gmail role
      '.adn .ads',      // Gmail ads
      'div[aria-label*="Message"]', // New Gmail
      '.gs'             // Gmail snippet
    ];
    
    for (let selector of selectors) {
      emailBody = document.querySelector(selector);
      if (emailBody && emailBody.innerText.length > 50) {
        console.log('Found email body with selector:', selector);
        break;
      }
    }
    
    // Get subject
    let subject = null;
    let subjectSelectors = [
      '.hP',
      '[name="subjectbox"]',
      'input[name="subject"]',
      'h2[data-thread-perm-id]',
      '.ha'
    ];
    
    for (let selector of subjectSelectors) {
      subject = document.querySelector(selector);
      if (subject && subject.innerText) {
        console.log('Found subject with selector:', selector);
        break;
      }
    }
    
    // Get sender
    let sender = null;
    let senderSelectors = [
      '.gD',
      '.go',
      '[email]',
      '.iw .gD',
      '.nH.Hg .gD'
    ];
    
    for (let selector of senderSelectors) {
      sender = document.querySelector(selector);
      if (sender && (sender.innerText || sender.getAttribute('email'))) {
        console.log('Found sender with selector:', selector);
        break;
      }
    }
    
    if (!emailBody || !emailBody.innerText) {
      console.log('No email body found');
      return null;
    }
    
    const emailData = {
      subject: subject ? subject.innerText.trim() : 'No Subject',
      sender: sender ? (sender.innerText || sender.getAttribute('email') || 'Unknown Sender').trim() : 'Unknown Sender',
      body: emailBody.innerText.trim()
    };
    
    console.log('Email found:', emailData.subject);
    return emailData;
  } catch (error) {
    console.error('Error getting email content:', error);
    return null;
  }
}

// Auto open compose window and insert reply
function autoInsertReply(replyText) {
  try {
    console.log('Auto inserting reply...', replyText);
    showNotification('Opening compose window...', 2000);
    
    // Method 1: Find and click Reply button
    const replySelectors = [
      '[aria-label="Reply"]',
      '[aria-label*="Reply"]',
      '.T-I.J-J5-Ji.aoO.v7',
      'div[role="button"][aria-label*="Reply"]',
      '.ams.bkH',
      '.T-I.J-J5-Ji.aoO',
      'div[data-tooltip="Reply"]',
      'div[data-tooltip*="Reply"]'
    ];
    
    let replyButton = null;
    for (let selector of replySelectors) {
      replyButton = document.querySelector(selector);
      if (replyButton) {
        console.log('Found reply button:', selector);
        break;
      }
    }
    
    if (replyButton) {
      replyButton.click();
      console.log('Reply button clicked');
      
      // Wait for compose window and insert with multiple attempts
      setTimeout(() => {
        insertTextIntoCompose(replyText);
      }, 1000);
      
      return true;
    }
    
    showNotification('Reply button not found. Please click Reply manually.', 3000);
    return false;
  } catch (error) {
    console.error('Error in auto insert:', error);
    showNotification('Error: ' + error.message, 3000);
    return false;
  }
}

// Insert text into compose box with multiple methods
function insertTextIntoCompose(text) {
  console.log('Attempting to insert text...', text.substring(0, 50));
  
  // Try multiple selectors for compose box
  const composeSelectors = [
    '[aria-label="Message Body"]',
    '[role="textbox"]',
    '.editable',
    'div[contenteditable="true"]',
    '[g_editable="true"]',
    '.Am.Al.editable',
    'div[aria-label*="Message"]',
    'div[class*="editable"]'
  ];
  
  let composeBox = null;
  for (let selector of composeSelectors) {
    composeBox = document.querySelector(selector);
    if (composeBox) {
      console.log('Found compose box with selector:', selector);
      break;
    }
  }
  
  if (composeBox) {
    // Method 1: Focus and set text
    composeBox.focus();
    composeBox.click();
    
    // Method 2: Set innerText
    composeBox.innerText = text;
    
    // Method 3: Set textContent
    composeBox.textContent = text;
    
    // Method 4: For contenteditable div
    if (composeBox.getAttribute('contenteditable') === 'true') {
      composeBox.innerHTML = text.replace(/\n/g, '<br>');
    }
    
    // Trigger all possible events
    const events = ['input', 'change', 'keyup', 'keydown', 'paste', 'focus'];
    events.forEach(eventType => {
      composeBox.dispatchEvent(new Event(eventType, { bubbles: true }));
    });
    
    // Also try execCommand for older Gmail
    try {
      document.execCommand('insertText', false, text);
    } catch (e) {
      console.log('execCommand not supported');
    }
    
    showNotification('✓ Reply inserted!', 2000);
    console.log('Text inserted successfully');
    return true;
  } else {
    console.log('Compose box not found, retrying...');
    setTimeout(() => {
      retryInsertText(text);
    }, 1000);
    return false;
  }
}

// Retry insertion
function retryInsertText(text) {
  const composeBox = document.querySelector('[role="textbox"], .editable, [contenteditable="true"], [aria-label="Message Body"]');
  
  if (composeBox) {
    composeBox.focus();
    composeBox.innerText = text;
    composeBox.dispatchEvent(new Event('input', { bubbles: true }));
    showNotification('✓ Reply inserted!', 2000);
  } else {
    showNotification('⚠️ Please click in compose box and paste (Ctrl+V)', 4000);
    // Copy to clipboard as backup
    copyToClipboard(text);
  }
}

// Copy to clipboard helper
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('📋 Reply copied! Paste in compose box (Ctrl+V)', 3000);
  });
}

// Show notification
function showNotification(message, duration = 2000) {
  const existing = document.querySelector('.ai-gmail-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'ai-gmail-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1a73e8;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
  `;
  
  // Add animation styles if not present
  if (!document.querySelector('#ai-gmail-styles')) {
    const style = document.createElement('style');
    style.id = 'ai-gmail-styles';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        to { opacity: 0; visibility: hidden; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.action);
  
  if (request.action === 'getEmail') {
    const emailData = getEmailContent();
    sendResponse(emailData);
    return false;
  }
  
  if (request.action === 'insertReply') {
    const success = autoInsertReply(request.reply);
    sendResponse({ success: success });
    return false;
  }
});