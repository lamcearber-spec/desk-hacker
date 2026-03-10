#!/usr/bin/env python3
"""Deploy konverter-pro web container."""
import subprocess, os

def run(cmd):
    print(f"$ {cmd}")
    subprocess.run(cmd, shell=True)

os.chdir("/home/muja/DatevBereit-Claude")
run("git pull")
run("source .env.datev && docker compose -f docker-compose.yml -f docker-compose.prod.yml build web")
run("docker stop konverter-pro-web-1; docker rm konverter-pro-web-1")
run("""docker run -d --name konverter-pro-web-1 --network host --restart unless-stopped \
 -e NODE_ENV=production -e NEXT_TELEMETRY_DISABLED=1 -e PORT=3000 -e HOSTNAME=0.0.0.0 \
 -e NEXT_PUBLIC_API_URL=https://api.konverter-pro.de -e API_URL=https://api.konverter-pro.de \
 konverter-pro-web:latest""")
print("✓ Done")