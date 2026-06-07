from deep_translator import GoogleTranslator
from twilio.rest import Client
from textblob import TextBlob
from flask import Flask, render_template, request, jsonify, redirect, session, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func
from groq import Groq
from datetime import datetime
import os
import json
import csv
import io
from dotenv import load_dotenv
from accuracy import compute_accuracy_metrics

# Load environment variables from .env
load_dotenv()

# =========================================================
# FLASK APPLICATION
# =========================================================

app = Flask(__name__)

# App configuration from environment
app.secret_key = os.getenv("FLASK_SECRET_KEY", "admin123")

# =========================================================
# DATABASE CONFIGURATION
# =========================================================

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:@localhost/chatbot_db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)

# =========================================================
# TWILIO CONFIGURATION
# =========================================================
load_dotenv()

account_sid = os.getenv("TWILIO_ACCOUNT_SID")
auth_token = os.getenv("TWILIO_AUTH_TOKEN")

client_twilio = Client(
    account_sid,
    auth_token
)

# =========================================================
# GROQ API CONFIGURATION
# =========================================================

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# =========================================================
# GLOBAL USER DATA
# =========================================================

user_data = {}

# =========================================================
# DATABASE MODEL
# =========================================================

class Lead(db.Model):

    __tablename__ = "leads"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100)
    )

    phone = db.Column(
        db.String(20)
    )

    email = db.Column(
        db.String(100)
    )

    requirement = db.Column(
        db.Text
    )

    translated_requirement = db.Column(
        db.Text
    )

    sentiment = db.Column(
        db.String(50)
    )

    score = db.Column(
        db.Integer
    )

    status = db.Column(
        db.String(50)
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)


# =========================================================
# CREATE TABLES
# =========================================================

with app.app_context():

    db.create_all()

# =========================================================
# AI RESPONSE FUNCTION
# =========================================================

def groq_reply(user_message):

    try:

        chat_completion = client.chat.completions.create(

            messages=[

                {
                    "role": "system",
                    "content": """
You are a professional Punjabi AI business assistant.

Your responsibilities:
1. Help customers professionally.
2. Reply in simple Punjabi.
3. Suggest business services.
4. Behave politely.
5. Keep replies short and smart.
"""
                },

                {
                    "role": "user",
                    "content": user_message
                }

            ],

            model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        )

        reply = chat_completion.choices[0].message.content

        return reply

    except Exception as e:

        print("Groq Error:", e)

        return "ਮਾਫ ਕਰਨਾ, AI ਇਸ ਸਮੇਂ ਉਪਲਬਧ ਨਹੀਂ ਹੈ।"

# =========================================================
# TRANSLATION FUNCTION
# =========================================================

def translate_to_punjabi(text):

    try:

        translated = GoogleTranslator(
            source='auto',
            target='pa'
        ).translate(text)

        return translated

    except Exception as e:

        print("Translation Error:", e)

        return text

# =========================================================
# SENTIMENT ANALYSIS
# =========================================================

def analyze_sentiment_old(text):

    analysis = TextBlob(text)

    polarity = analysis.sentiment.polarity

    if polarity > 0:

        return "Positive"

    elif polarity < 0:

        return "Negative"

    else:

        return "Neutral"


def analyze_sentiment(score):

    status = get_lead_status(score)

    if status == "Cold Lead":

        return "Negative"

    elif status == "Hot Lead":

        return "Positive"

    else:

        return "Neutral"

# =========================================================
# LEAD SCORE FUNCTION
# =========================================================

def calculate_lead_score(message):

    score = 0

    if not isinstance(message, str):
        message = ""
    else:
        message = message.lower()

    hot_keywords = [

        "urgent",
        "buy",
        "purchase",
        "developer",
        "interested",
        "price",
        "demo",
        "website",
        "software",
        "marketing",
        "seo",
        "app",
        "mobile app"

    ]

    warm_keywords = [

        "details",
        "information",
        "know more",
        "services",
        "help",
        "business"

    ]

    cold_keywords = [

        "hello",
        "hi",
        "thanks",
        "okay"

    ]

    for word in hot_keywords:

        if word in message:

            score += 30

    for word in warm_keywords:

        if word in message:

            score += 15

    for word in cold_keywords:

        if word in message:

            score += 5

    return score

# =========================================================
# LEAD STATUS
# =========================================================
# =========================================================

def get_lead_status(score):

    try:
        if score is None:
            return "Cold Lead"

        score = int(score)
    except (TypeError, ValueError):
        return "Cold Lead"

    if score >= 70:

        return "Hot Lead"

    elif score >= 30:

        return "Warm Lead"

    else:

        return "Cold Lead"

