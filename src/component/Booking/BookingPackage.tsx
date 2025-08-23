import { useNavigate } from "react-router-dom";
import medicin from "../../assets/images/medicine.png";
import prescription from "../../assets/images/prescription.png";
import medical from "../../assets/images/medical.png";
import injection from "../../assets/images/injection.png";
import hospital from "../../assets/images/hospital.png";
import clinic from "../../assets/images/clinic.png";
import doctor from "../../assets/images/doctor.png";
import health from "../../assets/images/doctor-visit.png";

type PackageItem = {
  id: string;
  label: string;
  image: string;
  onClick?: () => void;
};

const PACKAGES: PackageItem[] = [
  {
    id: "kham-da-day-dai-trang",
    label: "Đặt khám dạ dày & đại tràng",
    image: medical,
  },
  {
    id: "noi-soi-da-day-khong-dau",
    label: "Nội soi dạ dày không đau",
    image: medicin,
  },
  {
    id: "noi-soi-dai-trang-khong-dau",
    label: "Nội soi đại tràng không đau",
    image: prescription,
  },
  {
    id: "noi-soi-da-day-dai-trang-khong-dau",
    label: "Nội soi dạ dày & đại tràng không đau",
    image: injection,
  },
  {
    id: "tam-soat-ung-thu-da-day",
    label: "Tầm soát ung thư dạ dày",
    image: hospital,
  },
  {
    id: "tam-soat-ung-thu-dai-trang",
    label: "Tầm soát ung thư đại tràng",
    image: clinic,
  },
  {
    id: "tam-soat-ung-thu-da-day-dai-trang",
    label: "Tầm soát ung thư dạ dày & đại tràng",
    image: doctor,
  },
  {
    id: "tieu-chung-viem-gan",
    label: "Tiêm ngừa viêm gan",
    image: health,
  },
  {
    id: "goi-xet-nghiem",
    label: "Gói xét nghiệm",
    image: medical,
  },
  {
    id: "dat-kham-ngoai-gio",
    label: "Đặt khám ngoài giờ",
    image: medicin,
  },
  {
    id: "dat-kham-theo-bac-si",
    label: "Đặt khám theo bác sĩ",
    image: health,
  },
  {
    id: "tu-van-chon-bac-si",
    label: "Tư vấn chọn bác sĩ",
    image: doctor,
  },
];

export default function BookingPackages({
  items = PACKAGES,
}: {
  items?: PackageItem[];
}) {
  const navigate = useNavigate();
  return (
    <section className="w-full">
      <div className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
        <h2 className="text-3xl md:text-5xl font-bold text-sky-400 text-center">
          Đặt gói khám bệnh
        </h2>

        {/* Grid 4 cột trên desktop */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate("/booking-doctor")}
              className="w-full bg-white rounded-xl p-3 md:p-5 shadow-md ring-1 ring-slate-100
                   hover:ring-sky-400 hover:shadow-lg transition-all duration-300 cursor-pointer text-left"
              aria-label={item.label}
            >
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-sky-100 flex items-center justify-center ring-1 ring-sky-100">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-7 h-7 md:w-8 md:h-8 object-contain"
                  />
                </div>
                <span className="text-left font-medium text-slate-900 leading-snug">
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
