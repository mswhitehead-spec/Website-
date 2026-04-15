#!/bin/bash
PORT=${1:-8000}
echo ""
echo "  ⛰  Nordic Trail - Outdoor E-Commerce"
echo "  ──────────────────────────────────────"
echo "  Server running at: http://localhost:$PORT"
echo "  Press Ctrl+C to stop"
echo ""
cd "$(dirname "$0")"
python3 -m http.server "$PORT"
