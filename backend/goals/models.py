from django.conf import settings
from django.db import models


class Goal(models.Model):
    class Category(models.TextChoices):
        CAREER = "career", "Career"
        HEALTH = "health", "Health"
        FINANCE = "finance", "Finance"
        LEARNING = "learning", "Learning"
        PERSONAL = "personal", "Personal"
        RELATIONSHIPS = "relationships", "Relationships"
        OTHER = "other", "Other"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"
        CRITICAL = "critical", "Critical"

    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        ON_HOLD = "on_hold", "On Hold"
        COMPLETED = "completed", "Completed"
        ABANDONED = "abandoned", "Abandoned"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.PERSONAL)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    progress = models.PositiveSmallIntegerField(default=0, help_text="Progress percentage 0-100.")
    start_date = models.DateField(null=True, blank=True)
    deadline = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-priority", "deadline"]

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    @property
    def is_overdue(self):
        from django.utils import timezone
        return bool(self.deadline) and self.deadline < timezone.localdate() and self.status != self.Status.COMPLETED

    @property
    def milestone_progress(self):
        total = self.milestones.count()
        if total == 0:
            return None
        done = self.milestones.filter(is_completed=True).count()
        return round((done / total) * 100)


class Milestone(models.Model):
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name="milestones")
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    due_date = models.DateField(null=True, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["order", "due_date"]

    def __str__(self):
        return self.title
