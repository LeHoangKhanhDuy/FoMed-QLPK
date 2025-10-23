

export default function SkeletonHomeService() {
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col animate-pulse">
      {/* Ảnh */}
      <div className="h-38 rounded-t-xl bg-gray-200" />

      <div className="p-4 flex flex-col gap-3">
        {/* Badge verified (nếu có) */}
        <div className="h-5 w-24 bg-gray-200 rounded-full" />

        {/* Tên dịch vụ */}
        <div className="h-6 w-full bg-gray-200 rounded-md" />
        <div className="h-6 w-4/5 bg-gray-200 rounded-md" />

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-5 h-5 bg-gray-200 rounded-full" />
          ))}
          <div className="ml-2 h-4 w-12 bg-gray-200 rounded" />
        </div>

        {/* Giá */}
        <div className="h-7 w-32 bg-red-200 rounded-md" />

        {/* Nút */}
        <div className="h-12 w-full bg-sky-200 rounded-xl mt-2" />
      </div>
    </div>
  );
}
