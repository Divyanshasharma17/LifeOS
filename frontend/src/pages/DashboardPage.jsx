import { Target, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useApi } from "../hooks/useApi";
import { dashboardApi } from "../api/dashboard";
import { aiCoachApi } from "../api/aiCoach";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/dashboard/StatCard";
import DeadlinesList from "../components/dashboard/DeadlinesList";
import AiInsightsPanel from "../components/dashboard/AiInsightsPanel";
import RecentGoalsCard from "../components/dashboard/RecentGoalsCard";
import RecentTasksCard from "../components/dashboard/RecentTasksCard";
import Spinner from "../components/common/Spinner";

function greetingForHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading } = useApi(() => dashboardApi.overview(), []);
  const { data: aiData, loading: aiLoading } = useApi(() => aiCoachApi.recommendations(), []);

  if (loading) return <div className="page"><Spinner label="Loading your dashboard…" /></div>;

  const stats = data?.stats || {};

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{greetingForHour()}, {data?.greeting_name || user?.username}.</h1>
          <p className="page-subtitle">Here's where everything stands today.</p>
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 16 }}>
        <StatCard icon={<Target size={20} />} label="Active goals" value={stats.active_goals ?? 0} tone="accent" />
        <StatCard icon={<CheckCircle2 size={20} />} label="Tasks completed" value={stats.completed_tasks ?? 0} sublabel={`${stats.completed_tasks_today ?? 0} today`} tone="positive" />
        <StatCard icon={<Clock size={20} />} label="Pending tasks" value={stats.pending_tasks ?? 0} tone="teal" />
        <StatCard icon={<AlertTriangle size={20} />} label="Overdue items" value={(stats.overdue_goals ?? 0) + (stats.overdue_tasks ?? 0)} tone="danger" />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col-main">
          <AiInsightsPanel
            recommendations={aiData?.recommendations}
            loading={aiLoading}
            source={aiData?.source}
          />
          <div className="grid grid-cols-2">
            <RecentGoalsCard goals={data?.recent_goals} />
            <RecentTasksCard tasks={data?.recent_tasks} />
          </div>
        </div>
        <div className="dashboard-col-side">
          <DeadlinesList deadlines={data?.upcoming_deadlines} />
        </div>
      </div>
    </div>
  );
}
