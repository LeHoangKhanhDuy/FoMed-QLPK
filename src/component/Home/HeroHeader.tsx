import Searchbar from "../Search/Searchbar";
import medicin from "../../assets/images/medicine.png";
import prescription from "../../assets/images/prescription.png";
import medical from "../../assets/images/medical.png";
import injection from "../../assets/images/injection.png";
import hospital from "../../assets/images/hospital.png";
import clinic from "../../assets/images/clinic.png";
import doctor from "../../assets/images/doctor.png";
import health from "../../assets/images/doctor-visit.png";
import bv115 from "../../assets/images/bv115.webp";
import bvCR from "../../assets/images/bvChoRay.webp";
import bvND1 from "../../assets/images/bvNhiDong1.webp";
import bv175 from "../../assets/images/bvQuanY175.webp";
import bvTA from "../../assets/images/bvTamAnh.png";
import bvTD from "../../assets/images/bvTuDu.png";
import bvVM from "../../assets/images/bvVinMec.png";
import bvMat from "../../assets/images/bvMat.webp";
import vnvc from "../../assets/images/vnvc.png";
import { useState } from "react";
import { BriefcaseMedical, Calendar, HeartPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/auth";
import AuthModal from "../Auth/AuthModalProps";

type Service = {
  label: string;
  icon: string;
};

type Logo = { src: string; alt: string };

const services: Service[] = [
  { label: "Đặt lịch khám bệnh", icon: prescription },
  { label: "Đặt lịch xét nghiệm", icon: medical },
  { label: "Đặt lịch tiêm chủng", icon: injection },
  { label: "Khám bệnh nam khoa", icon: medicin },
  { label: "Khám bệnh phụ khoa", icon: hospital },
  { label: "Xét nghiệm sinh hóa", icon: clinic },
  { label: "Đặt lịch theo bác sĩ", icon: doctor },
  { label: "Khám sức khỏe xin việc", icon: health },
];

const logos: Logo[] = [
  {
    src: bv115,
    alt: "Bệnh viên 115",
  },
  {
    src: bvCR,
    alt: "Bệnh viện Chợ Rẫy",
  },
  {
    src: bvND1,
    alt: "Bệnh viện Nhi Đồng 1",
  },
  {
    src: bv175,
    alt: "Bệnh viện Quân Y 175",
  },
  {
    src: bvTA,
    alt: "Bệnh viện Đa Khoa Tâm Anh",
  },
  {
    src: bvTD,
    alt: "Bệnh viện Từ Dũ",
  },
  {
    src: bvVM,
    alt: "Bệnh viện Quốc tế VinMec",
  },
  {
    src: bvMat,
    alt: "Bệnh Viện Mắt",
  },
  {
    src: vnvc,
    alt: "Trung tâm tiêm chủng VNVC",
  },
];

export default function HeroHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoginOpen, setLoginOpen] = useState(false);

  const handleServiceClick = () => {
    const userInfo = localStorage.getItem("userInfo");
    const userToken = localStorage.getItem("userToken");

    if (!user || !userInfo || !userToken) {
      toast.error("Vui lòng đăng nhập để đặt lịch gói dịch vụ!");
      localStorage.setItem("redirectAfterLogin", "/booking-package");
      setLoginOpen(true);
      return;
    }

    navigate("/booking-package");
  };

  const handleLoginSuccess = () => {
    setLoginOpen(false);
    const redirectUrl = localStorage.getItem("redirectAfterLogin");
    if (redirectUrl) {
      navigate(redirectUrl);
      localStorage.removeItem("redirectAfterLogin");
    }
  };
  return (
    <>
      <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-200" />
      <div className="pointer-events-none absolute -z-10 inset-0 opacity-40">
        <div className="absolute w-72 h-72 bg-white/50 blur-3xl rounded-full -top-10 left-10" />
        <div className="absolute w-80 h-80 bg-sky-200/40 blur-3xl rounded-full top-20 right-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-sky-500 text-center leading-tight">
          FoMed – Sức khỏe hôm nay, niềm tin ngày mai
        </h1>

        {/* Search */}
        <div className="mt-6 max-w-3xl mx-auto z-20">
          <Searchbar />
          {/* Quick actions dưới Search */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {/* Đặt lịch hẹn */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2
                 shadow-sm ring-1 ring-slate-200 hover:ring-sky-300 focus:outline-none
                 transition cursor-pointer"
              aria-label="Đặt lịch hẹn"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sky-100">
                <Calendar className="h-4 w-4 text-sky-600" />
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Khám phá dịch vụ
              </span>
            </button>

            {/* Khám phá 40+ gói xét nghiệm */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2
                 shadow-sm ring-1 ring-slate-200 hover:ring-sky-300 focus:outline-none
                 transition cursor-pointer"
              aria-label="Khám phá gói xét nghiệm"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100">
                <BriefcaseMedical className="h-4 w-4 text-emerald-600" />
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Bác sĩ hàng đầu
              </span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2
                 shadow-sm ring-1 ring-slate-200 hover:ring-sky-300 focus:outline-none
                 transition cursor-pointer"
              onClick={() => navigate("/booking-doctor")}
              aria-label="Khám phá gói xét nghiệm"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-pink-100">
                <HeartPlus className="h-4 w-4 text-pink-600" />
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Hỏi đáp sức khỏe
              </span>
            </button>
          </div>
        </div>

        {/* Hospitals strip */}
        <div className="relative w-full overflow-hidden mt-14">
          <div className="mx-auto max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="marquee-rail flex w-max gap-8 transform-gpu animate-[marqueeX_30s_linear_infinite]">
              {[...logos, ...logos, ...logos].map((logo, i) => (
                <img
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 mx-2 object-contain select-none pointer-events-none"
                  loading="eager"
                  decoding="async"
                  draggable={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-8 md:mt-20">
          {/* ≥ md: grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4  ">
            {services.map((s, i) => (
              <button
                key={i}
                className="w-full bg-white rounded-xl p-2 md:p-3 shadow-sm ring-1 ring-slate-100
                   hover:ring-sky-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
                onClick={handleServiceClick}
                aria-label={s.label}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-sky-100 flex items-center justify-center ring-1 ring-sky-100">
                    <img
                      src={s.icon}
                      alt={s.label}
                      className="w-7 h-7 md:w-8 md:h-8 object-contain"
                    />
                  </div>
                  <div className="font-semibold text-slate-700 text-sm md:text-base">
                    {s.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      </section>
      <AuthModal
        isOpen={isLoginOpen}
        onClose={() => setLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />
    </>
  );
}
