const MESSAGE = "Free shipping on orders above ₹2499";

const PromoBar = () => {
  return (
    <div className="bg-black/5 dark:bg-black/40 border-b border-gray-200/20 dark:border-neutral-900/20 py-2 text-[10px] text-black dark:text-neutral-400 font-bold tracking-[0.2em] uppercase overflow-hidden relative select-none">
      <div className="animate-marquee whitespace-nowrap text-center">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="mx-3">
            {MESSAGE} <span className="ml-3 text-neutral-400 dark:text-neutral-600">•</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default PromoBar;
