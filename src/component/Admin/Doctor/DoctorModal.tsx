import { useEffect, useMemo, useRef, useState } from "react";
import { Save, X, Upload, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { SelectMenu, type SelectOption } from "../../ui/select-menu";
import { AxiosError } from "axios";
import {
  apiGetAvailableUsers,
  apiGetDoctorDetail,
  apiUploadCommonFile, // <--- Dùng hàm upload chung mới
} from "../../../services/doctorMApi";
import type {
  AvailableUser,
  CreateDoctorPayload,
  DoctorItem,
  UpdateDoctorPayload,
  DoctorEducation,
  DoctorExpertise,
  DoctorAchievement,
} from "../../../types/doctor/doctor";
import type { SpecialtyItem } from "../../../types/specialty/specialtyType";
import { apiGetPublicSpecialties } from "../../../services/specialtyApi";
import { getFullAvatarUrl } from "../../../Utils/avatarHelper";
import ConfirmModal from "../../../common/ConfirmModal";

// ===================== PROPS =====================
type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<DoctorItem>;
  onSubmit: (
    payload: CreateDoctorPayload | UpdateDoctorPayload
  ) => Promise<void>;
};

// ===================== COMPONENT =====================
export default function DoctorModal({
  open,
  onClose,
  initial,
  onSubmit,
}: Props) {
  const isEditing = !!initial?.doctorId;

  // Form State
  const [form, setForm] = useState<CreateDoctorPayload & UpdateDoctorPayload>({
    userId: initial?.userId ?? 0,
    title: initial?.title ?? null,
    primarySpecialtyId: null,
    licenseNo: initial?.licenseNo ?? null,
    roomName: initial?.roomName ?? null,
    experienceYears: initial?.experienceYears ?? null,
    experienceNote: null,
    intro: null,
    isActive: initial?.isActive ?? true,
    educations: [],
    expertises: [],
    achievements: [],
  });

  // Avatar state (Chỉ lưu URL chuỗi, không lưu File blob nữa)
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [initialAvatarUrl, setInitialAvatarUrl] = useState<string>(""); // Track giá trị ban đầu
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States cho dynamic lists
  const [educations, setEducations] = useState<DoctorEducation[]>([]);
  const [expertises, setExpertises] = useState<DoctorExpertise[]>([]);
  const [achievements, setAchievements] = useState<DoctorAchievement[]>([]);

  // Confirm delete item state
  const [confirmDelete, setConfirmDelete] = useState<{
    type: "education" | "expertise" | "achievement" | null;
    index: number | null;
  }>({ type: null, index: null });

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Danh sách Users & Specialties
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [specialties, setSpecialties] = useState<SpecialtyItem[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      // Reset các state
      setEducations([]);
      setExpertises([]);
      setAchievements([]);
      setErr(null);
      setAvatarUrl("");
      setInitialAvatarUrl("");

      // Load Specialties
      setLoadingSpecialties(true);
      const specialtiesList = await apiGetPublicSpecialties().catch(
        () => [] as SpecialtyItem[]
      );
      setSpecialties(specialtiesList);
      setLoadingSpecialties(false);

      // Load Available Users (chỉ khi tạo mới)
      if (!isEditing) {
        setLoadingUsers(true);
        const users = await apiGetAvailableUsers().catch(
          () => [] as AvailableUser[]
        );
        setAvailableUsers(users);
        setLoadingUsers(false);

        // Reset form cho tạo mới
        setForm({
          userId: 0,
          title: null,
          primarySpecialtyId: null,
          licenseNo: null,
          roomName: null,
          experienceYears: null,
          experienceNote: null,
          intro: null,
          isActive: true,
          educations: [],
          expertises: [],
          achievements: [],
        });
        return;
      }

      // Nếu đang edit: Fetch doctor detail
      if (isEditing && initial?.doctorId) {
        try {
          const detail = await apiGetDoctorDetail(initial.doctorId);

          // Tìm primarySpecialtyId từ name (hoặc logic mapping khác tùy BE trả về)
          const matchedSpecialty = specialtiesList.find(
            (s) => s.name === detail.primarySpecialtyName
          );

          setForm({
            userId: initial.userId ?? 0,
            title: detail.title,
            primarySpecialtyId: matchedSpecialty?.specialtyId ?? null,
            licenseNo: detail.licenseNo,
            roomName: detail.roomName,
            experienceYears: detail.experienceYears,
            experienceNote: detail.experienceNote,
            intro: detail.intro,
            isActive: initial.isActive ?? true,
            educations: [],
            expertises: [],
            achievements: [],
          });

          // Load dynamic lists
          setEducations(detail.educations || []);
          setExpertises(detail.expertises || []);
          setAchievements(detail.achievements || []);

          // Load avatar URL (String) - track cả giá trị ban đầu
          const initialAvatar = detail.avatarUrl || "";
          setAvatarUrl(initialAvatar);
          setInitialAvatarUrl(initialAvatar);
        } catch (error) {
          console.error("Error loading doctor detail:", error);
          toast.error("Không thể tải thông tin bác sĩ");
        }
      }
    };

    loadData();
  }, [open, isEditing, initial?.doctorId]);

  // Options
  const userOptions: SelectOption<number>[] = useMemo(
    () =>
      availableUsers.map((u) => ({
        value: u.userId,
        label: `${u.fullName} (${u.email || u.phone || "No contact"})`,
      })),
    [availableUsers]
  );

  const specialtyOptions: SelectOption<number>[] = useMemo(
    () =>
      specialties.map((s) => ({
        value: s.specialtyId,
        label: s.name,
      })),
    [specialties]
  );

  const ctrl =
    "mt-1 block w-full rounded-[var(--rounded)] border bg-white/90 px-4 py-3 text-[16px] leading-6 shadow-xs outline-none focus:ring-2 focus:ring-sky-500";

  // =================== DYNAMIC LIST HANDLERS (Giữ nguyên) ===================
  const addEducation = () =>
    setEducations([
      ...educations,
      { yearFrom: null, yearTo: null, title: "", detail: null },
    ]);
  const askRemoveEducation = (index: number) =>
    setConfirmDelete({ type: "education", index });
  const updateEducation = <K extends keyof DoctorEducation>(
    index: number,
    field: K,
    value: DoctorEducation[K]
  ) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const addExpertise = () => setExpertises([...expertises, { content: "" }]);
  const askRemoveExpertise = (index: number) =>
    setConfirmDelete({ type: "expertise", index });
  const updateExpertise = (index: number, value: string) => {
    const updated = [...expertises];
    updated[index] = { content: value };
    setExpertises(updated);
  };

  const addAchievement = () =>
    setAchievements([...achievements, { yearLabel: null, content: "" }]);
  const askRemoveAchievement = (index: number) =>
    setConfirmDelete({ type: "achievement", index });
  const updateAchievement = <K extends keyof DoctorAchievement>(
    index: number,
    field: K,
    value: DoctorAchievement[K]
  ) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const confirmDeleteItem = () => {
    if (confirmDelete.type === "education" && confirmDelete.index !== null) {
      setEducations(educations.filter((_, i) => i !== confirmDelete.index));
    } else if (
      confirmDelete.type === "expertise" &&
      confirmDelete.index !== null
    ) {
      setExpertises(expertises.filter((_, i) => i !== confirmDelete.index));
    } else if (
      confirmDelete.type === "achievement" &&
      confirmDelete.index !== null
    ) {
      setAchievements(achievements.filter((_, i) => i !== confirmDelete.index));
    }
    setConfirmDelete({ type: null, index: null });
  };

  // =================== AVATAR UPLOAD HANDLERS (LOGIC MỚI) ===================

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      return toast.error("Vui lòng chọn file ảnh");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Ảnh tối đa 5MB");
    }

    setUploadingAvatar(true);
    try {
      // 1. Upload lên Server lấy URL (Dùng API chung giống Service)
      const url = await apiUploadCommonFile(file);

      // 2. Lưu URL vào state (chưa lưu DB)
      setAvatarUrl(url);

      toast.success("Đã tải ảnh lên. Nhấn 'Lưu' để cập nhật.");
    } catch {
      toast.error("Lỗi khi tải ảnh lên server");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleBrowseFile = () => fileInputRef.current?.click();

  const handleClearAvatar = () => {
    // Chỉ xóa URL trong state, khi Submit mới lưu vào DB
    setAvatarUrl("");
    toast.success("Đã gỡ ảnh. Nhấn 'Lưu' để áp dụng.");
  };

  // =================== SUBMIT HANDLER ===================
  const submit = async () => {
    // Basic Validation
    if (!isEditing && (!form.userId || form.userId <= 0))
      return setErr("Vui lòng chọn User");
    if (form.title && form.title.length > 50) return setErr("Học hàm quá dài");
    // ... (Giữ các validation cũ) ...

    setLoading(true);
    try {
      const payload: CreateDoctorPayload | UpdateDoctorPayload = {
        ...(isEditing ? {} : { userId: form.userId }),
        title: form.title?.trim() || null,
        primarySpecialtyId: form.primarySpecialtyId || null,
        licenseNo: form.licenseNo?.trim() || null,
        roomName: form.roomName?.trim() || null,
        experienceYears: form.experienceYears,
        experienceNote: form.experienceNote?.trim() || null,
        intro: form.intro?.trim() || null,

        // Gửi avatarUrl nếu có thay đổi (kể cả empty string để xóa)
        // Khi create: luôn gửi nếu có giá trị
        // Khi update: chỉ gửi nếu khác với giá trị ban đầu
        ...(isEditing
          ? avatarUrl !== initialAvatarUrl
            ? { avatarUrl: avatarUrl || "" }
            : {}
          : avatarUrl
          ? { avatarUrl: avatarUrl }
          : {}),

        educations: educations,
        expertises: expertises,
        achievements: achievements,
        ...(isEditing ? { isActive: form.isActive } : {}),
      };

      await onSubmit(payload);
      onClose();
    } catch (e) {
      const error = e as AxiosError<{ message?: string }>;
      const message =
        error.response?.data?.message ||
        (error.isAxiosError ? error.message : (e as Error).message) ||
        "Lỗi khi lưu";
      setErr(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-5xl mx-3 sm:mx-0 bg-white rounded-xl shadow-2xl p-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 border-b pb-3">
          <h3 className="font-bold text-xl uppercase text-slate-700">
            {isEditing ? "Cập nhật hồ sơ bác sĩ" : "Thêm bác sĩ mới"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {err && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {err}
          </div>
        )}

        <div className="space-y-6">
          {/* ============ THÔNG TIN CƠ BẢN ============ */}
          <div className="border rounded-lg p-5 bg-slate-50/50">
            <h4 className="font-bold text-lg mb-4 text-sky-600 flex items-center gap-2">
              <span className="w-1 h-6 bg-sky-500 rounded-full"></span>
              Thông tin chung
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
              {/* CỘT TRÁI: AVATAR */}
              <div className="sm:col-span-3 flex flex-col items-center gap-3">
                <div className="relative group">
                  <img
                    src={getFullAvatarUrl(avatarUrl)}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md group-hover:shadow-lg transition-all"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleBrowseFile}
                    disabled={uploadingAvatar}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />{" "}
                    {uploadingAvatar ? "Đang tải..." : "Đổi ảnh"}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleClearAvatar}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <p className="text-[10px] text-slate-400 text-center">
                  Max 5MB. JPG/PNG.
                </p>
              </div>

              {/* CỘT PHẢI: FORM FIELDS */}
              <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chọn User (Chỉ hiện khi tạo mới) */}
                {!isEditing && (
                  <div className="sm:col-span-2">
                    <SelectMenu<number>
                      label="Chọn User (Role DOCTOR)"
                      required
                      value={form.userId || ""}
                      options={userOptions}
                      placeholder={
                        loadingUsers ? "Đang tải..." : "Tìm kiếm user..."
                      }
                      onChange={(v) =>
                        setForm({ ...form, userId: v === "" ? 0 : Number(v) })
                      }
                    />
                  </div>
                )}

                {/* Học hàm */}
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Học hàm / Danh xưng <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={form.title ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className={ctrl}
                    placeholder="VD: ThS.BS, CK1..."
                  />
                </label>

                {/* Số CCHN */}
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Số CCHN <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={form.licenseNo ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, licenseNo: e.target.value })
                    }
                    className={ctrl}
                    placeholder="VD: 00123/BYT"
                  />
                </label>

                {/* Chuyên khoa */}
                <div className="sm:col-span-1">
                  <SelectMenu<number>
                    label="Chuyên khoa chính"
                    required
                    value={form.primarySpecialtyId ?? ""}
                    options={specialtyOptions}
                    placeholder={
                      loadingSpecialties ? "Loading..." : "Chọn chuyên khoa"
                    }
                    onChange={(v) =>
                      setForm({
                        ...form,
                        primarySpecialtyId: v === "" ? null : Number(v),
                      })
                    }
                  />
                </div>

                {/* Kinh nghiệm */}
                <label className="block">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Năm kinh nghiệm <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.experienceYears ?? ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experienceYears:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                    className={ctrl}
                  />
                </label>

                {/* Phòng khám */}
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Tên phòng khám / Vị trí{" "}
                    <span className="text-red-500">*</span>
                  </span>
                  <input
                    value={form.roomName ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, roomName: e.target.value })
                    }
                    className={ctrl}
                    placeholder="VD: Phòng 201 - Tầng 2"
                  />
                </label>

                {/* Ghi chú kinh nghiệm */}
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Ghi chú kinh nghiệm
                  </span>
                  <textarea
                    rows={2}
                    value={form.experienceNote ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, experienceNote: e.target.value })
                    }
                    className={ctrl}
                    placeholder="Mô tả ngắn gọn..."
                  />
                </label>

                {/* Giới thiệu */}
                <label className="block sm:col-span-2">
                  <span className="text-sm font-medium text-slate-700 mb-1 block">
                    Giới thiệu chi tiết
                  </span>
                  <textarea
                    rows={4}
                    value={form.intro ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, intro: e.target.value })
                    }
                    className={ctrl}
                    placeholder="Thông tin giới thiệu hiển thị trên trang chủ..."
                  />
                </label>
              </div>
            </div>
          </div>

          {/* ============ HỌC VẤN ============ */}
          <div className="border rounded-lg p-4 bg-blue-50/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-base text-blue-700">
                Học vấn ({educations.length})
              </h4>
              <button
                type="button"
                onClick={addEducation}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition cursor-pointer"
              >
                + Thêm
              </button>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {educations.map((edu, idx) => (
                <div
                  key={idx}
                  className="bg-white p-3 rounded border shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      <input
                        type="number"
                        placeholder="Từ năm"
                        value={edu.yearFrom ?? ""}
                        onChange={(e) =>
                          updateEducation(
                            idx,
                            "yearFrom",
                            Number(e.target.value)
                          )
                        }
                        className="border rounded px-2 py-1 text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Đến năm"
                        value={edu.yearTo ?? ""}
                        onChange={(e) =>
                          updateEducation(idx, "yearTo", Number(e.target.value))
                        }
                        className="border rounded px-2 py-1 text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => askRemoveEducation(idx)}
                      className="rounded-full p-1 text-slate-400 bg-white border border-slate-200 shadow-sm hover:text-red-500 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Học hàm/vị/trường *"
                    value={edu.title}
                    onChange={(e) =>
                      updateEducation(idx, "title", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm w-full mb-2 font-medium"
                  />
                  <textarea
                    placeholder="Chi tiết..."
                    value={edu.detail ?? ""}
                    onChange={(e) =>
                      updateEducation(idx, "detail", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-xs w-full"
                    rows={2}
                  />
                </div>
              ))}
              {educations.length === 0 && (
                <p className="text-xs text-center text-slate-400 italic">
                  Chưa có thông tin
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chuyên môn */}
            <div className="border rounded-lg p-4 bg-green-50/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-base text-green-700">
                  Chuyên môn ({expertises.length})
                </h4>
                <button
                  type="button"
                  onClick={addExpertise}
                  className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition cursor-pointer"
                >
                  + Thêm
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                {expertises.map((exp, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      value={exp.content}
                      onChange={(e) => updateExpertise(idx, e.target.value)}
                      className="flex-1 border rounded px-3 py-2 text-sm"
                      placeholder="Nội dung..."
                    />
                    <button
                      type="button"
                      onClick={() => askRemoveExpertise(idx)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {expertises.length === 0 && (
                  <p className="text-xs text-center text-slate-400 italic">
                    Chưa có thông tin
                  </p>
                )}
              </div>
            </div>

            {/* ============ THÀNH TỰU ============ */}
            <div className="border rounded-lg p-4 bg-yellow-50/50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-base text-yellow-700">
                  Thành tựu ({achievements.length})
                </h4>
                <button
                  type="button"
                  onClick={addAchievement}
                  className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200 transition cursor-pointer"
                >
                  + Thêm
                </button>
              </div>
              <div className="space-y-2">
                {achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 items-start bg-white p-2 rounded border"
                  >
                    <input
                      type="text"
                      placeholder="Năm (VD: 2023)"
                      value={ach.yearLabel ?? ""}
                      onChange={(e) =>
                        updateAchievement(idx, "yearLabel", e.target.value)
                      }
                      className="w-24 border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Nội dung thành tựu..."
                      value={ach.content}
                      onChange={(e) =>
                        updateAchievement(idx, "content", e.target.value)
                      }
                      className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => askRemoveAchievement(idx)}
                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-xs text-center text-slate-400 italic">
                    Chưa có thông tin
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-[var(--rounded)] border text-slate-600 font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-6 py-2.5 rounded-[var(--rounded)] bg-primary-linear text-white font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save size={18} /> {loading ? "Đang xử lý..." : "Lưu hồ sơ"}
          </button>
        </div>
      </div>

      {/* Confirm Delete Item Modal */}
      <ConfirmModal
        open={confirmDelete.type !== null}
        onClose={() => setConfirmDelete({ type: null, index: null })}
        onConfirm={confirmDeleteItem}
        loading={false}
        title="Xóa mục"
        description="Bạn có chắc chắn muốn xóa mục này khỏi danh sách?"
        confirmText="Xóa"
        cancelText="Hủy"
        danger
      />
    </div>
  );
}
