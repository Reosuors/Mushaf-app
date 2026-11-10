import React from 'react';
import { QURAN_EDITION } from '../utils/quranText';
import { RECITERS } from '../utils/quranAudio';

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-4 space-y-2">
    <h3 className="text-sm font-bold text-[var(--gold2)]">{title}</h3>
    <div className="text-[0.8rem] leading-relaxed text-[var(--text2)] space-y-1.5">{children}</div>
  </section>
);

const A: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--gold)] underline underline-offset-2 break-all">
    {children}
  </a>
);

export const AboutSection: React.FC<{ lang: string }> = () => (
  <div className="max-w-2xl mx-auto p-4 pb-28 space-y-3 animate-fade-in" dir="rtl">
    <h2 className="text-lg font-bold text-[var(--gold2)] text-center font-amiri">عن التطبيق والمصادر</h2>

    <Card title="نص القرآن الكريم">
      <p>
        نص المصحف بالرسم العثماني من مشروع تنزيل (Tanzil Quran Text — Uthmani, Version 1.1)، حقوق النشر © 2007-2026 Tanzil Project،
        بترخيص المشاع الإبداعي (CC BY 3.0). النص منسوخ حرفياً بدون أي تعديل، ومحفوظ داخل التطبيق ليعمل بدون إنترنت.
      </p>
      <p>
        المصدر وتحديثات النص: <A href="https://tanzil.net">tanzil.net</A>
      </p>
      <p className="text-[var(--text3)]">النسخة المستعملة: {QURAN_EDITION}. أرقام الأجزاء والأحزاب والصفحات من بيانات تنزيل (Tanzil Quran Metadata، CC BY 3.0).</p>
    </Card>

    <Card title="التفسير والترجمات">
      <p>
        التفسير الميسر والتفاسير والترجمات الأخرى تأتي من خدمة <A href="https://alquran.cloud">alquran.cloud</A> (Islamic Network) عند فتح التفسير.
      </p>
    </Card>

    <Card title="التلاوات الصوتية">
      <p>
        تلاوة السورة كاملة من <A href="https://mp3quran.net">mp3quran.net</A>، والتلاوة آية بآية من <A href="https://everyayah.com">everyayah.com</A>
        — بنفس صوت القارئ اللي بتختاره. القرّاء: {RECITERS.map((r) => r.name).join('، ')}.
      </p>
    </Card>

    <Card title="مواقيت الصلاة">
      <p>
        مواقيت الصلاة من <A href="https://aladhan.com">aladhan.com</A>، مع حساب محلي احتياطي عند انقطاع الإنترنت.
      </p>
    </Card>

    <Card title="الخطوط">
      <p>
        خطوط Amiri Quran وAmiri وScheherazade New وNoto Naskh Arabic وReem Kufi وCairo من <A href="https://fonts.google.com">Google Fonts</A>
        بترخيص SIL Open Font License.
      </p>
    </Card>

    <Card title="تنبيه">
      <p>
        هذا التطبيق مشروع شخصي. إذا لاحظت أي خطأ بالنص أو بالتلاوة، يرجى المراجعة مع مصحف مطبوع والإبلاغ عنه.
      </p>
    </Card>
  </div>
);
