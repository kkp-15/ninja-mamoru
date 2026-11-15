// 印刷して使うパスワード管理ノート の検査（node tests/note.test.mjs）
import { createRequire } from 'module';
import assert from 'assert';
import { readFileSync } from 'fs';
const require = createRequire(import.meta.url);
const N = require('../password/note/note.js');
// はじめの形: 大きく書ける4件・欄は少なめ（はじめての人が迷わない）
assert.equal(N.DEF.per, 4); assert.equal(N.DEF.twofa, false); assert.equal(N.rows(N.DEF).length, 8);
// 選べるのは少しだけ（削ぎ落とし 2026-11-15）
assert.deepEqual(N.PER, [4, 8]); assert.deepEqual(N.SHEETS, [1, 3, 5]);
// 件数と枚数
assert.equal(N.total({ ...N.DEF, per: 8, sheets: 3 }), 24);
assert.equal(N.summary({ ...N.DEF, per: 8, sheets: 3 }), 'A4・3枚・24件ぶん');
// どの組み合わせでも、1件の行数が枠に入る（1行7mm以上）。枠の高さ = (268 - すき間) ÷ 段の数
for (const per of N.PER) for (const twofa of [false, true]) for (const memo of [false, true]) for (const history of [false, true]) {
  const o = { ...N.DEF, per, twofa, memo, history };
  const rows = N.rows(o).length, lanes = per / 2, h = (268 - 4 * (lanes - 1)) / lanes;
  assert.ok(h / rows >= 7, `行が低すぎる per=${per} rows=${rows} ${(h / rows).toFixed(1)}mm`);
  assert.equal(N.rows(o).filter(r => /his/.test(r.c)).length, N.historyRows(o));
}
// 用紙: 枚数ぶんの紙・件数ぶんの枠・通し番号・保管の注意書き
const html = N.allHtml({ ...N.DEF, per: 4, sheets: 3 });
assert.equal((html.match(/class="sheet /g) || []).length, 3);
assert.equal((html.match(/class="card"/g) || []).length, 12);
assert.ok(html.includes('<span class="no">12</span>') && html.includes('持ち歩かない'));
// 記入例: 画面だけ。印刷の用紙には入らない。メールは example.com（実在しない）
const ex = N.sampleHtml(N.DEF);
assert.ok(ex.includes('class="v old"') && ex.includes('新：') && ex.includes('hanako@example.com'));
assert.ok(!N.allHtml(N.DEF).includes('class="v'), '記入例が印刷に入っている');
assert.ok(!N.sampleHtml({ ...N.DEF, history: false }).includes('class="v old"'), '履歴なしのときは線を引かない');
// パスワードの案: 6文字×3・大文字1・数字1・見分けにくい文字なし。記入例と同じ形
const FORM = /^[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}-[a-zA-Z0-9]{6}$/, seen = new Set();
for (let i = 0; i < 500; i++) {
  const pw = N.makePw(); seen.add(pw);
  assert.match(pw, FORM);
  assert.equal((pw.match(/[A-Z]/g) || []).length, 1); assert.equal((pw.match(/[0-9]/g) || []).length, 1);
  assert.ok(!/[lIO01]/.test(pw), '見分けにくい文字: ' + pw);
}
assert.equal(seen.size, 500);
assert.match(N.SAMPLE.pw, FORM);
// 入力欄を作らない・外部リンクは運営の2つだけ（サイトの決まり）
const page = readFileSync(new URL('../password/note/index.html', import.meta.url), 'utf8');
assert.ok(!/<input|<textarea|<select|contenteditable|<form/i.test(page), '入力欄がある');
assert.ok(/<details class="custom" id="custom">/.test(page), '選ぶ項目は折りたたみの中');
assert.ok(!/style="/.test(page) && !/<style/.test(page), 'CSPで使えない書き方');
const ext = [...page.matchAll(/href="(https?:\/\/[^"]+)"/g)].map(m => new URL(m[1]).hostname).filter(h => h !== 'mamoru.kkpwebninja.com');
assert.deepEqual([...new Set(ext)].sort(), ['kkpwebninja.com', 'privacypolicy.kkpwebninja.com']);
// 価格は管理アプリのページ（compare.js）と同じ数字で書く
const cmp = readFileSync(new URL('../password/compare.js', import.meta.url), 'utf8');
for (const yen of ['17980', '27980']) assert.ok(cmp.includes(yen) && page.includes(Number(yen).toLocaleString('ja-JP') + '円'), '価格が compare.js と合わない: ' + yen);
assert.ok(/id="noteCta" href="\/password\/"/.test(page), '次の一歩はサイト内の総額くらべへ');
assert.ok(!/リベ|学長|両/.test(page), '会員限定の情報源の名前が出ている');
// メインを前に: 見出し（h2）を本文に並べない。読み物は「くわしく読む」の中
assert.ok(!/<h2/.test(page.split('<main>')[1].split('</main>')[0]), '本文に大きな見出しが出ている');
assert.ok(/<details class="custom more" id="more">/.test(page) && page.indexOf('id="more"') < page.indexOf('id="shimau"'), '読み物は折りたたみの中');
assert.ok(/id="kangae"/.test(page) && /id="motto"/.test(page) && /id="rei"/.test(page) && /id="tsukuru"/.test(page), '考え方・コツ・記入例・案は読みたい人だけ開ける形');
// 画面の部品が js と合っている（消した部品を js が探していない）
const js = readFileSync(new URL('../password/note/note.js', import.meta.url), 'utf8');
for (const m of js.matchAll(/\$\('([A-Za-z_]+)'\)/g)) assert.ok(page.includes('id="' + m[1] + '"'), 'ページに無い部品: ' + m[1]);
for (const id of ['o_twofa', 'o_memo', 'o_history']) assert.ok(page.includes('id="' + id + '"'));
assert.ok(!/localStorage|fetch\(|XMLHttpRequest|sendBeacon/.test(js), '保存や送信がある');
// 広告はPCの横だけ: プログラムは広い画面のときだけ js が読みこむ（ページに直接は書かない）。大きさは固定
assert.ok(!/<script[^>]+googlesyndication/.test(page), '広告のプログラムをページに直接書いている');
assert.ok(/min-width:1140px/.test(js) && /__kkpPreview/.test(js), '広い画面のときだけ読みこむ');
assert.ok(!/data-ad-format="auto"|full-width-responsive="true"/.test(page), '広告の大きさを auto にしている');
const hd = readFileSync(new URL('../_headers', import.meta.url), 'utf8');
assert.ok(/^\/\*\n  Content-Security-Policy: default-src 'self'; script-src 'self' https:\/\/www\.googletagmanager\.com;/m.test(hd), 'ほかのページの決まりが変わっている');
assert.equal((hd.match(/^\/password\/note\/\*$/gm) || []).length, 1);

// 入口: パスワードの3ページの上に、行き来するタブがある（「どこに印刷があるかわからない」への対処）
for (const f of ['../password/index.html', '../password/tsukuru/index.html', '../password/note/index.html']) {
  const h = readFileSync(new URL(f, import.meta.url), 'utf8');
  assert.ok(/<nav class="subnav"[^>]*>.*href="\/password\/note\/"[^>]*>ノートを印刷<\/a>/.test(h), 'タブが無い: ' + f);
}
console.log('note.test: ok');
