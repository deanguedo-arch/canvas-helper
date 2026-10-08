"""No-cache local preview for the Science 24 canonical games and audit launcher."""
import argparse,http.server,pathlib
p=argparse.ArgumentParser();p.add_argument('--port',type=int,default=57325);args=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[3]
class Handler(http.server.SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(root),**kw)
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
 def log_message(self,*a):pass
http.server.ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
