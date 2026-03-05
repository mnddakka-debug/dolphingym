"""
AI Chat Bot Launcher
This script starts both the API server and web server.
"""

import subprocess
import sys
import os
import time
import webbrowser
import threading
from http.server import HTTPServer, SimpleHTTPRequestHandler
import signal

# Configuration
API_PORT = 1337
WEB_PORT = 8080
WEB_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'web')

class QuietHTTPHandler(SimpleHTTPRequestHandler):
    """HTTP handler that doesn't log every request"""
    def log_message(self, format, *args):
        pass  # Suppress logging

def install_requirements():
    """Install required Python packages"""
    print("[INFO] Installing dependencies...")
    requirements_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'requirements.txt')
    subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', requirements_file, '-q'], check=False)

def start_api_server():
    """Start the FastAPI server"""
    print(f"[INFO] Starting API server on port {API_PORT}...")
    server_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'server.py')
    return subprocess.Popen([sys.executable, server_path], 
                          stdout=subprocess.PIPE, 
                          stderr=subprocess.PIPE,
                          creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)

def start_web_server():
    """Start the web server"""
    os.chdir(WEB_DIR)
    handler = QuietHTTPHandler
    httpd = HTTPServer(('', WEB_PORT), handler)
    print(f"[INFO] Web server started on port {WEB_PORT}")
    httpd.serve_forever()

def main():
    print("=" * 50)
    print("   AI Chat Bot - Keyless GPT Wrapper")
    print("=" * 50)
    print()
    
    # Install requirements
    install_requirements()
    print()
    
    # Start API server
    api_process = start_api_server()
    
    # Give API server time to start
    time.sleep(3)
    
    # Check if API server started successfully
    if api_process.poll() is not None:
        print("[ERROR] Failed to start API server!")
        sys.exit(1)
    
    print(f"[INFO] API server running on http://localhost:{API_PORT}")
    
    # Start web server in a thread
    web_thread = threading.Thread(target=start_web_server, daemon=True)
    web_thread.start()
    
    print()
    print("=" * 50)
    print(f"   OPEN YOUR BROWSER AT:")
    print(f"   http://localhost:{WEB_PORT}")
    print("=" * 50)
    print()
    print("[INFO] Press Ctrl+C to stop all servers")
    print()
    
    # Open browser automatically
    time.sleep(1)
    webbrowser.open(f'http://localhost:{WEB_PORT}')
    
    # Keep running
    try:
        while True:
            time.sleep(1)
            # Check if API server is still running
            if api_process.poll() is not None:
                print("[WARNING] API server stopped unexpectedly!")
                break
    except KeyboardInterrupt:
        print("\n[INFO] Shutting down...")
        api_process.terminate()
        print("[INFO] Goodbye!")

if __name__ == '__main__':
    main()
