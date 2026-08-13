import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const CustomDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  disabled = false,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Normalize options to objects { value, label }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return opt;
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val) => {
    if (disabled) return;
    onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-neutral-900 rounded-xl hover:border-gray-300 dark:hover:border-neutral-800 focus:outline-none transition-all ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 dark:text-zinc-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div
          className="absolute right-0 left-0 z-50 mt-2 py-1.5 bg-white dark:bg-zinc-950 border border-gray-100 dark:border-neutral-900 rounded-2xl shadow-2xl max-h-60 overflow-y-auto animate-[fadeIn_0.15s_ease-out]"
          style={{ transformOrigin: "top" }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs sm:text-sm font-semibold transition-colors ${
                  isSelected
                    ? "bg-gray-100 dark:bg-zinc-900 text-black dark:text-white"
                    : "text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-zinc-900/50 hover:text-black dark:hover:text-white"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check size={14} className="text-gray-900 dark:text-white shrink-0 ml-2" />
                )}
              </button>
            );
          })}
          {normalizedOptions.length === 0 && (
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 dark:text-zinc-600 text-center">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
