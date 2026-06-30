from django.utils import timezone
from rest_framework import serializers
from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    is_overdue = serializers.ReadOnlyField()
    goal_title = serializers.CharField(source="goal.title", read_only=True, default=None)

    class Meta:
        model = Task
        fields = [
            "id", "title", "description", "category", "priority", "status",
            "due_date", "completed_at", "order", "goal", "goal_title",
            "is_overdue", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "completed_at", "created_at", "updated_at"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)

    def update(self, instance, validated_data):
        becoming_done = validated_data.get("status") == Task.Status.DONE and instance.status != Task.Status.DONE
        becoming_undone = validated_data.get("status") and validated_data.get("status") != Task.Status.DONE and instance.status == Task.Status.DONE
        instance = super().update(instance, validated_data)
        if becoming_done:
            instance.completed_at = timezone.now()
            instance.save(update_fields=["completed_at"])
        elif becoming_undone:
            instance.completed_at = None
            instance.save(update_fields=["completed_at"])
        return instance


class TaskReorderSerializer(serializers.Serializer):
    """Bulk reorder payload: list of {id, status, order} used when dragging
    cards between kanban columns."""
    id = serializers.IntegerField()
    status = serializers.ChoiceField(choices=Task.Status.choices)
    order = serializers.IntegerField()