# =========================================================
# HOME PAGE
# =========================================================

@app.route("/")
def home():

    return render_template("index.html")

# =========================================================
# LOGIN PAGE
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        username = request.form.get("username")

        password = request.form.get("password")

        admin_user = os.getenv("ADMIN_USERNAME", "admin")
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin123")

        if username == admin_user and password == admin_pass:
            session["admin"] = True
            return redirect("/admin")

    return render_template("login.html")

# =========================================================
# ADMIN DASHBOARD
# =========================================================

@app.route("/admin")
def admin():

    if not session.get("admin"):

        return redirect("/login")

    leads = Lead.query.order_by(
        Lead.id.desc()
    ).all()

    total_leads = Lead.query.count()

    hot_leads = Lead.query.filter_by(
        status="Hot Lead"
    ).count()

    warm_leads = Lead.query.filter_by(
        status="Warm Lead"
    ).count()

    cold_leads = Lead.query.filter_by(
        status="Cold Lead"
    ).count()

    positive_sentiment = Lead.query.filter_by(
        sentiment="Positive"
    ).count()

    negative_sentiment = Lead.query.filter_by(
        sentiment="Negative"
    ).count()

    neutral_sentiment = Lead.query.filter_by(
        sentiment="Neutral"
    ).count()

    return render_template(

        "admin.html",

        leads=leads,

        total_leads=total_leads,

        hot_leads=hot_leads,

        warm_leads=warm_leads,

        cold_leads=cold_leads,

        positive_sentiment=positive_sentiment,

        negative_sentiment=negative_sentiment,

        neutral_sentiment=neutral_sentiment

    )

# =========================================================
# SEARCH LEADS
# =========================================================

@app.route("/search")
def search():

    if not session.get("admin"):

        return redirect("/login")

    keyword = request.args.get("keyword")

    leads = Lead.query.filter(

        Lead.name.contains(keyword) |

        Lead.email.contains(keyword) |

        Lead.requirement.contains(keyword)

    ).all()

    return render_template(
        "admin.html",
        leads=leads
    )

# =========================================================
# AI ANALYTICS DASHBOARD
# =========================================================

@app.route("/dashboard")
def dashboard():

    if not session.get("admin"):
        return redirect("/login")

    total_leads = Lead.query.count()

    if total_leads == 0:
        return render_template("dashboard.html", empty=True)

    # Sentiment Distribution
    sentiment_counts = {
        "Positive": Lead.query.filter_by(sentiment="Positive").count(),
        "Neutral": Lead.query.filter_by(sentiment="Neutral").count(),
        "Negative": Lead.query.filter_by(sentiment="Negative").count()
    }

    # Lead Status Distribution
    status_counts = {
        "Hot": Lead.query.filter_by(status="Hot Lead").count(),
        "Warm": Lead.query.filter_by(status="Warm Lead").count(),
        "Cold": Lead.query.filter_by(status="Cold Lead").count()
    }

    # AI Confidence Score Analytics
    avg_score = db.session.query(func.avg(Lead.score)).scalar() or 0
    max_score = db.session.query(func.max(Lead.score)).scalar() or 0
    min_score = db.session.query(func.min(Lead.score)).scalar() or 0

    # Confidence Score Distribution
    score_dist = {
        "0-20": Lead.query.filter(Lead.score <= 20).count(),
        "21-40": Lead.query.filter(Lead.score > 20, Lead.score <= 40).count(),
        "41-60": Lead.query.filter(Lead.score > 40, Lead.score <= 60).count(),
        "61-80": Lead.query.filter(Lead.score > 60, Lead.score <= 80).count(),
        "81-100": Lead.query.filter(Lead.score > 80).count(),
    }

    # Lead Generation Trends (Daily)
    # Group by date
    daily_trends = db.session.query(
        func.date(Lead.created_at).label('date'),
        func.count(Lead.id).label('count')
    ).group_by(func.date(Lead.created_at)).order_by(func.date(Lead.created_at)).all()

    daily_labels = [str(d.date) for d in daily_trends]
    daily_values = [d.count for d in daily_trends]

    # Multilingual Processing Analytics
    # In this app, translation is always performed for Punjabi.
    # We'll count leads where translated_requirement exists.
    translated_leads = Lead.query.filter(Lead.translated_requirement.isnot(None)).count()
    non_translated_leads = total_leads - translated_leads

    # Overall AI Performance Score (derived from avg confidence score)
    performance_score = round(avg_score, 1)

    # AI Accuracy Analytics — isolated module (see accuracy.py)
    accuracy_data = compute_accuracy_metrics(db, Lead)

    return render_template(

        "dashboard.html",

        total_leads=total_leads,

        sentiment_counts=sentiment_counts,

        status_counts=status_counts,

        avg_score=round(avg_score, 2),

        max_score=max_score,

        min_score=min_score,

        score_dist=score_dist,

        daily_labels=daily_labels,

        daily_values=daily_values,

        translated_leads=translated_leads,

        non_translated_leads=non_translated_leads,

        performance_score=performance_score,

        accuracy_data=accuracy_data

    )

