package com.ahmad.mushaf;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Bundle;
import android.os.SystemClock;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Calendar;
import java.util.Locale;

/** Home-screen widget: next prayer + live countdown + the five times (aladhan.com, same source as the app).
 * Location = the last city the user chose in the app (cached). Resizable small / medium / large. */
public class PrayerWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "com.ahmad.mushaf.PRAYER_WIDGET_DAILY_UPDATE";
    static final String PREFS = "mushaf_widget";
    static final String[] KEYS = { "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha" };
    static final String[] NAMES_AR = { "\u0627\u0644\u0641\u062C\u0631", "\u0627\u0644\u0638\u0647\u0631", "\u0627\u0644\u0639\u0635\u0631", "\u0627\u0644\u0645\u063A\u0631\u0628", "\u0627\u0644\u0639\u0634\u0627\u0621" };
    static final int[] ROW_IDS = { R.id.p_fajr, R.id.p_dhuhr, R.id.p_asr, R.id.p_maghrib, R.id.p_isha };
    private static final int GOLD = Color.parseColor("#D4AF37");
    private static final int TEXT = Color.parseColor("#F5EEDB");

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) render(context, mgr, id);
        refreshInBackground(context, goAsync());
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, Bundle o) {
        render(context, mgr, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            updateAll(context);
            refreshInBackground(context, goAsync());
        }
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) alarm.cancel(refreshIntent(context));
    }

    public static void updateAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        for (int id : mgr.getAppWidgetIds(new ComponentName(context, PrayerWidgetProvider.class))) render(context, mgr, id);
    }

    static String today() {
        Calendar c = Calendar.getInstance();
        return String.format(Locale.US, "%04d-%02d-%02d", c.get(Calendar.YEAR), c.get(Calendar.MONTH) + 1, c.get(Calendar.DAY_OF_MONTH));
    }

    /** Fetch today's timings for the cached city when what we hold is from another day. */
    private static void refreshInBackground(Context context, PendingResult pending) {
        final Context app = context.getApplicationContext();
        new Thread(() -> {
            try {
                SharedPreferences p = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
                String city = p.getString("city", "");
                if (!today().equals(p.getString("timings_date", "")) && city.length() > 0) {
                    Calendar c = Calendar.getInstance();
                    String date = String.format(Locale.US, "%02d-%02d-%04d", c.get(Calendar.DAY_OF_MONTH), c.get(Calendar.MONTH) + 1, c.get(Calendar.YEAR));
                    String u = "https://api.aladhan.com/v1/timingsByCity/" + date + "?city=" + URLEncoder.encode(city, "UTF-8")
                            + "&country=" + URLEncoder.encode(p.getString("country", ""), "UTF-8") + "&method=" + p.getInt("method", 4);
                    HttpURLConnection con = (HttpURLConnection) new URL(u).openConnection();
                    con.setConnectTimeout(10000); con.setReadTimeout(10000);
                    StringBuilder sb = new StringBuilder();
                    try (BufferedReader r = new BufferedReader(new InputStreamReader(con.getInputStream(), "UTF-8"))) {
                        String line; while ((line = r.readLine()) != null) sb.append(line);
                    }
                    JSONObject t = new JSONObject(sb.toString()).getJSONObject("data").getJSONObject("timings");
                    JSONObject keep = new JSONObject();
                    for (String k : KEYS) keep.put(k, t.getString(k).substring(0, 5));
                    p.edit().putString("timings", keep.toString()).putString("timings_date", today()).apply();
                    updateAll(app);
                }
            } catch (Exception ignored) {
                // offline: keep showing the last known times
            } finally {
                if (pending != null) pending.finish();
            }
        }).start();
    }

    private static long millisAt(String hhmm, int addDays) {
        Calendar c = Calendar.getInstance();
        c.add(Calendar.DAY_OF_YEAR, addDays);
        String[] p = hhmm.trim().split(":");
        c.set(Calendar.HOUR_OF_DAY, Integer.parseInt(p[0]));
        c.set(Calendar.MINUTE, Integer.parseInt(p[1].substring(0, 2)));
        c.set(Calendar.SECOND, 0); c.set(Calendar.MILLISECOND, 0);
        return c.getTimeInMillis();
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
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        int size = sizeClass(mgr, id);
        int layout = size == 0 ? R.layout.widget_prayer_small : size == 1 ? R.layout.widget_prayer : R.layout.widget_prayer_large;
        RemoteViews v = new RemoteViews(context.getPackageName(), layout);
        String city = p.getString("city", "");
        v.setTextViewText(R.id.p_city, city.length() > 0 ? city : "\u0627\u0641\u062A\u062D \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0648\u0627\u062E\u062A\u0631 \u0645\u062F\u064A\u0646\u062A\u0643");

        String[] times = new String[5];
        try {
            JSONObject t = new JSONObject(p.getString("timings", "{}"));
            for (int i = 0; i < 5; i++) times[i] = t.optString(KEYS[i], "");
        } catch (Exception e) { for (int i = 0; i < 5; i++) times[i] = ""; }

        int next = -1; long nextAt = 0; long now = System.currentTimeMillis();
        boolean stale = !today().equals(p.getString("timings_date", ""));
        if (times[0].length() >= 4) {
            try {
                for (int i = 0; i < 5; i++) { long at = millisAt(times[i], 0); if (at > now) { next = i; nextAt = at; break; } }
                if (next == -1) { next = 0; nextAt = millisAt(times[0], 1); }
            } catch (Exception ignored) { next = -1; }
        }

        if (next >= 0) {
            v.setTextViewText(R.id.p_next_name, NAMES_AR[next]);
            v.setTextViewText(R.id.p_next_time, times[next]);
            v.setChronometer(R.id.p_countdown, SystemClock.elapsedRealtime() + (nextAt - now), null, true);
            v.setChronometerCountDown(R.id.p_countdown, true);
            scheduleRefresh(context, nextAt + 30000);
        } else {
            v.setTextViewText(R.id.p_next_name, "\u0645\u0648\u0627\u0642\u064A\u062A \u0627\u0644\u0635\u0644\u0627\u0629");
            v.setTextViewText(R.id.p_next_time, "--:--");
        }
        if (size > 0) {
            for (int i = 0; i < 5; i++) {
                v.setTextViewText(ROW_IDS[i], NAMES_AR[i] + "\n" + (times[i].length() > 0 ? times[i] : "--:--"));
                v.setTextColor(ROW_IDS[i], i == next ? GOLD : TEXT);
            }
        }
        if (stale && size == 2) v.setTextViewText(R.id.p_city, city + " \u00B7 \u2026");

        Intent open = new Intent(context, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        open.putExtra("open_section", "prayer");
        v.setOnClickPendingIntent(R.id.widget_root, PendingIntent.getActivity(context, 8000 + id, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        mgr.updateAppWidget(id, v);
    }

    private static PendingIntent refreshIntent(Context context) {
        Intent i = new Intent(context, PrayerWidgetProvider.class).setAction(ACTION_REFRESH);
        return PendingIntent.getBroadcast(context, 8001, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    /** Re-render right after the next prayer so "next" moves on (inexact alarm, no special permission). */
    private static void scheduleRefresh(Context context, long at) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarm != null) alarm.set(AlarmManager.RTC, at, refreshIntent(context));
    }
}
