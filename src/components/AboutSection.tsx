import React from 'react';
import { BookOpen, Volume2, Type, ShieldCheck } from 'lucide-react';
import { MihrabBackdrop, MushafLogoEmblem, GoldDivider } from './IslamicOrnaments';

interface AboutSectionProps {
  lang: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ lang }) => {
  const isRtl = lang === 'ar' || lang === 'ur' || lang === 'fa';
  const version = import.meta.env.VITE_APP_VERSION || '1.1.0';

  const credits = [
    {
      icon: BookOpen,
      title: isRtl ? 'النص القرآني' : 'Quran Text',
      body: isRtl
        ? 'نص القرآن الكريم بالرسم العثماني منقول حرفياً دون أي تعديل من مشروع Tanzil.net (الإصدار 1.1) بترخيص CC BY 3.0.'
        : 'Verbatim Uthmani Quran text from Tanzil.net (v1.1), licensed under CC BY 3.0.',
      link: 'https://tanzil.net',
    },
    {
      icon: Volume2,
      title: isRtl ? 'التلاوات الصوتية' : 'Audio Recitations',
      body: isRtl
        ? 'تلاوات آية بآية لـ ٢٥ قارئاً من مشروع EveryAyah و MP3Quran.'
        : 'Verse-by-verse audio recitations by 25 reciters via EveryAyah & MP3Quran.',
      link: 'https://everyayah.com',
    },
    {
      icon: Type,
      title: isRtl ? 'الخطوط القرآنية' : 'Arabic Typography',
      body: isRtl
        ? 'خطوط Amiri Quran و Scheherazade New و Noto Naskh Arabic و Reem Kufi و Cairo.'
        : 'Amiri Quran, Scheherazade New, Noto Naskh Arabic, Reem Kufi & Cairo.',
    },
    {
      icon: ShieldCheck,
      title: isRtl ? 'الخصوصية والوقف' : 'Privacy & Ad-Free',
      body: isRtl
        ? 'تطبيق مجاني بالكامل وخالٍ من الإعلانات والتتبع، يعمل بدون إنترنت ويحفظ علاماتك محلياً على جهازك.'
        : '100% free, ad-free, offline-capable, and privacy-respecting.',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      <div className="relative rounded-[26px] overflow-hidden border border-[var(--gold)]/32 bg-gradient-to-b from-[var(--bg3)]/95 via-[var(--bg2)] to-[var(--bg2)] p-6 text-center shadow-lg">
        <MihrabBackdrop className="opacity-75" />
        <div className="relative z-10 flex flex-col items-center">
          <MushafLogoEmblem className="w-12 h-12 mb-3" />
          <h2 className="font-amiri text-3xl font-bold text-[var(--gold2)]">
            {isRtl ? 'مصحف' : 'Mushaf'}
          </h2>
          <span className="mt-1.5 text-[0.7rem] px-3 py-0.5 rounded-full bg-[var(--gold)]/12 border border-[var(--gold)]/30 text-[var(--gold2)] font-bold tabular-nums">
            v{version}
          </span>
          <GoldDivider className="w-32 my-3 opacity-60" />
          <p className="text-xs sm:text-sm text-[var(--text2)] max-w-md leading-relaxed">
            {isRtl
              ? 'القرآن الكريم بالرسم العثماني مع التلاوة والتفسير ومواقيت الصلاة والأذكار والرقية الشرعية.'
              : 'The Noble Quran in Uthmani script with recitation, tafsir, prayer times, adhkar & ruqyah.'}
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {credits.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className="bg-[var(--bg2)] border border-[var(--border2)] rounded-[20px] p-4 flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--gold)]/12 border border-[var(--gold)]/28 flex items-center justify-center text-[var(--gold)] shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-amiri text-base font-bold text-[var(--gold2)]">{c.title}</h3>
                <p className="text-xs text-[var(--text2)] mt-1 leading-relaxed">{c.body}</p>
                {c.link && (
                  <a
                    href={c.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-[0.7rem] text-[var(--gold)] hover:underline mt-1 font-semibold"
                    dir="ltr"
                  >
                    {c.link}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
