import Link from "next/link";

function SearchIcon({ className = "" }) {
  return (
    <img
      src="/icons/search.svg"
      alt=""
      width={18}
      height={18}
      className={`opacity-70 transition-opacity duration-200 group-focus-within:opacity-100 ${className}`}
    />
  );
}

const shellClass =
  "group flex h-12 w-full items-center gap-2.5 rounded-2xl border border-[#e8eaf2] bg-[#f8f9fc] px-3 shadow-[0_1px_2px_rgba(9,14,35,0.04)] transition duration-200 focus-within:border-[#4566ec]/35 focus-within:bg-white focus-within:shadow-[0_4px_16px_rgba(69,102,236,0.1)] focus-within:ring-[3px] focus-within:ring-[#4566ec]/12 lg:h-11 lg:gap-3 lg:rounded-xl lg:px-3.5";

const iconTileClass =
  "flex size-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-[inset_0_0_0_1px_#ebedf3] lg:size-8";

const fieldClass =
  "min-w-0 flex-1 bg-transparent text-[14px] font-normal leading-5 text-[#090e23] outline-none placeholder:font-light placeholder:text-[#6e7180] lg:text-[13px]";

export default function SearchBar({
  value,
  onChange,
  href,
  autoFocus = false,
  placeholder = "Search for a task",
}) {
  if (href) {
    return (
      <Link
        href={href}
        aria-label="Search tasks"
        className={`${shellClass} text-left active:scale-[0.995] lg:hover:border-[#dde1ec] lg:hover:bg-white lg:hover:shadow-[0_6px_18px_rgba(9,14,35,0.06)]`}
      >
        <span className={iconTileClass}>
          <SearchIcon />
        </span>
        <span className={`${fieldClass} text-[#6e7180]`}>{placeholder}</span>
      </Link>
    );
  }

  const showClear = Boolean(value?.trim());

  return (
    <label className={shellClass}>
      <span className="sr-only">Search for a task</span>
      <span className={iconTileClass} aria-hidden="true">
        <SearchIcon />
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={fieldClass}
      />
      {showClear ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f2f7] text-[#6e7180] transition duration-150 active:scale-95 lg:hover:bg-[#e8ebf3]"
        >
          <img src="/icons/close.svg" alt="" width={14} height={14} className="rotate-45" />
        </button>
      ) : null}
    </label>
  );
}
