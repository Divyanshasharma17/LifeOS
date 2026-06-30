from django.urls import path
from .views import (
    RecommendationsView, DailySummaryView, WeeklySummaryView,
    MonthlySummaryView, GoalForecastView, ChatView, EngineStatusView,
)

urlpatterns = [
    path("recommendations/", RecommendationsView.as_view(), name="ai-recommendations"),
    path("summary/daily/", DailySummaryView.as_view(), name="ai-daily-summary"),
    path("summary/weekly/", WeeklySummaryView.as_view(), name="ai-weekly-summary"),
    path("summary/monthly/", MonthlySummaryView.as_view(), name="ai-monthly-summary"),
    path("goal-forecast/", GoalForecastView.as_view(), name="ai-goal-forecast"),
    path("chat/", ChatView.as_view(), name="ai-chat"),
    path("status/", EngineStatusView.as_view(), name="ai-status"),
]
