import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DoctorCard from "../Card/DoctorCard";
import defaultDoctorImg from "../../assets/images/bacsi1.jpg";
import { apiGetPublicDoctors } from "../../services/doctorMApi";

interface DoctorDisplay {
  id: number;
  name: string;
  experience: string;
  specialty: string;
  rating: number;
  visitCount: number;
  logo: string;
  verified: boolean;
}

export default function DoctorClinic() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [doctors, setDoctors] = useState<DoctorDisplay[]>([]); // Changed to DoctorDisplay[]
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await apiGetPublicDoctors({
          page: 1,
          limit: 50,
        });
        const mappedDoctors: DoctorDisplay[] = res.items.map((doc) => ({
          id: doc.doctorId,
          name: doc.fullName || `BS #${doc.doctorId}`,
          experience: doc.experienceYears
            ? `+${doc.experienceYears} năm kinh nghiệm`
            : "+10 năm kinh nghiệm",
          specialty: doc.primarySpecialtyName || "Chuyên khoa tổng quát",
          rating: doc.ratingAvg || 4.5,
          visitCount: doc.visitCount || Math.floor(Math.random() * 200) + 50,
          logo: doc.avatarUrl || defaultDoctorImg,
          verified: doc.isActive,
        }));
        setDoctors(mappedDoctors);
      } catch (error) {
        console.error("Lỗi tải bác sĩ:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const scrollByOne = (dir: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el || doctors.length === 0) return;

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

  useEffect(() => {
    if (doctors.length === 0) return;

    const autoScroll = () => {
      const el = scrollerRef.current;
      if (!el || doctors.length === 0) return;

      const firstSnap = el.querySelector<HTMLElement>(".snap-start");
      if (!firstSnap) return;

      const GAP = 16;
      const cardWidth = firstSnap.offsetWidth + GAP;
      const maxScroll = el.scrollWidth - el.clientWidth;

      if (el.scrollLeft + cardWidth >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardWidth, behavior: "smooth" });
      }
    };

    const timer = setInterval(autoScroll, 3000);
    return () => clearInterval(timer);
  }, [doctors]);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({ left: 0, behavior: "auto" });
    }
  }, [doctors]);

  if (loading) {
    return (
      <div className="w-full">
        <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
          <header className="flex items-center justify-center gap-3 mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-shimmer" />
          </header>

          <div className="relative">
            <div className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-gray-200 animate-shimmer" />
            <div className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-gray-200 animate-shimmer" />

            <div className="flex overflow-x-auto gap-4 py-2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="snap-start shrink-0 basis-[calc((100%-16px))] lg:basis-[calc((100%-48px)/4)]"
                >
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col animate-pulse">
                    <div className="h-38 rounded-t-xl bg-gray-200" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 w-4/5 bg-gray-200 rounded" />
                      <div className="h-5 w-3/5 bg-gray-200 rounded" />
                      <div className="h-5 w-full bg-gray-200 rounded" />
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, j) => (
                          <div
                            key={j}
                            className="w-5 h-5 bg-gray-200 rounded-full"
                          />
                        ))}
                      </div>
                      <div className="h-10 w-full bg-sky-200 rounded-xl" />
                    </div>
                  </div>
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
            Bác sĩ hàng đầu
          </h2>
        </header>

        <div className="relative">
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

          <div
            ref={scrollerRef}
            className="flex overflow-x-auto gap-4 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2"
          >
            {doctors.length > 0 ? (
              doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="snap-start shrink-0 basis-[calc((100%-16px))] lg:basis-[calc((100%-48px)/4)]"
                >
                  <DoctorCard
                    name={doc.name}
                    experience={doc.experience}
                    specialty={doc.specialty}
                    rating={doc.rating}
                    visitCount={doc.visitCount}
                    logo={doc.logo}
                    verified={doc.verified}
                    onBook={() => console.log("Đặt khám với:", doc.name)}
                  />
                </div>
              ))
            ) : (
              <div className="w-full text-center py-8 text-gray-500">
                Không có bác sĩ nào.
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
