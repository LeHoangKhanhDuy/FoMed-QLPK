import type { DoctorEducation, DoctorExpertise, DoctorAchievement } from "../../services/doctorMApi";

interface DoctorIntroduceProps {
  intro?: string | null;
  educations?: DoctorEducation[];
  expertises?: DoctorExpertise[];
  achievements?: DoctorAchievement[];
}

export const DoctorIntroduce = ({
  intro,
  educations = [],
  expertises = [],
  achievements = [],
}: DoctorIntroduceProps) => {
  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* GIỚI THIỆU */}
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
        <h2 className="mb-4 text-2xl font-bold text-sky-500">Giới thiệu</h2>
        {intro && intro.trim() ? (
          <div className="whitespace-pre-line">{intro}</div>
        ) : (
          <p className="text-slate-500 italic">Đang cập nhật</p>
        )}
      </div>

      {/* HỌC VẤN */}
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
        <h2 className="mb-4 text-2xl font-bold text-sky-500">Học vấn</h2>
        {educations.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {educations.map((edu, idx) => {
              const yearRange =
                edu.yearFrom && edu.yearTo
                  ? `${edu.yearFrom} – ${edu.yearTo}`
                  : edu.yearFrom
                  ? `${edu.yearFrom}`
                  : edu.yearTo
                  ? `${edu.yearTo}`
                  : "";

              return (
                <li key={idx}>
                  {yearRange && <b>{yearRange}: </b>}
                  {edu.title}
                  {edu.detail && (
                    <>
                      {" – "}
                      <span className="text-slate-600">{edu.detail}</span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-slate-500 italic">Đang cập nhật</p>
        )}
      </div>

      {/* CHUYÊN MÔN */}
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
        <h2 className="mb-4 text-2xl font-bold text-sky-500">Chuyên môn</h2>
        {expertises.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {expertises.map((exp, idx) => (
              <li key={idx}>{exp.content}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic">Đang cập nhật</p>
        )}
      </div>

      {/* THÀNH TỰU */}
      <div className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 text-justify">
        <h2 className="mb-4 text-2xl font-bold text-sky-500">Thành tựu</h2>
        {achievements.length > 0 ? (
          <ul className="list-disc pl-5 space-y-2">
            {achievements.map((ach, idx) => (
              <li key={idx}>
                {ach.yearLabel && <b>{ach.yearLabel}: </b>}
                {ach.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500 italic">Đang cập nhật</p>
        )}
      </div>
    </div>
  );
};
