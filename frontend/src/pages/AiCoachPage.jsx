import { useApi } from "../hooks/useApi";
import { aiCoachApi } from "../api/aiCoach";
import ChatPanel from "../components/ai/ChatPanel";
import SummaryTabs from "../components/ai/SummaryTabs";
import GoalForecastCard from "../components/ai/GoalForecastCard";
import AiInsightsPanel from "../components/dashboard/AiInsightsPanel";

export default function AiCoachPage() {
  const { data: recData, loading: recLoading } = useApi(() => aiCoachApi.recommendations(), []);
  const { data: statusData } = useApi(() => aiCoachApi.status(), []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>AI Coach</h1>
          <p className="page-subtitle">
            Personalized insights from your real activity —{" "}
            {statusData?.source === "gemini" ? "powered by Gemini" : "running on the built-in rule-based engine"}.
          </p>
        </div>
      </div>

      <div className="ai-coach-grid">
        <div className="ai-coach-col-main">
          <ChatPanel />
        </div>
        <div className="ai-coach-col-side">
          <AiInsightsPanel recommendations={recData?.recommendations} loading={recLoading} source={recData?.source} />
          <SummaryTabs />
          <GoalForecastCard />
        </div>
      </div>
    </div>
  );
}
