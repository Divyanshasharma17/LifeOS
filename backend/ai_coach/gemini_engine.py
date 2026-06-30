"""Gemini-backed AI engine. Wraps Google's free-tier Gemini API for richer,
more natural-language insights and chat responses. Every public function
here degrades to the rule_engine equivalent if:
  - GEMINI_API_KEY is not set in the environment, or
  - the Gemini call raises any exception (network, quota, bad response).

This means the AI Coach always returns something useful, with or without
an API key configured.
"""
import json
import logging

from django.conf import settings

from . import rule_engine

logger = logging.getLogger(__name__)

_genai_client = None
_genai_available = False
_genai_model_name = getattr(settings, "GEMINI_MODEL", "gemini-2.0-flash")

try:
    from google import genai

    if getattr(settings, "GEMINI_API_KEY", None):
        _genai_client = genai.Client(api_key=settings.GEMINI_API_KEY)
        _genai_available = True
except Exception as exc:  # pragma: no cover - defensive import guard
    logger.warning("Gemini SDK unavailable or misconfigured: %s", exc)
    _genai_available = False


def is_gemini_configured():
    return _genai_available


def _safe_generate(prompt, max_retries=1):
    """Calls Gemini and returns text, or None on any failure."""
    if not _genai_available:
        return None
    try:
        response = _genai_client.models.generate_content(
            model=_genai_model_name, contents=prompt
        )
        text = getattr(response, "text", None)
        return text.strip() if text else None
    except Exception as exc:
        logger.warning("Gemini generation failed: %s", exc)
        return None


def _context_to_prompt_block(context):
    return json.dumps(context, indent=2, default=str)


def generate_recommendations(context):
    prompt = f"""You are LifeOS's AI productivity coach. Based ONLY on the JSON data below
about one user's goals and tasks, write 2-4 short, specific, actionable recommendations.
Do not invent data not present in the JSON. Respond ONLY with a JSON array of objects,
each with "title" (max 8 words) and "body" (1-2 sentences). No markdown, no preamble.

DATA:
{_context_to_prompt_block(context)}
"""
    text = _safe_generate(prompt)
    if not text:
        return rule_engine.generate_recommendations(context)
    try:
        cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)
        if isinstance(parsed, list) and all("title" in p and "body" in p for p in parsed):
            return parsed
        raise ValueError("Unexpected shape")
    except Exception:
        return rule_engine.generate_recommendations(context)


def _generate_summary(context, period_label, fallback_fn):
    prompt = f"""You are LifeOS's AI coach. Write a concise {period_label} performance summary
(3-5 sentences, encouraging but honest, no fluff) based ONLY on this user's JSON data.
Do not invent numbers not present in the data. Plain text only, no markdown.

DATA:
{_context_to_prompt_block(context)}
"""
    text = _safe_generate(prompt)
    return text if text else fallback_fn(context)


def generate_daily_summary(context):
    return _generate_summary(context, "daily", rule_engine.generate_daily_summary)


def generate_weekly_summary(context):
    return _generate_summary(context, "weekly", rule_engine.generate_weekly_summary)


def generate_monthly_summary(context):
    return _generate_summary(context, "monthly", rule_engine.generate_monthly_summary)


def generate_goal_forecast(context):
    prompt = f"""You are LifeOS's AI coach. For each goal in the "near_deadline" and "overdue"
lists in this JSON, forecast whether the user will finish on time, given its progress percentage
and deadline. Respond ONLY with a JSON array of objects with "title", "progress", and "verdict"
(1 short sentence). No markdown, no preamble.

DATA:
{_context_to_prompt_block(context)}
"""
    text = _safe_generate(prompt)
    if not text:
        return rule_engine.generate_goal_forecast(context)
    try:
        cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        parsed = json.loads(cleaned)
        if isinstance(parsed, list):
            return parsed
        raise ValueError("Unexpected shape")
    except Exception:
        return rule_engine.generate_goal_forecast(context)


def answer_chat_question(question, context, history=None):
    history = history or []
    history_block = "\n".join(f"{h['role']}: {h['content']}" for h in history[-6:])
    prompt = f"""You are LifeOS's AI Coach chatbot — warm, concise, and practical. Answer the
user's question using ONLY the JSON data below about their goals and tasks. Never invent
numbers or items not present in the data. Keep the answer under 120 words, plain text,
no markdown headers.

CONVERSATION SO FAR:
{history_block}

USER DATA:
{_context_to_prompt_block(context)}

USER QUESTION: {question}
"""
    text = _safe_generate(prompt)
    return text if text else rule_engine.answer_chat_question(question, context)
