"""本地预览服务器：和 python3 -m http.server 一样，但让浏览器每次都重新取文件，
改完照片、数据或样式后刷新一下就能看到，不会被旧缓存挡住。

用法:  python3 tools/serve.py [端口，默认 8765]
"""
import functools, http.server, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
handler = functools.partial(NoCacheHandler, directory=ROOT)
with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
    print("Serving %s at http://localhost:%d" % (ROOT, port))
    httpd.serve_forever()
