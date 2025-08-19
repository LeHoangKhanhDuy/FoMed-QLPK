import { useRef, useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceClinicCard from "../Card/ServiceCard";
import khamtq from "../../assets/images/khamtongquat.jpg";

// Demo data dùng tạm cho cả 3 tab
const CLINICS = [
  {
    id: 1,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 2,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám sức khỏe tổng quát",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 3,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 4,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám sức khỏe tổng quát",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 5,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 6,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám sức khỏe tổng quát",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 7,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 8,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám sức khỏe tổng quát",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 9,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 10,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "GGói khám sức khoẻ tổng quát tại nhà",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 11,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám mắt tổng quát",
    price: "300.000 đ",
    logo: khamtq,
    verified: true,
  },
  {
    id: 12,
    name: "TS.BS NGUYỄN KIM CHUNG",
    services: "Gói khám sức khoẻ tổng quát tại nhà",
    price: "300.000  đ",
    logo: khamtq,
    verified: true,
  },
];

type TabKey = "goi" | "xetnghiem" | "tiemchung";

export default function ServiceClinic() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("goi");

  // Data theo tab (demo: chia tạm theo id)
  const data = useMemo(() => {
    switch (activeTab) {
      case "goi": // Gói khám bệnh
        return CLINICS.filter((x) => x.id % 3 === 1 || x.id % 3 === 0);
      case "xetnghiem": // Xét nghiệm
        return CLINICS.filter((x) => x.id % 3 === 2);
      case "tiemchung": // Tiêm chủng
        return CLINICS.filter((x) => x.id % 3 !== 2);
      default:
        return CLINICS;
    }
  }, [activeTab]);

  // Reset về đầu khi đổi tab
  useEffect(() => {
    if (scrollerRef.current)
      scrollerRef.current.scrollTo({ left: 0, behavior: "auto" });
  }, [activeTab]);

  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    const firstSnap = el.querySelector<HTMLElement>(".snap-start");
    if (!firstSnap) return;

    const GAP = 16; // gap-4
    const cardWidth = firstSnap.offsetWidth + GAP;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (dir === "right") {
      if (el.scrollLeft + cardWidth >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    } else {
      if (el.scrollLeft - cardWidth <= 2) {
        el.scrollTo({ left: maxScroll, behavior: "smooth" });
      } else {
        el.scrollBy({ left: -cardWidth, behavior: "smooth" });
      }
    }
  };

  // Auto scroll mỗi 3 giây (giữ như cũ)
  useEffect(() => {
    const timer = setInterval(() => {
      scrollByOne("right");
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white">
      <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
        <header className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase">
            Dịch vụ y tế hàng đầu
          </h2>
        </header>

        {/* Tabs category */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("goi")}
            className={[
              "px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer",
              activeTab === "goi"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50",
            ].join(" ")}
          >
            Khám bệnh
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("xetnghiem")}
            className={[
              "px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer",
              activeTab === "xetnghiem"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50",
            ].join(" ")}
          >
            Xét nghiệm
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tiemchung")}
            className={[
              "px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer",
              activeTab === "tiemchung"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50",
            ].join(" ")}
          >
            Tiêm chủng
          </button>
        </div>

        <div className="relative">
          {/* Nút điều hướng (ẩn mobile) */}
          <button
            aria-label="Trước"
            onClick={() => scrollByOne("left")}
            className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white hover:shadow-xs border border-gray-200 items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Sau"
            onClick={() => scrollByOne("right")}
            className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white hover:shadow-xs border border-gray-200 items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronRight />
          </button>

          {/* Carousel (giữ desktop format như cũ) */}
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2"
          >
            {data.map((c) => (
              <div
                key={c.id}
                className="snap-start shrink-0 basis-[calc((100%-16px))] lg:basis-[calc((100%-48px)/4)]"
              >
                <ServiceClinicCard
                  name={c.name}
                  services={c.services}
                  price={c.price}
                  logo={c.logo}
                  verified={c.verified}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center">
          <button className="rounded-[var(--rounded)] text-sky-400 hover:text-sky-500 text-md px-2 py-1 cursor-pointer">
            Xem thêm
          </button>
        </div>
      </section>
    </div>
  );
}
