"""Serve only on this computer, using a stable origin for review saves."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser

root = Path(__file__).resolve().parent
address = ("127.0.0.1", 8765)
try:
    server = ThreadingHTTPServer(address, partial(SimpleHTTPRequestHandler, directory=str(root)))
except OSError as error:
    raise SystemExit(f"Cannot start the local preview on port 8765: {error}. Close the existing preview server before retrying.")
url = "http://127.0.0.1:8765/OPEN_PHASES.html"
print(f"Local review: {url}\nPress Control-C to stop. This is not a submission server.")
webbrowser.open(url)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
