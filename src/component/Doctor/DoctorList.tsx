import type { FC } from "react";
import { useNavigate } from "react-router-dom";

interface Doctor {
  id: number;
  name: string;
  title: string;
  specialty: string;
  experience: string;
  education: string;
  image: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  onSelect?: (doctorId: number) => void;
}

const DoctorList: FC<DoctorListProps> = ({ doctors }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doc) => (
        <div
          key={doc.id}
          className="bg-white border rounded-xl shadow hover:shadow-md transition p-5 flex flex-col items-center text-center cursor-pointer"
        >
          <img
            src={doc.image}
            alt={doc.name}
            className="w-28 h-28 rounded-full object-cover mb-4"
          />
          <h3 className="font-semibold text-xl">{doc.name}</h3>
          <p className="text-sky-500 text-lg font-medium">{doc.title}</p>
          <p>+{doc.specialty}</p>
          <p className="text-sm text-gray-500 mt-1">{doc.experience}</p>
          <p className="text-sm text-gray-500">{doc.education}</p>

          <div className="flex gap-3 mt-4">
            <button className="px-4 py-2 border border-sky-500 text-sky-500 rounded-[var(--rounded)] hover:bg-sky-50 cursor-pointer">
              Xem chi tiết
            </button>
            <button
              onClick={() =>
                navigate(`/booking/select-service`, {
                  state: { doctor: doc }, // có thể tận dụng để khỏi fetch lần 1
                })
              }
              className="px-4 py-2 bg-primary-linear text-white rounded-[var(--rounded)] cursor-pointer"
            >
              Đặt lịch khám
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DoctorList;
