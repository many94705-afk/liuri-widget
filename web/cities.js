// 出生城市 → 时区（离线对照表）。输入城市、省份、国家或完整地址都可以，取其中能认出的最长地名。
// 中国大陆一律按北京时间（Asia/Shanghai，含 1986—1991 年夏令时），新疆、西藏也按官方北京时间。
(function (root) {
  'use strict';

  const MAINLAND = `中国 中国大陆 大陆 内地
北京 天津 上海 重庆
河北 石家庄 唐山 秦皇岛 邯郸 邢台 保定 张家口 承德 沧州 廊坊 衡水 雄安
山西 太原 大同 阳泉 长治 晋城 朔州 晋中 运城 忻州 临汾 吕梁
内蒙古 呼和浩特 包头 乌海 赤峰 通辽 鄂尔多斯 呼伦贝尔 巴彦淖尔 乌兰察布 兴安盟 锡林郭勒 阿拉善 满洲里 二连浩特
辽宁 沈阳 大连 鞍山 抚顺 本溪 丹东 锦州 营口 阜新 辽阳 盘锦 铁岭 朝阳 葫芦岛
吉林 长春 吉林市 四平 辽源 通化 白山 松原 白城 延边 延吉 珲春
黑龙江 哈尔滨 齐齐哈尔 鸡西 鹤岗 双鸭山 大庆 伊春 佳木斯 七台河 牡丹江 黑河 绥化 大兴安岭 漠河
江苏 南京 无锡 徐州 常州 苏州 南通 连云港 淮安 盐城 扬州 镇江 泰州 宿迁 昆山 张家港 常熟 江阴 太仓 宜兴
浙江 杭州 宁波 温州 嘉兴 湖州 绍兴 金华 衢州 舟山 台州 丽水 义乌 慈溪 余姚 瑞安 乐清 诸暨 海宁 桐乡
安徽 合肥 芜湖 蚌埠 淮南 马鞍山 淮北 铜陵 安庆 黄山 滁州 阜阳 宿州 六安 亳州 池州 宣城
福建 福州 厦门 莆田 三明 泉州 漳州 南平 龙岩 宁德 晋江 石狮 福清
江西 南昌 景德镇 萍乡 九江 新余 鹰潭 赣州 吉安 宜春 抚州 上饶
山东 济南 青岛 淄博 枣庄 东营 烟台 潍坊 济宁 泰安 威海 日照 临沂 德州 聊城 滨州 菏泽 莱芜 寿光 即墨
河南 郑州 开封 洛阳 平顶山 安阳 鹤壁 新乡 焦作 濮阳 许昌 漯河 三门峡 南阳 商丘 信阳 周口 驻马店 济源
湖北 武汉 黄石 十堰 宜昌 襄阳 襄樊 鄂州 荆门 孝感 荆州 黄冈 咸宁 随州 恩施 仙桃 潜江 天门 神农架
湖南 长沙 株洲 湘潭 衡阳 邵阳 岳阳 常德 张家界 益阳 郴州 永州 怀化 娄底 湘西 吉首
广东 广州 深圳 珠海 汕头 佛山 韶关 湛江 肇庆 江门 茂名 惠州 梅州 汕尾 河源 阳江 清远 东莞 中山 潮州 揭阳 云浮 顺德
广西 南宁 柳州 桂林 梧州 北海 防城港 钦州 贵港 玉林 百色 贺州 河池 来宾 崇左
海南 海口 三亚 三沙 儋州 琼海 万宁 文昌
四川 成都 自贡 攀枝花 泸州 德阳 绵阳 广元 遂宁 内江 乐山 南充 眉山 宜宾 广安 达州 雅安 巴中 资阳 阿坝 甘孜 凉山 西昌
贵州 贵阳 六盘水 遵义 安顺 毕节 铜仁 黔西南 黔东南 黔南 凯里 都匀 兴义
云南 昆明 曲靖 玉溪 保山 昭通 丽江 普洱 临沧 楚雄 红河 蒙自 文山 西双版纳 景洪 大理 德宏 瑞丽 怒江 迪庆 香格里拉
西藏 拉萨 日喀则 昌都 林芝 山南 那曲 阿里
陕西 西安 铜川 宝鸡 咸阳 渭南 延安 汉中 榆林 安康 商洛
甘肃 兰州 嘉峪关 金昌 白银 天水 武威 张掖 平凉 酒泉 庆阳 定西 陇南 临夏 甘南 敦煌
青海 西宁 海东 海北 黄南 海南州 果洛 玉树 海西 格尔木 德令哈
宁夏 银川 石嘴山 吴忠 固原 中卫
新疆 乌鲁木齐 克拉玛依 吐鲁番 哈密 昌吉 博尔塔拉 巴音郭楞 库尔勒 阿克苏 克孜勒苏 喀什 和田 伊犁 伊宁 塔城 阿勒泰 石河子 奎屯`;

  // 其他国家和地区。只有一个时区的国家可以直接填国家名；美国、加拿大、澳大利亚、俄罗斯、巴西等请填城市。
  const OTHERS = {
    'Asia/Hong_Kong': '香港 九龙 新界',
    'Asia/Macau': '澳门',
    'Asia/Taipei': '台湾 台北 新北 桃园 台中 台南 高雄 基隆 新竹 嘉义 彰化 屏东 宜兰 花莲 台东 苗栗 南投 云林',
    'Asia/Tokyo': '日本 东京 大阪 京都 横滨 名古屋 札幌 福冈 神户 冲绳 那霸',
    'Asia/Seoul': '韩国 首尔 釜山 仁川 大邱 济州',
    'Asia/Pyongyang': '朝鲜 平壤',
    'Asia/Ulaanbaatar': '蒙古国 乌兰巴托',
    'Asia/Singapore': '新加坡',
    'Asia/Kuala_Lumpur': '马来西亚 吉隆坡 槟城 新山 马六甲 怡保',
    'Asia/Bangkok': '泰国 曼谷 清迈 普吉',
    'Asia/Ho_Chi_Minh': '越南 河内 胡志明市 西贡 岘港 海防',
    'Asia/Phnom_Penh': '柬埔寨 金边 暹粒',
    'Asia/Vientiane': '老挝 万象',
    'Asia/Yangon': '缅甸 仰光 曼德勒',
    'Asia/Manila': '菲律宾 马尼拉 宿务',
    'Asia/Jakarta': '雅加达 泗水 万隆',
    'Asia/Makassar': '巴厘岛',
    'Asia/Kolkata': '印度 新德里 德里 孟买 班加罗尔 加尔各答 金奈 海德拉巴',
    'Asia/Kathmandu': '尼泊尔 加德满都',
    'Asia/Dhaka': '孟加拉 达卡',
    'Asia/Karachi': '巴基斯坦 卡拉奇 伊斯兰堡 拉合尔',
    'Asia/Colombo': '斯里兰卡 科伦坡',
    'Asia/Dubai': '阿联酋 迪拜 阿布扎比',
    'Asia/Qatar': '卡塔尔 多哈',
    'Asia/Riyadh': '沙特 利雅得 吉达',
    'Asia/Tehran': '伊朗 德黑兰',
    'Asia/Jerusalem': '以色列 耶路撒冷 特拉维夫',
    'Asia/Almaty': '哈萨克斯坦 阿拉木图 阿斯塔纳',
    'Europe/Istanbul': '土耳其 伊斯坦布尔 安卡拉',
    'Europe/Moscow': '莫斯科 圣彼得堡',
    'Europe/London': '英国 伦敦 曼彻斯特 伯明翰 利物浦 爱丁堡 格拉斯哥',
    'Europe/Dublin': '爱尔兰 都柏林',
    'Europe/Paris': '法国 巴黎 里昂 马赛 尼斯',
    'Europe/Berlin': '德国 柏林 慕尼黑 法兰克福 汉堡 科隆 斯图加特',
    'Europe/Rome': '意大利 罗马 米兰 威尼斯 佛罗伦萨 那不勒斯',
    'Europe/Madrid': '西班牙 马德里 巴塞罗那',
    'Europe/Lisbon': '葡萄牙 里斯本',
    'Europe/Amsterdam': '荷兰 阿姆斯特丹 鹿特丹',
    'Europe/Brussels': '比利时 布鲁塞尔',
    'Europe/Zurich': '瑞士 苏黎世 日内瓦 伯尔尼',
    'Europe/Vienna': '奥地利 维也纳',
    'Europe/Prague': '捷克 布拉格',
    'Europe/Warsaw': '波兰 华沙',
    'Europe/Budapest': '匈牙利 布达佩斯',
    'Europe/Athens': '希腊 雅典',
    'Europe/Stockholm': '瑞典 斯德哥尔摩',
    'Europe/Oslo': '挪威 奥斯陆',
    'Europe/Copenhagen': '丹麦 哥本哈根',
    'Europe/Helsinki': '芬兰 赫尔辛基',
    'Europe/Kyiv': '乌克兰 基辅',
    'America/New_York': '纽约 波士顿 华盛顿 费城 迈阿密 亚特兰大 底特律 匹兹堡 奥兰多',
    'America/Chicago': '芝加哥 休斯顿 达拉斯 奥斯汀 新奥尔良 明尼阿波利斯 圣路易斯',
    'America/Denver': '丹佛 盐湖城',
    'America/Phoenix': '凤凰城 菲尼克斯',
    'America/Los_Angeles': '洛杉矶 旧金山 西雅图 圣何塞 拉斯维加斯 波特兰 硅谷',
    'Pacific/Honolulu': '夏威夷 檀香山',
    'America/Anchorage': '阿拉斯加 安克雷奇',
    'America/Toronto': '多伦多 蒙特利尔 渥太华 魁北克',
    'America/Vancouver': '温哥华 维多利亚',
    'America/Edmonton': '卡尔加里 埃德蒙顿',
    'America/Mexico_City': '墨西哥 墨西哥城',
    'America/Sao_Paulo': '圣保罗 里约热内卢',
    'America/Argentina/Buenos_Aires': '阿根廷 布宜诺斯艾利斯',
    'America/Santiago': '智利',
    'America/Lima': '秘鲁 利马',
    'Australia/Sydney': '悉尼 堪培拉',
    'Australia/Melbourne': '墨尔本',
    'Australia/Brisbane': '布里斯班 黄金海岸',
    'Australia/Perth': '珀斯',
    'Australia/Adelaide': '阿德莱德',
    'Pacific/Auckland': '新西兰 奥克兰 惠灵顿 基督城',
    'Africa/Cairo': '埃及 开罗',
    'Africa/Johannesburg': '南非 约翰内斯堡 开普敦',
    'Africa/Nairobi': '肯尼亚 内罗毕',
    'Africa/Lagos': '尼日利亚 拉各斯',
  };
  const MULTI_ZONE = '美国 加拿大 澳大利亚 澳洲 俄罗斯 巴西 印度尼西亚 印尼';

  const LABELS = {
    'Asia/Shanghai': '北京时间（中国大陆）', 'Asia/Hong_Kong': '香港时间', 'Asia/Macau': '澳门时间', 'Asia/Taipei': '台湾时间',
  };

  const names = new Map();
  for (const name of MAINLAND.split(/\s+/)) if (name) names.set(name, 'Asia/Shanghai');
  for (const [zone, list] of Object.entries(OTHERS)) for (const name of list.split(/\s+/)) names.set(name, zone);
  const multi = MULTI_ZONE.split(/\s+/);

  // 返回 {zone, label} ；认不出时返回 {error}。也接受直接输入的时区，如 Asia/Tokyo、+09:00。
  function resolve(text) {
    const raw = String(text || '').trim();
    if (!raw) return { error: '请填写出生城市' };
    if (/^[A-Za-z_]+\/[A-Za-z_\/]+$/.test(raw)) {
      try { new Intl.DateTimeFormat('en-US', { timeZone: raw }); return { zone: raw, label: raw }; }
      catch (e) { return { error: `不认识时区「${raw}」` }; }
    }
    if (/^(UTC|GMT)?\s*[+-]\d{1,2}(:\d{2})?$/i.test(raw)) {
      const zone = raw.replace(/^(UTC|GMT)\s*/i, '');
      return { zone: zone === '+08:00' || zone === '+8' ? 'Asia/Shanghai' : zone, label: `UTC${zone}` };
    }
    let best = '';
    for (const name of names.keys()) if (name.length > best.length && raw.includes(name)) best = name;
    if (best) {
      const zone = names.get(best);
      const city = new Intl.DateTimeFormat('zh-CN', { timeZone: zone, timeZoneName: 'long' })
        .formatToParts(new Date()).find(p => p.type === 'timeZoneName');
      return { zone, label: LABELS[zone] || (city ? city.value : zone), matched: best };
    }
    const country = multi.find(name => raw.includes(name));
    if (country) return { error: `${country}有多个时区，请填具体出生城市` };
    return { error: `没找到「${raw}」。中国大陆可以填所在省或地级市（如 浙江、金华）；国外请填大城市名，或直接填时区（如 Asia/Tokyo、+09:00）` };
  }

  const api = { resolve };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.LiuriCities = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
