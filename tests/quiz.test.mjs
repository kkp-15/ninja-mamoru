// 見分けトレーニングのデータ検査（node tests/quiz.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
const require = createRequire(import.meta.url);
const { Q } = require('../sagi/quiz.js');
assert.equal(Q.length, 10);
for (const q of Q) {
  assert.equal(q.opts.length, 3, q.body);
  assert.ok(q.ok >= 0 && q.ok < 3, q.body);
  assert.ok(/^https:\/\/www\.(nta\.go\.jp|japanpost\.jp|yamato-hd\.co\.jp|antiphishing\.jp|docomo\.ne\.jp)\//.test(q.src[1]), '出典は公式ドメインだけ: ' + q.src[1]);
  // 偽URL・電話番号・メールアドレスを載せない
  const text = [q.body, q.link, q.from, ...q.opts, q.why].join(' ');
  assert.ok(!/https?:\/\/|www\.|@|\d{2,4}-\d{2,4}-\d{3,4}/.test(text), '問題文にURL・アドレス・電話番号: ' + text);
}
console.log('quiz.test: ok');
// 正解だけ長い・具体的、で当てられないように、選択肢の長さをそろえる
for (const q of Q) {
  const L = q.opts.map(o => [...o].length);
  assert.ok(Math.max(...L) / Math.min(...L) <= 1.35, '選択肢の長さの差が大きい: ' + q.opts.join(' / '));
  assert.ok([...q.opts[q.ok]].length <= Math.max(...L.filter((_, k) => k !== q.ok)) + 4, '正解だけ長い: ' + q.opts[q.ok]);
}
console.log('quiz.test (長さ): ok');
