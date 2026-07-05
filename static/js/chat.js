document.addEventListener("DOMContentLoaded", () => {
    const themeToggle = document.getElementById("theme-toggle");
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem("theme") || "dark-mode";
    body.className = savedTheme;
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
        if (body.classList.contains("light-mode")) {
            body.classList.replace("light-mode", "dark-mode");
            localStorage.setItem("theme", "dark-mode");
            updateThemeIcon("dark-mode");
        } else {
            body.classList.replace("dark-mode", "light-mode");
            localStorage.setItem("theme", "light-mode");
            updateThemeIcon("light-mode");
        }
    });

    // Enhanced Enter key support
    document.getElementById("msg").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            if (e.shiftKey) {
                return;
            }
            e.preventDefault();
            sendMessage();
        }
    });

    document.getElementById("msg").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Initialize language selector buttons
    initLanguageSelector();

    // Update placeholder based on saved language
    updatePlaceholder();
});

// =========================================================
// LANGUAGE CONFIGURATION
// =========================================================

const LANG_STRINGS = {
    en: {
        placeholder: "Type your message or business inquiry...",
        disclaimer: "AI can make mistakes. Please verify important information.",
        welcomeTitle: "Business Project Assistant",
        welcomeSubtitle: "Your intelligent lead qualification & customer support partner",
        features: [
            "Answer customer queries instantly",
            "Collect lead information efficiently",
            "Generate qualified leads automatically",
            "Connect customers with your team"
        ],
        welcomePrompt: "How can I assist you today?",
        errorMessage: "Sorry, something went wrong. Please try again.",
        selectLanguage: "Select Language",
    },
    pa: {
        placeholder: "ਆਪਣਾ ਸੁਨੇਹਾ ਜਾਂ ਕਾਰੋਬਾਰੀ ਪੁੱਛਗਿੱਛ ਟਾਈਪ ਕਰੋ...",
        disclaimer: "AI ਗਲਤੀਆਂ ਕਰ ਸਕਦਾ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਮਹੱਤਵਪੂਰਨ ਜਾਣਕਾਰੀ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
        welcomeTitle: "ਕਾਰੋਬਾਰੀ ਪ੍ਰੋਜੈਕਟ ਸਹਾਇਕ",
        welcomeSubtitle: "ਤੁਹਾਡਾ ਬੁੱਧੀਮਾਨ ਲੀਡ ਯੋਗਤਾ ਅਤੇ ਗਾਹਕ ਸਹਾਇਤਾ ਸਾਥੀ",
        features: [
            "ਗਾਹਕਾਂ ਦੇ ਸਵਾਲਾਂ ਦੇ ਤੁਰੰਤ ਜਵਾਬ ਦਿਓ",
            "ਲੀਡ ਜਾਣਕਾਰੀ ਕੁਸ਼ਲਤਾ ਨਾਲ ਇਕੱਠੀ ਕਰੋ",
            "ਯੋਗ ਲੀਡਾਂ ਆਪਣੇ ਆਪ ਬਣਾਓ",
            "ਗਾਹਕਾਂ ਨੂੰ ਆਪਣੀ ਟੀਮ ਨਾਲ ਜੋੜੋ"
        ],
        welcomePrompt: "ਅੱਜ ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
        errorMessage: "ਮਾਫ ਕਰਨਾ, ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    },
    both: {
        placeholder: "Type your message... / ਆਪਣਾ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ...",
        disclaimer: "AI can make mistakes. / AI ਗਲਤੀਆਂ ਕਰ ਸਕਦਾ ਹੈ।",
        welcomeTitle: "Business Project Assistant\nਕਾਰੋਬਾਰੀ ਪ੍ਰੋਜੈਕਟ ਸਹਾਇਕ",
        welcomeSubtitle: "Your intelligent lead qualification & customer support partner\nਤੁਹਾਡਾ ਬੁੱਧੀਮਾਨ ਲੀਡ ਯੋਗਤਾ ਅਤੇ ਗਾਹਕ ਸਹਾਇਤਾ ਸਾਥੀ",
        features: [
            "Answer queries instantly / ਤੁਰੰਤ ਜਵਾਬ ਦਿਓ",
            "Collect lead info / ਲੀਡ ਜਾਣਕਾਰੀ ਇਕੱਠੀ ਕਰੋ",
            "Generate leads / ਯੋਗ ਲੀਡਾਂ ਬਣਾਓ",
            "Connect customers / ਗਾਹਕਾਂ ਨੂੰ ਜੋੜੋ"
        ],
        welcomePrompt: "How can I assist you? / ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ?",
        errorMessage: "Something went wrong. / ਕੁਝ ਗਲਤ ਹੋ ਗਿਆ।",
        selectLanguage: "Select Language / ਭਾਸ਼ਾ ਚੁਣੋ",
    }
};

// =========================================================
// LANGUAGE STATE
// =========================================================

function getSelectedLanguage() {
    return localStorage.getItem("chat_language") || "en";
}

function setSelectedLanguage(lang) {
    localStorage.setItem("chat_language", lang);
    updatePlaceholder();
    updateDisclaimerText();
    updateLanguageButtons();
}

function getLangStrings() {
    return LANG_STRINGS[getSelectedLanguage()] || LANG_STRINGS["en"];
}

function updatePlaceholder() {
    const msgInput = document.getElementById("msg");
    if (msgInput) {
        msgInput.placeholder = getLangStrings().placeholder;
    }
}

function updateDisclaimerText() {
    const disclaimer = document.querySelector(".chat-footer small");
    if (disclaimer) {
        disclaimer.textContent = getLangStrings().disclaimer;
    }
}

function updateLanguageButtons() {
    const currentLang = getSelectedLanguage();
    document.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });
}

