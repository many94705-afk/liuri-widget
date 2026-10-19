# 流日小窗

📱 **手机版**：[点这里打开](https://many94705-afk.github.io/liuri-widget/)（用浏览器打开后添加到主屏幕即可）

💻 **Mac 版**：[下载 liuri-widget-mac.zip](https://github.com/many94705-afk/liuri-widget/releases/download/V1.0/liuri-widget-mac.zip)（安装方法见下方）

一张小卡片，一眼看到**此刻**流日接通了你的哪些通道：

- 每条通道从几点到几点、还剩多久；
- 是哪颗星体接通的，例如「57.6 流日设计 · 月亮」（只显示你自己没有、由流日补上的闸门）；
- 接下来 24 小时将接通的通道及其时段。

全部计算在你自己的设备上完成：不联网计算、不上传出生信息、免费。星历使用 Swiss Ephemeris（内置 Moshier 星历）。

## 手机上使用（iPhone / 安卓）

1. 用手机浏览器打开本项目的网页版：<https://many94705-afk.github.io/liuri-widget/>
2. iPhone：Safari 点“分享 → 添加到主屏幕”；安卓：浏览器菜单里选“添加到主屏幕”。
3. 以后点桌面图标即可打开。第一次填写出生日期、时间和出生城市；打开过一次后断网也能用。

## Mac 桌面小窗

1. 在右侧 **Releases** 下载 `liuri-widget-mac.zip`，解压后把「流日小窗」拖进“应用程序”文件夹。
2. 第一次打开时 macOS 会提示“无法验证开发者”（因为没有付费签名）。打开“系统设置 → 隐私与安全性”，在页面下方点“仍要打开”，之后就能正常打开。
3. 在卡片里填写出生日期、时间和出生城市（如 成都、香港、东京，也可以填省份或完整地址），保存即可。

卡片贴在桌面上、不挡其他窗口。按住卡片顶部的标题可以拖动位置；点右上角 ⚙︎ 修改个人资料。屏幕顶部菜单栏的「流」字里还可以：重新计算、切换“始终浮在最前”、设置开机自动打开、退出。

## 自己构建

需要 Xcode 命令行工具（`xcode-select --install`），不需要完整 Xcode：

```bash
./build_mac.sh
```

生成 `dist/流日小窗.app`。网页版就是 `web/` 文件夹，直接放到任何静态网站即可。

核对计算结果：`node tests/compare.js`（`tests/reference.json` 是由原 Python 版引擎生成的参考数据）。

## 文件

- `web/engine.js`：闸门爻线、设计时刻（太阳往前 88°）、接通通道及起止时间的计算。
- `web/widget.html`：卡片界面；`web/cities.js`：出生城市 → 时区对照。
- `web/vendor/`：Swiss Ephemeris 的 WebAssembly 版本（来自 `@swisseph/browser` 1.4.0）。
- `mac/main.swift`、`build_mac.sh`：Mac 桌面小程序外壳与打包脚本。

## 授权

Swiss Ephemeris 以 AGPL-3.0 授权，本项目同样以 AGPL-3.0 公开源代码（见 `LICENSE`）。

仅供自我探索与参考。
