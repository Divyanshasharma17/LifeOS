from django.db.models import Count
from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Goal, Milestone
from .serializers import GoalSerializer, GoalCreateSerializer, MilestoneSerializer


class GoalViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "category"]
    search_fields = ["title", "description"]
    ordering_fields = ["deadline", "priority", "created_at", "progress"]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user).prefetch_related("milestones")

    def get_serializer_class(self):
        if self.action == "create":
            return GoalCreateSerializer
        return GoalSerializer

    def get_serializer_context(self):
        return {"request": self.request}

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        total = qs.count()
        by_status = qs.values("status").annotate(count=Count("id"))
        overdue = sum(1 for g in qs if g.is_overdue)
        active = qs.exclude(status__in=[Goal.Status.COMPLETED, Goal.Status.ABANDONED]).count()
        completed = qs.filter(status=Goal.Status.COMPLETED).count()
        return Response({
            "total": total,
            "active": active,
            "completed": completed,
            "overdue": overdue,
            "by_status": list(by_status),
        })


class MilestoneViewSet(viewsets.ModelViewSet):
    serializer_class = MilestoneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Milestone.objects.filter(goal__user=self.request.user)
