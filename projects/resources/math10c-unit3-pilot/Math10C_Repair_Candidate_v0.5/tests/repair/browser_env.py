from pathlib import Path
import http.server,threading
ROOT=Path(__file__).resolve().parents[2]
class Server:
 def __enter__(self):
  root=ROOT
  class Handler(http.server.SimpleHTTPRequestHandler):
   def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
   def log_message(self,*a):pass
   def do_GET(self):
    if self.path.startswith('/managed') or self.path.startswith('/baseline-managed'):
     h=(root/'workspace/index.html').read_text();which='base' if self.path.startswith('/baseline-managed') else 'proposed'
     h=h.replace('<head>','<head><base href="/workspace/">',1)
     at=h.index('<script')
     h=h[:at]+'<script src="/tests/repair/lms_harness.js"></script><script src="/tests/repair/runtime/bridge-'+which+'.js"></script>'+h[at:]
     self.send_response(200);self.send_header('Content-Type','text/html; charset=utf-8');self.end_headers();self.wfile.write(h.encode());return
    super().do_GET()
  self.http=http.server.ThreadingHTTPServer(('127.0.0.1',0),Handler);self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start();self.url=f'http://127.0.0.1:{self.http.server_port}';return self
 def __exit__(self,*a):self.http.shutdown();self.http.server_close()
