"""本地预览服务器：和 python3 -m http.server 一样，但让浏览器每次都重新取文件，
改完照片、数据或样式后刷新一下就能看到，不会被旧缓存挡住。

用法:
  python3 tools/serve.py [端口]          只允许本机访问（默认 8765）
  python3 tools/serve.py [端口] --lan    同一网络里的手机也能访问

--lan 时，定位记录、git 仓库、工具脚本等内部文件一律返回 404，也不列目录。
"""
import functools, http.server, os, socket, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 网站用不到、也不该被别人看到的东西
PRIVATE_NAMES = {"Timeline.json"}
PRIVATE_DIRS = {"tools", "preview"}


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def _is_private(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        parts = [p for p in path.split("/") if p]
        if not parts:
            return False
        return (any(p.startswith(".") for p in parts)  # .git .claude .gitignore 等
                or parts[0] in PRIVATE_DIRS
                or parts[-1] in PRIVATE_NAMES)

    def send_head(self):
        if self._is_private():
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):  # 不列目录
        self.send_error(404)
        return None


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("192.168.0.1", 9))  # 不会真的发包，只用来取本机局域网地址
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


args = [a for a in sys.argv[1:] if not a.startswith("--")]
lan = "--lan" in sys.argv
port = int(args[0]) if args else 8765
host = "0.0.0.0" if lan else "127.0.0.1"
handler = functools.partial(Handler, directory=ROOT)
with http.server.ThreadingHTTPServer((host, port), handler) as httpd:
    print("Serving %s at http://localhost:%d" % (ROOT, port))
    if lan and lan_ip():
        print("On your phone (same network): http://%s:%d" % (lan_ip(), port))
    httpd.serve_forever()
