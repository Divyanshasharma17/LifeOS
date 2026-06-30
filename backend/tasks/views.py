from django.db import transaction
from django.db.models import Count
from rest_framework import viewsets, permissions, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer, TaskReorderSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "priority", "category", "goal"]
    search_fields = ["title", "description"]
    ordering_fields = ["due_date", "priority", "created_at", "order"]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).select_related("goal")

    def get_serializer_context(self):
        return {"request": self.request}

    @action(detail=False, methods=["get"])
    def board(self, request):
        """Returns tasks grouped by status column for the kanban view."""
        qs = self.get_queryset()
        columns = {}
        for choice_value, _label in Task.Status.choices:
            columns[choice_value] = TaskSerializer(
                qs.filter(status=choice_value), many=True, context={"request": request}
            ).data
        return Response(columns)

    @action(detail=False, methods=["post"])
    def reorder(self, request):
        """Accepts a list of {id, status, order} and persists drag-and-drop changes."""
        serializer = TaskReorderSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            for item in serializer.validated_data:
                Task.objects.filter(id=item["id"], user=request.user).update(
                    status=item["status"], order=item["order"]
                )
        return Response({"detail": "Order updated."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        total = qs.count()
        done = qs.filter(status=Task.Status.DONE).count()
        overdue = sum(1 for t in qs if t.is_overdue)
        by_status = qs.values("status").annotate(count=Count("id"))
        return Response({
            "total": total,
            "done": done,
            "pending": total - done,
            "overdue": overdue,
            "by_status": list(by_status),
        })
