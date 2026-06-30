"""Builds a compact, structured snapshot of a user's activity across all
LifeOS modules. This snapshot is the single source of truth fed to both
the rule-based engine and the Gemini prompt, so the two stay consistent
with each other and with whatever the user actually sees on their
dashboard.
"""
from datetime import timedelta

from django.utils import timezone

from goals.models import Goal
from tasks.models import Task


def build_user_context(user):
    today = timezone.localdate()
    week_ago = today - timedelta(days=7)

    goals_qs = Goal.objects.filter(user=user)
    tasks_qs = Task.objects.filter(user=user)

    active_goals = list(goals_qs.exclude(status__in=[Goal.Status.COMPLETED, Goal.Status.ABANDONED]))
    overdue_goals = [g for g in active_goals if g.is_overdue]
    stalled_goals = [g for g in active_goals if g.progress < 25 and g.status == Goal.Status.IN_PROGRESS]

    pending_tasks = list(tasks_qs.exclude(status=Task.Status.DONE))
    overdue_tasks = [t for t in pending_tasks if t.is_overdue]
    high_priority_pending = [t for t in pending_tasks if t.priority in (Task.Priority.HIGH, Task.Priority.URGENT)]

    tasks_completed_week = tasks_qs.filter(status=Task.Status.DONE, completed_at__date__gte=week_ago).count()
    tasks_completed_today = tasks_qs.filter(status=Task.Status.DONE, completed_at__date=today).count()

    context = {
        "today": str(today),
        "goals": {
            "active_count": len(active_goals),
            "overdue_count": len(overdue_goals),
            "stalled_count": len(stalled_goals),
            "completed_count": goals_qs.filter(status=Goal.Status.COMPLETED).count(),
            "overdue": [
                {"title": g.title, "deadline": str(g.deadline), "progress": g.progress, "priority": g.priority}
                for g in overdue_goals[:5]
            ],
            "stalled": [
                {"title": g.title, "progress": g.progress, "priority": g.priority}
                for g in stalled_goals[:5]
            ],
            "near_deadline": [
                {"title": g.title, "deadline": str(g.deadline), "progress": g.progress}
                for g in active_goals
                if g.deadline and 0 <= (g.deadline - today).days <= 7
            ][:5],
        },
        "tasks": {
            "pending_count": len(pending_tasks),
            "overdue_count": len(overdue_tasks),
            "high_priority_pending_count": len(high_priority_pending),
            "completed_today": tasks_completed_today,
            "completed_this_week": tasks_completed_week,
            "overdue": [
                {"title": t.title, "due_date": str(t.due_date), "priority": t.priority}
                for t in overdue_tasks[:5]
            ],
            "high_priority_pending": [
                {"title": t.title, "due_date": str(t.due_date) if t.due_date else None, "status": t.status}
                for t in high_priority_pending[:5]
            ],
        },
        # Reserved keys for upcoming modules (Study, Focus, Habits, Health,
        # Mood, Journal) so prompts and rule logic can be extended later
        # without changing this function's contract.
        "study": {"hours_this_week": 0, "sessions_this_week": 0},
        "focus": {"minutes_today": 0, "sessions_today": 0},
        "habits": {"active_count": 0, "best_streak": 0, "at_risk": []},
        "health": {"avg_sleep_hours": None, "water_intake_avg_ml": None},
        "mood": {"avg_mood_week": None, "avg_stress_week": None},
    }
    return context
