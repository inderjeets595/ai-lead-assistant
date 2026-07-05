# AI Lead Assistant — Multilingual Chatbot & Admin Comparison Dashboard

A professional, enterprise-grade AI Lead Assistant built with **Flask**, **Groq LLM (LLaMA 3.3)**, **SQLAlchemy**, and **Chart.js**. It collects customer leads via dynamic conversational flows in multiple languages (English, Punjabi, Dual), performs automated sentiment analysis and lead scoring (Hot/Warm/Cold), sends real-time WhatsApp alerts via Twilio, and provides a full Admin Analytics & Comparison Dashboard suite.

---

## 🚀 Key Features

- 💬 **Multilingual Conversational Chatbot**: Supports English, Punjabi (Gurmukhi script), and Dual-language mode with automatic translation using `deep-translator`.
- 🔥 **Automated Lead Scoring & Sentiment Analysis**: Evaluates customer requirements to classify leads into **Hot**, **Warm**, and **Cold** tiers with sentiment detection.
- 📲 **Real-time WhatsApp Alerts**: Direct WhatsApp notification triggers via Twilio API when high-value leads are captured.
- 📊 **AI Analytics Dashboard**: High-level visual statistics on sentiment distribution, daily lead trends, confidence score histograms, and system health metrics.
- ⚖️ **Performance Comparison Dashboard**: Standalone admin module to visually compare performance between the **Existing Approach** and **Proposed Approach**.
- 🛠️ **Decoupled & Modular Design**: Comparison dashboard files are completely isolated for easy toggling, modification, or removal.

---

## ⚖️ Performance Comparison Dashboard

The **Comparison Dashboard** (`/comparison`) allows administrators to evaluate and benchmark system performance across 5 core lead analytics metrics.

### 🎛️ Functional Highlights
1. **Interactive Toggle Buttons**:
   - **Existing Approach** (Default) vs. **Proposed Approach** (+2.0% to 3.5% improvement demonstration).
   - Switching toggles dynamically animates KPI card values without full page reloads.
2. **5 Key Performance Indicator (KPI) Cards**:
   - **Efficiency** (Doughnut Chart)
   - **Accuracy** (Vertical Bar Chart)
   - **Processing Speed** (Line Chart)
   - **Customer Satisfaction** (Grouped Horizontal Bar Chart)
   - **Cost Efficiency** (Horizontal Bar Chart)
3. **Chart.js Visualizations**:
   - Separate interactive charts rendered side-by-side with grouped datasets and legends.
   - Automatic cleanup of Chart.js instances to prevent duplicate rendering on re-plots.

---

## 🧮 Metric Calculation Logic

All **Existing Approach** metrics start at a baseline of **60.0%** to guarantee realistic presentation, and react **dynamically to real-time database changes** (lead additions, edits, and deletions):

| Metric | Calculation Formula | Description |
| :--- | :--- | :--- |
| **Efficiency** | `60.0% + [ (Hot Leads × 28 + Warm Leads × 12) / Total Leads ]` | Conversion ratio weighted by high-priority leads. |
| **Accuracy** | `60.0% + ( Internal AI Consistency % × 0.35 )` | Evaluates classification agreement between lead scores & saved statuses. |
| **Processing Speed** | `60.0% + ( Average Lead Score × 0.32 )` | Derived from the average confidence score across all recorded inquiries. |
| **Customer Satisfaction** | `60.0% + [ (Positive Leads × 28 + Neutral Leads × 10) / Total Leads ]` | Weighted ratio of positive & neutral sentiment customer interactions. |
| **Cost Efficiency** | `60.0% + [ (Hot Leads × 24 + Warm Leads × 14) / Total Leads ]` | Density ratio of actionable inquiries vs. cold leads. |

> **Proposed Approach**: Calculated as `Existing Metric Value + Improvement Factor (2.0% – 3.5%)` for enterprise demonstration.

---

## 📁 Project Structure

```
ai-lead-assistant/
├── app.py                      # Main Flask application & routes (/admin, /dashboard, /comparison)
├── accuracy.py                 # Standalone internal AI accuracy analytics module
├── templates/
│   ├── base.html               # Main admin app shell, sidebar navigation & theme switcher
│   ├── admin.html              # Leads management table with search, filter & modals
│   ├── dashboard.html          # High-level AI analytics dashboard
│   ├── comparison.html         # Comparison Dashboard template (Existing vs Proposed)
│   ├── index.html              # Customer-facing AI Chatbot interface
│   └── login.html              # Admin login page
├── static/
│   ├── css/
│   │   ├── common.css          # Shared CSS reset, color tokens & keyframe animations
│   │   ├── base.css            # Sidebar layout, topbar & theme styling
│   │   ├── admin.css           # Leads table & modal styles
│   │   ├── dashboard.css       # Analytics metric cards & chart styling
│   │   └── comparison.css      # Comparison dashboard toggle, KPI grid & chart cards
│   └── js/
│       ├── chat.js             # Customer chatbot frontend logic
│       └── comparison.js       # Standalone comparison toggle, KPI animation & Chart.js logic
└── README.md                   # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.9+
- MySQL Server (or SQLite fallback)

### 2. Install Dependencies
```bash
pip install flask flask-sqlalchemy pymysql groq twilio textblob deep-translator python-dotenv
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
FLASK_SECRET_KEY=admin123
DATABASE_URL=mysql+pymysql://root:@localhost/chatbot_db
GROQ_API_KEY=your_groq_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Run the Application
```bash
python app.py
```

Open your browser and navigate to:
- **Chatbot Interface**: `http://127.0.0.1:5000/`
- **Admin Panel**: `http://127.0.0.1:5000/admin`
- **Analytics Dashboard**: `http://127.0.0.1:5000/dashboard`
- **Comparison Dashboard**: `http://127.0.0.1:5000/comparison`

---

## 🔒 Disabling/Enabling the Comparison Module
To temporarily disable or hide the Comparison Dashboard functionality:
1. Comment out or remove `@app.route("/comparison")` in `app.py`.
2. Remove or hide the `<a href="/comparison">` link in `templates/base.html`.
