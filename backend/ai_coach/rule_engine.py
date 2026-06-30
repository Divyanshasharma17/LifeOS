"""Rule-based insight and chat-response engine. This is the default,
always-available AI Coach backend — it requires no API key and runs purely
off the structured context from context_builder.py. It is also used as a
graceful fallback if the Gemini API is unavailable, rate-limited, or
unconfigured.
"""


def generate_recommendations(context):
    """Returns a list of {title, body} dicts ranked by urgency."""
    recs = []
    goals = context["goals"]
    tasks = context["tasks"]

    if goals["overdue_count"] > 0:
        names = ", ".join(g["title"] for g in goals["overdue"][:3])
        recs.append({
            "title": f"{goals['overdue_count']} goal(s) are overdue",
            "body": f"These need attention first: {names}. Consider breaking them into smaller "
                    f"milestones or pushing the deadline if priorities have shifted.",
        })

    if tasks["overdue_count"] > 0:
        names = ", ".join(t["title"] for t in tasks["overdue"][:3])
        recs.append({
            "title": f"{tasks['overdue_count']} task(s) are overdue",
            "body": f"Clear these first to reduce mental load: {names}.",
        })

    if tasks["high_priority_pending_count"] > 0 and tasks["overdue_count"] == 0:
        names = ", ".join(t["title"] for t in tasks["high_priority_pending"][:3])
        recs.append({
            "title": "High-priority tasks waiting",
            "body": f"Focus today's energy here: {names}.",
        })

    if goals["stalled_count"] > 0:
        names = ", ".join(g["title"] for g in goals["stalled"][:3])
        recs.append({
            "title": f"{goals['stalled_count']} goal(s) have stalled below 25% progress",
            "body": f"{names} — try scheduling one small, concrete next action for each this week.",
        })

    if goals["near_deadline"]:
        names = ", ".join(g["title"] for g in goals["near_deadline"][:3])
        recs.append({
            "title": "Deadlines approaching within 7 days",
            "body": f"{names}. Plan dedicated time blocks now to avoid a last-minute scramble.",
        })

    if tasks["completed_today"] >= 3:
        recs.append({
            "title": "Strong day so far",
            "body": f"You've completed {tasks['completed_today']} tasks today. Keep the momentum — "
                    f"consider tackling one more high-priority item before you stop.",
        })

    if not recs:
        recs.append({
            "title": "You're on track",
            "body": "No overdue items or stalled goals right now. Good time to plan ahead or "
                    "start a new goal/habit.",
        })

    return recs


def generate_daily_summary(context):
    tasks = context["tasks"]
    goals = context["goals"]
    lines = [
        f"Today you completed {tasks['completed_today']} task(s), with {tasks['pending_count']} still pending.",
    ]
    if tasks["overdue_count"]:
        lines.append(f"{tasks['overdue_count']} task(s) are overdue and should be prioritized tomorrow.")
    if goals["active_count"]:
        lines.append(f"You have {goals['active_count']} active goal(s); {goals['overdue_count']} are overdue.")
    if not tasks["overdue_count"] and not goals["overdue_count"]:
        lines.append("Nothing is overdue — solid day of staying on top of things.")
    return " ".join(lines)


def generate_weekly_summary(context):
    tasks = context["tasks"]
    goals = context["goals"]
    lines = [
        f"This week you completed {tasks['completed_this_week']} task(s).",
        f"You currently have {goals['active_count']} active goal(s) and {goals['completed_count']} completed overall.",
    ]
    if goals["stalled_count"]:
        lines.append(f"{goals['stalled_count']} goal(s) have under 25% progress — worth revisiting your approach.")
    if goals["near_deadline"]:
        lines.append(f"{len(goals['near_deadline'])} goal(s) have deadlines in the next 7 days.")
    return " ".join(lines)


def generate_monthly_summary(context):
    goals = context["goals"]
    tasks = context["tasks"]
    return (
        f"Across this period you've completed {goals['completed_count']} goal(s) in total, "
        f"with {goals['active_count']} still active. Task throughput shows {tasks['completed_this_week']} "
        f"completed in the last 7 days alone. "
        + ("Consider reviewing stalled goals to keep momentum consistent."
           if goals["stalled_count"] else
           "Your goal progress is moving steadily — keep the current rhythm.")
    )


def generate_goal_forecast(context):
    """Very simple heuristic forecast per goal based on progress vs days remaining."""
    forecasts = []
    for g in context["goals"]["near_deadline"] + context["goals"]["overdue"]:
        progress = g.get("progress", 0)
        if progress >= 80:
            verdict = "On track to finish on time."
        elif progress >= 50:
            verdict = "Achievable, but will need focused effort soon."
        elif progress >= 25:
            verdict = "At risk — current pace suggests you may miss the deadline."
        else:
            verdict = "High risk — significant catch-up needed or deadline should be revisited."
        forecasts.append({"title": g["title"], "progress": progress, "verdict": verdict})
    return forecasts


def answer_chat_question(question, context):
    """Lightweight intent matching for the chatbot fallback when Gemini is
    not configured or fails. Covers the example questions from the spec.
    """
    q = question.lower()
    goals = context["goals"]
    tasks = context["tasks"]

    if "focus" in q and "today" in q:
        if tasks["overdue_count"]:
            names = ", ".join(t["title"] for t in tasks["overdue"][:3])
            return f"Start with your overdue tasks: {names}. Clearing these will reduce stress and free you up for proactive work."
        if tasks["high_priority_pending"]:
            names = ", ".join(t["title"] for t in tasks["high_priority_pending"][:3])
            return f"Focus on your high-priority tasks today: {names}."
        return "Nothing urgent is overdue — good day to make progress on a stalled goal or plan ahead."

    if "falling behind" in q or ("goals" in q and "behind" in q):
        if goals["overdue"] or goals["stalled"]:
            items = goals["overdue"] + goals["stalled"]
            names = ", ".join(g["title"] for g in items[:4])
            return f"These goals need attention: {names}."
        return "No goals are currently falling behind — nice work staying consistent."

    if "productiv" in q:
        tips = []
        if tasks["overdue_count"]:
            tips.append("clear overdue tasks first to reduce backlog stress")
        if goals["stalled_count"]:
            tips.append("break stalled goals into one small daily action")
        if not tips:
            tips.append("batch similar tasks together and protect a daily focus block")
        return "To improve productivity: " + "; ".join(tips) + "."

    if "habit" in q:
        return ("Habit tracking isn't enabled in this build yet — once added, I'll prioritize habits "
                "with broken streaks or ones tied to your stalled goals.")

    # Generic fallback referencing real numbers from context.
    return (
        f"Here's where things stand: {goals['active_count']} active goals "
        f"({goals['overdue_count']} overdue), {tasks['pending_count']} pending tasks "
        f"({tasks['overdue_count']} overdue). Ask me about today's focus, goals falling behind, "
        f"or how to improve productivity for more specific guidance."
    )
