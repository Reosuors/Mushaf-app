package com.example.mushaf;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {
    private static final String PREFS = "mushaf_widget";

    @PluginMethod
    public void setWidgetData(PluginCall call) {
        SharedPreferences.Editor editor = getContext()
                .getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit();

        String mode = call.getString("mode");
        String ayah = call.getString("ayah");
        String surah = call.getString("surah");
        String prayers = call.getString("prayers");
        String city = call.getString("city");

        if (mode != null) editor.putString("mode", mode);
        if (ayah != null) editor.putString("ayah", ayah);
        if (surah != null) editor.putString("surah", surah);
        if (prayers != null) editor.putString("prayers", prayers);
        if (city != null) editor.putString("city", city);
        editor.apply();

        MushafWidgetProvider.updateAll(getContext());
        call.resolve(new JSObject().put("updated", true));
    }
}
