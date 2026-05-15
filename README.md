# jobs.ge → Telegram Scraper

A small Python bot that watches a [jobs.ge](https://jobs.ge) listing page every
30 minutes and posts new vacancies to a Telegram channel. Duplicates are never
sent twice — already-seen job IDs are remembered in `seen.json`.

## Files

| File               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `main.py`          | The scraper + Telegram poster + 30-minute loop.        |
| `config.py`        | Bot token, chat id, target URL, poll interval.         |
| `requirements.txt` | Python packages the script needs.                      |
| `seen.json`        | Auto-created. Stores IDs of jobs already announced.    |

## Setup (Windows PowerShell)

1. **Install Python 3.10+** from <https://www.python.org/downloads/>. During
   install, tick "Add Python to PATH".

2. **Open PowerShell** in this project folder and create a virtual
   environment (recommended but optional):

   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**

   ```powershell
   pip install -r requirements.txt
   ```

4. **Create a Telegram bot:**
   - Open Telegram, search for `@BotFather`, send `/newbot`, follow the
     prompts. Copy the token it gives you.
   - Create a channel (or use an existing one). Add your new bot as an
     **Administrator** with permission to post messages.

5. **Edit `config.py`:**
   - Paste the bot token into `TELEGRAM_BOT_TOKEN`.
   - Set `TELEGRAM_CHAT_ID` to your channel's `@username` (public channels)
     or the numeric `-100…` id (private channels). To find a private id,
     post anything in the channel, then visit
     `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser.

6. **Run it:**

   ```powershell
   python main.py
   ```

   You should see a log line every 30 minutes. Stop with `Ctrl+C`.

## How duplicates are avoided

Each job on jobs.ge has a numeric `id` in its URL
(`...?view=jobs&id=123456`). After a job is sent, that id is written to
`seen.json`. On the next cycle the script skips any id it has seen before, so
the same vacancy is never posted twice — even if the script restarts.

## Tweaking

- **Different category / location:** change `TARGET_URL` in `config.py`.
  The query parameters are: `cid` (category), `lid` (location), `q` (search).
- **Polling speed:** change `POLL_INTERVAL` (in seconds). 1800 = 30 min.
- **Reset memory:** delete `seen.json` and the next run will treat every
  listing as new.

## Troubleshooting

- **No jobs parsed / `last_page.html` appears**: the site layout changed.
  Open the saved HTML and adjust `parse_jobs()` in `main.py`.
- **`Telegram API error 400 chat not found`**: the bot is not in the channel,
  or the chat id is wrong. Re-add the bot as Admin and double-check
  `TELEGRAM_CHAT_ID`.
- **Georgian text shows as `???`**: make sure your terminal uses UTF-8
  (`chcp 65001` in PowerShell). The script already requests UTF-8.

## Running 24/7

To keep the bot running after you close PowerShell, use **Task Scheduler** on
Windows or run inside a screen/tmux session on Linux. For a managed service,
deploy to any small VPS and run `python main.py` under `systemd` or `pm2`.
