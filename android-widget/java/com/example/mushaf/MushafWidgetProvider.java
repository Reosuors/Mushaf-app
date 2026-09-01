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
import android.widget.RemoteViews;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public class MushafWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_TOGGLE = "com.example.mushaf.WIDGET_TOGGLE";
    public static final String ACTION_DAILY_UPDATE = "com.example.mushaf.WIDGET_DAILY_UPDATE";
    private static final String PREFS = "mushaf_widget";
    private static final String[] AYAT = {
            "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "فَاذْكُرُونِي أَذْكُرْكُمْ",
            "وَقُلْ رَبِّ زِدْنِي عِلْمًا", "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
            "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا"
    };
    private static final String[] SURAHS = {"الشرح، الآية 6", "البقرة، الآية 152", "طه، الآية 114", "البقرة، الآية 153", "الطلاق، الآية 2"};

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) update(context, manager, id);
        scheduleDailyUpdate(context);
    }

    @Override public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_TOGGLE.equals(intent.getAction())) {
            SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String mode = p.getString("mode", "ayah");
            p.edit().putString("mode", "ayah".equals(mode) ? "prayer" : "ayah").apply();
            updateAll(context);
        } else if (ACTION_DAILY_UPDATE.equals(intent.getAction())) {
            updateAll(context);
            scheduleDailyUpdate(context);
        }
    }

    @Override public void onEnabled(Context context) { scheduleDailyUpdate(context); }

    public static void updateAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, MushafWidgetProvider.class);
        for (int id : manager.getAppWidgetIds(component)) update(context, manager, id);
    }

    private static void update(Context context, AppWidgetManager manager, int id) {
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String mode = p.getString("mode", "ayah");
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.mushaf_widget);
        boolean ayahMode = "ayah".equals(mode);
        views.setTextViewText(R.id.widget_title, ayahMode ? "آية اليوم" : "أوقات الصلاة");
        if (ayahMode) {
            int index = (Calendar.getInstance().get(Calendar.DAY_OF_YEAR) - 1) % AYAT.length;
            views.setTextViewText(R.id.widget_content, AYAT[index]);
            views.setTextViewText(R.id.widget_subtitle, SURAHS[index]);
        } else {
            String city = p.getString("city", "الموقع الحالي");
            views.setTextViewText(R.id.widget_content, p.getString("prayers", "الفجر  •  الظهر  •  العصر"));
            views.setTextViewText(R.id.widget_subtitle, city);
        }
        Intent toggle = new Intent(context, MushafWidgetProvider.class).setAction(ACTION_TOGGLE);
        PendingIntent pending = PendingIntent.getBroadcast(context, id, toggle,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        views.setOnClickPendingIntent(R.id.widget_toggle, pending);
        manager.updateAppWidget(id, views);
    }

    private static void scheduleDailyUpdate(Context context) {
        AlarmManager alarm = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Intent intent = new Intent(context, MushafWidgetProvider.class).setAction(ACTION_DAILY_UPDATE);
        PendingIntent pending = PendingIntent.getBroadcast(context, 9001, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Calendar next = Calendar.getInstance();
        next.add(Calendar.DAY_OF_YEAR, 1);
        next.set(Calendar.HOUR_OF_DAY, 0); next.set(Calendar.MINUTE, 1); next.set(Calendar.SECOND, 0);
        alarm.setInexactRepeating(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pending);
    }
}
