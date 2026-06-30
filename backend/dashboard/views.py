from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from goals.models import Goal
from tasks.models import Task


class DashboardOverviewView(APIView):
    """Single aggregated payload powering the home dashboard: headline
    stats, upcoming deadlines, and recent activity across modules.
    Designed so that future modules (Study, Focus, Habits, Health, Mood,
    Journal) can be added to the same response shape without breaking
    the frontend contract.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.localdate()
        week_ahead = today + timedelta(days=7)

        goals_qs = Goal.objects.filter(user=user)
        tasks_qs = Task.objects.filter(user=user)

        active_goals = goals_qs.exclude(status__in=[Goal.Status.COMPLETED, Goal.Status.ABANDONED])
        completed_goals = goals_qs.filter(status=Goal.Status.COMPLETED)
        completed_tasks_today = tasks_qs.filter(status=Task.Status.DONE, completed_at__date=today)

        upcoming_goal_deadlines = active_goals.filter(
            deadline__isnull=False, deadline__gte=today, deadline__lte=week_ahead
        ).order_by("deadline")[:5]

        upcoming_task_deadlines = tasks_qs.exclude(status=Task.Status.DONE).filter(
            due_date__isnull=False, due_date__gte=today, due_date__lte=week_ahead
        ).order_by("due_date")[:5]

        overdue_goals = [g for g in active_goals if g.is_overdue]
        overdue_tasks = [t for t in tasks_qs.exclude(status=Task.Status.DONE) if t.is_overdue]

        stats = {
            "active_goals": active_goals.count(),
            "completed_goals": completed_goals.count(),
            "total_tasks": tasks_qs.count(),
            "completed_tasks": tasks_qs.filter(status=Task.Status.DONE).count(),
            "completed_tasks_today": completed_tasks_today.count(),
            "pending_tasks": tasks_qs.exclude(status=Task.Status.DONE).count(),
            "overdue_goals": len(overdue_goals),
            "overdue_tasks": len(overdue_tasks),
            # Placeholders kept in the contract for upcoming modules so the
            # frontend dashboard cards are already wired for them.
            "study_hours_week": 0,
            "focus_minutes_today": 0,
            "habit_streak_best": 0,
            "mood_avg_week": None,
        }

        upcoming_deadlines = []
        for g in upcoming_goal_deadlines:
            upcoming_deadlines.append({
                "type": "goal", "id": g.id, "title": g.title,
                "date": g.deadline, "priority": g.priority,
            })
        for t in upcoming_task_deadlines:
            upcoming_deadlines.append({
                "type": "task", "id": t.id, "title": t.title,
                "date": t.due_date, "priority": t.priority,
            })
        upcoming_deadlines.sort(key=lambda x: x["date"])

        recent_goals = goals_qs.order_by("-updated_at")[:5]
        recent_tasks = tasks_qs.order_by("-updated_at")[:5]

        return Response({
            "greeting_name": user.first_name or user.username,
            "stats": stats,
            "upcoming_deadlines": upcoming_deadlines[:8],
            "recent_goals": [
                {"id": g.id, "title": g.title, "progress": g.progress, "status": g.status}
                for g in recent_goals
            ],
            "recent_tasks": [
                {"id": t.id, "title": t.title, "status": t.status, "priority": t.priority}
                for t in recent_tasks
            ],
        })
