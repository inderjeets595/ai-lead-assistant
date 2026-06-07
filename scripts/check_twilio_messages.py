from dotenv import load_dotenv
import os
from twilio.rest import Client

load_dotenv()

sid = os.getenv("TWILIO_ACCOUNT_SID")
token = os.getenv("TWILIO_AUTH_TOKEN")
to_num = os.getenv("NOTIFY_WHATSAPP_TO")

print("Checking messages to:", to_num)

try:
    client = Client(sid, token)
    msgs = client.messages.list(to=to_num, limit=20)
    if not msgs:
        print("No recent messages to this number found.")
    for m in msgs:
        print("SID:", m.sid, "DateSent:", getattr(m, 'date_sent', None), "Status:", getattr(m, 'status', None), "Direction:", getattr(m, 'direction', None), "Err:", getattr(m, 'error_code', None))
        print("Body:", (m.body[:200] + '...') if m.body else None)
        print('---')
except Exception as e:
    print("Error listing messages:", e)
