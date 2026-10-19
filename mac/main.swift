// 流日小窗：把 web/widget.html 放进一张贴在桌面上的圆角小卡片。
// 计算全部在页面里的 JavaScript 完成；这里只负责窗口、菜单栏和保存个人资料。
import Cocoa
import ServiceManagement
import WebKit

let cardWidth: CGFloat = 340
let defaults = UserDefaults.standard

/// 无边框窗口默认不能输入文字；允许它成为键盘焦点，设置表单才能打字。
final class CardPanel: NSPanel {
    override var canBecomeKey: Bool { true }
}

/// 按住卡片顶部标题栏可以拖动窗口；其余区域正常点击。
final class CardWebView: WKWebView {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
    override func mouseDown(with event: NSEvent) {
        if let window, event.locationInWindow.y > window.frame.height - 36,
           event.locationInWindow.x < window.frame.width - 40 {
            window.performDrag(with: event)
        } else {
            super.mouseDown(with: event)
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate, WKScriptMessageHandler {
    var panel: CardPanel!
    var webView: CardWebView!
    var statusItem: NSStatusItem!
    var pinItem: NSMenuItem!
    var loginItem: NSMenuItem!

    var floating: Bool {
        get { defaults.bool(forKey: "floating") }
        set { defaults.set(newValue, forKey: "floating") }
    }

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildPanel()
        buildMenu()
        panel.orderFrontRegardless()
        // 合盖睡眠、屏幕关闭期间页面计时器会暂停，醒来后马上按当前时间刷新。
        for name in [NSWorkspace.didWakeNotification, NSWorkspace.screensDidWakeNotification,
                     NSWorkspace.sessionDidBecomeActiveNotification] {
            NSWorkspace.shared.notificationCenter.addObserver(
                forName: name, object: nil, queue: .main) { [weak self] _ in
                self?.webView.evaluateJavaScript("window.liuriTick && window.liuriTick()")
            }
        }
    }

    // MARK: 窗口

    func buildPanel() {
        let screen = NSScreen.main?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
        let frame = NSRect(x: screen.maxX - cardWidth - 24, y: screen.maxY - 260 - 24, width: cardWidth, height: 260)
        panel = CardPanel(contentRect: frame, styleMask: [.borderless, .nonactivatingPanel],
                          backing: .buffered, defer: false)
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.isMovableByWindowBackground = false
        panel.hidesOnDeactivate = false
        panel.collectionBehavior = [.canJoinAllSpaces, .stationary, .ignoresCycle]
        panel.setFrameAutosaveName("LiuriWidgetCard")
        applyLevel()

        // 实色暖肤色底，与页面里的卡片颜色一致，文字对比更清楚。
        let card = NSView(frame: NSRect(origin: .zero, size: frame.size))
        card.wantsLayer = true
        card.layer?.backgroundColor = NSColor(red: 0xfb / 255.0, green: 0xef / 255.0, blue: 0xe2 / 255.0, alpha: 1).cgColor
        card.layer?.cornerRadius = 22
        card.layer?.masksToBounds = true
        card.autoresizingMask = [.width, .height]
        panel.contentView = card

        let config = WKWebViewConfiguration()
        let controller = WKUserContentController()
        controller.add(self, name: "liuri")
        let profile = defaults.string(forKey: "profile") ?? "null"
        controller.addUserScript(WKUserScript(source: "window.LIURI_PROFILE = \(profile);",
                                              injectionTime: .atDocumentStart, forMainFrameOnly: true))
        config.userContentController = controller
        webView = CardWebView(frame: card.bounds, configuration: config)
        webView.setValue(false, forKey: "drawsBackground")
        webView.autoresizingMask = [.width, .height]
        card.addSubview(webView)

        let web = Bundle.main.resourceURL!.appendingPathComponent("web")
        webView.loadFileURL(web.appendingPathComponent("widget.html"), allowingReadAccessTo: web)
    }

    /// 默认贴在桌面上（在其他窗口下面，像系统小组件）；也可以切换成始终浮在最前。
    func applyLevel() {
        panel.level = floating ? .floating
            : NSWindow.Level(rawValue: Int(CGWindowLevelForKey(.desktopIconWindow)) + 1)
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? [String: Any], let type = body["type"] as? String else { return }
        switch type {
        case "height":
            // 卡片高度随通道数量变化，保持顶部位置不动。
            guard let value = body["value"] as? Double, value > 0 else { return }
            var frame = panel.frame
            let height = CGFloat(min(value, 720))
            frame.origin.y += frame.height - height
            frame.size.height = height
            panel.setFrame(frame, display: true)
        case "profile":
            guard let profile = body["profile"],
                  let data = try? JSONSerialization.data(withJSONObject: profile),
                  let text = String(data: data, encoding: .utf8) else { return }
            defaults.set(text, forKey: "profile")
        default:
            break
        }
    }

    // MARK: 菜单栏

    func buildMenu() {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "流"
        let menu = NSMenu()
        menu.addItem(withTitle: "显示小窗", action: #selector(showCard), keyEquivalent: "")
        menu.addItem(withTitle: "个人资料…", action: #selector(editProfile), keyEquivalent: ",")
        menu.addItem(withTitle: "重新计算", action: #selector(refresh), keyEquivalent: "r")
        menu.addItem(.separator())
        pinItem = menu.addItem(withTitle: "始终浮在最前", action: #selector(togglePin), keyEquivalent: "")
        loginItem = menu.addItem(withTitle: "开机自动打开", action: #selector(toggleLogin), keyEquivalent: "")
        menu.addItem(.separator())
        menu.addItem(withTitle: "退出流日小窗", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        statusItem.menu = menu
        updateMenuStates()
    }

    func updateMenuStates() {
        pinItem.state = floating ? .on : .off
        loginItem.state = SMAppService.mainApp.status == .enabled ? .on : .off
    }

    @objc func showCard() {
        panel.orderFrontRegardless()
    }

    @objc func editProfile() {
        NSApp.activate(ignoringOtherApps: true)
        panel.makeKeyAndOrderFront(nil)
        webView.evaluateJavaScript("window.liuriShowSettings && window.liuriShowSettings()")
    }

    @objc func refresh() {
        webView.evaluateJavaScript("window.liuriRefresh && window.liuriRefresh()")
    }

    @objc func togglePin() {
        floating.toggle()
        applyLevel()
        panel.orderFrontRegardless()
        updateMenuStates()
    }

    @objc func toggleLogin() {
        do {
            if SMAppService.mainApp.status == .enabled {
                try SMAppService.mainApp.unregister()
            } else {
                try SMAppService.mainApp.register()
            }
        } catch {
            let alert = NSAlert()
            alert.messageText = "没能设置开机自动打开"
            alert.informativeText = "请先把「流日小窗」拖进“应用程序”文件夹再试。也可以在“系统设置 → 通用 → 登录项”里手动添加。\n\n\(error.localizedDescription)"
            alert.runModal()
        }
        updateMenuStates()
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
