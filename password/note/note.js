/* 印刷して使うパスワード管理ノート。
   白紙の用紙を作って印刷するだけ。画面には何も打ち込ませない（サイトの決まり）。
   選んだ内容（件数・欄・枚数）も、作ったパスワードの案も、保存も送信もしない。数えるのは押した回数だけ。 */
(function (root) {
  var PER = [4, 8];                    // 1枚あたりの件数
  var SHEETS = [1, 3, 5];              // 枚数
  // はじめの形は、大きく書ける4件。欄は少なめ（はじめての人・年配の人が迷わないように）
  var DEF = { per: 4, sheets: 3, twofa: false, memo: true, history: true };
  var CAUTION = '持ち歩かない・端末やつくえに貼らない・家の決まった場所にしまう';

  // 変更の履歴の行数（1行は約7mm以上を保つ）
  function historyRows(o) {
    if (!o.history) return 0;
    return { 4: 3, 8: 2 }[o.per];
  }

  // 1件ぶんの行（上から順）。k=ラベル、c=行の種類
  function rows(o) {
    var r = [
      { c: 'name', k: 'サービス名' },
      { c: 'line', k: 'ログインID' },
      { c: 'line pw', k: 'パスワード' },
      { c: 'line', k: '登録メール' }
    ];
    if (o.twofa) r.push({ c: 'line box', k: '2段階認証', t: '□SMS　□アプリ　□パスキー　□なし' });
    if (o.memo) r.push({ c: 'line', k: 'メモ' });
    for (var i = 0, n = historyRows(o); i < n; i++) r.push({ c: 'line his', k: '変えた日', t: '　　.　　.　　　新：' });
    return r;
  }

  function total(o) { return o.per * o.sheets; }
  function summary(o) { return 'A4・' + o.sheets + '枚・' + total(o) + '件ぶん'; }

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
    h += '</div><div class="foot"><span>' + CAUTION + '</span><span>' + page + ' / ' + o.sheets + '</span></div></div>';
    return h;
  }
  function allHtml(o) { var h = ''; for (var p = 1; p <= o.sheets; p++) h += sheetHtml(o, p); return h; }

  // 記入例（画面で見るだけ。印刷には入らない）。文字は作りものの例
  var SAMPLE = { name: '○○銀行', id: 'hanako-y', pw: 'mikan7-sorako-Kutsub', mail: 'hanako@example.com', memo: 'スマホのアプリあり', his: '2027. 3. 2　新：yukino-Hashi4-madobe' };
  function sampleHtml(o) {
    var rs = rows(o), v = SAMPLE, h = '<div class="card">', hisDone = false;
    for (var j = 0; j < rs.length; j++) {
      var r = rs[j], k = r.k, val = '', t = r.t || '';
      if (j === 0) val = v.name;
      else if (k === 'ログインID') val = v.id;
      else if (/pw/.test(r.c)) val = v.pw;
      else if (k === '登録メール') val = v.mail;
      else if (k === 'メモ') val = v.memo;
      else if (/box/.test(r.c)) t = t.replace('□SMS', '☑SMS');
      else if (/his/.test(r.c) && !hisDone) { val = v.his; t = ''; hisDone = true; }
      var old = /pw/.test(r.c) && historyRows(o) > 0;      // 変えたあとは、古いものに線を引く
      h += '<div class="r ' + r.c + '"><span class="k">' + esc(k) + '</span>' +
        (t ? '<span class="t">' + esc(t) + '</span>' : '') +
        (val ? '<span class="v' + (old ? ' old' : '') + '">' + esc(val) + '</span>' : '') + '</div>';
    }
    return h + '</div>';
  }

  // パスワードの案。6文字×3をハイフンでつないだ20文字（大文字1つ・数字1つ）。
  // 手で書き写すので、見分けにくい文字（l・I・O・0・1）は使わない。「パスワードを作る」の Apple と同じ形と同じ作り方
  var LOWER = 'abcdefghijkmnopqrstuvwxyz', UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ', DIGIT = '23456789';
  function rnd(n, rand) {
    if (rand) return Math.floor(rand() * n);
    var lim = Math.floor(0x100000000 / n) * n, a = new Uint32Array(1);
    do { (typeof crypto !== 'undefined' ? crypto : root.crypto).getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }
  function makePw(rand) {
    var c = [], i, dp, up;
    for (i = 0; i < 18; i++) c.push(LOWER[rnd(LOWER.length, rand)]);
    dp = rnd(18, rand);
    do { up = rnd(18, rand); } while (up === dp);
    c[dp] = DIGIT[rnd(DIGIT.length, rand)];
    c[up] = UPPER[rnd(UPPER.length, rand)];
    return c.slice(0, 6).join('') + '-' + c.slice(6, 12).join('') + '-' + c.slice(12).join('');
  }

  var api = { DEF: DEF, PER: PER, SHEETS: SHEETS, rows: rows, historyRows: historyRows, total: total, summary: summary, sheetHtml: sheetHtml, allHtml: allHtml, sampleHtml: sampleHtml, SAMPLE: SAMPLE, makePw: makePw };
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
    press($('perPick'), o.per); press($('sheetPick'), o.sheets);
    ['twofa', 'memo', 'history'].forEach(function (key) { $('o_' + key).setAttribute('aria-pressed', String(!!o[key])); });
    $('dockSum').textContent = summary(o);
    $('pv').innerHTML = sheetHtml(o, 1);
    $('sheets').innerHTML = allHtml(o);
    $('ex').innerHTML = sampleHtml(o);
    $('exOld').hidden = !o.history;
  }
  function newPw() { $('pwOut').textContent = makePw(); }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button') : null;
    if (!b) return;
    var box = b.parentNode && b.parentNode.id;
    if (box === 'perPick') o.per = +b.getAttribute('data-v');
    else if (box === 'sheetPick') o.sheets = +b.getAttribute('data-v');
    else if (/^o_/.test(b.id)) o[b.id.slice(2)] = !o[b.id.slice(2)];
    else if (b.id === 'pwAgain') { newPw(); if (root.mamoruEvent) root.mamoruEvent('mamoru_note_pwgen', { from: 'note' }); return; }
    else if (b.id === 'printBtn') {
      if (root.mamoruEvent) root.mamoruEvent('mamoru_note_print', { from: 'note' });
      root.print();
      return;
    } else return;
    draw();
  });
  doc.body.classList.add('hasDock');
  draw();
  newPw();
})(typeof window !== 'undefined' ? window : globalThis);
