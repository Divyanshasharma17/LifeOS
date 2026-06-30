import { useState } from "react";
import { useApi } from "../../hooks/useApi";
import { aiCoachApi } from "../../api/aiCoach";
import Card from "../common/Card";
import Spinner from "../common/Spinner";

const TABS = [
  { key: "daily", label: "Daily", fetcher: () => aiCoachApi.dailySummary() },
  { key: "weekly", label: "Weekly", fetcher: () => aiCoachApi.weeklySummary() },
  { key: "monthly", label: "Monthly", fetcher: () => aiCoachApi.monthlySummary() },
];

export default function SummaryTabs() {
  const [active, setActive] = useState("daily");
  const tab = TABS.find((t) => t.key === active);
  const { data, loading } = useApi(tab.fetcher, [active]);

  return (
    <Card>
      <div className="summary-tab-row">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`summary-tab ${active === t.key ? "summary-tab-active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {loading ? (
        <Spinner label="Generating summary…" />
      ) : (
        <p className="summary-text">{data?.summary}</p>
      )}
    </Card>
  );
}
