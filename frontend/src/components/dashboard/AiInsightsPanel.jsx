import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import Card from "../common/Card";
import Spinner from "../common/Spinner";
import EmptyState from "../common/EmptyState";

export default function AiInsightsPanel({ recommendations, loading, source }) {
  return (
    <Card className="ai-panel">
      <div className="ai-panel-header">
        <h3 className="card-title">
          <Sparkles size={16} className="ai-panel-icon" /> AI Coach recommendations
        </h3>
        {source && (
          <span className="ai-source-tag">{source === "gemini" ? "Gemini" : "Rule engine"}</span>
        )}
      </div>

      {loading ? (
        <Spinner label="Analyzing your activity…" />
      ) : !recommendations || recommendations.length === 0 ? (
        <EmptyState title="No recommendations yet" message="Add a goal or task to get personalized guidance." />
      ) : (
        <ul className="insight-list">
          {recommendations.slice(0, 4).map((rec, i) => (
            <li key={i} className="insight-item">
              <span className="insight-bullet" />
              <div>
                <p className="insight-title">{rec.title}</p>
                <p className="insight-body">{rec.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Link to="/ai-coach" className="ai-panel-cta">
        Open AI Coach <ArrowRight size={14} />
      </Link>
    </Card>
  );
}
