import EmptyState from "@/components/EmptyState";
import TaskRow from "@/components/TaskRow";
import WeekSummaryCards from "@/components/WeekSummaryCards";

function CardProgress({ completed, total }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2 text-[11px]">
        <span className="text-[#6e7180]">
          {completed} / {total} completed
        </span>
        <span className="font-medium text-[#090e23]">{percent}%</span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full border border-[#eaeaea] bg-[#f4f5f8]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-[#4566ec] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function WeekCard({
  week,
  selected,
  expanded,
  statusLabel,
  onSelect,
  onToggleStatus,
  onEdit,
  onAskDelete,
  onDeleteNow,
}) {
  const total = week.openCount + week.completedCount;

  return (
    <section
      className={`overflow-hidden rounded-2xl border bg-white shadow-[0_1px_2px_rgba(9,14,35,0.04)] transition-shadow ${
        selected
          ? "border-[#4566ec] ring-2 ring-[#4566ec]/25"
          : "border-[#eaeaea] lg:hover:shadow-[0_4px_14px_rgba(9,14,35,0.06)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(week.id)}
        aria-expanded={expanded}
        aria-current={selected ? "true" : undefined}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-semibold leading-5 text-[#090e23]">{week.label}</p>
            <p className="mt-1 text-[11px] font-medium text-[#4566ec]">{statusLabel}</p>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            aria-hidden="true"
            className={`mt-1 shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M3 6l5 5 5-5" fill="none" stroke="#4566ec" strokeWidth="1.5" />
          </svg>
        </div>
        <WeekSummaryCards
          completed={week.completedCount}
          pending={week.openCount}
          label={statusLabel}
          compact
          className="mt-3"
        />
        <CardProgress completed={week.completedCount} total={total} />
      </button>
      {expanded ? (
        <div className="border-t border-[#eaeaea] px-3 pb-1 pt-3 lg:hidden">
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
