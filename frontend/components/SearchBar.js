import Link from "next/link";

export default function SearchBar({
  value,
  onChange,
  href,
  autoFocus = false,
  placeholder = "Search for a task",
}) {
  const icon = <img src="/icons/search.svg" alt="" width={18} height={18} />;

  if (href) {
    return (
      <Link
        href={href}
        className="flex h-[47px] w-full items-center gap-3 rounded-[4px] border border-[#e6e6e6] bg-white px-4 text-left"
      >
        <span className="flex-1 text-[12px] font-light text-black/60">{placeholder}</span>
        {icon}
      </Link>
    );
  }

  return (
    <label className="flex h-[47px] w-full items-center gap-3 rounded-[4px] border border-[#e6e6e6] bg-white px-4">
      <span className="sr-only">Search for a task</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="min-w-0 flex-1 bg-transparent text-[12px] font-light text-[#090e23] outline-none placeholder:text-black/60"
      />
      {icon}
    </label>
  );
}
