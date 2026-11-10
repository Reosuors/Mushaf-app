from pathlib import Path

root = Path(__file__).resolve().parents[1]
java_dir = root / "android/app/src/main/java/com/ahmad/mushaf"
res_dir = root / "android/app/src/main/res"
java_dir.mkdir(parents=True, exist_ok=True)

for source in (root / "android-widget/java/com/ahmad/mushaf").glob("*.java"):
    (java_dir / source.name).write_text(source.read_text())

# copy every widget resource (layouts for small / medium / large, drawables, provider info)
for kind in ["layout", "drawable", "xml"]:
    for source in sorted((root / "android-widget/res" / kind).glob("*.xml")):
        target = res_dir / kind / source.name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(source.read_text())

main = java_dir / "MainActivity.java"
text = main.read_text()
if "WidgetBridgePlugin" not in text:
    text = text.replace(
        "package com.ahmad.mushaf;\n",
        "package com.ahmad.mushaf;\n\nimport android.os.Bundle;\n",
        1,
    )
    text = text.replace(
        "import com.getcapacitor.BridgeActivity;",
        "import com.getcapacitor.BridgeActivity;\n\nimport com.ahmad.mushaf.WidgetBridgePlugin;",
        1,
    )
    text = text.replace(
        "public class MainActivity extends BridgeActivity {",
        "public class MainActivity extends BridgeActivity {\n"
        "    @Override\n"
        "    public void onCreate(Bundle savedInstanceState) {\n"
        "        registerPlugin(WidgetBridgePlugin.class);\n"
        "        super.onCreate(savedInstanceState);\n"
        "    }",
        1,
    )
    main.write_text(text)

manifest = root / "android/app/src/main/AndroidManifest.xml"
text = manifest.read_text()
permissions = """    <uses-permission android:name=\"android.permission.ACCESS_COARSE_LOCATION\" />
    <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />
    <uses-permission android:name=\"android.permission.POST_NOTIFICATIONS\" />
    <uses-permission android:name=\"android.permission.RECORD_AUDIO\" />
"""
if "android.permission.ACCESS_FINE_LOCATION" not in text:
    start = text.find(">", text.find("<manifest ")) + 1
    text = text[:start] + "\n" + permissions + text[start:]

receivers = """        <receiver
            android:name=\".MushafWidgetProvider\"
            android:exported=\"true\">
            <intent-filter>
                <action android:name=\"android.appwidget.action.APPWIDGET_UPDATE\" />
                <action android:name=\"com.ahmad.mushaf.WIDGET_DAILY_UPDATE\" />
            </intent-filter>
            <meta-data android:name=\"android.appwidget.provider\" android:resource=\"@xml/widget_ayah_info\" />
        </receiver>
        <receiver
            android:name=\".PrayerWidgetProvider\"
            android:exported=\"true\">
            <intent-filter>
                <action android:name=\"android.appwidget.action.APPWIDGET_UPDATE\" />
                <action android:name=\"com.ahmad.mushaf.PRAYER_WIDGET_DAILY_UPDATE\" />
            </intent-filter>
            <meta-data android:name=\"android.appwidget.provider\" android:resource=\"@xml/widget_prayer_info\" />
        </receiver>
"""
if "android:name=\".PrayerWidgetProvider\"" not in text:
    text = text.replace("</application>", receivers + "    </application>", 1)
manifest.write_text(text)
