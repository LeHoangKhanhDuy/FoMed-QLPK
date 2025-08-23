import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DoctorCard from "../Card/DoctorCard";
import bs1 from "../../assets/images/bacsi1.jpg";

// Demo data
const CLINICS = [
  {
    id: 1,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
  {
    id: 2,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
  {
    id: 3,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
  {
    id: 4,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
  {
    id: 5,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
  {
    id: 6,
    name: "TS.BS NGUYỄN KIM CHUNG",
    experience: "30 năm kinh nghiệm",
    specialty: "Ngoại Thần Kinh - Cột Sống",
    rating: 5,
    visitCount: 100,
    logo: bs1,
    verified: true,
  },
];

export default function DoctorClinic() {
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
    <div className="w-full">
      <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
        <header className="flex items-center justify-center gap-3 mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-black uppercase">
            Bác sĩ hàng đầu
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
                <DoctorCard
                  name={c.name}
                  experience={c.experience}
                  specialty={c.specialty}
                  rating={c.rating}
                  visitCount={c.visitCount}
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
