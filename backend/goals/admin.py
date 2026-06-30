from django.contrib import admin
from .models import Goal, Milestone


class MilestoneInline(admin.TabularInline):
    model = Milestone
    extra = 0


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "priority", "status", "progress", "deadline")
    list_filter = ("status", "priority", "category")
    search_fields = ("title", "description")
    inlines = [MilestoneInline]
