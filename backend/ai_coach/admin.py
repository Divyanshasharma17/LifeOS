from django.contrib import admin
from .models import Insight, ChatMessage


@admin.register(Insight)
class InsightAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "kind", "source", "created_at")
    list_filter = ("kind", "source")


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "content", "created_at")
    list_filter = ("role",)
