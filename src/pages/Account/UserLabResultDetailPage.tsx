// pages/Account/UserLabResultDetailPage.tsx
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { LabResultDetails } from "../../component/Account/LabResultDetail";
import type { LabResultDetail } from "../../types/lab/lab";

const FAKE_DETAILS: LabResultDetail[] = [
  {
    id: 9001,
    result_code: "LR-0001",
    collected_at: "2025/08/01 09:10",
    reported_at: "2025/08/01 15:30",
    sample_type: "Huyết thanh",
    service_name: "Sinh hóa máu cơ bản",
    ordered_by: "TS.BS Nguyễn Văn A",
    status: "completed",
    patient: {
      code: "BN000567",
      full_name: "Nguyễn Minh K",
      dob: "1995-04-12",
      sex: "M",
    },
    items: [
      {
        id: 1,
        analyte: "Glucose",
        result: "6.4",
        unit: "mmol/L",
        refRange: "3.9 – 6.4",
        flag: "N",
      },
      {
        id: 2,
        analyte: "Urea",
        result: "7.2",
        unit: "mmol/L",
        refRange: "2.5 – 7.1",
        flag: "H",
        note: "Hơi tăng",
      },
      {
        id: 3,
        analyte: "Creatinine",
        result: "82",
        unit: "µmol/L",
        refRange: "62 – 106",
        flag: "N",
      },
    ],
    notes: "Nên xét nghiệm lại sau ăn 2 giờ để so sánh.",
    warnings: ["Nếu có triệu chứng bất thường, liên hệ bác sĩ."],
  },
  {
    id: 9003,
    result_code: "LR-0003",
    collected_at: "2025/08/06 08:40",
    reported_at: "2025/08/06 12:05",
    sample_type: "Máu toàn phần",
    service_name: "Huyết học tổng quát",
    status: "abnormal",
    patient: {
      code: "BN000789",
      full_name: "Lê Hoàng D",
      dob: "1992-11-03",
      sex: "M",
    },
    items: [
      {
        id: 1,
        analyte: "WBC",
        result: "12.1",
        unit: "10^9/L",
        refRange: "4.0 – 10.0",
        flag: "H",
      },
      {
        id: 2,
        analyte: "RBC",
        result: "4.6",
        unit: "10^12/L",
        refRange: "4.2 – 5.9",
        flag: "N",
      },
      {
        id: 3,
        analyte: "PLT",
        result: "170",
        unit: "10^9/L",
        refRange: "150 – 400",
        flag: "N",
      },
    ],
    warnings: ["Bạch cầu tăng: xem xét nhiễm trùng hoặc viêm cấp."],
  },
];

export default function UserLabResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const data = useMemo(
    () =>
      FAKE_DETAILS.find((d) => String(d.id) === String(resultId)) ??
      FAKE_DETAILS[0],
    [resultId]
  );

  return (
    <UserLayout>
      <div className="min-h-screen p-4 mx-auto max-w-screen-2xl">
        <LabResultDetails result={data} />
      </div>
    </UserLayout>
  );
}
