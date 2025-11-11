
import { useEffect, useState, useCallback } from "react";
import CMSLayout from "../../../layouts/CMSLayout"; 
import type { AppointmentStatus } from "../../../types/appointment/appointment";
import type { BEAppointment } from "../../../services/appointmentsApi";
import { appointmentsList } from "../../../services/appointmentsApi";
import toast from "react-hot-toast";
import AppointmentList from "../../../component/Admin/Appointment/AppointmentList";

export default function AppointmentListPage() {
  const [items, setItems] = useState<BEAppointment[]>([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(
    async (date: string = today) => {
      setLoading(true);
      try {
        const res = await appointmentsList({
          date,
          page: 1,
          limit: 20,
        });
        setItems(res.items ?? []);
      } catch (e) {
        console.error(e);
        toast.error("Không tải được danh sách lịch hẹn.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [today]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Callback đổi trạng thái (nếu muốn chỉ local)
  const onSetStatus = (id: number, status: AppointmentStatus) => {
    setItems((lst) =>
      lst.map((it) => (it.appointmentId === id ? { ...it, status } : it))
    );
  };

  return (
    <CMSLayout>
      <div className="space-y-4">
        {loading && (
          <div className="text-sm text-slate-500">Đang tải danh sách…</div>
        )}
        <AppointmentList
          items={items}
          perPage={8}
          onSetStatus={onSetStatus}
          title="Danh sách chờ khám"
        />
      </div>
    </CMSLayout>
  );
}
