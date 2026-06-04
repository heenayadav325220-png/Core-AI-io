// ==========================================================================
// 1. CONFIGURATION & CORE AI APIS (Vercel Backend Routing)
// ==========================================================================
const CONFIG = {
    modelName: "Gemini 1.5 Flash"
    // यहाँ अब सीधे API Key और गूगल का URL रखने की ज़रूरत नहीं है, क्योंकि रिक्वेस्ट अब तेरे सर्वर रूट पर जाएगी।
};

// ==========================================================================
// 2. DOM ELEMENTS SELECTION
// ==========================================================================
// Layout Elements
const menuBtn = document.getElementById('menuBtn');
const settingsBtn = document.getElementById('settingsBtn');
const navSlider = document.getElementById('navSlider');
const closeNavBtn = document.getElementById('closeNavBtn');
const infoModal = document.getElementById('infoModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// Chat Logic Elements
const chatScreen = document.getElementById('chatScreen');
const centerLogoContainer = document.getElementById('centerLogoContainer');
const coreLogo = document.getElementById('coreLogo');
const messagesContainer = document.getElementById('messagesContainer');

// Input Controls
const userInput = document.getElementById('userInput');
const shareFilesBtn = document.getElementById('shareFilesBtn');
const fileInput = document.getElementById('fileInput');
const micBtn = document.getElementById('micBtn');
const sendBtn = document.getElementById('sendBtn');

// Theme Elements
const themeButtons = document.querySelectorAll('.theme-btn');

// App State Tracker
let isFirstMessage = true;

// ==========================================================================
// 3. CORE CHAT LOGIC & GEMINI INTEGRATION
// ==========================================================================

// Monitor input to enable/disable Send Button (Empty screen message handler)
userInput.addEventListener('input', () => {
    const text = userInput.value.trim();
    if (text.length > 0) {
        sendBtn.removeAttribute('disabled');
    } else {
        sendBtn.setAttribute('disabled', 'true');
    }
    
    // Auto-resize textarea row height dynamically
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
});

// Main Send Handler
async function handleSendMessage() {
    const messageText = userInput.value.trim();
    if (!messageText) return;

    // Reset input fields instantly
    userInput.value = '';
    userInput.style.height = 'auto';
    sendBtn.setAttribute('disabled', 'true');

    // UI State Management for the Core AI Central Logo
    if (isFirstMessage) {
        isFirstMessage = false;
        
        // 1. Logo Starts to Shine/Glow
        coreLogo.classList.add('shine');
        
        // Small delay to appreciate the shine, then morph transition
        setTimeout(() => {
            // 2. Logo disappears smoothly, Messages area reveals
            centerLogoContainer.classList.add('hidden');
            messagesContainer.classList.remove('hidden');
            
            // Render user message and invoke AI
            renderMessage(messageText, 'user');
            fetchGeminiResponse(messageText);
        }, 800);
    } else {
        renderMessage(messageText, 'user');
        fetchGeminiResponse(messageText);
    }
}

// Trigger Send on click or Enter key (without Shift)
sendBtn.addEventListener('click', handleSendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// Render Message Blocks into UI Window
function renderMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-bubble', `${sender}-message`);
    
    // Inject clean styling for chat bubbles via runtime CSS classes
    messageDiv.style.padding = '12px 16px';
    messageDiv.style.borderRadius = '18px';
    messageDiv.style.maxWidth = '85%';
    messageDiv.style.fontSize = '0.95rem';
    messageDiv.style.lineHeight = '1.4';
    
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
    
    // Smooth scrolling to latest text blocks
    chatScreen.scrollTo({
        top: chatScreen.scrollHeight,
        behavior: 'smooth'
    });
}

// REST Client for Core AI - Vercel Serverless Connection
async function fetchGeminiResponse(prompt) {
    // Temporary Loading State Placeholder
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = "Core is typing...";
    loadingDiv.style.fontSize = '0.85rem';
    loadingDiv.style.color = 'var(--text-secondary)';
    loadingDiv.style.paddingLeft = '10px';
    messagesContainer.appendChild(loadingDiv);

    try {
        // [यहाँ बदलाव किया गया है] - यह अब सीधे वेंसल के बैकएंड रूट को कॉल करेगा
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);

        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            renderMessage(reply, 'core');
        } else {
            renderMessage("Error: Token verification or Key authentication failed.", 'core');
            console.error("API Error Details:", data);
        }
    } catch (error) {
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);
        renderMessage("Connection error. Ensure Vercel system-environment variables are online.", 'core');
        console.error("Vercel Route Failure:", error);
    }
}

// ==========================================================================
// 4. UI INTERACTIONS (Slider, Modal, Files & Mic)
// ==========================================================================

// Full Screen Navigation Slider Open/Close Actions
menuBtn.addEventListener('click', () => navSlider.classList.add('open'));
closeNavBtn.addEventListener('click', () => navSlider.classList.remove('open'));

// Developer Detail Modal System
settingsBtn.addEventListener('click', () => infoModal.classList.add('open'));
closeModalBtn.addEventListener('click', () => infoModal.classList.remove('open'));
infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.remove('open');
});

// File Share Upload Feature (+) Trigger
shareFilesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        alert(`${fileInput.files.length} Files Selected for upload to Core AI.`);
    }
});

// Microphone Voice Trigger Action Placeholder
micBtn.addEventListener('click', () => {
    micBtn.style.color = 'var(--accent-color)';
    alert("Microphone integration ready. Listening state triggered...");
    setTimeout(() => { micBtn.style.color = 'var(--text-secondary)'; }, 2000);
});

// ==========================================================================
// 5. SMART MULTI-THEME SWITCHING CONTROLLER
// ==========================================================================
themeButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Toggle Active Class Highlights
        document.querySelector('.theme-btn.active').classList.remove('active');
        button.classList.add('active');

        // Extract and swap themes dynamically from HTML configurations
        const targetTheme = button.getAttribute('data-theme');
        
        // Clear old modes safely
        document.body.classList.remove('dark-mode', 'glass-mode', 'neon-mode', 'cyber-mode');
        
        // Inject newly activated styling matrix
        if (targetTheme === 'dark') document.body.classList.add('dark-mode');
        if (targetTheme === 'glass') document.body.classList.add('glass-mode');
        if (targetTheme === 'neon') document.body.classList.add('neon-mode');
        if (targetTheme === 'cyber') document.body.classList.add('cyber-mode');
    });
});
        
