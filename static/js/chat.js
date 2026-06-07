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
    // Send message on Enter (Shift+Enter for new line)
    document.getElementById("msg").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            // If Shift+Enter, allow new line (browser default behavior)
            if (e.shiftKey) {
                return; // Allow default newline behavior
            }
            // Regular Enter sends the message
            e.preventDefault(); // Prevent default newline
            sendMessage();
        }
    });

    // Also support keydown for better mobile compatibility
    document.getElementById("msg").addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});

function updateThemeIcon(theme) {
    const icon = document.querySelector("#theme-toggle i");
    if (theme === "dark-mode") {
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }
}

function suggestQuestion(text) {
    document.getElementById("msg").value = text;
    sendMessage();
}

// Lead collection state
let leadData = {
    name: null,
    phone: null,
    email: null,
    requirement: null,
    currentStep: 0
};

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

    // Add user message
    appendMessage("user", msg);
    msgInput.value = "";

    // Add typing indicator
    const typingId = addTypingIndicator();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: msg })
        });

        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);

        // Add bot response
        appendMessage("bot", data.reply);

        // Check if lead creation was successful
        if (data.lead_created) {
            showLeadSuccessScreen(data);
        }
    } catch (error) {
        console.error("Error:", error);
        removeTypingIndicator(typingId);
        appendMessage("bot", "Sorry, something went wrong. Please try again.");
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    
    messageDiv.innerHTML = `
        <div class="message-content shadow-sm">
            ${text}
        </div>
        <div class="message-time">${timestamp}</div>
    `;
    
    chatBox.appendChild(messageDiv);
    
    // Scroll to the latest message with a small delay to ensure DOM is updated
    setTimeout(() => {
        chatMain.scrollTop = chatMain.scrollHeight;
    }, 0);
}

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
    
    // Scroll to the typing indicator with a small delay
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

async function resetChat() {
    try {
        const response = await fetch("/reset-chat");
        
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

        // Clear UI
        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML = `
            <div id="welcome-screen" class="welcome-screen fade-in">
                <div class="welcome-icon">🤖</div>
                <h2 class="welcome-title">AI Business Assistant</h2>
                <p class="welcome-subtitle">Your intelligent lead qualification & customer support partner</p>
                
                <div class="feature-list">
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span>Answer customer queries instantly</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span>Collect lead information efficiently</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span>Generate qualified leads automatically</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">✓</span>
                        <span>Connect customers with your team</span>
                    </div>
                </div>
                
                <p class="welcome-prompt">How can I assist you today?</p>
            </div>
        `;

        console.log(data.message);
    } catch (error) {
        console.error("Error resetting chat:", error);
    }
}

function showProgressTracker(step, totalSteps) {
    const chatBox = document.getElementById("chat-box");
    const chatMain = document.querySelector(".chat-main");
    
    // Remove existing progress tracker if any
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
