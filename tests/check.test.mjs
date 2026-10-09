// 守り度チェックの判定テスト（node tests/check.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
const require = createRequire(import.meta.url);
const { ITEMS, judge } = require('../check.js');

const ids = ITEMS.map(i => i.id);
const all = v => Object.fromEntries(ids.map(id => [id, v]));

// 全部はい
let r = judge(all(1));
assert.equal(r.complete, true); assert.equal(r.yes, 8); assert.equal(r.top.length, 0); assert.equal(r.level, 'all');

// 全部いいえ → 優先順の上から3つ、残り5つ
r = judge(all(0));
assert.deepEqual(r.top.map(i => i.id), ['reuse', 'mail2fa', 'link']);
assert.equal(r.rest.length, 5); assert.equal(r.level, 'low');

// 未回答があれば complete=false
r = judge({ reuse: 1, mail2fa: 0 });
assert.equal(r.answered, 2); assert.equal(r.complete, false);

// いいえが2つ → good、順番は ITEMS の並び
r = judge({ ...all(1), sns: 0, update: 0 });
assert.deepEqual(r.top.map(i => i.id), ['update', 'sns']); assert.equal(r.level, 'good');

// いいえが4つ → mid
r = judge({ ...all(1), pm: 0, card: 0, sns: 0, link: 0 });
assert.equal(r.level, 'mid'); assert.deepEqual(r.top.map(i => i.id), ['link', 'pm', 'card']);

// 項目のリンク先は空でない
ITEMS.forEach(i => { assert.ok(i.link && i.linkText && i.todo && i.q, i.id); });

console.log('check.test: ok');
