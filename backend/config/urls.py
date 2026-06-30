from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/dashboard/", include("dashboard.urls")),
    path("api/", include("goals.urls")),
    path("api/", include("tasks.urls")),
    path("api/ai/", include("ai_coach.urls")),
]
