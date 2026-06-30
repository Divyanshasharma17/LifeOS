from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from . import engine
from .models import ChatMessage
from .serializers import ChatMessageSerializer, ChatRequestSerializer


class RecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        recommendations, source = engine.get_recommendations(request.user)
        return Response({"recommendations": recommendations, "source": source})


class DailySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary, source = engine.get_daily_summary(request.user)
        return Response({"summary": summary, "source": source})


class WeeklySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary, source = engine.get_weekly_summary(request.user)
        return Response({"summary": summary, "source": source})


class MonthlySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        summary, source = engine.get_monthly_summary(request.user)
        return Response({"summary": summary, "source": source})


class GoalForecastView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        forecast, source = engine.get_goal_forecast(request.user)
        return Response({"forecast": forecast, "source": source})


class ChatView(APIView):
    """Handles the AI Coach chatbot. GET returns history, POST sends a
    message and returns the assistant's reply, persisting both turns.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        messages = ChatMessage.objects.filter(user=request.user)[:200]
        return Response(ChatMessageSerializer(messages, many=True).data)

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question = serializer.validated_data["message"]

        ChatMessage.objects.create(user=request.user, role=ChatMessage.Role.USER, content=question)

        history = list(
            ChatMessage.objects.filter(user=request.user).order_by("-created_at")[:8]
            .values("role", "content")
        )[::-1]

        answer, source = engine.get_chat_answer(request.user, question, history)
        assistant_msg = ChatMessage.objects.create(
            user=request.user, role=ChatMessage.Role.ASSISTANT, content=answer
        )
        return Response(
            {"reply": ChatMessageSerializer(assistant_msg).data, "source": source},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request):
        ChatMessage.objects.filter(user=request.user).delete()
        return Response({"detail": "Chat history cleared."}, status=status.HTTP_204_NO_CONTENT)


class EngineStatusView(APIView):
    """Lets the frontend show whether Gemini or the rule-based engine is active."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"source": engine.get_engine_source()})
