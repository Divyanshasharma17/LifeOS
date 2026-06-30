from django.utils import timezone
from rest_framework import serializers
from .models import Goal, Milestone


class MilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Milestone
        fields = ["id", "goal", "title", "is_completed", "due_date", "order", "created_at", "completed_at"]
        read_only_fields = ["id", "created_at", "completed_at"]

    def update(self, instance, validated_data):
        becoming_complete = validated_data.get("is_completed") and not instance.is_completed
        becoming_incomplete = validated_data.get("is_completed") is False and instance.is_completed
        instance = super().update(instance, validated_data)
        if becoming_complete:
            instance.completed_at = timezone.now()
            instance.save(update_fields=["completed_at"])
        elif becoming_incomplete:
            instance.completed_at = None
            instance.save(update_fields=["completed_at"])
        return instance


class GoalSerializer(serializers.ModelSerializer):
    milestones = MilestoneSerializer(many=True, read_only=True)
    milestone_progress = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    days_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = [
            "id", "title", "description", "category", "priority", "status",
            "progress", "start_date", "deadline", "completed_at",
            "created_at", "updated_at", "milestones", "milestone_progress",
            "is_overdue", "days_remaining",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "completed_at"]

    def get_days_remaining(self, obj):
        if not obj.deadline:
            return None
        return (obj.deadline - timezone.localdate()).days

    def update(self, instance, validated_data):
        becoming_complete = validated_data.get("status") == Goal.Status.COMPLETED and instance.status != Goal.Status.COMPLETED
        instance = super().update(instance, validated_data)
        if becoming_complete:
            instance.completed_at = timezone.now()
            instance.progress = 100
            instance.save(update_fields=["completed_at", "progress"])
        return instance

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class GoalCreateSerializer(GoalSerializer):
    """Same as GoalSerializer but accepts nested milestone titles on create."""
    initial_milestones = serializers.ListField(
        child=serializers.CharField(max_length=200), write_only=True, required=False
    )

    class Meta(GoalSerializer.Meta):
        fields = GoalSerializer.Meta.fields + ["initial_milestones"]

    def create(self, validated_data):
        milestone_titles = validated_data.pop("initial_milestones", [])
        validated_data["user"] = self.context["request"].user
        goal = Goal.objects.create(**validated_data)
        for i, title in enumerate(milestone_titles):
            Milestone.objects.create(goal=goal, title=title, order=i)
        return goal
