function CompleteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="#1f2f7a" strokeWidth="1.5" />
      <path d="M6.5 10.2l2.4 2.4 4.6-5.2" stroke="#1f2f7a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="#b4232c" strokeWidth="1.5" />
      <path d="M7 7l6 6M13 7l-6 6" stroke="#b4232c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SummaryCard({ title, count, label, icon, cardClass, tileClass, compact }) {
  if (compact) {
    return (
      <div className={`min-w-0 rounded-xl border p-3 ${cardClass}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tileClass}`}>{icon}</span>
          <span className="text-[26px] font-semibold leading-none tabular-nums text-[#090e23]">
            {String(count).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-2.5 truncate whitespace-nowrap text-[12px] font-medium text-[#090e23]">{title}</p>
      </div>
    );
  }

  return (
    <div className={`min-w-0 rounded-2xl border ${compact ? "p-3" : "p-4"} ${cardClass}`}>
      <div className={`flex items-center ${compact ? "gap-2" : "gap-2.5"}`}>
        <span
          className={`flex shrink-0 items-center justify-center rounded-lg ${compact ? "size-8" : "size-9"} ${tileClass}`}
        >
          {icon}
        </span>
        <p className="min-w-0 text-[13px] font-medium leading-4 text-[#090e23]">{title}</p>
      </div>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-1.5">
        <span
          className={`${compact ? "text-[28px]" : "text-[32px]"} font-semibold leading-none tabular-nums text-[#090e23]`}
        >
          {String(count).padStart(2, "0")}
        </span>
        <span className="text-[12px] text-[#6e7180]">{label}</span>
      </p>
    </div>
  );
}

export default function WeekSummaryCards({ completed, pending, label, compact = false, className = "" }) {
  return (
    <div className={`grid grid-cols-2 ${compact ? "gap-2.5" : "gap-3"} ${className}`}>
      <SummaryCard
        title="Task Complete"
        count={completed}
        label={label}
        icon={<CompleteIcon />}
        cardClass="border-[#e3e8ff] bg-[#eff2ff]"
        tileClass="bg-[#4566ec]/30"
        compact={compact}
      />
      <SummaryCard
        title="Task Pending"
        count={pending}
        label={label}
        icon={<PendingIcon />}
        cardClass="border-[#ffd6d8] bg-[#ffe6e7]"
        tileClass="bg-[#f2545b]/25"
        compact={compact}
      />
    </div>
  );
}
