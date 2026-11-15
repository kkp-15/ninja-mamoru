// 印刷して使うパスワード管理ノート の検査（node tests/note.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
const N = require('../password/note/note.js');
// はじめの形: 大きく書ける4件・欄は少なめ（はじめての人が迷わない）
assert.equal(N.DEF.per, 4); assert.equal(N.DEF.twofa, false); assert.equal(N.rows(N.DEF).length, 8);
// 件数と枚数
assert.equal(N.total({ ...N.DEF, per: 6, sheets: 2 }), 12);
assert.equal(N.summary({ ...N.DEF, per: 8, sheets: 3 }), 'A4・3枚・24件ぶん（1枚8件）');
// どの組み合わせでも、1件の行数が枠に入る（1行7mm以上）。枠の高さ = (268 - すき間) ÷ 段の数
for (const per of N.PER) for (const twofa of [0, 1]) for (const question of [0, 1]) for (const memo of [0, 1]) for (const history of [0, 1]) {
  const o = { ...N.DEF, per, twofa, question, memo, history };
  const rows = N.rows(o).length, lanes = per / 2, h = (268 - 4 * (lanes - 1)) / lanes;
  assert.ok(h / rows >= 7, `行が低すぎる per=${per} rows=${rows} ${(h / rows).toFixed(1)}mm`);
  assert.equal(N.rows(o).filter(r => /his/.test(r.c)).length, N.historyRows(o));
  if (history) assert.ok(N.historyRows(o) >= 1);
}
// 用紙: 枚数ぶんの紙・件数ぶんの枠・通し番号・「パスワード」という題を出さない
const html = N.allHtml({ ...N.DEF, per: 6, sheets: 3 });
assert.equal((html.match(/class="sheet /g) || []).length, 3);
assert.equal((html.match(/class="card"/g) || []).length, 18);
assert.ok(html.includes('<span class="no">18</span>'));
assert.ok(N.sheetHtml({ ...N.DEF, hint: true }, 1).includes('パスワードの手がかり'));
assert.ok(!N.sheetHtml({ ...N.DEF, caution: false }, 1).includes('持ち歩かない'));
// 入力欄を作らない・外部リンクは運営の2つだけ（サイトの決まり）
const page = readFileSync(new URL('../password/note/index.html', import.meta.url), 'utf8');
assert.ok(!/<input|<textarea|<select|contenteditable|<form/i.test(page), '入力欄がある');
assert.ok(/<details class="custom" id="custom">/.test(page), '選ぶ項目は折りたたみの中');
assert.ok(!/style="/.test(page) && !/<style/.test(page), 'CSPで使えない書き方');
const ext = [...page.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => new URL(m[1]).hostname).filter(h => h !== 'mamoru.kkpwebninja.com');
assert.deepEqual([...new Set(ext)].sort(), ['kkpwebninja.com', 'privacypolicy.kkpwebninja.com']);
assert.ok(!/リベ|学長|両/.test(page), '会員限定の情報源の名前が出ている');
assert.ok(/<details class="custom" id="kangae">/.test(page) && /id="motto"/.test(page), '考え方とコツは読みたい人だけ開ける形');
const js = readFileSync(new URL('../password/note/note.js', import.meta.url), 'utf8');
assert.ok(!/localStorage|fetch\(|XMLHttpRequest|sendBeacon/.test(js), '保存や送信がある');
console.log('note.test: ok');
