import DoctorCard, { type DoctorCardProps } from "../Card/DoctorCard";

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
  doctors?: DoctorCardProps[]; // có thể không truyền
  currentDoctorName?: string;
  limit?: number;
  seeAllHref?: string;
  className?: string;
};

export default function DoctorRelated({
  title = "Bác sĩ cùng chuyên khoa",
  doctors,
  currentDoctorName,
  limit = 8,
  className = "",
}: Props) {
  // Luôn có dữ liệu: nếu rỗng thì dùng MOCK
  const source =
    Array.isArray(doctors) && doctors.length > 0 ? doctors : MOCK_DOCTORS;

  const list = (
    currentDoctorName
      ? source.filter((d) => d.name !== currentDoctorName)
      : source
  ).slice(0, limit);

  return (
    <section className={`mt-10 ${className}`}>
      {/* Header */}
      <div className="mb-6 flex items-center justify-center gap-3">
        <h2 className="text-2xl font-bold text-sky-500 uppercase">{title}</h2>
      </div>

      {/* Grid Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((doc, idx) => (
          <DoctorCard key={idx} {...doc} />
        ))}
      </div>
    </section>
  );
}
