import { useEffect, useState } from "react";
import DoctorCard, { type DoctorCardProps } from "../Card/DoctorCard";
import {
  apiGetRelatedDoctors,
  type RelatedDoctorDto,
} from "../../services/doctorMApi";
import { getFullAvatarUrl } from "../../Utils/avatarHelper";

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
    name: `${doctor.title ? doctor.title + " " : ""}${
      doctor.fullName || "Bác sĩ"
    }`,
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

    if (!doctorId) {
      // Không fetch nếu chưa biết bác sĩ hiện tại
      setRelatedDoctors([]);
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
        setRelatedDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [doctorId, doctors, limit]);

  // Quyết định nguồn dữ liệu: doctors prop > relatedDoctors state > MOCK
  const source =
    Array.isArray(doctors) && doctors.length > 0 ? doctors : relatedDoctors;

  const list = (
    currentDoctorName
      ? source.filter((d) => d.name !== currentDoctorName)
      : source
  ).slice(0, limit);

  const noDoctors = !loading && list.length === 0;

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

      {noDoctors ? (
        <p className="text-center text-sm text-slate-500">
          Không có bác sĩ nào cùng chuyên khoa
        </p>
      ) : (
        !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((doc, idx) => (
              <DoctorCard key={`${doc.detailHref}-${idx}`} {...doc} />
            ))}
          </div>
        )
      )}
    </section>
  );
}
