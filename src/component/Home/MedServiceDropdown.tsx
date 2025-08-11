import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { CalendarHeart, ChevronDownIcon } from "lucide-react";
import { useState, useRef } from "react";

const helpItems = [
  { to: "/", label: "Đặt lịch khám bệnh" },
  { to: "/", label: "Đặt lịch xét nghiệm" },
  { to: "/", label: "Đặt lịch tiêm chủng" },
  { to: "/", label: "Mua thuốc theo toa" },
];

const MedServiceDropdownMenu = () => {
  const [isHovered, setIsHovered] = useState(false);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutIdRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200); // Delay 200ms trước khi đóng
  };

  return (
    <Popover
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PopoverButton className="group flex items-center gap-x-1 text-sm hover:text-[var(--hover)] text-black cursor-pointer">
        <CalendarHeart className="w-4 h-4" />
        Dịch vụ y tế
        <ChevronDownIcon
          className="size-5 flex-none transform transition-transform duration-300 group-hover:rotate-180"
          aria-hidden="true"
        />
      </PopoverButton>

      <PopoverPanel
        static
        className={`absolute top-4 left-0 z-10 mt-3 w-42 max-w-md rounded-md bg-white shadow-lg ring-1 ring-gray-100 transition-opacity duration-200 ${
          isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="py-2">
          {helpItems.map((item, index) => (
            <a
              target="_blank"
              key={index}
              href={item.to}
              className="group flex w-full items-center gap-2 font-semibold px-4 py-2 hover:bg-gray-100 hover:text-[var(--hover)] transition-colors duration-300"
            >
              {item.label}
            </a>
          ))}
        </div>
      </PopoverPanel>
    </Popover>
  );
};

export default MedServiceDropdownMenu;
