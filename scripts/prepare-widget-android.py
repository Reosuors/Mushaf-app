from pathlib import Path

root = Path(__file__).resolve().parents[1]
java_dir = root / "android/app/src/main/java/com/example/mushaf"
res_dir = root / "android/app/src/main/res"
java_dir.mkdir(parents=True, exist_ok=True)
for source in (root / "android-widget/java/com/example/mushaf").glob("*.java"):
    (java_dir / source.name).write_text(source.read_text())
for source, target in [
    (root / "android-widget/res/layout/mushaf_widget.xml", res_dir / "layout/mushaf_widget.xml"),
    (root / "android-widget/res/drawable/widget_background.xml", res_dir / "drawable/widget_background.xml"),
    (root / "android-widget/res/xml/mushaf_widget_info.xml", res_dir / "xml/mushaf_widget_info.xml"),
]:
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(source.read_text())

main = java_dir / "MainActivity.java"
text = main.read_text()
if "WidgetBridgePlugin" not in text:
    text = text.replace(
        "package com.example.mushaf;\n",
        "package com.example.mushaf;\n\nimport android.os.Bundle;\n",
        1,
    )
    text = text.replace(
        "import com.getcapacitor.BridgeActivity;",
        "import com.getcapacitor.BridgeActivity;\n\nimport com.example.mushaf.WidgetBridgePlugin;",
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
receiver = """        <receiver
            android:name=\".MushafWidgetProvider\"
            android:exported=\"true\">
            <intent-filter>
                <action android:name=\"android.appwidget.action.APPWIDGET_UPDATE\" />
                <action android:name=\"com.example.mushaf.WIDGET_TOGGLE\" />
                <action android:name=\"com.example.mushaf.WIDGET_DAILY_UPDATE\" />
            </intent-filter>
            <meta-data
                android:name=\"android.appwidget.provider\"
                android:resource=\"@xml/mushaf_widget_info\" />
        </receiver>
"""
if "MushafWidgetProvider" not in text:
    text = text.replace("</application>", receiver + "    </application>", 1)
manifest.write_text(text)
