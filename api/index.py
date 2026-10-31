import os
import sys
from pathlib import Path

# Ensure both root and backend directory are in sys.path for universal resolution
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

for p in [str(backend_dir), str(root_dir)]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from app.main import app
except ImportError:
    from backend.app.main import app

# Export both app and handler for universal serverless compatibility
handler = app
