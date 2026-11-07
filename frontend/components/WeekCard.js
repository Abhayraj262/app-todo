import EmptyState from "@/components/EmptyState";
import TaskRow from "@/components/TaskRow";

function CountTile({ label, count, className }) {
  return (
    <div className={`px-3 py-3 ${className}`}>
      <p className="text-[12px] text-[#090e23]">{label}</p>
      <p className="text-[22px] font-semibold text-[#090e23]">{String(count).padStart(2, "0")}</p>
    </div>
  );
}

export default function WeekCard({
  week,
  expanded,
  onToggle,
  onToggleStatus,
  onEdit,
  onAskDelete,
  onDeleteNow,
}) {
  return (
    <section className="border border-[#e6e6e6] bg-white">
      <button
        type="button"
        onClick={() => onToggle(week.id)}
        aria-expanded={expanded}
        className="w-full px-4 py-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[18px] font-semibold text-[#090e23]">{week.label}</p>
            {week.isCurrent ? <p className="text-[10px] text-[#6e7180]">This week</p> : null}
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`mt-1 shrink-0 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M3 6l5 5 5-5" fill="none" stroke="#4566ec" strokeWidth="1.5" />
          </svg>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <CountTile label="Open" count={week.openCount} className="bg-[#ffe6e7]" />
          <CountTile label="Completed" count={week.completedCount} className="bg-[#eff2ff]" />
        </div>
      </button>
      {expanded ? (
        <div className="px-4 pb-2">
          {week.tasks.length === 0 ? (
            <EmptyState message="No tasks this week." />
          ) : (
            week.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={onToggleStatus}
                onEdit={onEdit}
                onAskDelete={onAskDelete}
                onDeleteNow={onDeleteNow}
              />
            ))
          )}
        </div>
      ) : null}
    </section>
  );
}
