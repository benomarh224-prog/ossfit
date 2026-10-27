#!/usr/bin/env bash
# Watchdog: keeps the Next.js dev server alive, restarting it if it dies.
# Intended to be run detached in the background.
cd /home/z/my-project

LOG=/home/z/my-project/dev.log

while true; do
  # kill any stale next dev / turbopack processes
  pkill -f "next dev" 2>/dev/null
  pkill -f "next-server" 2>/dev/null
  sleep 1

  echo "[watchdog] starting next dev at $(date -Iseconds)" >> "$LOG"
  # Use webpack bundler (more memory-stable than Turbopack in constrained envs).
  NODE_OPTIONS="--max-old-space-size=1024" bun --bun next dev -p 3000 --webpack >> "$LOG" 2>&1
  EXIT=$?
  echo "[watchdog] next dev exited with $EXIT at $(date -Iseconds) — restarting in 3s" >> "$LOG"
  sleep 3
done
