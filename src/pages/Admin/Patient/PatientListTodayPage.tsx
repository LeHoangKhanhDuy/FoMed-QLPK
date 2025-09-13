import PatientListToday from "../../../component/Admin/Patient/PatientListToday";
import CSMLayout from "../../../layouts/CMSLayout";
import type { Patient } from "../../../types/doctor/doctor";

const MOCK_PATIENTS: Patient[] = [
  {
    id: 1,
    code: "BN0001",
    name: "Nguyễn Văn A",
    sex: "Nam",
    dob: "1990-05-12",
    visitTime: "08:30",
    status: "Chờ khám",
    service: "Khám Tổng quát",
  },
  {
    id: 2,
    code: "BN0002",
    name: "Trần Thị B",
    sex: "Nữ",
    dob: "1985-09-21",
    visitTime: "09:15",
    status: "Đã đặt",
    service: "Khám Tổng quát",
  },
  {
    id: 3,
    code: "BN0003",
    name: "Phạm Quốc C",
    sex: "Nam",
    dob: "1978-03-10",
    visitTime: "10:00",
    status: "Đã khám",
    service: "Khám Tổng quát",
  },
  {
    id: 4,
    code: "BN0004",
    name: "Lê Thu D",
    sex: "Nữ",
    dob: "2000-12-05",
    visitTime: "10:45",
    status: "Đã hủy",
    service: "Khám Tổng quát",
  },
  {
    id: 5,
    code: "BN0005",
    name: "Lê Minh K",
    sex: "Nam",
    dob: "2005-12-05",
    visitTime: "10:50",
    status: "Vắng mặt",
    service: "Khám Tổng quát",
  },
];

export const PatientListTodayAdminPage = () => {
  return (
    <CSMLayout>
      <PatientListToday items={MOCK_PATIENTS} />
    </CSMLayout>
  );
};
