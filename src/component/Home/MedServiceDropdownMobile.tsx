import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  Transition,
} from "@headlessui/react";
import { CalendarHeart, ChevronDownIcon } from "lucide-react";
import { Link } from "react-router-dom";

const helpItems = [
  { to: "/", label: "Đặt lịch khám bệnh" },
  { to: "/", label: "Đặt lịch xét nghiệm" },
  { to: "/", label: "Đặt lịch tiêm chủng" },
  { to: "/", label: "Mua thuốc theo toa" },
];

const MedServiceDropdownMobile = () => {
  return (
    <div>
      <Popover className="relative">
        <Disclosure as="div" className="-mx-3">
          <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base/7 font-semibold text-gray-900">
            <CalendarHeart className="w-8 h-8 mr-3 rounded-md bg-green-400 p-1.5 text-white" />
            Dịch vụ y tế
            <ChevronDownIcon
              aria-hidden="true"
              className="size-5 flex-none ml-auto transition-transform duration-500 group-data-[open]:rotate-180"
            />
          </DisclosureButton>

          {/* Smooth & slow dropdown */}
          <Transition
            enter="transition ease-out duration-500"
            enterFrom="opacity-0 -translate-y-2"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-500"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-2"
          >
            <DisclosurePanel className="mt-2 space-y-2 origin-top">
              {helpItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="flex items-center gap-x-3 rounded-lg py-2 pr-3 pl-6 text-md font-semibold text-gray-900 hover:bg-gray-50"
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

export default MedServiceDropdownMobile;
