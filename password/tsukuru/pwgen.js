/* パスワードを作る・今のパスワードを確かめる。
   作るのはこの画面の中だけ（ブラウザの暗号用の乱数 crypto.getRandomValues）。作った文字も、はい/いいえの答えも、保存も送信もしない。
   本物のパスワードを打ち込む欄は作らない（サイトの決まり）。 */
(function (root) {
  var LOWER = 'abcdefghijkmnopqrstuvwxyz';           // l を除く（1・I と見分けにくい）
  var UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';            // I・O を除く
  var DIGIT = '23456789';                             // 0・1 を除く
  var LOWER_ALL = 'abcdefghijklmnopqrstuvwxyz';
  var UPPER_ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var DIGIT_ALL = '0123456789';
  var SYMBOL = '!@#$%^&*';                            // 多くのサイトで通る記号（Bitwarden の既定と同じ8種）

  // 0〜n-1 の偏りのない乱数（あまりの偏りを捨てる）
  function rnd(n, rand) {
    if (rand) return Math.floor(rand() * n);
    var lim = Math.floor(0x100000000 / n) * n, a = new Uint32Array(1);
    do { (typeof crypto !== "undefined" ? crypto : root.crypto).getRandomValues(a); } while (a[0] >= lim);
    return a[0] % n;
  }
  function pick(s, rand) { return s[rnd(s.length, rand)]; }
  function log2(x) { return Math.log(x) / Math.LN2; }

  // おまかせ（ランダム）。o: {len, upper, digit, symbol, plain(見分けにくい文字を除く)}
  function randomPw(o, rand) {
    var sets = [o.plain ? LOWER : LOWER_ALL];
    if (o.upper) sets.push(o.plain ? UPPER : UPPER_ALL);
    if (o.digit) sets.push(o.plain ? DIGIT : DIGIT_ALL);
    if (o.symbol) sets.push(SYMBOL);
    var all = sets.join(''), pw;
    // 選んだ種類が全部1つ以上入るまで作り直す（全部入った並びの中で偏りなく選ぶため）
    for (var t = 0; t < 1000; t++) {
      pw = '';
      for (var i = 0; i < o.len; i++) pw += pick(all, rand);
      if (sets.every(function (s) { return [].some.call(pw, function (c) { return s.indexOf(c) >= 0; }); })) break;
    }
    return { pw: pw, bits: o.len * log2(all.length) };
  }

  // Apple と同じ形: 6文字×3をハイフンでつなぐ20文字。大文字1・数字1・残り小文字16
  function applePw(rand) {
    var c = [];
    for (var i = 0; i < 18; i++) c.push(pick(LOWER, rand));
    var dp = rnd(18, rand), up;
    do { up = rnd(18, rand); } while (up === dp);
    c[dp] = pick(DIGIT, rand);
    c[up] = pick(UPPER, rand);
    var pw = c.slice(0, 6).join('') + '-' + c.slice(6, 12).join('') + '-' + c.slice(12).join('');
    var bits = log2(18 * 17) + log2(DIGIT.length) + log2(UPPER.length) + 16 * log2(LOWER.length);
    return { pw: pw, bits: bits };
  }

  // 覚える用: 関係のない英単語をつなぐ（総務省の一般向けページの勧め方）。o: {n, cap, num}
  function wordsPw(o, words, rand) {
    var w = [];
    for (var i = 0; i < o.n; i++) w.push(pick(words, rand));
    if (o.cap) w = w.map(function (x) { return x[0].toUpperCase() + x.slice(1); });
    var bits = o.n * log2(words.length);
    if (o.num) {
      var k = rnd(o.n, rand);
      w[k] = w[k] + pick(DIGIT_ALL, rand);
      bits += log2(10) + log2(o.n);
    }
    return { pw: w.join('-'), bits: bits };
  }

  // 強さの目安（ビット＝何通りあるかを2の何乗で表した数）
  function grade(bits) {
    if (bits >= 80) return { key: 'top', label: 'とても強い' };
    if (bits >= 60) return { key: 'good', label: '強い' };
    if (bits >= 45) return { key: 'mid', label: 'ふつう' };
    return { key: 'low', label: '弱い' };
  }

  // 今のパスワードの確かめ（はい/いいえだけ）。a: {len:1/0, reuse, personal, common, leaked, twofa}
  // 1 は「はい」。reuse・personal・common・leaked は「はい」が悪い答え
  var CHECK = [
    { id: 'leaked', bad: 1, w: 5, todo: 'そのサービスのパスワードを今日変える', how: '流出の知らせが来た所は、まずそこを変えます。同じものを使っている所も全部です。' },
    { id: 'reuse', bad: 1, w: 4, todo: '使い回しをやめる（大事な所から1つずつ）', how: 'メール → お金 → 通販 → SNS の順に、サイトごとに別のパスワードにします。' },
    { id: 'common', bad: 1, w: 3, todo: 'よくある並びをやめて、上で作った案に変える', how: '「123456」「password」「qwerty」のような並びは、最初に試されます。' },
    { id: 'personal', bad: 1, w: 3, todo: '名前・誕生日の入らないものに変える', how: 'SNSや年賀状から分かる言葉は推測に使われます。' },
    { id: 'len', bad: 0, w: 2, todo: '10文字以上、できれば15文字以上にする', how: '総務省は10文字以上を目安にしています。長さがいちばん効きます。' },
    { id: 'twofa', bad: 0, w: 2, todo: '2段階認証を付ける', how: 'パスワードが漏れても、それだけでは入られにくくなります。' }
  ];
  function check(a) {
    var bad = CHECK.filter(function (q) { return a[q.id] === q.bad; });
    var score = bad.reduce(function (s, q) { return s + q.w; }, 0);
    var level = score === 0 ? 'ok' : score <= 2 ? 'soso' : score <= 5 ? 'warn' : 'danger';
    return { bad: bad, score: score, level: level };
  }

  var api = { randomPw: randomPw, applePw: applePw, wordsPw: wordsPw, grade: grade, check: check, CHECK: CHECK, SYMBOL: SYMBOL };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // ---- 画面 ----
  var $ = function (id) { return document.getElementById(id); };
  var st = { type: 'random', len: 16, upper: true, digit: true, symbol: true, plain: true, n: 5, cap: true, num: true };
  var ans = {};
  function press(boxId, v) { [].forEach.call(document.querySelectorAll('#' + boxId + ' button'), function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === String(v))); }); }

  function make() {
    var r = st.type === 'apple' ? applePw() : st.type === 'words' ? wordsPw(st, root.PW_WORDS) : randomPw(st);
    var g = grade(r.bits);
    $('pwOut').textContent = r.pw;
    $('pwLen').textContent = r.pw.length + '文字';
    $('pwGrade').textContent = g.label;
    $('pwGrade').className = 'g-' + g.key;
    $('pwBits').textContent = '約' + Math.floor(r.bits) + 'ビット';
    $('copyMsg').textContent = '';
  }
  function show() {
    press('typePick', st.type);
    $('optRandom').hidden = st.type !== 'random';
    $('optWords').hidden = st.type !== 'words';
    $('optApple').hidden = st.type !== 'apple';
    press('lenPick', st.len); press('nPick', st.n);
    ['upper', 'digit', 'symbol', 'plain', 'cap', 'num'].forEach(function (k) { var b = $('o_' + k); if (b) b.setAttribute('aria-pressed', String(st[k])); });
    make();
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) return;
    var box = b.parentElement && b.parentElement.id;
    if (box === 'typePick') { st.type = b.dataset.v; show(); return; }
    if (box === 'lenPick') { st.len = Number(b.dataset.v); show(); return; }
    if (box === 'nPick') { st.n = Number(b.dataset.v); show(); return; }
    if (b.id && b.id.indexOf('o_') === 0) {
      var k = b.id.slice(2);
      st[k] = !st[k];
      show(); return;
    }
    if (b.id === 'again') { make(); return; }
    if (b.id === 'copy') {
      var t = $('pwOut').textContent;
      var done = function () { $('copyMsg').textContent = 'コピーしました。使い終わったら、ほかの文字をコピーして上書きしておくと安心です。'; if (root.mamoruEvent) root.mamoruEvent('mamoru_pwgen_copy', { from: 'tsukuru' }); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { sel(); });
      else sel();
      return;
    }
    if (b.parentElement && b.parentElement.classList.contains('yn')) {
      var q = b.parentElement.dataset.q;
      ans[q] = Number(b.dataset.v);
      [].forEach.call(b.parentElement.querySelectorAll('button'), function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      var tr = b.closest('tr'); if (tr) tr.classList.add('done');
      if (CHECK.every(function (c) { return c.id in ans; })) result();
      return;
    }
    if (b.id === 'ckReset') {
      ans = {};
      [].forEach.call(document.querySelectorAll('#ck .yn button'), function (x) { x.setAttribute('aria-pressed', 'false'); });
      [].forEach.call(document.querySelectorAll('#ck tr'), function (x) { x.classList.remove('done'); });
      $('ckResult').hidden = true;
    }
  });
  function sel() {
    var r = document.createRange(); r.selectNodeContents($('pwOut'));
    var s = root.getSelection(); s.removeAllRanges(); s.addRange(r);
    $('copyMsg').textContent = '文字を選びました。長押し（右クリック）で「コピー」を選んでください。';
  }
  function result() {
    var r = check(ans);
    var big = { ok: 'いまのところ大きな心配はありません', soso: 'もう一歩で安心です', warn: '早めに変えたほうがよい状態です', danger: '今日のうちに変えてください' }[r.level];
    $('ckBig').textContent = big;
    var tb = $('ckTodo'); tb.textContent = '';
    var list = r.bad.slice().sort(function (a, b) { return b.w - a.w; }).slice(0, 3);
    if (!list.length) list = [{ todo: '管理アプリに保存して、サイトごとに別のパスワードを続ける', how: 'いまの使い方を続けてください。新しく作るときは上の案が使えます。' }];
    list.forEach(function (q, i) {
      var tr = document.createElement('tr');
      var n = document.createElement('td'); n.className = 'n'; n.textContent = String(i + 1);
      var td = document.createElement('td');
      var bb = document.createElement('b'); bb.textContent = q.todo;
      var sp = document.createElement('span'); sp.className = 'how'; sp.textContent = q.how;
      td.appendChild(bb); td.appendChild(sp); tr.appendChild(n); tr.appendChild(td); tb.appendChild(tr);
    });
    $('ckResult').hidden = false;
    if (root.mamoruEvent) root.mamoruEvent('mamoru_pwcheck_done', { from: 'tsukuru' });
  }
  show();
})(this);
