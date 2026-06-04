// ==========================================================================
// 1. CONFIGURATION & DIRECT GEMINI API INTEGRATION
// ==========================================================================
const CONFIG = {
    // ⚠️ रोहित भाई, यहाँ अपनी असली जेमिनी API की (AQ.Ab8RN6K7HFjKbdKBp6bc-Ec5uFRJvf2_39K-n16PbBRTlCN9yA) पेस्ट कर दे
    apiKey: "YOUR_ACTUAL_GEMINI_API_KEY", 
    apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
  value(GEMINI,KEY)
};

// ==========================================================================
// 2. DOM ELEMENTS SELECTION
// ==========================================================================
const menuBtn = document.getElementById('menuBtn');
const settingsBtn = document.getElementById('settingsBtn');
const navSlider = document.getElementById('navSlider');
const closeNavBtn = document.getElementById('closeNavBtn');
const infoModal = document.getElementById('infoModal');
const closeModalBtn = document.getElementById('closeModalBtn');

const chatScreen = document.getElementById('chatScreen');
const centerLogoContainer = document.getElementById('centerLogoContainer');
const coreLogo = document.getElementById('coreLogo');
const messagesContainer = document.getElementById('messagesContainer');

const userInput = document.getElementById('userInput');
const shareFilesBtn = document.getElementById('shareFilesBtn');
const fileInput = document.getElementById('fileInput');
const micBtn = document.getElementById('micBtn');
const sendBtn = document.getElementById('sendBtn');

const themeButtons = document.querySelectorAll('.theme-btn');

let isFirstMessage = true;

// ==========================================================================
// 3. CORE CHAT LOGIC
// ==========================================================================

// Monitor input to enable/disable Send Button
userInput.addEventListener('input', () => {
    const text = userInput.value.trim();
    if (text.length > 0) {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute('disabled', 'true');
    }
    
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Main Send Handler
async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.setAttribute('disabled', 'true');

    if (isFirstMessage) {
        isFirstMessage = false;
        coreLogo.classList.add('shine');
        
        setTimeout(() => {
            centerLogoContainer.classList.add('hidden');
            messagesContainer.classList.remove('hidden');
            
            renderMessage(messageText, 'user');
            fetchGeminiResponse(messageText);
        }, 800);
    } else {
        renderMessage(messageText, 'user');
        fetchGeminiResponse(messageText);
    }
}

sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

function renderMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble', `${sender}-message`);
    
    messageDiv.style.padding = '12px 16px';
    messageDiv.style.borderRadius = '18px';
    messageDiv.style.maxWidth = '85%';
    messageDiv.style.fontSize = '0.95rem';
    messageDiv.style.lineHeight = '1.4';
    messageDiv.style.margin = '6px 0';
    
    if (sender === 'user') {
        messageDiv.style.alignSelf = 'flex-end';
        messageDiv.style.backgroundColor = 'var(--accent-color)';
        messageDiv.style.color = '#ffffff';
    } else {
        messageDiv.style.alignSelf = 'flex-start';
        messageDiv.style.backgroundColor = 'var(--input-bg)';
        messageDiv.style.color = 'var(--text-color)';
        messageDiv.style.border = '1px solid var(--border-color)';
    }
    
    messageDiv.innerText = text;
    messagesContainer.appendChild(messageDiv);
    chatScreen.scrollTo({ top: chatScreen.scrollHeight, behavior: 'smooth' });
}

// डायरेक्ट जेमिनी कॉल (अब कोई पुराना मैसेज नहीं दिखेगा, सीधे असली रिस्पॉन्स आएगा)
async function fetchGeminiResponse(prompt) {
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = "Core is typing...";
    loadingDiv.style.fontSize = '0.85rem';
    loadingDiv.style.color = 'var(--text-secondary)';
    loadingDiv.style.paddingLeft = '10px';
    messagesContainer.appendChild(loadingDiv);
    chatScreen.scrollTo({ top: chatScreen.scrollHeight, behavior: 'smooth' });

    try {
        const response = await fetch(`${CONFIG.apiUrl}?key=${CONFIG.CONFIG_apiKey || CONFIG.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            renderMessage(data.candidates[0].content.parts[0].text, 'core');
        } else {
            // यहाँ अब असली एरर दिखेगा जो गूगल भेजेगा
            renderMessage("Google API Error: " + JSON.stringify(data), 'core');
        }
    } catch (error) {
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);
        renderMessage("Network Error: " + error.message, 'core');
    }
}

// ==========================================================================
// 4. UI INTERACTIONS
// ==========================================================================
menuBtn.addEventListener('click', () => navSlider.classList.add('open'));
closeNavBtn.addEventListener('click', () => navSlider.classList.remove('open'));

settingsBtn.addEventListener('click', () => infoModal.classList.add('open'));
closeModalBtn.addEventListener('click', () => infoModal.classList.remove('open'));
infoModal.addEventListener('click', (e) => { if (e.target === infoModal) infoModal.classList.remove('open'); });

shareFilesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) alert(`${fileInput.files.length} Files Selected.`);
});

micBtn.addEventListener('click', () => {
    micBtn.style.color = 'var(--accent-color)';
    alert("Microphone integration ready...");
    setTimeout(() => { micBtn.style.color = 'var(--text-secondary)'; }, 2000);
});

// Theme Switching
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('.theme-btn.active').classList.remove('active');
        button.classList.add('active');
        const targetTheme = button.getAttribute('data-theme');
        document.body.classList.remove('dark-mode', 'glass-mode', 'neon-mode', 'cyber-mode');
        document.body.classList.add(`${targetTheme}-mode`);
    });
});
