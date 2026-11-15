/* 印刷して使うパスワード管理ノート。
   白紙の用紙を作って印刷するだけ。画面には何も打ち込ませない（サイトの決まり）。
   選んだ内容（件数・欄・枚数）は保存も送信もしない。数えるのは「印刷を押した回数」だけ。 */
(function (root) {
  var PER = [4, 6, 8];                 // 1枚あたりの件数
  var SHEETS = [1, 2, 3, 5, 10];       // 枚数
  var DEF = { per: 6, sheets: 2, twofa: true, question: false, memo: true, history: true, hint: false, caution: true };

  // 変更の履歴の行数。1件の枠を高くできるほど多く取る（1行は約7mm以上を保つ）
  function historyRows(o) {
    if (!o.history) return 0;
    var base = 4 + (o.twofa ? 1 : 0) + (o.question ? 1 : 0) + (o.memo ? 1 : 0);
    var max = { 4: 17, 6: 11, 8: 8 }[o.per] - base;       // 枠の高さ ÷ 7.3mm から、見出し以外に入る行数
    return Math.max(1, Math.min(max, { 4: 5, 6: 3, 8: 2 }[o.per]));
  }

  // 1件ぶんの行（上から順）。k=ラベル、c=行の種類
  function rows(o) {
    var r = [
      { c: 'name', k: 'サービス名' },
      { c: 'line', k: 'ログインID' },
      { c: 'line pw', k: o.hint ? 'パスワードの手がかり' : 'パスワード' },
      { c: 'line', k: '登録メール' }
    ];
    if (o.twofa) r.push({ c: 'line box', k: '2段階認証', t: '□SMS　□アプリ　□パスキー　□なし' });
    if (o.question) r.push({ c: 'line', k: 'ひみつの質問など' });
    if (o.memo) r.push({ c: 'line', k: 'メモ' });
    for (var i = 0, n = historyRows(o); i < n; i++) r.push({ c: 'line his', k: '変えた日', t: '　　.　　.　　　新：' });
    return r;
  }

  function total(o) { return o.per * o.sheets; }
  function summary(o) { return 'A4・' + o.sheets + '枚・' + total(o) + '件ぶん（1枚' + o.per + '件）'; }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // 1枚ぶんのHTML。page は 1 から
  function sheetHtml(o, page) {
    var rs = rows(o), h = '<div class="sheet per' + o.per + '"><div class="cards">';
    for (var i = 0; i < o.per; i++) {
      var no = (page - 1) * o.per + i + 1;
      h += '<div class="card">';
      for (var j = 0; j < rs.length; j++) {
        h += '<div class="r ' + rs[j].c + '"><span class="k">' + esc(rs[j].k) + '</span>' +
          (rs[j].t ? '<span class="t">' + esc(rs[j].t) + '</span>' : '') +
          (j === 0 ? '<span class="no">' + no + '</span>' : '') + '</div>';
      }
      h += '</div>';
    }
    h += '</div><div class="foot"><span>' + (o.caution ? '持ち歩かない・端末やつくえに貼らない・家の決まった場所にしまう' : '') + '</span><span>' + page + ' / ' + o.sheets + '</span></div></div>';
    return h;
  }
  function allHtml(o) { var h = ''; for (var p = 1; p <= o.sheets; p++) h += sheetHtml(o, p); return h; }

  var api = { DEF: DEF, PER: PER, SHEETS: SHEETS, rows: rows, historyRows: historyRows, total: total, summary: summary, sheetHtml: sheetHtml, allHtml: allHtml };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.MamoruNote = api;

  // ---- 画面 ----
  var doc = root.document, o = {}, k;
  for (k in DEF) o[k] = DEF[k];
  function $(id) { return doc.getElementById(id); }
  function press(box, v) {
    [].forEach.call(box.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === String(v))); });
  }
  function draw() {
    press($('perPick'), o.per); press($('sheetPick'), o.sheets); press($('hintPick'), o.hint ? 1 : 0);
    ['twofa', 'question', 'memo', 'history', 'caution'].forEach(function (key) { $('o_' + key).setAttribute('aria-pressed', String(!!o[key])); });
    $('sum').textContent = summary(o);
    $('dockSum').textContent = summary(o);
    $('pv').innerHTML = sheetHtml(o, 1);
    $('sheets').innerHTML = allHtml(o);
    var n = historyRows(o);
    $('hisNote').textContent = o.history ? '変更の履歴は1件につき' + n + '回ぶん書けます。' : '';
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    var box = b.parentNode && b.parentNode.id;
    if (box === 'perPick') o.per = +b.getAttribute('data-v');
    else if (box === 'sheetPick') o.sheets = +b.getAttribute('data-v');
    else if (box === 'hintPick') o.hint = b.getAttribute('data-v') === '1';
    else if (/^o_/.test(b.id)) o[b.id.slice(2)] = !o[b.id.slice(2)];
    else if (b.id === 'printBtn' || b.id === 'printBtn2') {
      if (root.mamoruEvent) root.mamoruEvent('mamoru_note_print', { from: 'note' });
      root.print();
      return;
    } else return;
    draw();
  });
  doc.body.classList.add('hasDock');
  draw();
})(typeof window !== 'undefined' ? window : globalThis);
