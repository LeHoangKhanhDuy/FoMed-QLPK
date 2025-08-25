import { MedicalHistory } from "../../component/Account/MedicalHistory";
import UserLayout from "../../layouts/UserLayout";

export default function UserMedicalHistoryPage() {
  return (
    <div>
      <UserLayout>
        <MedicalHistory />
      </UserLayout>
    </div>
  );
}
