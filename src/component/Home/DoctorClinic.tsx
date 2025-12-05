import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // [MỚI] Import điều hướng

import DoctorCard from "../Card/DoctorCard";
import defaultDoctorImg from "../../assets/images/bacsi1.jpg";
import { apiGetPublicDoctors } from "../../services/doctorMApi";
import { getFullAvatarUrl } from "../../Utils/avatarHelper";

// [MỚI] Import AuthModal (Dùng đường dẫn tương tự như trong DoctorCard của bạn)
import AuthModal from "../Auth/AuthModalProps";

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
  const [doctors, setDoctors] = useState<DoctorDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  // [MỚI] State quản lý Modal Login và Hook điều hướng
  const navigate = useNavigate();
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [pendingDoctorId, setPendingDoctorId] = useState<number | null>(null);


  // --- Fetch Data ---
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);

        // Cache logic
        const cacheKey = "home_doctors_cache";
        const cacheTimeKey = "home_doctors_cache_time";
        const cached = sessionStorage.getItem(cacheKey);
        const cacheTime = sessionStorage.getItem(cacheTimeKey);

        const CACHE_DURATION = 5 * 60 * 1000; // 5 phút
        const now = Date.now();

        if (cached && cacheTime && now - parseInt(cacheTime) < CACHE_DURATION) {
          setDoctors(JSON.parse(cached));
          setLoading(false);
          return;
        }

        // Fetch API
        const res = await apiGetPublicDoctors({
          page: 1,
          limit: 16,
        });

        const mappedDoctors: DoctorDisplay[] = res.items.map((doc) => ({
          id: doc.doctorId,
          name: doc.fullName || `BS #${doc.doctorId}`,
          experience: doc.experienceYears
            ? `+${doc.experienceYears} năm kinh nghiệm`
            : "+10 năm kinh nghiệm",
          specialty: doc.primarySpecialtyName || "Chuyên khoa tổng quát",
          rating: doc.ratingAvg || 4.5,
          visitCount: doc.visitCount ?? 0,
          logo: doc.avatarUrl
            ? getFullAvatarUrl(doc.avatarUrl)
            : defaultDoctorImg,
          verified: true,
        }));

        setDoctors(mappedDoctors);

        sessionStorage.setItem(cacheKey, JSON.stringify(mappedDoctors));
        sessionStorage.setItem(cacheTimeKey, now.toString());
      } catch (error) {
        console.error("Lỗi tải bác sĩ:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // --- Scroll Logic ---
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

  // --- [MỚI] Logic Xử lý Đặt lịch ---
  const handleBooking = (doctor: DoctorDisplay) => {
    const token = localStorage.getItem("userToken");
    if (token && token !== "undefined" && token !== "null") {
      // ĐÃ LOGIN -> Chuyển hướng
      navigate(`/booking-service?doctorId=${doctor.id}`);
    } else {
      // CHƯA LOGIN -> Mở Modal
      setPendingDoctorId(doctor.id);
      setLoginOpen(true);
    }
  };

  // Callback khi login thành công (truyền vào AuthModal nếu hỗ trợ)
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    if (pendingDoctorId) {
      navigate(`/booking-service?doctorId=${pendingDoctorId}`);
      setPendingDoctorId(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <section className="mx-auto max-w-7xl px-4 xl:px-0 py-10 md:py-14">
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
                    id={doc.id}
                    name={doc.name}
                    experience={doc.experience}
                    specialty={doc.specialty}
                    rating={doc.rating}
                    visitCount={doc.visitCount}
                    logo={doc.logo}
                    verified={doc.verified}
                    // [QUAN TRỌNG] Truyền hàm handleBooking vào đây
                    onBook={() => handleBooking(doc)}
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
      </section>

      {/* [MỚI] Component Modal Login hiển thị khi isLoginOpen = true */}
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
