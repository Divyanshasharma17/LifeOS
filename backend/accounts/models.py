from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user model for LifeOS, extending Django's built-in auth user
    with profile fields used across the app (dashboard greeting, avatar, etc).
    """
    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, default="")
    avatar_color = models.CharField(
        max_length=7, default="#6C5CE7",
        help_text="Hex color used for the user's avatar initials badge."
    )
    timezone = models.CharField(max_length=64, default="UTC")
    daily_goal_minutes = models.PositiveIntegerField(
        default=120, help_text="Target focused/study minutes per day, used by AI Coach."
    )
    onboarding_complete = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username
