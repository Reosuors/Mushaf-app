# مصحف — Mushaf app

تطبيق مصحف بالرسم العثماني: قراءة، تلاوة آية بآية بصوت القارئ اللي بتختاره، تفسير، علامات، متابعة القراءة، الأجزاء والأحزاب والصفحات، ثيمات، مواقيت الصلاة والأذكار، و"اسأل" للأسئلة الدينية. يشتغل بدون إنترنت بعد أول فتح (PWA).

## Sources / المصادر
- Quran text: Tanzil Quran Text (Uthmani, v1.1) © Tanzil Project, CC BY 3.0 — https://tanzil.net — verbatim copy in `public/quran/quran-uthmani.txt` (do not edit it).
- Juz / hizb / page data: Tanzil Quran Metadata, CC BY 3.0 (`src/data/quranMeta.ts`).
- Ruqyah: verses referenced by surah:ayah only (`src/data/ruqyah.ts`), text read from the Tanzil file; prophetic duas copied verbatim from sunnah.com (Muslim 2186, 2202, 2708; Bukhari 5743, 3371), each shown with its source link.
- Tafsir & translations: alquran.cloud. Audio: mp3quran.net (full surah), everyayah.com (per ayah). Prayer times: aladhan.com. Fonts: Google Fonts (OFL).

## Run
```
npm install
npm run dev        # local
npm run typecheck
npm test
npm run build
```

## "اسأل" chat
`api/chat.ts` is a Vercel serverless function. Add `GEMINI_API_KEY` in Vercel → Settings → Environment Variables, then redeploy. Without the key the chat screen shows "يحتاج تفعيل المفتاح".

## Designs / التصاميم
Six layouts, chosen in Settings → التصميم, independent of the colour theme: `modern` (default, original dark-gold), `mushaf_page`, `cards`, `minimal`, `grid`, `drawer` (`src/components/Designs.tsx`, styles in `src/index.css`).

## Android
App id is now `com.ahmad.mushaf` (was `com.example.mushaf`), `allowMixedContent: false`.

### Home-screen widgets (APK only)
Ayah of the Day and Prayer Times widgets (`android-widget/`), resizable small/medium/large. The workflow `.github/workflows/build-app.yml` copies them in (`scripts/prepare-widget-android.py`) and builds the APK on every push to `main` → GitHub → Actions → latest run → Artifacts → `android-builds`. Widgets don't exist for the website/PWA shortcut.
