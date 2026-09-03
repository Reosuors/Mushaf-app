package com.example.mushaf;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.view.View;
import android.widget.RemoteViews;

import java.util.Calendar;
import java.util.Locale;

public class PrayerWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_DAILY_UPDATE = "com.example.mushaf.PRAYER_WIDGET_DAILY_UPDATE";
    private static final String PREFS = "mushaf_widget";

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
        scheduleDailyUpdate(context);
    }

    @Override public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_DAILY_UPDATE.equals(intent.getAction())) {
            updateAll(context);
            scheduleDailyUpdate(context);
        }
    }

    @Override public void onEnabled(Context context) { scheduleDailyUpdate(context); }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, PrayerWidgetProvider.class);
        for (int id : manager.getAppWidgetIds(component)) update(context, manager, id);
    }

    private static boolean isArabic() {
        return Locale.getDefault().getLanguage().equalsIgnoreCase("ar");
    }

    private static void update(Context context, AppWidgetManager manager, int id) {
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        boolean arabic = isArabic();
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer);
        views.setTextViewText(R.id.widget_prayer_title, arabic ? "أوقات الصلاة" : "Prayer Times");
        views.setTextViewText(R.id.widget_prayer_city, p.getString("city", arabic ? "الموقع الحالي" : "Current location"));
        String summary = p.getString("prayers", "الفجر --  •  الظهر --  •  العصر --  •  المغرب --  •  العشاء --");
        String[] values = summary.split("  •  ", -1);
        int[] rowIds = { R.id.prayer_row_fajr, R.id.prayer_row_dhuhr, R.id.prayer_row_asr, R.id.prayer_row_maghrib, R.id.prayer_row_isha };
        int[] timeIds = { R.id.prayer_time_fajr, R.id.prayer_time_dhuhr, R.id.prayer_time_asr, R.id.prayer_time_maghrib, R.id.prayer_time_isha };
        int[] nameIds = { R.id.prayer_name_fajr, R.id.prayer_name_dhuhr, R.id.prayer_name_asr, R.id.prayer_name_maghrib, R.id.prayer_name_isha };
        String[] arNames = { "الفجر", "الظهر", "العصر", "المغرب", "العشاء" };
        String[] enNames = { "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha" };
        int width = manager.getAppWidgetOptions(id).getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 300);
        int visibleRows = width < 210 ? 2 : (width < 300 ? 3 : 5);
        for (int i = 0; i < rowIds.length; i++) {
            boolean visible = i < visibleRows;
            views.setViewVisibility(rowIds[i], visible ? View.VISIBLE : View.GONE);
            if (visible) {
                String item = i < values.length ? values[i].trim() : "--";
                int split = item.lastIndexOf(' ');
                String time = split >= 0 ? item.substring(split + 1) : item;
                views.setTextViewText(nameIds[i], arabic ? arNames[i] : enNames[i]);
                views.setTextViewText(timeIds[i], time);
            }
        }
        manager.updateAppWidget(id, views);
    }

    private static void scheduleDailyUpdate(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, PrayerWidgetProvider.class).setAction(ACTION_DAILY_UPDATE);
        PendingIntent pending = PendingIntent.getBroadcast(context, 9002, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Calendar next = Calendar.getInstance();
        next.add(Calendar.DAY_OF_YEAR, 1);
        next.set(Calendar.HOUR_OF_DAY, 0); next.set(Calendar.MINUTE, 1); next.set(Calendar.SECOND, 0);
        alarm.setInexactRepeating(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pending);
    }
}
