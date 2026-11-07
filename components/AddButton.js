export default function AddButton({ onClick }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20">
      <div className="mx-auto flex w-full max-w-[640px] justify-center pb-6">
        <button
          type="button"
          onClick={onClick}
          aria-label="Add task"
          className="pointer-events-auto flex size-[76px] items-center justify-center rounded-full bg-[#4566ec]"
        >
          <img src="/icons/plus.svg" alt="" width={21} height={21} />
        </button>
      </div>
    </div>
  );
}
