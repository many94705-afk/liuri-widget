#!/bin/zsh
# 打包 Mac 桌面小程序：dist/流日小窗.app（同时支持 Apple 芯片和 Intel）。
# 只需要 Xcode 命令行工具（xcode-select --install），不需要完整的 Xcode。
set -e
cd "$(dirname "$0")"

APP="dist/流日小窗.app"
rm -rf "$APP" build
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources" build

for arch in arm64 x86_64; do
  swiftc -O -target "$arch-apple-macos13.0" -o "build/LiuriWidget-$arch" mac/main.swift \
    -framework Cocoa -framework WebKit -framework ServiceManagement
done
lipo -create build/LiuriWidget-arm64 build/LiuriWidget-x86_64 -output "$APP/Contents/MacOS/LiuriWidget"

cp -R web "$APP/Contents/Resources/web"
[[ -f mac/AppIcon.icns ]] && cp mac/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"

cat > "$APP/Contents/Info.plist" <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>CFBundleName</key><string>流日小窗</string>
  <key>CFBundleDisplayName</key><string>流日小窗</string>
  <key>CFBundleIdentifier</key><string>app.liuri.widget</string>
  <key>CFBundleExecutable</key><string>LiuriWidget</string>
  <key>CFBundleIconFile</key><string>AppIcon</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>1.0</string>
  <key>CFBundleVersion</key><string>1</string>
  <key>LSMinimumSystemVersion</key><string>13.0</string>
  <key>LSUIElement</key><true/>
  <key>NSHighResolutionCapable</key><true/>
</dict></plist>
PLIST

codesign --force --deep --sign - "$APP"
rm -rf build
echo "已生成：$APP"
