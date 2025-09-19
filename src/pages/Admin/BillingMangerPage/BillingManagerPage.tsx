import BillingListManager from "../../../component/Admin/BillingManager/BillingListManager";
import CSMLayout from "../../../layouts/CMSLayout";

export const BillingManagerPage = () => {
  return (
    <div>
      <CSMLayout>
        <BillingListManager />
      </CSMLayout>
    </div>
  );
};
