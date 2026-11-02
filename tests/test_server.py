import os
import http.server
import socketserver
import threading
import urllib.request
import sys
import time

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

PORT = 8765

def run_server():
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.serve_forever()

# Start server in thread
t = threading.Thread(target=run_server, daemon=True)
t.start()
time.sleep(1)

endpoints = [
    "",
    "index.html",
    "css/main.css",
    "css/components.css",
    "css/math.css",
    "js/questions.js",
    "js/storage.js",
    "js/app.js"
]

print(f"Testing local HTTP server at http://127.0.0.1:{PORT}/...")
for ep in endpoints:
    url = f"http://127.0.0.1:{PORT}/{ep}"
    req = urllib.request.urlopen(url)
    status = req.getcode()
    content_len = len(req.read())
    assert status == 200, f"Failed: {url} returned {status}"
    print(f"✓ GET /{ep:<20} -> HTTP 200 OK ({content_len} bytes)")

print("\n🎉 ALL ASSETS SERVED VIA HTTP WITH STATUS 200 OK!")
