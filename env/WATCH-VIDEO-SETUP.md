# watch-video — Setup Instructions for JC

## What it does
Downloads any YouTube video → transcribes audio via Azure Whisper → summarizes with Claude.

## Prerequisites (already installed on this server)
- `yt-dlp` — YouTube downloader
- `ffmpeg` — audio splitting
- `deno` — JS runtime needed by yt-dlp for YouTube
- Azure Whisper — transcription (West Europe endpoint)
- Anthropic API — summarization

## Usage
```bash
watch-video.sh "https://www.youtube.com/watch?v=VIDEO_ID"
```

Output:
- First 2000 chars of transcript printed
- Full summary (topic + key insights + takeaways)
- Full transcript saved to `/tmp/last_video_transcript.txt`

## YouTube Cookies (required)
YouTube blocks server IPs without auth. Cookies are stored at:
```
/root/.config/youtube_cookies.txt
```
These are Arber's YouTube session cookies. They expire ~2 years from issue date (currently valid until ~2027).

**If cookies expire:** Export fresh ones from Chrome using the "Get cookies.txt LOCALLY" extension while logged into YouTube, save as `youtube_cookies.txt` and upload to `/root/.config/youtube_cookies.txt`.

## Rate Limits
Azure Whisper: 1 request per 30 seconds (S0 tier).
For a 54-min video (7 chunks) → ~4 minutes total transcription time.

## Config files
| What | Path |
|------|------|
| Script | `/root/clawd/scripts/watch-video.sh` |
| YouTube cookies | `/root/.config/youtube_cookies.txt` |
| Azure config | `/root/.config/azure-openai/config.json` |
| Azure Whisper key | `/root/.config/azure-openai/api_key_whisper` |
| Anthropic key | In `~/.bashrc` as `ANTHROPIC_API_KEY` |

## Troubleshooting
- **"Sign in to confirm you're not a bot"** → Cookies expired, get fresh ones from Arber
- **"Rate limit"** → Azure Whisper throttling, script handles this automatically with 30s delays
- **"n challenge solving failed"** → deno not in PATH; run `export PATH="$PATH:/root/.deno/bin"` first
