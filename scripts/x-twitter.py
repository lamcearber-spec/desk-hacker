#!/usr/bin/env python3
"""Post to X/Twitter using bird CLI."""
import subprocess, os

def tweet(text):
    os.system("source ~/.bashrc")
    result = subprocess.run(
        ["bird", "tweet", text],
        capture_output=True, text=True,
        env={**os.environ, 
             "AUTH_TOKEN": os.environ.get("AUTH_TOKEN", ""),
             "CT0": os.environ.get("CT0", "")}
    )
    print(result.stdout or result.stderr)
    return result.returncode == 0

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python x-twitter.py 'Your tweet text'")
    else:
        tweet(" ".join(sys.argv[1:]))