# =========================================================
# DELETE LEAD
# =========================================================

@app.route("/edit/<int:id>", methods=["POST"])
def edit_lead(id):

    if not session.get("admin"):

        return redirect("/login")

    lead = Lead.query.get(id)

    if lead:

        lead.name = request.form.get("name")

        lead.phone = request.form.get("phone")

        lead.email = request.form.get("email")

        lead.requirement = request.form.get("requirement")

        lead.translated_requirement = translate_to_punjabi(
            lead.requirement
        )

        lead.score = calculate_lead_score(
            lead.requirement
        )

        lead.sentiment = analyze_sentiment(
            lead.score
        )

        lead.status = get_lead_status(
            lead.score
        )

        db.session.commit()

    return redirect("/admin")


@app.route("/delete/<int:id>")
def delete_lead(id):

    if not session.get("admin"):

        return redirect("/login")

    lead = Lead.query.get(id)

    if lead:

        db.session.delete(lead)

        db.session.commit()

    return redirect("/admin")

# =========================================================
# LOGOUT
# =========================================================

@app.route("/logout")
def logout():

    session.pop("admin", None)

    return redirect("/login")

# =========================================================
# SAVE LEAD FUNCTION
# =========================================================

def save_lead(data):

    translated_requirement = translate_to_punjabi(
        data["requirement"]
    )

    score = calculate_lead_score(
        data["requirement"]
    )

    sentiment = analyze_sentiment(score)

    status = get_lead_status(score)

    new_lead = Lead(

        name=data["name"],

        phone=data["phone"],

        email=data["email"],

        requirement=data["requirement"],

        translated_requirement=translated_requirement,

        sentiment=sentiment,

        score=score,

        status=status

    )

    db.session.add(new_lead)

    db.session.commit()

    return sentiment, score, status

# =========================================================
# SEND WHATSAPP ALERT
# =========================================================

def send_whatsapp_alert(data, status):

    try:

        from_number = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")
        to_number = os.getenv("NOTIFY_WHATSAPP_TO")

        client_twilio.messages.create(

            from_=from_number,

            body=f"""

New Lead Received

Name: {data['name']}

Phone: {data['phone']}

Email: {data['email']}

Requirement: {data['requirement']}

Lead Status: {status}

""",

            to=to_number

        )

    except Exception as e:

        print("Twilio Error:", e)

        # Handle WhatsApp "outside messaging window" error (63016)
        err_text = str(e)
        if "63016" in err_text:

            template_sid = os.getenv("TWILIO_WHATSAPP_TEMPLATE_SID")

            if template_sid and to_number:

                try:
                    client_twilio.messages.create(
                        from_=from_number,
                        to=to_number,
                        content_sid=template_sid,
                        content_variables=json.dumps({
                            "name": data.get("name"),
                            "phone": data.get("phone"),
                            "email": data.get("email"),
                            "requirement": data.get("requirement"),
                            "status": status
                        })
                    )
                    print("Sent WhatsApp template fallback (ContentSid)")
                except Exception as e2:
                    print("Template send error:", e2)
            else:
                print("No TWILIO_WHATSAPP_TEMPLATE_SID configured for template fallback.")

