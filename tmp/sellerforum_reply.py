import os
import time
from notte_sdk import NotteClient

NOTTE_API_KEY = os.getenv("NOTTE_API_KEY")
if not NOTTE_API_KEY:
    print("ERROR: NOTTE_API_KEY not set")
    exit(1)

notte = NotteClient(api_key=NOTTE_API_KEY)

message = """Für die DATEV-Anbindung nutzen wir konverter-pro.de zur Konvertierung – PDF-Kontoauszüge (auch von Wise, Revolut, Bunq) werden automatisch in MT940 umgewandelt. KI-basiert, keine feste Bankliste, funktioniert also auch für Neobanken die DATEV nicht nativ unterstützt."""

task = f"""
1. Navigate to https://www.sellerforum.de/login/
2. Login as username: MadMaxInDaHaus, password: nv5RuuW5VyAspy8
3. After login, go to https://www.sellerforum.de/forum/thread/64219/?action=reply
4. In the reply form, enter the following exact text into the message box: {message}
5. Submit the reply (look for submit/post button).
6. Confirm the post was successful by checking for success message or redirected to thread.
7. Take a screenshot of the confirmation or new post.
8. Output the screenshot URL or base64 if possible, and "SUCCESS" or "FAILURE: reason".
"""

print("Starting Notte session...")

with notte.Session(headless=True, open_viewer=False) as session:
    agent = notte.Agent(session=session)
    result = agent.run(task=task, url="https://www.sellerforum.de/login/")
    print("Agent result:", result)
    print("SUCCESS" if "success" in result.lower() else "FAILED")
