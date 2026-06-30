import { useApi } from "../../hooks/useApi";
import { aiCoachApi } from "../../api/aiCoach";
import Card from "../common/Card";
import Spinner from "../common/Spinner";
import EmptyState from "../common/EmptyState";
import ProgressBar from "../common/ProgressBar";
import { TrendingUp } from "lucide-react";

function verdictTone(verdict = "") {
  const v = verdict.toLowerCase();
  if (v.includes("on track")) return "positive";
  if (v.includes("achievable")) return "accent";
  if (v.includes("risk") && v.includes("high")) return "danger";
  if (v.includes("risk")) return "warning";
  return "accent";
}

export default function GoalForecastCard() {
  const { data, loading } = useApi(() => aiCoachApi.goalForecast(), []);
  const forecast = data?.forecast || [];

  return (
    <Card>
      <h3 className="card-title">Goal completion forecast</h3>
      {loading ? (
        <Spinner label="Forecasting…" />
      ) : forecast.length === 0 ? (
        <EmptyState
          icon={<TrendingUp size={28} />}
          title="No goals to forecast"
          message="Goals with deadlines in the next 7 days, or overdue goals, will get a forecast here."
        />
      ) : (
        <ul className="forecast-list">
          {forecast.map((f, i) => {
            const tone = verdictTone(f.verdict);
            return (
              <li key={i} className="forecast-item">
                <div className="forecast-item-top">
                  <span className="forecast-title">{f.title}</span>
                  <span className="mono forecast-progress-label">{f.progress}%</span>
                </div>
                <ProgressBar value={f.progress} tone={tone === "positive" ? "positive" : tone === "danger" ? "danger" : "accent"} />
                <p className={`forecast-verdict forecast-verdict-${tone}`}>{f.verdict}</p>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
