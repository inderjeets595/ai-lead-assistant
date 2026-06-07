from dotenv import load_dotenv
import os
from twilio.rest import Client

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")

print("TWILIO_ACCOUNT_SID:", sid[:8] + '...' if sid else None)

try:
    client = Client(sid, token)
    acct = client.api.accounts(sid).fetch()
    print("Account SID:", acct.sid)
    print("Account Friendly Name:", getattr(acct, 'friendly_name', None))
    print("Account Status:", getattr(acct, 'status', None))
    msgs = client.messages.list(limit=1)
    print("Messages list fetched, count:", len(msgs))
except Exception as e:
    print("Twilio check error:", e)
