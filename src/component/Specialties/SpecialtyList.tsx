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
import React, { useEffect, useMemo, useState } from "react";
import type { SpecialtyItem } from "../../types/specialty/specialtyType";
import { getPublicSpecialties } from "../../services/specialty";

const ICON_ROTATION = [HeartPulse, Baby, Brain, Activity, Stethoscope, Syringe];

const ICON_BY_CODE: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  cardio: HeartPulse,
  "tim-mach": HeartPulse,
  gastro: Syringe,
  "tieu-hoa": Syringe,
  endocrine: Brain,
  "noi-tiet": Brain,
  andrology: Stethoscope,
  "nam-khoa": Stethoscope,
  gynecology: Baby,
  "phu-khoa": Baby,
};

type SpecialtyCard = {
  id: number;
  name: string;
  desc: string;
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const pickIcon = (
  code: string | null | undefined,
  idx: number
): React.ComponentType<React.SVGProps<SVGSVGElement>> => {
  if (code) {
    const normalized = toSlug(code);
    if (ICON_BY_CODE[normalized]) return ICON_BY_CODE[normalized];
  }
  return ICON_ROTATION[idx % ICON_ROTATION.length] ?? Stethoscope;
};

function Card({ s }: { s: SpecialtyCard }) {
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
  const [data, setData] = useState<SpecialtyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getPublicSpecialties();
        if (!active) return;
        setData(res);
        setError(null);
      } catch (err) {
        if (!active) return;
        const msg =
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách chuyên khoa";
        setError(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, []);

  const cards = useMemo<SpecialtyCard[]>(() => {
    return data.map((item, idx) => {
      const slugSource = item.code || item.name || String(item.specialtyId);
      const slug = toSlug(slugSource) || `specialty-${item.specialtyId}`;
      return {
        id: item.specialtyId,
        name: item.name,
        desc: item.description ?? "Đang cập nhật mô tả.",
        href: `/chuyen-khoa/${slug}`,
        Icon: pickIcon(item.code || item.name, idx),
      } satisfies SpecialtyCard;
    });
  }, [data]);

  let content: React.ReactNode;
  if (loading) {
    content = (
      <p className="col-span-full text-center text-slate-500">
        Đang tải danh sách chuyên khoa…
      </p>
    );
  } else if (error) {
    content = <p className="col-span-full text-center text-red-500">{error}</p>;
  } else if (cards.length === 0) {
    content = (
      <p className="col-span-full text-center text-slate-500">
        Chưa có chuyên khoa hoạt động.
      </p>
    );
  } else {
    content = cards.map((s) => <Card key={s.id} s={s} />);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 xl:px-0 py-8 md:py-14">
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl text-center font-extrabold tracking-tight text-sky-500 uppercase">
          Chuyên khoa
        </h1>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {content}
      </section>
    </main>
  );
}
