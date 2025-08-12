import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  Transition,
} from "@headlessui/react";
import { ChevronDownIcon, MessageCircleQuestionMark } from "lucide-react";
import { Link } from "react-router-dom";

const helpItems = [
  { to: "/", label: "Hướng dẫn đặt lịch" },
  { to: "/", label: "Hướng dẫn kê toa thuốc" },
  { to: "/", label: "Hướng dẫn xem kết quả" },
  { to: "/", label: "Hướng dẫn xem hóa đơn" },
  { to: "/", label: "Hướng dẫn thanh toán" },
];
const HelpMedDropdownMobile = () => {
  return (
    <div>
      <Popover className="relative">
        <Disclosure as="div" className="-mx-3">
          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
            <MessageCircleQuestionMark className="w-8 h-8 mr-3 rounded-md bg-amber-400 p-1.5 text-white" />
            Hướng dẫn
            <ChevronDownIcon
              aria-hidden="true"
              className="size-5 flex-none ml-auto group-data-[open]:rotate-180 transition-transform duration-300"
            />
          </DisclosureButton>

          <Transition
            enter="transition ease-out duration-500"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-500"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="mt-2 space-y-2 ">
              {helpItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="flex items-center gap-x-3 rounded-lg py-2 pr-3 pl-6 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <span className="flex ml-7 text-md font-bold">
                    {item.label}
                  </span>
                </Link>
              ))}
            </DisclosurePanel>
          </Transition>
        </Disclosure>
      </Popover>
    </div>
  );
};

export default HelpMedDropdownMobile;
