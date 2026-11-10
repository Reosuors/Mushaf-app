package com.ahmad.mushaf;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.RemoteViews;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.TimeZone;

/** Home-screen widget: Ayah of the Day. Resizable small / medium / large; tap opens the app at that ayah. */
public class MushafWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_DAILY_UPDATE = "com.ahmad.mushaf.WIDGET_DAILY_UPDATE";

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(context, mgr, id);
        scheduleMidnight(context);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, Bundle newOptions) {
        render(context, mgr, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_DAILY_UPDATE.equals(intent.getAction())) updateAll(context);
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) alarm.cancel(midnightIntent(context));
    }

    public static void updateAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, MushafWidgetProvider.class));
        for (int id : ids) render(context, mgr, id);
        if (ids.length > 0) scheduleMidnight(context);
    }

    /** 0 = small, 1 = medium, 2 = large — from the size the launcher gives this widget (updates on resize). */
    static int sizeClass(AppWidgetManager mgr, int id) {
        Bundle o = mgr.getAppWidgetOptions(id);
        int h = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 110);
        int w = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 250);
        if (h < 100 || w < 180) return 0;
        if (h < 200) return 1;
        return 2;
    }

    static void render(Context context, AppWidgetManager mgr, int id) {
        int[] ref = QuranData.ayahOfDay(Calendar.getInstance());
        String text = QuranData.readAyah(context, ref[0], ref[1]);
        String label = "\u0633\u0648\u0631\u0629 " + QuranData.NAMES[ref[0] - 1] + " \u00B7 " + QuranData.arabicDigits(ref[1]);
        int size = sizeClass(mgr, id);
        int layout = size == 0 ? R.layout.widget_ayah_small : size == 1 ? R.layout.widget_ayah_day : R.layout.widget_ayah_large;
        RemoteViews v = new RemoteViews(context.getPackageName(), layout);
        v.setTextViewText(R.id.widget_ayah_text, "\uFD3F" + text + "\uFD3E");
        v.setTextViewText(R.id.widget_surah_label, label);

        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        open.putExtra("open_surah", ref[0]);
        open.putExtra("open_ayah", ref[1]);
        PendingIntent pi = PendingIntent.getActivity(context, 7000 + id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        v.setOnClickPendingIntent(R.id.widget_root, pi);
        mgr.updateAppWidget(id, v);
    }

    private static PendingIntent midnightIntent(Context context) {
        Intent i = new Intent(context, MushafWidgetProvider.class).setAction(ACTION_DAILY_UPDATE);
        return PendingIntent.getBroadcast(context, 7001, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void scheduleMidnight(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm == null) return;
        Calendar next = Calendar.getInstance();
        next.add(Calendar.DAY_OF_YEAR, 1);
        next.set(Calendar.HOUR_OF_DAY, 0); next.set(Calendar.MINUTE, 1); next.set(Calendar.SECOND, 0);
        alarm.set(AlarmManager.RTC, next.getTimeInMillis(), midnightIntent(context));
    }
}

/** Ayah of the Day for the widget: the SAME date-based pick as the web app (src/utils/quranText.ts),
 * text read from the bundled Tanzil file the app ships (assets/public/quran/quran-uthmani.txt). */
final class QuranData {
    static final String[] NAMES = {"الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس","هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه","الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم","لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر","فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق","الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة","الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج","نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس","التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد","الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات","القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر","المسد","الإخلاص","الفلق","الناس"};
    static final int[] COUNTS = {7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6};
    private static final String ASSET = "public/quran/quran-uthmani.txt";

    private QuranData() {}

    /** {surah, ayah} for the given local date — mirrors getAyahOfDayRef(). */
    static int[] ayahOfDay(Calendar local) {
        Calendar utc = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
        utc.clear();
        utc.set(local.get(Calendar.YEAR), local.get(Calendar.MONTH), local.get(Calendar.DAY_OF_MONTH));
        long day = Math.floorDiv(utc.getTimeInMillis(), 86400000L);
        long global = ((day * 2731L) % 6236L + 6236L) % 6236L + 1L;
        long n = global;
        for (int i = 0; i < 114; i++) {
            if (n <= COUNTS[i]) return new int[] { i + 1, (int) n };
            n -= COUNTS[i];
        }
        return new int[] { 1, 1 };
    }

    static String readAyah(Context ctx, int surah, int ayah) {
        String prefix = surah + "|" + ayah + "|";
        try (BufferedReader r = new BufferedReader(new InputStreamReader(ctx.getAssets().open(ASSET), StandardCharsets.UTF_8))) {
            String line;
            while ((line = r.readLine()) != null) {
                if (line.startsWith(prefix)) return stripBasmala(surah, ayah, clean(line.substring(prefix.length())));
            }
        } catch (Exception ignored) { }
        return "";
    }

    private static String clean(String t) {
        return t.replace("\uFEFF", "").replace("\u2060", "").replace("\u200B", "").trim();
    }

    private static String skeleton(String t) {
        StringBuilder b = new StringBuilder();
        for (int i = 0; i < t.length(); i++) {
            char c = t.charAt(i);
            if (Character.getType(c) == Character.NON_SPACING_MARK || c == '\u0640') continue;
            b.append(c == '\u0671' ? '\u0627' : c);
        }
        return b.toString();
    }

    /** Same rule as the app: drop the first four words of ayah 1 (surahs 2–114 except 9) only if they are the basmala. */
    static String stripBasmala(int surah, int ayah, String text) {
        if (surah == 1 || surah == 9 || ayah != 1) return text;
        String[] w = text.split(" ");
        if (w.length > 4 && skeleton(w[0] + " " + w[1] + " " + w[2] + " " + w[3]).equals("\u0628\u0633\u0645 \u0627\u0644\u0644\u0647 \u0627\u0644\u0631\u062D\u0645\u0646 \u0627\u0644\u0631\u062D\u064A\u0645")) {
            StringBuilder b = new StringBuilder();
            for (int i = 4; i < w.length; i++) { if (b.length() > 0) b.append(' '); b.append(w[i]); }
            return b.toString();
        }
        return text;
    }

    static String arabicDigits(int n) {
        String s = String.valueOf(n);
        StringBuilder b = new StringBuilder();
        for (char c : s.toCharArray()) b.append((char) ('\u0660' + (c - '0')));
        return b.toString();
    }
}
