// 総額くらべの計算テスト（node tests/compare.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
const require = createRequire(import.meta.url);
const { calc } = require('../password/compare.js');
const r = (n) => Math.round(n);
// 1人・3年: 3年版 17,980 / 年払い 47.88*3*159.17*1.1 = 25,149.3
let x = calc(1, 3);
assert.equal(x.sn, 17980); assert.equal(r(x.yr), 25149); assert.equal(x.best, 'sn');
// 1人・1年: 3年版は3年分の価格のまま 17,980、年払い 8,383
x = calc(1, 1);
assert.equal(x.sn, 17980); assert.equal(r(x.yr), 8383); assert.equal(x.best, 'yr');
// 家族・6年: 3年版2回 55,960 / 年払い 71.88*6*159.17 = 68,647.2 ×1.1 = 75,511.9
x = calc(5, 6);
assert.equal(x.sn, 55960); assert.equal(r(x.yr), 75512); assert.equal(x.best, 'sn');
// 月払いは年払いより高い
assert.ok(calc(1, 3).mo > calc(1, 3).yr);
console.log('compare.test: ok');
