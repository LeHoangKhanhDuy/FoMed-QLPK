import { Link } from "react-router-dom";
import {
  HeartPulse,
  Baby,
  Brain,
  Activity,
  Stethoscope,
  Syringe,
} from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

// NOTE: You can replace icons below per specialty if you have brand assets.
// I used lucide-react for a clean minimal look similar to your screenshot.

type Specialty = {
  key: string;
  name: string;
  desc: string;
  href: string; // route to detail page
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const SPECIALTIES: Specialty[] = [
  {
    key: "chronic",
    name: "Bệnh mãn tính",
    desc: "Đánh giá, theo dõi và điều trị chuyên sâu các bệnh lý mãn tính, bao gồm bệnh tim mạch, chuyển hóa, xương khớp, tiêu hóa và bệnh gan, thận mãn tính",
    href: "/chuyen-khoa/benh-man-tinh",
    Icon: HeartPulse,
  },
  {
    key: "andrology",
    name: "Nam khoa",
    desc: "Khám và điều trị các bệnh lý nam khoa như rối loạn cương dương, xuất tinh sớm, bệnh tuyến tiền liệt, vô sinh hiếm muộn",
    href: "/chuyen-khoa/nam-khoa",
    Icon: Stethoscope,
  },
  {
    key: "gynecology",
    name: "Phụ khoa",
    desc: "Khám và điều trị toàn diện các bệnh lý phụ khoa như viêm nhiễm, rối loạn kinh nguyệt, u xơ tử cung cùng các loại ung thư ở nữ giới",
    href: "/chuyen-khoa/phu-khoa",
    Icon: Baby,
  },
  {
    key: "cardio",
    name: "Tim mạch",
    desc: "Đánh giá chuyên sâu, phát hiện và điều trị kịp thời các bệnh lý tim mạch như bệnh động mạch vành, tăng huyết áp, rối loạn nhịp tim, suy tim",
    href: "/chuyen-khoa/tim-mach",
    Icon: Activity,
  },
  {
    key: "gastro",
    name: "Tiêu hóa",
    desc: "Khám và chẩn đoán điều trị các bệnh đường tiêu hóa như viêm loét dạ dày, hội chứng ruột kích thích, nhiễm trùng, dị ứng thực phẩm cùng các bệnh lý gan-mật",
    href: "/chuyen-khoa/tieu-hoa",
    Icon: Syringe,
  },
  {
    key: "endocrine",
    name: "Nội tiết",
    desc: "Điều trị chuyên sâu các bệnh lý liên quan đến hệ thống nội tiết như đái tháo đường, hội chứng chuyển hóa, rối loạn tuyến giáp, rối loạn hormone sinh dục nam/nữ",
    href: "/chuyen-khoa/noi-tiet",
    Icon: Brain,
  },
  {
    key: "endocrine",
    name: "Nội tiết",
    desc: "Điều trị chuyên sâu các bệnh lý liên quan đến hệ thống nội tiết như đái tháo đường, hội chứng chuyển hóa, rối loạn tuyến giáp, rối loạn hormone sinh dục nam/nữ",
    href: "/chuyen-khoa/noi-tiet",
    Icon: Brain,
  },
  {
    key: "endocrine",
    name: "Nội tiết",
    desc: "Điều trị chuyên sâu các bệnh lý liên quan đến hệ thống nội tiết như đái tháo đường, hội chứng chuyển hóa, rối loạn tuyến giáp, rối loạn hormone sinh dục nam/nữ",
    href: "/chuyen-khoa/noi-tiet",
    Icon: Brain,
  },
  {
    key: "endocrine",
    name: "Nội tiết",
    desc: "Điều trị chuyên sâu các bệnh lý liên quan đến hệ thống nội tiết như đái tháo đường, hội chứng chuyển hóa, rối loạn tuyến giáp, rối loạn hormone sinh dục nam/nữ",
    href: "/chuyen-khoa/noi-tiet",
    Icon: Brain,
  },
];

function Card({ s }: { s: Specialty }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-sky-400 hover:shadow-md cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 rounded-[var(--rounded)] bg-sky-50 ring-1 ring-sky-100 p-3">
          <s.Icon className="h-7 w-7 text-sky-500" aria-hidden />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{s.name}</h3>
          <p className="mt-2 text-slate-600 leading-relaxed text-sm">
            {s.desc}
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-between">
        <Link
          to={s.href}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition cursor-pointer"
          aria-label={`Tìm hiểu thêm về ${s.name}`}
        >
          Tìm hiểu thêm
        </Link>
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-[var(--rounded)] bg-primary-linear px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-600 transition cursor-pointer"
        >
          Đặt lịch
        </button>
      </div>
    </motion.article>
  );
}

export default function SpecialtyList() {
  return (
    <main className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl text-center font-extrabold tracking-tight text-sky-500 uppercase">
          Chuyên khoa
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SPECIALTIES.map((s) => (
          <Card key={s.key} s={s} />
        ))}
      </section>
    </main>
  );
}
