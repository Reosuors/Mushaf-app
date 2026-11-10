"""Configure release signing + version for the Capacitor Android project (run in CI after `cap sync`).
Reads the upload keystore path/passwords from environment variables set from GitHub secrets."""
from pathlib import Path
import os, re

root = Path(__file__).resolve().parents[1]
app_gradle = root / "android/app/build.gradle"
variables = root / "android/variables.gradle"

# Play requires targetSdk >= 35; make sure compile/target are at least 35.
if variables.exists():
    v = variables.read_text()
    for key in ("compileSdkVersion", "targetSdkVersion"):
        m = re.search(key + r"\s*=\s*(\d+)", v)
        if m and int(m.group(1)) < 35:
            v = v.replace(m.group(0), f"{key} = 35")
    variables.write_text(v)
    print([l.strip() for l in v.splitlines() if "Sdk" in l])

g = app_gradle.read_text()
if "MUSHAF_RELEASE_SIGNING" not in g:
    g += """

// MUSHAF_RELEASE_SIGNING: Play upload signing + version (values come from GitHub secrets / CI env)
android {
    defaultConfig {
        versionCode = Integer.parseInt(System.getenv("VERSION_CODE") ?: "1")
        versionName = System.getenv("VERSION_NAME") ?: "1.0.0"
    }
    signingConfigs {
        release {
            if (System.getenv("KEYSTORE_FILE")) {
                storeFile = file(System.getenv("KEYSTORE_FILE"))
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            if (System.getenv("KEYSTORE_FILE")) {
                signingConfig = signingConfigs.release
            }
        }
    }
}
"""
    app_gradle.write_text(g)
print("release signing configured; keystore from env:", bool(os.environ.get("KEYSTORE_FILE")))
