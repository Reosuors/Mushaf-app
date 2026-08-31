import React, { useState, useEffect, useRef } from 'react';
import { 
  Download, 
  CheckCircle2, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Trash2, 
  Sparkles, 
  X, 
  Clock, 
  BookOpen, 
  RotateCcw,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { 
  getDownloadedSurahNumbers, 
  downloadAllSurahs, 
  deleteSurahOffline, 
  downloadSurahFromApi, 
  clearAllOfflineStorage 
} from '../utils/offlineStorage';
import { DownloadProgress } from '../types';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  isOnline: boolean;
  onDownloadedChange?: (downloaded: number[]) => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
  isOnline,
  onDownloadedChange,
}) => {
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({
    current: 0,
    total: 114,
    currentSurahName: '',
    isDownloading: false,
    isCompleted: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [singleDownloading, setSingleDownloading] = useState<number | null>(null);
  const cancelSignalRef = useRef<{ cancelled: boolean }>({ cancelled: false });

  const isRtl = lang === 'ar' || lang === 'ur';

  const refreshDownloadedList = async () => {
    const list = await getDownloadedSurahNumbers();
    setDownloadedSurahs(list);
    if (onDownloadedChange) {
      onDownloadedChange(list);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshDownloadedList();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadAll = async () => {
    if (!isOnline) return;
    cancelSignalRef.current.cancelled = false;
    await downloadAllSurahs((p) => {
      setDownloadProgress(p);
      refreshDownloadedList();
    }, cancelSignalRef.current);
  };

  const handleCancelDownload = () => {
    cancelSignalRef.current.cancelled = true;
    setDownloadProgress(prev => ({ ...prev, isDownloading: false }));
  };

  const handleDownloadSingle = async (surahNumber: number) => {
    if (!isOnline) return;
    try {
      setSingleDownloading(surahNumber);
      await downloadSurahFromApi(surahNumber);
      await refreshDownloadedList();
    } catch (err) {
      console.error(err);
    } finally {
      setSingleDownloading(null);
    }
  };

  const handleDeleteSingle = async (surahNumber: number) => {
    await deleteSurahOffline(surahNumber);
    await refreshDownloadedList();
  };

  const handleClearAll = async () => {
    if (window.confirm(isRtl ? 'هل أنت متأكد من حذف جميع السور المحفوظة أوفلاين؟' : 'Are you sure you want to delete all offline surahs?')) {
      await clearAllOfflineStorage();
      await refreshDownloadedList();
    }
  };

  const filteredSurahs = SURAHS.filter(s => 
    s.ar.includes(searchTerm) || 
    s.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(s.n).includes(searchTerm)
  );

  const downloadedCount = downloadedSurahs.length;
  const percentage = Math.round((downloadedCount / 114) * 100);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-[var(--bg2)] border border-[var(--border2)] rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border2)] flex items-center justify-between bg-gradient-to-r from-[var(--bg3)] to-[var(--bg2)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center text-[var(--gold)] shadow-inner">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] font-amiri flex items-center gap-2">
                {isRtl ? 'إدارة الوضع بدون إنترنت (Offline Mode)' : 'Offline Mode & Downloads'}
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--gold)]/10 text-[var(--gold2)] font-sans font-medium">
                  {percentage}% {isRtl ? 'جاهز' : 'ready'}
                </span>
              </h2>
              <p className="text-xs text-[var(--text3)]">
                {isRtl ? 'تصفح القرآن والصلاة والأذكار في أي وقت دون اتصال' : 'Access Quran, Prayer & Azkar anywhere without internet'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[var(--bg3)] hover:bg-[var(--border2)] text-[var(--text2)] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="px-4 py-3 bg-[var(--bg3)]/60 border-b border-[var(--border2)] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                <Wifi className="w-3.5 h-3.5" />
                {isRtl ? 'متصل بالشبكة (Online)' : 'Connected (Online)'}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                {isRtl ? 'بدون إنترنت (Offline)' : 'No Internet (Offline)'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[var(--text3)]">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-[var(--gold)]" />
              {downloadedCount} / 114 {isRtl ? 'سورة' : 'Surahs'}
            </span>
            {downloadedCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                title={isRtl ? 'مسح الذاكرة' : 'Clear storage'}
              >
                <Trash2 className="w-3 h-3" />
                {isRtl ? 'مسح' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Offline Features Highlights */}
        <div className="p-4 bg-[var(--bg)]/40 border-b border-[var(--border2)] grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <div className="leading-tight">
              <div className="font-bold text-[var(--text)]">{isRtl ? 'مواقيت الصلاة' : 'Prayer Times'}</div>
              <div className="text-[0.68rem] text-[var(--text3)]">{isRtl ? 'حساب فلكي دقيق 100%' : '100% astronomical'}</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <div className="leading-tight">
              <div className="font-bold text-[var(--text)]">{isRtl ? 'الأذكار والتسبيح' : 'Azkar & Tasbih'}</div>
              <div className="text-[0.68rem] text-[var(--text3)]">{isRtl ? 'متاحة بالكامل دائماً' : 'Fully offline ready'}</div>
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-[var(--bg2)] border border-[var(--border2)] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
            <div className="leading-tight">
              <div className="font-bold text-[var(--text)]">{isRtl ? 'حفظ محلي آمن' : 'Local Storage'}</div>
              <div className="text-[0.68rem] text-[var(--text3)]">{isRtl ? 'قاعدة بيانات IndexedDB' : 'Fast IndexedDB'}</div>
            </div>
          </div>
        </div>

        {/* Download All CTA & Progress */}
        <div className="p-4 border-b border-[var(--border2)] bg-[var(--bg2)]">
          {downloadProgress.isDownloading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[var(--gold2)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--gold)] animate-ping" />
                  {isRtl ? `جاري تحميل سورة ${downloadProgress.currentSurahName}...` : `Downloading ${downloadProgress.currentSurahName}...`}
                </span>
                <span className="text-[var(--text3)] font-mono">
                  {downloadProgress.current} / {downloadProgress.total}
                </span>
              </div>
              <div className="w-full bg-[var(--bg3)] h-2.5 rounded-full overflow-hidden border border-[var(--border2)]">
                <div 
                  className="h-full bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] transition-all duration-300"
                  style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
                />
              </div>
              <button
                onClick={handleCancelDownload}
                className="text-xs text-red-400 hover:underline cursor-pointer pt-1"
              >
                {isRtl ? 'إلغاء التحميل' : 'Cancel Download'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-bold text-[var(--text)]">
                  {downloadedCount === 114 
                    ? (isRtl ? 'المصحف كاملاً متاح بدون إنترنت 🎉' : 'Complete Quran is available offline 🎉')
                    : (isRtl ? 'تحميل سور المصحف للقراءة بدون إنترنت' : 'Download Quran for Offline Reading')
                  }
                </div>
                <div className="text-[0.72rem] text-[var(--text3)]">
                  {isRtl ? 'حجم البيانات خفيف جداً (~3 ميغابايت للنصوص والتفاسير)' : 'Lightweight text footprint (~3MB for all verses)'}
                </div>
              </div>

              {downloadedCount < 114 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={!isOnline}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold2)] text-black text-xs font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all whitespace-nowrap"
                >
                  <Download className="w-4 h-4" />
                  {isRtl ? 'تحميل المصحف كاملاً (114 سورة)' : 'Download All 114 Surahs'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Surahs Search & List */}
        <div className="p-3 border-b border-[var(--border2)] bg-[var(--bg3)]/50">
          <input
            type="text"
            placeholder={isRtl ? 'ابحث عن سورة لتحميلها أو حذفها...' : 'Search surah to download or manage...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg2)] border border-[var(--border2)] text-[var(--text)] text-xs rounded-xl px-3 py-2 outline-none focus:border-[var(--gold)]"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1.5 max-h-72">
          {filteredSurahs.map((surah) => {
            const isDownloaded = downloadedSurahs.includes(surah.n);
            const isSingleLoading = singleDownloading === surah.n;

            return (
              <div
                key={surah.n}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border2)] hover:border-[var(--gold)]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[var(--bg3)] border border-[var(--border2)] flex items-center justify-center text-xs font-mono text-[var(--gold2)]">
                    {surah.n}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[var(--text)] font-amiri">
                      {isRtl ? `سورة ${surah.ar}` : surah.en}
                    </div>
                    <div className="text-[0.68rem] text-[var(--text3)]">
                      {surah.a} {isRtl ? 'آية' : 'Ayahs'} • {surah.t}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isDownloaded ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[0.68rem] text-emerald-500 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isRtl ? 'محفوظة' : 'Saved'}
                      </span>
                      <button
                        onClick={() => handleDeleteSingle(surah.n)}
                        className="p-1 text-[var(--text3)] hover:text-red-400 rounded-lg cursor-pointer transition-colors"
                        title={isRtl ? 'حذف' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDownloadSingle(surah.n)}
                      disabled={!isOnline || isSingleLoading}
                      className="px-2.5 py-1 rounded-lg bg-[var(--bg3)] hover:bg-[var(--gold)]/20 border border-[var(--border2)] hover:border-[var(--gold)] text-[var(--text2)] hover:text-[var(--gold)] text-xs flex items-center gap-1 cursor-pointer transition-all disabled:opacity-40"
                    >
                      {isSingleLoading ? (
                        <RotateCcw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                      <span>{isRtl ? 'تحميل' : 'Download'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--border2)] bg-[var(--bg3)]/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--gold)] text-black text-xs font-bold hover:bg-[var(--gold2)] transition-colors cursor-pointer"
          >
            {isRtl ? 'تم / إغلاق' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
