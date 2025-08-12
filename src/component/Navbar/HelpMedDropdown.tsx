import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { ChevronDownIcon, MessageCircleQuestionMark } from "lucide-react";
import { useState, useRef } from "react";

const helpItems = [
  { to: "/", label: "Hướng dẫn đặt lịch" },
  { to: "/", label: "Hướng dẫn kê toa thuốc" },
  { to: "/", label: "Hướng dẫn xem kết quả" },
  { to: "/", label: "Hướng dẫn xem hóa đơn" },
  { to: "/", label: "Hướng dẫn thanh toán" },
];

const HelpMedDropdownMenu = () => {
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
        <MessageCircleQuestionMark className="w-5 h-5" />
       Hướng dẫn sử dụng
        <ChevronDownIcon
          className="size-5 flex-none transform transition-transform duration-300 group-hover:rotate-180"
          aria-hidden="true"
        />
      </PopoverButton>

      <PopoverPanel
        static
        className={`absolute top-4 left-0 z-10 mt-3 w-52 max-w-md rounded-md bg-white shadow-lg ring-1 ring-gray-100 transition-opacity duration-200 ${
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

export default HelpMedDropdownMenu;
