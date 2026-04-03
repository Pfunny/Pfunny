## Telegram File Storage Bot

This project contains a legal Telegram bot for storing files that users upload themselves.

### Features
- `/start`: help and command overview
- `/save`: upload instructions
- `/list`: list your saved files
- `/delete <filename>`: remove a file from your personal folder
- Handles incoming `video` and `document` messages and stores them locally

### Setup
1. Create a bot with `@BotFather` and get your `BOT_TOKEN`.
2. Copy `.env.example` to `.env` and fill in your token.
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the bot:
   ```bash
   python bot.py
   ```

### Environment variables
- `BOT_TOKEN`: your Telegram bot token (required)
- `STORAGE_DIR`: root directory for saved files (default: `storage`)

### Notes
Please use this only for legal content you have rights to upload and store.
