// src/pages/Account/UserPrescriptionDetailPage.tsx
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import UserLayout from "../../layouts/UserLayout";
import type { PrescriptionDetail } from "../../component/Account/PrescriptionDetail";
import PrescriptionDetails from "../../component/Account/PrescriptionDetail";


// Fake data (tối thiểu đủ field theo type)
const FAKE_DETAILS: PrescriptionDetail[] = [
  {
    id: 5534,
    rx_code: "DTFM-5534",
    issued_at: "2025/08/01 10:30",
    valid_until: "2025/09/01 23:59",
    status: "issued",
    record_code: "HSFM-ABCDEF",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Nội tổng quát",
    patient: {
      code: "BN000567",
      full_name: "Nguyễn Minh K",
      dob: "1995-04-12",
      sex: "M",
      diagnosis: "Cảm cúm",
      allergies: ["Penicillin"],
    },
    items: [
      {
        id: 1,
        drugName: "Paracetamol",
        strength: "500mg",
        form: "viên",
        route: "PO",
        dosageText: "1 viên x 3 lần/ngày",
        durationDays: 5,
        quantityPrescribed: 15,
        instructions: "Uống sau ăn, cách nhau ≥ 4 giờ.",
      },
    ],
    notes: "Uống nhiều nước, nghỉ ngơi.",
    warnings: ["Bệnh nhân dị ứng Penicillin – tránh nhóm beta-lactam."],
  },
  {
    id: 1234,
    rx_code: "DTFM-1234",
    issued_at: "2025/08/03 15:05",
    status: "dispensed",
    record_code: "HSFM-ABEREF",
    doctor_name: "TS.BS Nguyễn Văn A",
    service_name: "Gói khám tổng quát",
    department: "Hô hấp",
    patient: { full_name: "Lê Hoàng D", sex: "M", diagnosis: "Viêm họng cấp" },
    items: [
      {
        id: 1,
        drugName: "Azithromycin",
        strength: "500mg",
        form: "viên",
        route: "PO",
        dosageText: "1 viên/ngày",
        durationDays: 3,
        quantityPrescribed: 3,
        instructions: "Uống sau ăn, cách nhau ≥ 4 giờ.",
      },
    ],
    notes: "Uống nhiều nước, nghỉ ngơi.",
    warnings: ["Bệnh nhân dị ứng Penicillin – tránh nhóm beta-lactam."],
  },
];

export default function UserPrescriptionDetailPage() {
  const { rxId } = useParams<{ rxId: string }>();
  const navigate = useNavigate();

  const rx = useMemo(
    () =>
      FAKE_DETAILS.find((d) => String(d.id) === String(rxId)) ??
      FAKE_DETAILS[0],
    [rxId]
  );

  return (
    <UserLayout>
      <PrescriptionDetails
        rx={rx}
        onBack={() => navigate("/user/prescriptions")}
        onPrint={() => window.print()}
        onDownloadPdf={() => alert("Tải PDF (mock)")}
      />
    </UserLayout>
  );
}
