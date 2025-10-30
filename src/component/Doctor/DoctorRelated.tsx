import { useEffect, useState } from "react";
import DoctorCard, { type DoctorCardProps } from "../Card/DoctorCard";
import { apiGetRelatedDoctors, type RelatedDoctorDto } from "../../services/doctorMApi";
import { getFullAvatarUrl } from "../../Utils/avatarHelper";

const MOCK_DOCTORS: DoctorCardProps[] = [
  {
    name: "BS.CKI Nguyễn Văn An",
    specialty: "Nội tổng quát",
    experience: "10+ năm kinh nghiệm",
    rating: 4.7,
    visitCount: 3200,
    logo: "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
    verified: true,
    detailHref: "/doctor/101",
    bookHref: "/booking?doctorId=101",
  },
  {
    name: "ThS.BS Trần Bích Hạnh",
    specialty: "Tim mạch",
    experience: "12+ năm kinh nghiệm",
    rating: 4.8,
    visitCount: 2800,
    logo: "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
    verified: true,
    detailHref: "/doctor/102",
    bookHref: "/booking?doctorId=102",
  },
  {
    name: "BS.CKI Lê Hoàng Duy",
    specialty: "Cơ xương khớp",
    experience: "8+ năm kinh nghiệm",
    rating: 4.6,
    visitCount: 2100,
    logo: "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
    verified: true,
    detailHref: "/doctor/103",
    bookHref: "/booking?doctorId=103",
  },
  {
    name: "BS Phạm Thu Hà",
    specialty: "Tai Mũi Họng",
    experience: "9+ năm kinh nghiệm",
    rating: 4.5,
    visitCount: 1900,
    logo: "https://medpro.vn/_next/image?url=https%3A%2F%2Fcdn.medpro.vn%2Fprod-partner%2F20af7575-df2e-4224-b40d-36055b476ba6-do-dang-khoa.webp&w=384&q=75",
    verified: true,
    detailHref: "/doctor/104",
    bookHref: "/booking?doctorId=104",
  },
];

type Props = {
  title?: string;
  doctorId?: number; // ID bác sĩ hiện tại để fetch related doctors
  doctors?: DoctorCardProps[]; // có thể không truyền
  currentDoctorName?: string;
  limit?: number;
  seeAllHref?: string;
  className?: string;
};

/**
 * Map RelatedDoctorDto từ API sang DoctorCardProps cho UI
 */
function mapRelatedDoctorToCard(doctor: RelatedDoctorDto): DoctorCardProps {
  return {
    id: doctor.doctorId,
    name: `${doctor.title ? doctor.title + " " : ""}${doctor.fullName || "Bác sĩ"}`,
    specialty: doctor.primarySpecialtyName || "Chuyên khoa tổng hợp",
    experience: doctor.experienceYears
      ? `${doctor.experienceYears}+ năm kinh nghiệm`
      : "Kinh nghiệm chuyên môn",
    rating: doctor.ratingAvg || 5.0,
    visitCount: doctor.ratingCount || 0,
    logo: getFullAvatarUrl(doctor.avatarUrl),
    verified: true,
    detailHref: `/user/doctor/${doctor.doctorId}`,
    bookHref: `/booking-service?doctorId=${doctor.doctorId}`,
  };
}

export default function DoctorRelated({
  title = "Bác sĩ cùng chuyên khoa",
  doctorId,
  doctors,
  currentDoctorName,
  limit = 8,
  className = "",
}: Props) {
  const [relatedDoctors, setRelatedDoctors] = useState<DoctorCardProps[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch related doctors từ API nếu có doctorId
  useEffect(() => {
    // Nếu đã có doctors từ props, không fetch
    if (doctors && doctors.length > 0) {
      return;
    }

    // Nếu không có doctorId, dùng MOCK
    if (!doctorId) {
      setRelatedDoctors(MOCK_DOCTORS);
      return;
    }

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const data = await apiGetRelatedDoctors(doctorId, limit);
        const mapped = data.map(mapRelatedDoctorToCard);
        setRelatedDoctors(mapped);
      } catch (error) {
        console.error("Error fetching related doctors:", error);
        // Fallback về MOCK nếu API fail
        setRelatedDoctors(MOCK_DOCTORS);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [doctorId, doctors, limit]);

  // Quyết định nguồn dữ liệu: doctors prop > relatedDoctors state > MOCK
  const source =
    Array.isArray(doctors) && doctors.length > 0
      ? doctors
      : relatedDoctors.length > 0
      ? relatedDoctors
      : MOCK_DOCTORS;

  const list = (
    currentDoctorName
      ? source.filter((d) => d.name !== currentDoctorName)
      : source
  ).slice(0, limit);

  // Không hiển thị section nếu không có bác sĩ nào
  if (!loading && list.length === 0) {
    return null;
  }

  return (
    <section className={`mt-10 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <h2 className="text-2xl font-bold text-sky-500 uppercase">{title}</h2>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-white rounded-xl border border-slate-200 p-4"
            >
              <div className="w-full h-48 bg-slate-200 rounded-lg mb-3" />
              <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Grid Card */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((doc, idx) => (
            <DoctorCard key={`${doc.detailHref}-${idx}`} {...doc} />
          ))}
        </div>
      )}
    </section>
  );
}
