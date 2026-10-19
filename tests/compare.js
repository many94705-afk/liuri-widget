// 逐条比对 JavaScript 引擎与正式版 Python 引擎。运行：node tests/compare.js
const assert = require('node:assert/strict');
const ref = require('./reference.json');
const E = require('../web/engine.js');

(async () => {
  await E.init();
  let maxLon = 0, maxDesign = 0;
  for (const c of ref.charts) {
    const js = E.chart(c.ms);
    maxDesign = Math.max(maxDesign, Math.abs(js.designTime - c.designMs));
    for (const side of ['personality', 'design']) for (const [name, [lon, gate, line]] of Object.entries(c[side])) {
      const p = js[side][name];
      maxLon = Math.max(maxLon, Math.abs(((p.lon - lon + 540) % 360) - 180));
      assert.deepEqual([p.gl.gate, p.gl.line], [gate, line], `${new Date(c.ms).toISOString()} ${side} ${name}`);
    }
  }
  console.log(`300 张图 × 26 个星体闸门爻线全部一致；黄经最大差 ${maxLon.toExponential(2)}°，设计时刻最大差 ${maxDesign} 毫秒`);
  const iso = ms => ms == null ? null : new Date(ms).toISOString().slice(0, 16);
  const py = s => s == null ? null : new Date(s).toISOString().slice(0, 16);
  let n = 0;
  for (const v of ref.views) {
    const js = E.nowView(v.birthMs, v.nowMs);
    const strip = list => list.map(c => ({ ...c, start: c.start ?? null, end: c.end ?? null }));
    assert.deepEqual(js.channels.map(c => c.channel).sort(), v.view.channels.map(c => c.channel).sort());
    for (const c of v.view.channels) {
      const j = js.channels.find(x => x.channel === c.channel);
      assert.equal(iso(j.start), py(c.start), `start ${c.channel}`);
      assert.equal(iso(j.end), py(c.end), `end ${c.channel}`);
      assert.deepEqual(j.gates, c.gates);
      n++;
    }
    assert.deepEqual(js.upcoming.map(u => [u.channel, iso(u.start), iso(u.end)]), v.view.upcoming.map(u => [u.channel, py(u.start), py(u.end)]));
  }
  console.log(`12 个人 × 此刻接通：${n} 条通道的起止时间（到分钟）、星体来源、24 小时预告（含结束时间）全部一致`);
})().catch(e => { console.error(e); process.exitCode = 1; });

// 出生时间换算（含 1986—1991 年中国大陆夏令时）与正式版 parse_local_datetime 一致。
const TZ_CASES = [
  ['1990-05-15', '19:29', 'Asia/Shanghai', 642767340000],
  ['1993-11-08', '21:40', 'Asia/Shanghai', 752766000000],
  ['1988-08-01', '12:00', 'Asia/Shanghai', 586407600000],
  ['2000-01-01', '00:30', 'Asia/Tokyo', 946654200000],
  ['1975-07-04', '09:10', 'America/New_York', 173711400000],
  ['2001-06-15', '12:30', '+05:30', 992588400000],
  ['2001-06-15', '12:30', '-03:00', 992619000000],
];
for (const [d, t, z, expected] of TZ_CASES) assert.equal(E.localToUtc(d, t, z), expected, `${d} ${t} ${z}`);
console.log(`出生时间换算 ${TZ_CASES.length} 个样本一致（含 1990 年夏令时）`);

// 出生城市 → 时区
const C = require('../web/cities.js');
const CITY_CASES = [
  ['成都', 'Asia/Shanghai'], ['广东省深圳市南山区', 'Asia/Shanghai'], ['乌鲁木齐', 'Asia/Shanghai'], ['中国大陆', 'Asia/Shanghai'],
  ['海南州', 'Asia/Shanghai'], ['香港', 'Asia/Hong_Kong'], ['台北市', 'Asia/Taipei'], ['澳门', 'Asia/Macau'],
  ['日本东京', 'Asia/Tokyo'], ['美国纽约', 'America/New_York'], ['洛杉矶', 'America/Los_Angeles'], ['悉尼', 'Australia/Sydney'],
  ['Asia/Tokyo', 'Asia/Tokyo'], ['+08:00', 'Asia/Shanghai'], ['+09:00', '+09:00'],
];
for (const [text, zone] of CITY_CASES) assert.equal(C.resolve(text).zone, zone, text);
for (const text of ['美国', '火星城', '', 'Mars/Base']) assert.ok(C.resolve(text).error, text);
assert.equal(E.localToUtc('1990-05-15', '19:29', C.resolve('成都').zone), 642767340000);
console.log(`出生城市对照 ${CITY_CASES.length} 个样本正确，认不出时给出提示`);
