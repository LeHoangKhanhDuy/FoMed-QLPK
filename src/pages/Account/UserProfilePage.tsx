import UserInfo from "../../component/Account/UserInfo";
import UserLayout from "../../layouts/UserLayout";


export default function UserProfilePage() {
  return (
    <div>
      <UserLayout>
        <UserInfo user={null} />
      </UserLayout>
    </div>
  );
}
