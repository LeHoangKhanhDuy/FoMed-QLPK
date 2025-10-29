import { useRef, useEffect, useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ServiceClinicCard from "../Card/ServiceCard";
import defaultImage from "../../assets/images/khamtongquat.jpg";
import type { ServiceItem } from "../../types/serviceType/service";
import { getService } from "../../services/service";
import SkeletonHomeService from "../../Utils/SkeletonHomeService";

type TabKey = "goi" | "xetnghiem" | "tiemchung";

interface ClinicDisplay {
  id: number;
  name: string;
  services: string;
  price: string;
  logo?: string;
  verified?: boolean;
}

export default function ServiceClinic() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>("goi");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ API với cache
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Kiểm tra cache trong sessionStorage (cache 5 phút)
        const cacheKey = 'home_services_cache';
        const cacheTimeKey = 'home_services_cache_time';
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(cacheTimeKey);
        
        const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
        const now = Date.now();
        
        if (cached && cacheTime && (now - parseInt(cacheTime)) < CACHE_DURATION) {
          // Dùng cache
          setServices(JSON.parse(cached));
          setLoading(false);
          return;
        }
        
        // Fetch từ API - giảm xuống 20 items (đủ cho carousel)
        const res = await getService({
          pageSize: 20,
          isActive: true,
        });
        
        setServices(res.data.items);
        
        // Lưu vào cache
        sessionStorage.setItem(cacheKey, JSON.stringify(res.data.items));
        sessionStorage.setItem(cacheTimeKey, now.toString());
      } catch (error) {
        console.error("Lỗi tải dịch vụ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Nhóm dịch vụ theo tab
  const data = useMemo(() => {
    if (loading || services.length === 0) return [];

    const normalize = (str: string) => str.toLowerCase().trim();

    const tabMap: Record<TabKey, (s: ServiceItem) => boolean> = {
      goi: (s) => {
        const cat = normalize(s.category?.name || "");
        const name = normalize(s.name);
        return (
          cat.includes("khám") ||
          cat.includes("gói") ||
          name.includes("khám") ||
          name.includes("tổng quát")
        );
      },
      xetnghiem: (s) => {
        const cat = normalize(s.category?.name || "");
        const name = normalize(s.name);
        return cat.includes("xét nghiệm") || name.includes("xét nghiệm");
      },
      tiemchung: (s) => {
        const cat = normalize(s.category?.name || "");
        const name = normalize(s.name);
        return (
          cat.includes("tiêm") ||
          cat.includes("chủng") ||
          name.includes("tiêm chủng")
        );
      },
    };

    const filtered = services.filter(tabMap[activeTab]);

    // Chuyển thành định dạng hiển thị
    return filtered.map(
      (s): ClinicDisplay => ({
        id: s.serviceId,
        name: s.category?.name || "Dịch vụ y tế",
        services: s.name,
        price:
          s.basePrice != null ? `${s.basePrice.toLocaleString()} đ` : "Liên hệ",
        logo: s.imageUrl || s.category?.imageUrl || defaultImage, 
        verified: s.isActive,
      })
    );
  }, [services, activeTab, loading]);

  // Reset scroll khi đổi tab
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [activeTab]);

  // Scroll tự động
  useEffect(() => {
    const timer = setInterval(() => {
      scrollByOne("right");
    }, 3000);
    return () => clearInterval(timer);
  }, [data]);

  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el || data.length === 0) return;

    const firstSnap = el.querySelector<HTMLElement>(".snap-start");
    if (!firstSnap) return;

    const GAP = 16;
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

  // Hiển thị loading
  if (loading) {
    return (
      <div className="w-full">
        <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
          <header className="flex items-center justify-center gap-3 mb-6">
            <div className="h-8 w-64 bg-gray-200 rounded animate-shimmer" />
          </header>

          {/* Tabs skeleton */}
          <div className="mb-4 flex items-center justify-center gap-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-10 w-28 bg-gray-200 rounded-[var(--rounded)] animate-shimmer"
              />
            ))}
          </div>

          <div className="relative">
            {/* Nút điều hướng */}
            <div className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-gray-200 animate-shimmer" />
            <div className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-gray-200 animate-shimmer" />

            {/* Carousel skeleton */}
            <div className="flex overflow-x-auto gap-4 py-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 basis-[calc((100%-16px))] lg:basis-[calc((100%-48px)/4)]"
                >
                  <SkeletonHomeService />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="h-6 w-24 bg-gray-200 rounded animate-shimmer" />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
        <header className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase">
            Dịch vụ y tế hàng đầu
          </h2>
        </header>

        {/* Tabs */}
        <div className="mb-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab("goi")}
            className={`px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer ${
              activeTab === "goi"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50"
            }`}
          >
            Khám bệnh
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("xetnghiem")}
            className={`px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer ${
              activeTab === "xetnghiem"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50"
            }`}
          >
            Xét nghiệm
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tiemchung")}
            className={`px-4 py-2 rounded-[var(--rounded)] text-sm font-semibold transition cursor-pointer ${
              activeTab === "tiemchung"
                ? "bg-sky-500 text-white shadow-[0_4px_10px_rgba(56,189,248,0.35)]"
                : "text-sky-500 bg-white ring-1 ring-sky-200 hover:bg-sky-50"
            }`}
          >
            Tiêm chủng
          </button>
        </div>

        <div className="relative">
          {/* Nút điều hướng */}
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

          {/* Carousel */}
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2"
          >
            {data.length > 0 ? (
              data.map((c) => (
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
                    linkTo={`/booking-doctor?serviceId=${c.id}`}
                    onBook={() => navigate(`/booking-doctor?serviceId=${c.id}`)}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-gray-500">
                Không có dịch vụ nào trong danh mục này.
              </div>
            )}
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
