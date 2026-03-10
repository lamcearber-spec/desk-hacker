#!/usr/bin/env python3
"""Build Stripe app bundle."""
import subprocess, os
os.chdir("/home/muja/DatevBereit-Claude/stripe-app")
subprocess.run("npm install", shell=True)
subprocess.run("npm run build", shell=True)
print("\n✓ Built. Upload via Stripe Dashboard.")