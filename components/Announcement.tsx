import React from 'react';
import { content } from '../i18n';
import type { Lang } from '../types';

interface AnnouncementProps {
  lang: Lang;
}

const Announcement: React.FC<AnnouncementProps> = ({ lang }) => {
  const t = content[lang].announcement;
  const schedule = content[lang].schedule;

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-8 border-t-8 border-[#1A237E]">
      <div className="prose max-w-none">
        <h2 className="text-xl font-bold text-[#1A237E]">{t.title}</h2>
        <p>
          <strong>{t.to.label}</strong> {t.to.value}
        </p>
        <p>{t.p1}</p>
        {t.p2 && <p>{t.p2}</p>}
        <ul className="list-disc pl-5">
          {schedule.map((item) => (
            <li key={item.id}>
              <strong>{item.label}:</strong> {item.time}
            </li>
          ))}
        </ul>
        <p>{t.p3}</p>
        <p>{t.p4}</p>
        {t.p5 && <p>{t.p5}</p>}
      </div>
    </div>
  );
};

export default Announcement;
