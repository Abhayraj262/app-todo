import EmptyState from "@/components/EmptyState";
import TaskRow from "@/components/TaskRow";
import WeekSummaryCards from "@/components/WeekSummaryCards";

function CardProgress({ completed, total }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] text-[#6e7180]">
          {total === 0 ? "No tasks yet" : `${completed} of ${total} done`}
        </span>
        {total === 0 ? null : (
          <span className="rounded-full bg-[#f4f5f8] px-2 py-0.5 text-[11px] font-semibold tabular-nums text-[#090e23]">
            {percent}%
          </span>
        )}
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eef0f6]"
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
      className={`overflow-hidden rounded-2xl border bg-white transition duration-200 ${
        selected
          ? "border-[#4566ec] shadow-[0_6px_20px_rgba(69,102,236,0.12)] ring-4 ring-[#4566ec]/10"
          : "border-[#ebedf3] shadow-[0_1px_2px_rgba(9,14,35,0.04)] lg:hover:-translate-y-0.5 lg:hover:border-[#dde1ec] lg:hover:shadow-[0_8px_22px_rgba(9,14,35,0.07)]"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(week.id)}
        aria-expanded={expanded}
        aria-current={selected ? "true" : undefined}
        className="w-full p-4 text-left lg:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold leading-6 text-[#090e23]">{week.label}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-[#eff2ff] px-2 py-0.5 text-[11px] font-medium text-[#4566ec]">
              {statusLabel}
            </span>
          </div>
          <span
            className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
              selected ? "bg-[#4566ec]" : "bg-[#f4f5f8]"
            }`}
            aria-hidden="true"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path
                d="M3 6l5 5 5-5"
                fill="none"
                stroke={selected ? "#ffffff" : "#4566ec"}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        <WeekSummaryCards
          completed={week.completedCount}
          pending={week.openCount}
          label={statusLabel}
          compact
          className="mt-4"
        />
        <CardProgress completed={week.completedCount} total={total} />
      </button>
      {expanded ? (
        <div className="border-t border-[#ebedf3] bg-[#fafbfe] px-3 pb-1 pt-3 lg:hidden">
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