// =========================================================
// LANGUAGE SELECTOR INITIALIZATION
// =========================================================

function initLanguageSelector() {
    const langSelector = document.getElementById("language-selector");
    if (!langSelector) return;

    const currentLang = getSelectedLanguage();

    langSelector.querySelectorAll(".lang-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.lang === currentLang);

        btn.addEventListener("click", async () => {
            const lang = btn.dataset.lang;
            setSelectedLanguage(lang);

            // Notify backend of language change
            try {
                await fetch("/api/set-language", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        session_id: CHAT_SESSION_ID,
                        language: lang
                    })
                });
            } catch (e) {
                console.error("Language set error:", e);
            }

            // Refresh welcome screen if still visible
            const welcomeScreen = document.getElementById("welcome-screen");
            if (welcomeScreen && welcomeScreen.style.display !== "none") {
                renderWelcomeScreen();
            }
        });
    });
}

// =========================================================
// THEME
// =========================================================

function updateThemeIcon(theme) {
    const icon = document.querySelector("#theme-toggle i");
    if (theme === "dark-mode") {
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }
}

// =========================================================
// SUGGESTED QUESTION
// =========================================================

function suggestQuestion(text) {
    document.getElementById("msg").value = text;
    sendMessage();
}

// =========================================================
// LEAD DATA & SESSION
// =========================================================

let leadData = {
    name: null,
    phone: null,
    email: null,
    requirement: null,
    currentStep: 0
};

// Unique session ID per tab
if (!sessionStorage.getItem("chat_session_id")) {
    sessionStorage.setItem(
        "chat_session_id",
        (typeof crypto !== "undefined" && crypto.randomUUID)
            ? crypto.randomUUID()
            : (Date.now().toString(36) + Math.random().toString(36).slice(2))
    );
}
const CHAT_SESSION_ID = sessionStorage.getItem("chat_session_id");

// =========================================================
// INSTANT CLIENT-SIDE USER INPUT TRANSLATION
// =========================================================

async function formatUserMessageClient(text, lang) {
    if (!text || lang === "en") return text;
    const stripped = text.trim();
    // Don't translate pure phone numbers or email addresses
    if (stripped.replace(/[^0-9]/g, '').length === stripped.length || stripped.includes("@") || (stripped.startsWith("+") && stripped.substring(1).replace(/[^0-9]/g, '').length === stripped.length - 1)) {
        return text;
    }
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=pa&dt=t&q=${encodeURIComponent(stripped)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data[0]) {
            const translated = data[0].map(item => item[0]).join('');
            if (lang === "pa") {
                return translated;
            } else if (lang === "both") {
                return translated !== stripped ? `${stripped}\n\n${translated}` : stripped;
            }
        }
    } catch (e) {
        console.error("Client translation error:", e);
    }
    return text;
}

// =========================================================
// SEND MESSAGE
// =========================================================

async function sendMessage() {
    const msgInput = document.getElementById("msg");
    const msg = msgInput.value.trim();
    const chatBox = document.getElementById("chat-box");
    const welcomeScreen = document.getElementById("welcome-screen");

    if (msg === "") return;

    // Hide welcome screen on first message
    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }

    msgInput.value = "";

    const currentLang = getSelectedLanguage();

    // Instantly format user message based on selected language
    const formattedMsg = await formatUserMessageClient(msg, currentLang);

    // Add user message immediately in selected language
    const userMsgId = appendMessage("user", formattedMsg);

    // Add typing indicator
    const typingId = addTypingIndicator();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: msg,
                session_id: CHAT_SESSION_ID,
                language: currentLang
            })
        });

        const data = await response.json();

        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Update user message content if backend provided a refined formatted version
        if (data.user_message_formatted) {
            updateMessageContent(userMsgId, data.user_message_formatted);
        }

        // Add bot response
        appendMessage("bot", data.reply);

        // Check if lead creation was successful
        if (data.lead_created) {
            showLeadSuccessScreen(data);
        }
    } catch (error) {
        console.error("Error:", error);
        removeTypingIndicator(typingId);
        appendMessage("bot", getLangStrings().errorMessage);
    }
}

// =========================================================
// MESSAGE RENDERING
// =========================================================

