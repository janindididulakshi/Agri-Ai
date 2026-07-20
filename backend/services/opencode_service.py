import logging
import os
from typing import Any, Dict, List, Optional

from openai import OpenAI

from config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_MAX_DOA_CHARS = 28_000

_ZEN_BASE_URL = "https://opencode.ai/zen/v1"
_GO_BASE_URL = "https://opencode.ai/zen/go/v1"

_DEFAULT_MODEL = "deepseek-v4-flash-free"


def _get_client() -> OpenAI:
    key = settings.OPENCODE_API_KEY or os.getenv("OPENCODE_API_KEY", "")
    if not key:
        raise ValueError("OPENCODE_API_KEY not configured")
    base_url = os.getenv("OPENCODE_BASE_URL") or settings.OPENCODE_BASE_URL or _ZEN_BASE_URL
    return OpenAI(api_key=key, base_url=base_url)


def _model_name() -> str:
    return (os.getenv("OPENCODE_MODEL") or settings.OPENCODE_MODEL or _DEFAULT_MODEL).strip()


def season_label() -> str:
    import datetime
    m = datetime.datetime.utcnow().month
    if m in (10, 11, 12, 1, 2, 3):
        return "Maha"
    return "Yala"


def farming_system_prompt(
    weather: str,
    location: str,
    season: Optional[str] = None,
    doa_knowledge: str = "",
) -> str:
    season = season or season_label()
    doa_block = doa_knowledge.strip() or "(no DOA rows loaded)"
    if len(doa_block) > _MAX_DOA_CHARS:
        doa_block = doa_block[:_MAX_DOA_CHARS] + "\n…(truncated)"
    return f"""ඔබ දක්ෂ කෘෂිකර්ම උපදේශකයෙකි.
Sri Lanka farmers help කරන්න.
Current weather: {weather}
Location: {location}
Season: {season}

DOA knowledge base (cite when relevant, keep answers simple):
{doa_block}

Rules:
- Answer ANY farming question
- Sinhala or English (match user)
- Respond using plain text and bullet points
- Do NOT use emojis or AI icons
- No technical jargon
- Local Sri Lanka advice
"""


def _chat_sync(
    message: str,
    chat_history: List[Dict[str, str]],
    weather_context: str,
    location_name: str,
    doa_knowledge: str,
    image_b64: Optional[str] = None,
    image_type: Optional[str] = None,
) -> str:
    fallback_base = "සමාවෙන්න, දැන් පිළිතුර ලබා ගැනීමට බැරි වුණා. ටික වේලාවකින් නැවත උත්සාහ කරන්න. 🌾"
    try:
        client = _get_client()
        model = _model_name()

        system = farming_system_prompt(weather_context, location_name, None, doa_knowledge)

        messages: List[Dict[str, str]] = [{"role": "system", "content": system}]
        for turn in chat_history[-12:]:
            role = "user" if turn.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": turn.get("content", "")})
        
        if image_b64:
            messages.append({
                "role": "user",
                "content": [
                    {"type": "text", "text": message},
                    {"type": "image_url", "image_url": {"url": f"data:{image_type or 'image/jpeg'};base64,{image_b64}"}}
                ]
            })
            # Ensure we use a vision-capable model if an image is provided
            if "deepseek" in model.lower():
                model = "mimo-v2.5-free"
        else:
            messages.append({"role": "user", "content": message})

        resp = client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=2048,
            temperature=0.65,
        )

        text = (resp.choices[0].message.content or "").strip()
        if text:
            logger.info("OpenCode Zen reply via model=%s", model)
            return text

        logger.warning("OpenCode Zen empty response model=%s", model)
        return fallback_base

    except Exception as e:
        logger.exception("OpenCode Zen chat fatal: %s", e)
        detail = str(e).strip()
        if "429" in detail or "quota" in detail.lower():
            return fallback_base + " (API කෝටාව අවසන් — OpenCode Zen ගිණුම පරීක්ෂා කරන්න.)"
        if "401" in detail or "unauthorized" in detail.lower():
            return fallback_base + " (API යතුර වලංගු නැත — OPENCODE_API_KEY පරීක්ෂා කරන්න.)"
        if "model" in detail.lower() and "not found" in detail.lower() or "404" in detail:
            return fallback_base + " (මොඩලය සොයාගත නොහැක — OPENCODE_MODEL පරීක්ෂා කරන්න.)"
        return f"{fallback_base} ({e})"


async def opencode_chat_reply(
    message: str,
    chat_history: List[Dict[str, str]],
    lat: Optional[float],
    lon: Optional[float],
    weather_context: str,
    location_name: str,
    doa_knowledge: str,
    image_b64: Optional[str] = None,
    image_type: Optional[str] = None,
) -> str:
    import asyncio

    try:
        return await asyncio.to_thread(
            _chat_sync, message, chat_history, weather_context, location_name, doa_knowledge, image_b64, image_type
        )
    except Exception as e:
        logger.exception("opencode_chat_reply: %s", e)
        return f"සමාවෙන්න, AI සේවාව අකර්මණ්‍යයි: {e}"
