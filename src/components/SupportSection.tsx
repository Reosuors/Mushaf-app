import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../data/translations';
import { Heart, Coffee, ShieldCheck, Sparkles, Star, CheckCircle2 } from 'lucide-react';
import {
  getDonationMode,
  loadSupportProducts,
  donate,
  finishPendingDonations,
  type DonationMode,
  type SupportProduct,
} from '../utils/donations';

interface SupportSectionProps {
  lang: string;
}

export const SupportSection: React.FC<SupportSectionProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.ar;

  const [stats, setStats] = useState({
    prayers: 0,
    azkar: 0,
    tasbih: 0,
  });

  const [mode, setMode] = useState<DonationMode | null>(null);
  useEffect(() => {
    let alive = true;
    getDonationMode().then((m) => alive && setMode(m));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    setStats({
      prayers: parseInt(localStorage.getItem('prayers_checked') || '12', 10),
      azkar: parseInt(localStorage.getItem('azkar_read') || '45', 10),
      tasbih: parseInt(localStorage.getItem('tasbih_lifetime') || '128', 10),
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-3.5 sm:p-6 pb-28 space-y-4 animate-fade-in">
      {/* Hero Supporter Banner */}
      <div className="bg-gradient-to-br from-[var(--bg2)] via-[var(--bg3)] to-[var(--bg2)] border border-[var(--gold)]/40 rounded-3xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 mx-auto flex items-center justify-center mb-4 animate-heartbeat shadow-[0_0_20px_rgba(201,168,76,0.3)]">
          <Heart className="w-8 h-8 text-[var(--gold)] fill-[var(--gold)]" />
        </div>

        <h2 className="font-amiri text-2xl sm:text-3xl font-bold text-[var(--gold2)]">
          {t.supportHeroTitle || 'ساهم في استمرار التطوير والصدقة الجارية'}
        </h2>

        <p className="text-xs sm:text-sm text-[var(--text2)] leading-relaxed mt-2 max-w-lg mx-auto">
          {t.supportHeroDesc ||
            'مصحف هو تطبيق وقفي مجاني بالكامل وخالٍ من الإعلانات. دعمك يساهم في تغطية تكاليف الخوادم وتطوير مزايا إسلامية جديدة للجميع.'}
        </p>

        {/* Donation: Google Play Billing in the Play install, Ko-fi everywhere else */}
        <div className="mt-6">
          {mode === 'external' && (
            <a
              id="kofi-donation-btn"
              href="https://ko-fi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[var(--gold)] text-black font-extrabold px-8 py-3.5 rounded-2xl text-sm shadow-xl hover:bg-[var(--gold2)] active:scale-95 transition-all cursor-pointer"
            >
              <Coffee className="w-5 h-5" />
              <span>{t.supportDonateBtn || 'تبرع عبر Ko-fi / Buy Me a Coffee'}</span>
            </a>
          )}
          {mode === 'play' && <PlayDonation lang={lang} />}
        </div>
      </div>

      {/* Community Engagement & Goal Tracker */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--gold)]" />
          <h3 className="font-bold text-sm sm:text-base text-[var(--gold2)]">
            {lang === 'ar' ? 'سجل بركاتك في التطبيق' : 'Your App Activity Log'}
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--gold)] block">
              {stats.prayers}
            </span>
            <span className="text-[0.65rem] text-[var(--text3)]">
              {lang === 'ar' ? 'مواقيت صلاة' : 'Prayer Checks'}
            </span>
          </div>

          <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--gold)] block">
              {stats.azkar}
            </span>
            <span className="text-[0.65rem] text-[var(--text3)]">
              {lang === 'ar' ? 'أذكار مقروءة' : 'Azkar Read'}
            </span>
          </div>

          <div className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl p-3">
            <span className="text-xl sm:text-2xl font-black text-[var(--gold)] block">
              {stats.tasbih}
            </span>
            <span className="text-[0.65rem] text-[var(--text3)]">
              {lang === 'ar' ? 'تسبيحة' : 'Tasbih Done'}
            </span>
          </div>
        </div>
      </div>

      {/* Trust & Privacy Value Pillars */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)]">
              {lang === 'ar' ? '١٠٠٪ بدون إعلانات وتتبع' : '100% Ad-Free & Private'}
            </h4>
            <p className="text-[0.68rem] text-[var(--text3)] mt-0.5">
              {lang === 'ar'
                ? 'لا نجمع أي بيانات شخصية ولا نعرض أي إعلانات تجارية.'
                : 'Zero tracking and zero commercial advertisements.'}
            </p>
          </div>
        </div>

      </div>

      {/* Sincere Dua Card */}
      <div className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl p-5 text-center">
        <span className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider block mb-1">
          {lang === 'ar' ? 'دعاء للمستخدمين والداعمين' : 'Dua for you'}
        </span>
        <p className="font-quran text-lg sm:text-xl text-[var(--gold2)] leading-[2.2] dir-rtl">
          «اللَّهُمَّ اجْعَلِ القُرْآنَ العَظِيمَ رَبِيعَ قُلُوبِنَا، وَنُورَ صُدُورِنَا، وَجَلَاءَ أَحْزَانِنَا، وَذَهَابَ هُمُومِنَا»
        </p>
      </div>
    </div>
  );
};

