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
import bvDHYD from "../../assets/images/bvDHYD.webp";
import bvMat from "../../assets/images/bvMat.webp";
import vnvc from "../../assets/images/vnvc.png";

type Service = {
  label: string;
  icon: string;
};

type Logo = { src: string; alt: string };

const services: Service[] = [
  { label: "Đặt lịch khám bệnh", icon: prescription },
  { label: "Đặt lịch xét nghiệm", icon: medical },
  { label: "Kê toa thuốc", icon: medicin },
  { label: "Đặt lịch tiêm chủng", icon: injection },
  { label: "Bệnh viên", icon: hospital },
  { label: "Phòng khám tư nhân", icon: clinic },
  { label: "Bác sĩ chuyên khoa", icon: doctor },
  { label: "Khám sức khỏe", icon: health },
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
    src: bvDHYD,
    alt: "Bệnh viện Đại học Y Dược",
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
  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-100 via-white to-white" />
      <div className="pointer-events-none absolute -z-10 inset-0 opacity-40">
        <div className="absolute w-72 h-72 bg-white/50 blur-3xl rounded-full -top-10 left-10" />
        <div className="absolute w-80 h-80 bg-sky-200/40 blur-3xl rounded-full top-20 right-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold text-slate-800 text-center leading-tight">
          FoMed kết nối Người dân với các Dịch vụ y tế tiên tiến
        </h1>

        {/* Search */}
        <div className="mt-6 max-w-3xl mx-auto">
          <Searchbar />
        </div>

        {/* Hospitals strip */}
        <div className="relative w-full overflow-hidden mt-14">
          <div className="relative mx-auto max-w-7xl overflow-hidden">
            {/* Fade edges (đổi màu mép theo nền của bạn: white/sky-100/...) */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
            />

            {/* Track chạy vô hạn */}
            <div className="marquee-track flex w-max animate-marquee">
              {[...logos, ...logos].map((logo, i) => (
                <img
                  key={i}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-16 mx-8 object-contain select-none"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-8 md:mt-20">
          {/* ≥ md: grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {services.map((s, i) => (
              <button
                key={i}
                className="w-full bg-white rounded-2xl p-4 md:p-5 shadow-md ring-1 ring-slate-100
                   hover:ring-sky-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
                aria-label={s.label}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sky-50 flex items-center justify-center ring-1 ring-sky-100">
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
  );
}
