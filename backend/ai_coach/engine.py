"""Public facade for the AI Coach. Views should import from here only —
never from gemini_engine or rule_engine directly — so the "which backend
is active" decision lives in exactly one place.
"""
from . import gemini_engine, rule_engine
from .context_builder import build_user_context


def get_engine_source():
    return "gemini" if gemini_engine.is_gemini_configured() else "rule_based"


def get_recommendations(user):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.generate_recommendations(context), "gemini"
    return rule_engine.generate_recommendations(context), "rule_based"


def get_daily_summary(user):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.generate_daily_summary(context), "gemini"
    return rule_engine.generate_daily_summary(context), "rule_based"


def get_weekly_summary(user):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.generate_weekly_summary(context), "gemini"
    return rule_engine.generate_weekly_summary(context), "rule_based"


def get_monthly_summary(user):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.generate_monthly_summary(context), "gemini"
    return rule_engine.generate_monthly_summary(context), "rule_based"


def get_goal_forecast(user):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.generate_goal_forecast(context), "gemini"
    return rule_engine.generate_goal_forecast(context), "rule_based"


def get_chat_answer(user, question, history=None):
    context = build_user_context(user)
    if gemini_engine.is_gemini_configured():
        return gemini_engine.answer_chat_question(question, context, history), "gemini"
    return rule_engine.answer_chat_question(question, context), "rule_based"
