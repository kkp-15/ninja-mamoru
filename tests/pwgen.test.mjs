// パスワードを作る の検査（node tests/pwgen.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
const require = createRequire(import.meta.url);
const P = require('../password/tsukuru/pwgen.js');
const W = require('../password/tsukuru/words.js');
assert.equal(W.length, 7776);
// おまかせ: 長さと、選んだ種類が全部入る
for (let i = 0; i < 300; i++) {
  const r = P.randomPw({ len: 16, upper: true, digit: true, symbol: true, plain: true });
  assert.equal(r.pw.length, 16);
  assert.ok(/[a-z]/.test(r.pw) && /[A-Z]/.test(r.pw) && /[0-9]/.test(r.pw) && /[!@#$%^&*]/.test(r.pw), r.pw);
  assert.ok(!/[l1IO0]/.test(r.pw), '見分けにくい文字: ' + r.pw);
}
assert.ok(!/[A-Z0-9!@#$%^&*]/.test(P.randomPw({ len: 20, plain: false }).pw));
// Apple と同じ形
for (let i = 0; i < 300; i++) {
  const r = P.applePw();
  assert.match(r.pw, /^[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}$/);
  assert.equal(r.pw.length, 20);
  assert.equal((r.pw.match(/[A-Z]/g) || []).length, 1);
  assert.equal((r.pw.match(/[0-9]/g) || []).length, 1);
}
// 覚える用
const w = P.wordsPw({ n: 5, cap: true, num: true }, W);
assert.equal(w.pw.split('-').length, 5);
assert.equal((w.pw.match(/[0-9]/g) || []).length, 1);
assert.ok(Math.abs(P.wordsPw({ n: 6, cap: false, num: false }, W).bits - 77.5) < 0.1);
// 強さの目安
assert.equal(P.grade(81).label, 'とても強い'); assert.equal(P.grade(60).label, '強い'); assert.equal(P.grade(44).label, '弱い');
assert.equal(P.grade(P.randomPw({ len: 16, upper: true, digit: true, symbol: true, plain: true }).bits).label, 'とても強い');
// 確かめ: 全部よい答え → ok、流出あり → 先頭が「今日変える」
const good = { len: 1, reuse: 0, personal: 0, common: 0, leaked: 0, twofa: 1 };
assert.equal(P.check(good).level, 'ok');
const bad = P.check({ ...good, leaked: 1, reuse: 1 });
assert.equal(bad.level, 'danger');
// 入力欄を作らない（サイトの決まり）
import { readFileSync } from 'fs';
const html = readFileSync(new URL('../password/tsukuru/index.html', import.meta.url), 'utf8');
assert.ok(!/<input|<textarea|contenteditable/i.test(html), '入力欄がある');
console.log('pwgen.test: ok');
