import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ClinicCard from "../Card/ClinicCard";
import bv1 from "../../assets/images/bv115.webp";
import bv2 from "../../assets/images/bvChoRay.webp";
import bv3 from "../../assets/images/bvDHYD.webp";
import bv4 from "../../assets/images/bvMat.webp";
import bv5 from "../../assets/images/bvNhiDong1.webp";
import bv6 from "../../assets/images/bvQuanY175.webp";
import bv7 from "../../assets/images/bvTamAnh.png";
import bv8 from "../../assets/images/bvTuDu.png";
import bv9 from "../../assets/images/bvVinMec.png";

// Demo data
const CLINICS = [
  {
    id: 1,
    name: "Trung Tâm Nội Soi Tiêu Hoá Doctor Check",
    district: "Quận 10, TP.HCM",
    rating: 5,
    logo: bv1,
    verified: true,
  },
  {
    id: 2,
    name: "Bệnh viện Ung bướu Hưng Việt",
    district: "Hai Bà Trưng, Hà Nội",
    rating: 5,
    logo: bv2,
    verified: true,
  },
  {
    id: 3,
    name: "Phòng khám MedFit",
    district: "Quận 10, TP.HCM",
    rating: 5,
    logo: bv3,
    verified: false,
  },
  {
    id: 4,
    name: "Bệnh viện Đại học Y Dược TP.HCM",
    district: "Quận 5, TP.HCM",
    rating: 4.7,
    logo: bv4,
    verified: true,
  },
  {
    id: 5,
    name: "Bệnh viện Đa khoa Quốc tế City",
    district: "Bình Tân, TP.HCM",
    rating: 4.8,
    logo: bv5,
    verified: true,
  },
  {
    id: 6,
    name: "Bệnh viện Quân Y 175",
    district: "Bình Thạnh, TP.HCM",
    rating: 4.8,
    logo: bv6,
    verified: false,
  },
  {
    id: 7,
    name: "Bệnh viện Tâm Anh",
    district: "Quận 9, TP.HCM",
    rating: 4.8,
    logo: bv7,
    verified: true,
  },
  {
    id: 8,
    name: "Bệnh viện Từ Dũ",
    district: "Quận 1, TP.HCM",
    rating: 4.8,
    logo: bv8,
    verified: false,
  },
  {
    id: 9,
    name: "Bệnh viện Vinmec",
    district: "Bình Thạnh, TP.HCM",
    rating: 4.8,
    logo: bv9,
    verified: false,
  },
];

export default function FavoriteClinic() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;

    const firstSnap = el.querySelector<HTMLElement>(".snap-start");
    if (!firstSnap) return;

    const GAP = 16; // gap-4 = 16px
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

  // Auto scroll mỗi 3 giây
  useEffect(() => {
    const timer = setInterval(() => {
      scrollByOne("right");
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-white ">
      <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
        <header className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase">
            Cơ sở y tế hàng đầu
          </h2>
        </header>

        <div className="relative ">
          {/* Nút điều hướng */}
          <button
            aria-label="Trước"
            onClick={() => scrollByOne("left")}
            className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white hover:shadow-xs border border-gray-200 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronLeft />
          </button>
          <button
            aria-label="Sau"
            onClick={() => scrollByOne("right")}
            className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white hover:shadow-xs border border-gray-200 flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ChevronRight />
          </button>

          {/* Carousel giữ khoảng cách giữa các card */}
          <div
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2"
          >
            {CLINICS.map((c) => (
              <div
                key={c.id}
                className="snap-start shrink-0 basis-[calc((100%-16px))] lg:basis-[calc((100%-48px)/4)]"
              >
                <ClinicCard
                  name={c.name}
                  district={c.district}
                  rating={c.rating}
                  logo={c.logo}
                  verified={c.verified}
                  onBook={() => console.log("Đặt khám:", c.name)}
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
