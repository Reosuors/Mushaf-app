package com.ahmad.mushaf;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    private static final String PREFS = "mushaf_widget";

    @PluginMethod
    public void setWidgetData(PluginCall call) {
        SharedPreferences.Editor editor = getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
        for (String k : new String[] { "mode", "ayah", "surah", "prayers", "city", "country", "timings" }) {
            String v = call.getString(k);
            if (v != null) editor.putString(k, v);
        }
        Integer method = call.getInt("method");
        if (method != null) editor.putInt("method", method);
        String date = call.getString("date");
        if (date != null && call.getString("timings") != null) editor.putString("timings_date", date);
        editor.apply();

        MushafWidgetProvider.updateAll(getContext());
        PrayerWidgetProvider.updateAll(getContext());
        call.resolve(new JSObject().put("updated", true));
    }

    /** Where to go when the app was started from a widget tap (consumed once). */
    @PluginMethod
    public void getLaunchTarget(PluginCall call) {
        Activity a = getActivity();
        JSObject out = a != null ? targetOf(a.getIntent(), true) : new JSObject();
        call.resolve(out);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        JSObject t = targetOf(intent, false);
        if (t.length() > 0) notifyListeners("widgetOpen", t);
    }

    private static JSObject targetOf(Intent intent, boolean consume) {
        JSObject o = new JSObject();
        if (intent == null) return o;
        int s = intent.getIntExtra("open_surah", 0);
        if (s > 0) { o.put("surah", s); o.put("ayah", intent.getIntExtra("open_ayah", 1)); }
        String sec = intent.getStringExtra("open_section");
        if (sec != null) o.put("section", sec);
        if (consume) { intent.removeExtra("open_surah"); intent.removeExtra("open_ayah"); intent.removeExtra("open_section"); }
        return o;
    }
}
