// 生成图标：暖肤色圆角方块 + 粉色「流」字。
// 运行：swift mac/make_icon.swift （输出 web/icon-180.png、web/icon-512.png 和 mac/AppIcon.icns 所需的图片集）
import AppKit

func draw(size: CGFloat, rounded: Bool) -> NSBitmapImageRep {
    let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: Int(size), pixelsHigh: Int(size),
                               bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false,
                               colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    let rect = NSRect(x: 0, y: 0, width: size, height: size)
    // macOS 图标按规范留边并画圆角；iPhone 图标铺满，由系统自己裁圆角。
    let body = rounded ? rect.insetBy(dx: size * 0.1, dy: size * 0.1) : rect
    let path = rounded ? NSBezierPath(roundedRect: body, xRadius: size * 0.18, yRadius: size * 0.18) : NSBezierPath(rect: body)
    NSColor(red: 0xfb / 255.0, green: 0xef / 255.0, blue: 0xe2 / 255.0, alpha: 1).setFill()
    path.fill()
    let font = NSFont(name: "PingFangSC-Semibold", size: body.width * 0.56) ?? NSFont.boldSystemFont(ofSize: body.width * 0.56)
    let text = NSAttributedString(string: "流", attributes: [
        .font: font, .foregroundColor: NSColor(red: 0xe2 / 255.0, green: 0x45 / 255.0, blue: 0x7f / 255.0, alpha: 1)])
    let box = text.size()
    text.draw(at: NSPoint(x: body.midX - box.width / 2, y: body.midY - box.height / 2))
    NSGraphicsContext.restoreGraphicsState()
    return rep
}

func save(_ rep: NSBitmapImageRep, _ path: String) {
    try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
}

let root = URL(fileURLWithPath: #filePath).deletingLastPathComponent().deletingLastPathComponent().path
save(draw(size: 180, rounded: false), "\(root)/web/icon-180.png")
save(draw(size: 512, rounded: false), "\(root)/web/icon-512.png")
let set = "\(root)/mac/AppIcon.iconset"
try? FileManager.default.createDirectory(atPath: set, withIntermediateDirectories: true)
for base in [16, 32, 128, 256, 512] {
    save(draw(size: CGFloat(base), rounded: true), "\(set)/icon_\(base)x\(base).png")
    save(draw(size: CGFloat(base * 2), rounded: true), "\(set)/icon_\(base)x\(base)@2x.png")
}
print("图标已生成")