function appendMessage(sender, text, customId = null) {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const msgId = customId || (`${sender}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`);
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    messageDiv.id = msgId;

    // Convert newlines to <br> for proper display
    const formattedText = text.replace(/\n/g, "<br>");

    messageDiv.innerHTML = `
        <div class="message-content shadow-sm">
            ${formattedText}
        </div>
        <div class="message-time">${timestamp}</div>
    `;

    chatBox.appendChild(messageDiv);

    setTimeout(() => {
        chatMain.scrollTop = chatMain.scrollHeight;
    }, 0);

    return msgId;
}

function updateMessageContent(msgId, text) {
    const el = document.getElementById(msgId);
    if (el) {
        const contentEl = el.querySelector(".message-content");
        if (contentEl) {
            contentEl.innerHTML = text.replace(/\n/g, "<br>");
        }
    }
}

// =========================================================
// TYPING INDICATOR
// =========================================================

function addTypingIndicator() {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");
    const typingId = "typing-" + Date.now();

    const typingDiv = document.createElement("div");
    typingDiv.className = "message bot-message typing-container";
    typingDiv.id = typingId;

    typingDiv.innerHTML = `
        <div class="message-content shadow-sm">
            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;

    chatBox.appendChild(typingDiv);

    setTimeout(() => {
        chatMain.scrollTop = chatMain.scrollHeight;
    }, 0);

    return typingId;
}

function removeTypingIndicator(id) {
    const indicator = document.getElementById(id);
    if (indicator) {
        indicator.remove();
    }
}

// =========================================================
// WELCOME SCREEN RENDERING
// =========================================================

function renderWelcomeScreen() {
    const chatBox = document.getElementById("chat-box");
    const strings = getLangStrings();

    // Build feature items
    const featureItems = strings.features.map(f => `
        <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span>${f}</span>
        </div>
    `).join("");

    chatBox.innerHTML = `
        <div id="welcome-screen" class="welcome-screen fade-in">
            <div class="welcome-icon">🤖</div>
            <h2 class="welcome-title">${strings.welcomeTitle}</h2>
            <p class="welcome-subtitle">${strings.welcomeSubtitle}</p>

            <div class="feature-list">
                ${featureItems}
            </div>

            <p class="welcome-prompt">${strings.welcomePrompt}</p>
        </div>
    `;
}

// =========================================================
// RESET CHAT
// =========================================================

async function resetChat() {
    try {
        const response = await fetch(`/reset-chat?session_id=${CHAT_SESSION_ID}`);

        if (!response.ok) {
            throw new Error("Failed to reset chat on server");
        }

        const data = await response.json();

        // Reset lead data
        leadData = {
            name: null,
            phone: null,
            email: null,
            requirement: null,
            currentStep: 0
        };

        // Render welcome screen in current language
        renderWelcomeScreen();

        console.log(data.message);
    } catch (error) {
        console.error("Error resetting chat:", error);
    }
}

// =========================================================
// PROGRESS TRACKER
// =========================================================

function showProgressTracker(step, totalSteps) {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");

    const existingTracker = document.getElementById("progress-tracker");
    if (existingTracker) {
        existingTracker.remove();
    }

    const steps = ["Name", "Phone Number", "Email Address", "Requirement"];

    const progressDiv = document.createElement("div");
    progressDiv.id = "progress-tracker";
    progressDiv.className = "progress-tracker";

    let progressHTML = `<div class="progress-title">Step ${step} of ${totalSteps}</div>`;

    steps.forEach((stepName, index) => {
        const isCompleted = index < step - 1;
        const isPending = index === step - 1;
        progressHTML += `
            <div class="progress-item ${isCompleted ? 'completed' : isPending ? 'pending' : ''}">
                ${stepName}
            </div>
        `;
    });

    progressDiv.innerHTML = progressHTML;
    chatBox.appendChild(progressDiv);

    setTimeout(() => {
        chatMain.scrollTop = chatMain.scrollHeight;
    }, 0);
}

// =========================================================
// LEAD SUCCESS SCREEN
// =========================================================

function showLeadSuccessScreen(leadInfo) {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");

    const successDiv = document.createElement("div");
    successDiv.className = "message bot-message";
    successDiv.innerHTML = `
        <div class="success-screen">
            <div class="success-icon">🎉</div>
            <h2 class="success-title">Lead Created Successfully!</h2>
            <p class="success-message">
                Thank you for your interest.<br>
                Our team has received your information and will contact you shortly.
            </p>
            
            <div class="lead-summary">
                <div class="lead-summary-title">Lead Summary</div>
                <div class="lead-item">
                    <span class="lead-label">Name:</span>
                    <span class="lead-value">${leadInfo.name || 'N/A'}</span>
                </div>
                <div class="lead-item">
                    <span class="lead-label">Phone:</span>
                    <span class="lead-value">${leadInfo.phone || 'N/A'}</span>
                </div>
                <div class="lead-item">
                    <span class="lead-label">Email:</span>
                    <span class="lead-value">${leadInfo.email || 'N/A'}</span>
                </div>
                <div class="lead-item">
                    <span class="lead-label">Requirement:</span>
                    <span class="lead-value">${leadInfo.requirement || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;

    chatBox.appendChild(successDiv);

    setTimeout(() => {
        chatMain.scrollTop = chatMain.scrollHeight;
    }, 0);
}
