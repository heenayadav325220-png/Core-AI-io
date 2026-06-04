// ==========================================================================
// 1. CONFIGURATION & CORE AI APIS (Vercel Route Sync)
// ==========================================================================
const CONFIG = {
    modelName: "Gemini 1.5 Flash"
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
// 3. CORE CHAT LOGIC & GEMINI INTEGRATION
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
        
        // 1. Logo Starts to Shine/Glow
        coreLogo.classList.add('shine');
        
        setTimeout(() => {
            // 2. Logo disappears smoothly, Messages area reveals
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
    
    chatScreen.scrollTo({
        top: chatScreen.scrollHeight,
        behavior: 'smooth'
    });
}

// 🛠️ [यहाँ सुधारा गया है] - यह आपके Vercel /api/chat सर्वरलेस फ़ंक्शन से कनेक्ट होगा
async function fetchGeminiResponse(prompt) {
    const loadingDiv = document.createElement('div');
    loadingDiv.innerText = "Core is typing...";
    loadingDiv.style.fontSize = '0.85rem';
    loadingDiv.style.color = 'var(--text-secondary)';
    loadingDiv.style.paddingLeft = '10px';
    messagesContainer.appendChild(loadingDiv);
    chatScreen.scrollTo({ top: chatScreen.scrollHeight, behavior: 'smooth' });

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: prompt })
        });

        const data = await response.json();
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);

        // गूगल जेमिनी के सही डेटा स्ट्रक्चर को रीड करना
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const reply = data.candidates[0].content.parts[0].text;
            renderMessage(reply, 'core');
        } else {
            renderMessage("Error: Authentication Failed. Check if GEMINI_KEY is set properly in Vercel rohit", 'core');
            console.error("Vercel Response Log:", data);
        }
    } catch (error) {
        if (loadingDiv.parentNode) messagesContainer.removeChild(loadingDiv);
        renderMessage("Connection error. Vercel backend function is unreachable.", 'core');
        console.error("Fetch Error:", error);
    }
}

// ==========================================================================
// 4. UI INTERACTIONS
// ==========================================================================
menuBtn.addEventListener('click', () => navSlider.classList.add('open'));
closeNavBtn.addEventListener('click', () => navSlider.classList.remove('open'));

settingsBtn.addEventListener('click', () => infoModal.classList.add('open'));
closeModalBtn.addEventListener('click', () => infoModal.classList.remove('open'));
infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) infoModal.classList.remove('open');
});

shareFilesBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        alert(`${fileInput.files.length} Files Selected for upload to Core AI.`);
    }
});

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
        document.querySelector('.theme-btn.active').classList.remove('active');
        button.classList.add('active');

        const targetTheme = button.getAttribute('data-theme');
        document.body.classList.remove('dark-mode', 'glass-mode', 'neon-mode', 'cyber-mode');
        
        if (targetTheme === 'dark') document.body.classList.add('dark-mode');
        if (targetTheme === 'glass') document.body.classList.add('glass-mode');
        if (targetTheme === 'neon') document.body.classList.add('neon-mode');
        if (targetTheme === 'cyber') document.body.classList.add('cyber-mode');
    });
});