# =========================================================
# CHATBOT API
# =========================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    global user_data

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "reply": "No data received"
            })

        user_message = data.get("message", "").strip()

        # START CHAT
        if "step" not in user_data:

            user_data["step"] = "name"

            return jsonify({
                "reply": "AI Business Chatbot<br><br>ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?"
            })

        # NAME
        elif user_data["step"] == "name":

            user_data["name"] = user_message
            user_data["step"] = "phone"

            return jsonify({
                "reply": "ਆਪਣਾ ਫੋਨ ਨੰਬਰ ਦਰਜ ਕਰੋ"
            })

        # PHONE
        elif user_data["step"] == "phone":

            user_data["phone"] = user_message
            user_data["step"] = "email"

            return jsonify({
                "reply": "ਆਪਣਾ ਈਮੇਲ ਦਰਜ ਕਰੋ"
            })

        # EMAIL
        elif user_data["step"] == "email":

            user_data["email"] = user_message
            user_data["step"] = "requirement"

            return jsonify({
                "reply": "ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਸੇਵਾ ਚਾਹੀਦੀ ਹੈ?"
            })

        # REQUIREMENT
        elif user_data["step"] == "requirement":

            user_data["requirement"] = user_message

            sentiment, score, status = save_lead(user_data)

            send_whatsapp_alert(
                user_data,
                status
            )

            ai_reply = groq_reply(user_message)

            punjabi_reply = translate_to_punjabi(
                ai_reply
            )

            summary = f"""
Lead Saved Successfully

Name: {user_data['name']}
Phone: {user_data['phone']}
Email: {user_data['email']}
Requirement: {user_data['requirement']}

Sentiment: {sentiment}
Lead Score: {score}
Lead Status: {status}

AI Reply:
{punjabi_reply}
"""

            user_data["step"] = "chat"

            return jsonify({
                "reply": summary
            })

        # CONTINUOUS AI CHAT
        elif user_data["step"] == "chat":

            ai_reply = groq_reply(user_message)

            punjabi_reply = translate_to_punjabi(
                ai_reply
            )

            return jsonify({
                "reply": punjabi_reply
            })

        # FALLBACK
        return jsonify({
            "reply": "Something went wrong. Please restart chat."
        })

    except Exception as e:

        print("Chat Error:", e)

        return jsonify({
            "reply": f"Error: {str(e)}"
        })

# =========================================================
# CONTACT FORM
# =========================================================

@app.route("/contact", methods=["POST"])
def contact():

    name = request.form.get("name")

    email = request.form.get("email")

    phone = request.form.get("phone")

    requirement = request.form.get("message")

    lead_data = {

        "name": name,

        "email": email,

        "phone": phone,

        "requirement": requirement

    }

    sentiment, score, status = save_lead(
        lead_data
    )

    send_whatsapp_alert(
        lead_data,
        status
    )

    return redirect("/admin")

# =========================================================
# API FOR TOTAL LEADS
# =========================================================

@app.route("/api/total-leads")
def total_leads_api():

    total = Lead.query.count()

    return jsonify({

        "total_leads": total

    })

# =========================================================
# API FOR HOT LEADS
# =========================================================

@app.route("/api/hot-leads")
def hot_leads_api():

    total = Lead.query.filter_by(
        status="Hot Lead"
    ).count()

    return jsonify({

        "hot_leads": total

    })

# =========================================================
# API FOR WARM LEADS
# =========================================================

@app.route("/api/warm-leads")
def warm_leads_api():

    total = Lead.query.filter_by(
        status="Warm Lead"
    ).count()

    return jsonify({

        "warm_leads": total

    })

# =========================================================
# API FOR COLD LEADS
# =========================================================

@app.route("/api/cold-leads")
def cold_leads_api():

    total = Lead.query.filter_by(
        status="Cold Lead"
    ).count()

    return jsonify({

        "cold_leads": total

    })

# =========================================================
# EXPORT LEADS
# =========================================================

@app.route("/export")
def export():

    if not session.get("admin"):
        return redirect("/login")

    leads = Lead.query.order_by(Lead.id.asc()).all()

    # Build CSV in-memory
    output = io.StringIO()
    writer = csv.writer(output)

    # Header row
    writer.writerow([
        "ID", "Name", "Phone", "Email",
        "Requirement", "Translated Requirement",
        "Sentiment", "Score", "Status", "Created At"
    ])

    # Data rows
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.phone,
            lead.email,
            lead.requirement,
            lead.translated_requirement,
            lead.sentiment,
            lead.score,
            lead.status,
            lead.created_at.strftime("%Y-%m-%d %H:%M:%S") if lead.created_at else ""
        ])

    csv_content = output.getvalue()
    output.close()

    filename = f"leads_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return Response(
        csv_content,
        mimetype="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Content-Type": "text/csv; charset=utf-8"
        }
    )

# =========================================================
# RESET CHAT
# =========================================================

@app.route("/reset-chat")
def reset_chat():

    global user_data

    user_data = {}

    return jsonify({

        "message": "Chat Reset Successfully"

    })

# =========================================================
# ERROR HANDLER
# =========================================================

@app.errorhandler(404)
def not_found(error):

    return render_template(
        "404.html"
    ), 404

# =========================================================
# SERVER STATUS
# =========================================================

@app.route("/status")
def status():

    return jsonify({

        "status": "running",

        "message": "AI Chatbot Server Running"

    })

# =========================================================
# RUN SERVER
# =========================================================
if __name__ == "__main__":

    app.run(
        debug=True,
        host="0.0.0.0",
        port=5000
    )
