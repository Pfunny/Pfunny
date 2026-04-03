import asyncio
import os
from pathlib import Path

from aiogram import Bot, Dispatcher, F
from aiogram.filters import Command, CommandObject
from aiogram.types import Message
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
STORAGE_DIR = Path(os.getenv("STORAGE_DIR", "storage"))

if not BOT_TOKEN:
    raise ValueError("Please set BOT_TOKEN in your environment or .env file.")

STORAGE_DIR.mkdir(parents=True, exist_ok=True)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


def get_user_storage_dir(user_id: int) -> Path:
    path = STORAGE_DIR / str(user_id)
    path.mkdir(parents=True, exist_ok=True)
    return path


def sanitize_filename(filename: str) -> str:
    sanitized = filename.replace("\\", "_").replace("/", "_").strip()
    if not sanitized:
        return "file.bin"
    return sanitized[:180]


def unique_target_path(base_path: Path) -> Path:
    if not base_path.exists():
        return base_path

    stem = base_path.stem
    suffix = base_path.suffix
    index = 1

    while True:
        candidate = base_path.with_name(f"{stem}_{index}{suffix}")
        if not candidate.exists():
            return candidate
        index += 1


@dp.message(Command("start"))
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Hi 👋\n"
        "This bot stores files you upload in your personal folder.\n"
        "Please upload only files you own rights to.\n\n"
        "Commands:\n"
        "/save - How to upload\n"
        "/list - Show your saved files\n"
        "/delete <filename> - Delete a file"
    )


@dp.message(Command("save"))
async def cmd_save(message: Message) -> None:
    await message.answer(
        "Send a video or file and I will save it in your personal storage folder."
    )


@dp.message(Command("list"))
async def cmd_list(message: Message) -> None:
    storage = get_user_storage_dir(message.from_user.id)
    files = sorted(path.name for path in storage.iterdir() if path.is_file())

    if not files:
        await message.answer("You do not have any saved files yet.")
        return

    max_items = 100
    lines = [f"• {name}" for name in files[:max_items]]
    reply = "📁 Your files:\n" + "\n".join(lines)
    if len(files) > max_items:
        reply += f"\n... and {len(files) - max_items} more"

    await message.answer(reply)


@dp.message(Command("delete"))
async def cmd_delete(message: Message, command: CommandObject) -> None:
    filename = sanitize_filename((command.args or "").strip())

    if not command.args:
        await message.answer("Usage: /delete <filename>")
        return

    target = get_user_storage_dir(message.from_user.id) / filename
    if not target.exists() or not target.is_file():
        await message.answer("File not found.")
        return

    target.unlink()
    await message.answer(f"🗑️ Deleted: {filename}")


@dp.message(F.video | F.document)
async def handle_upload(message: Message) -> None:
    user_folder = get_user_storage_dir(message.from_user.id)

    if message.video:
        tg_file = message.video
        filename = message.video.file_name or f"video_{tg_file.file_unique_id}.mp4"
    else:
        tg_file = message.document
        filename = message.document.file_name or f"document_{tg_file.file_unique_id}.bin"

    safe_name = sanitize_filename(filename)
    target = unique_target_path(user_folder / safe_name)

    await message.answer(f"⬇️ Saving: {target.name} ...")
    await bot.download(tg_file, destination=target)
    await message.answer(f"✅ Saved: {target.name}")


@dp.message()
async def fallback(message: Message) -> None:
    await message.answer("Send a file/video or use /save, /list, /delete.")


if __name__ == "__main__":
    asyncio.run(dp.start_polling(bot))
