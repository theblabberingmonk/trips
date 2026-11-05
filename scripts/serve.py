"""Serve the project locally, selecting another port when one is occupied."""
import argparse
import errno
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--port', type=int, default=5173)
args = parser.parse_args()
if not 1 <= args.port <= 65535:
    parser.error('Port must be between 1 and 65535')

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

handler = partial(PreviewHandler, directory=str(Path(__file__).resolve().parent.parent))
server = None
for port in range(args.port, min(args.port + 20, 65536)):
    try:
        server = ThreadingHTTPServer(('127.0.0.1', port), handler)
        break
    except OSError as error:
        if error.errno != errno.EADDRINUSE:
            raise
        print(f'Port {port} is already in use; trying the next port.', flush=True)
if server is None:
    parser.exit(1, 'No free preview port found. Try npm start -- --port 5200\n')
print(f'\nTrips is ready: http://localhost:{server.server_port}/\nPress Ctrl+C to stop.\n', flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    print('\nStopped Trips preview.')
finally:
    server.server_close()
