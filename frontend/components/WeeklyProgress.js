export default function WeeklyProgress({ completed, total }) {
  const percent = total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="mt-4 rounded-2xl border border-[#eaeaea] bg-white p-3">
      <p className="text-[12px] font-medium text-[#090e23]">Weekly progress</p>
      <div className="mt-2 flex items-baseline justify-between gap-2">
        <p className="text-[13px] text-[#6e7180]">
          {completed} / {total} tasks completed
        </p>
        <p className="shrink-0 text-[13px] font-medium text-[#090e23]">{percent}%</p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full border border-[#eaeaea] bg-[#f4f5f8]"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Weekly progress ${percent} percent`}
      >
        <div
          className="h-full rounded-full bg-[#4566ec] transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