/** Google Play install only: one-time "support" products sold through Google Play Billing. */
const PlayDonation: React.FC<{ lang: string }> = ({ lang }) => {
  const ar = lang === 'ar';
  const [products, setProducts] = useState<SupportProduct[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<null | 'success' | 'pending' | 'error'>(null);

  useEffect(() => {
    let alive = true;
    let stop = () => {};
    loadSupportProducts().then((list) => alive && setProducts(list));
    finishPendingDonations(() => alive && setNote('success')).then((r) => (stop = r));
    return () => {
      alive = false;
      stop();
    };
  }, []);

  const give = async (id: string) => {
    if (busy) return;
    setBusy(id);
    setNote(null);
    const status = await donate(id);
    setBusy(null);
    if (status !== 'cancelled') setNote(status);
  };

  if (products === null) {
    return (
      <p id="play-donation-loading" className="text-xs text-[var(--text3)] animate-pulse">
        {ar ? 'جارِ تحميل خيارات الدعم…' : 'Loading support options…'}
      </p>
    );
  }

  if (products.length === 0) {
    return (
      <div id="play-donation-unavailable" className="bg-[var(--bg3)] border border-[var(--border2)] rounded-2xl px-4 py-3 text-xs text-[var(--text2)]">
        {ar ? 'التبرع عبر جوجل بلاي غير متاح حالياً' : 'Donating through Google Play is not available right now'}
        <span className="block text-[0.65rem] text-[var(--text3)] mt-1">
          {ar ? 'جزاك الله خيراً على نيّتك، حاول لاحقاً إن شاء الله' : 'Thank you for the thought, please try again later'}
        </span>
      </div>
    );
  }

  return (
    <div id="play-donation" className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
        {products.map((p) => (
          <button
            key={p.productId}
            data-product={p.productId}
            onClick={() => give(p.productId)}
            disabled={!!busy}
            className="flex flex-col items-center justify-center gap-0.5 bg-[var(--gold)] text-black font-extrabold px-3 py-3 rounded-2xl text-sm shadow-xl hover:bg-[var(--gold2)] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
          >
            <span className="text-base" dir="ltr">{busy === p.productId ? '…' : p.price}</span>
            <span className="text-[0.65rem] font-bold opacity-80">{ar ? 'ادعم التطبيق' : 'Support'}</span>
          </button>
        ))}
      </div>
      <p className="text-[0.65rem] text-[var(--text3)] flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5" />
        {ar ? 'دفع آمن عبر Google Play' : 'Secure payment through Google Play'}
      </p>
      {note === 'success' && (
        <div id="play-donation-thanks" className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 text-xs text-[var(--text)] flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{ar ? 'جزاك الله خيراً! وصل دعمك، شكراً لأنك ساهمت في استمرار التطبيق 💛' : 'Thank you! Your support arrived and helps keep the app going 💛'}</span>
        </div>
      )}
      {note === 'pending' && (
        <p className="text-xs text-[var(--text2)]">
          {ar ? 'الدفع قيد المعالجة، وسيُحتسب دعمك فور اكتماله' : 'Your payment is processing; it will count as soon as it completes'}
        </p>
      )}
      {note === 'error' && (
        <p className="text-xs text-[var(--text2)]">
          {ar ? 'لم تكتمل العملية، حاول مرة أخرى' : 'The payment did not go through, please try again'}
        </p>
      )}
    </div>
  );
};
