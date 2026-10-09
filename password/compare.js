/* 1Password 総額くらべ。価格は 2026-10-09 に公式ページで確認した通常価格。
   人数と年数はこの画面の中だけで使い、保存も送信もしない。 */
(function (root) {
  var CHECKED = '2026年10月9日';
  var RATE = 159.17; // 三菱UFJ銀行 米ドルTTS 2026/10/09 10:26
  var TAX = 1.10;    // 日本の請求先は消費税が別行で加わる（1Password Support「Taxes」）。標準税率10%
  var P = {
    1: { sn: 17980, yr: 47.88, mo: 4.99, label: '1人' },
    5: { sn: 27980, yr: 71.88, mo: 7.99, label: '家族（5人まで）' }
  };
  function yen(n) { return Math.round(n).toLocaleString('ja-JP') + '円'; }
  function calc(ppl, years) {
    var p = P[ppl];
    var snSets = Math.ceil(years / 3);                 // 3年単位で買う
    var sn = p.sn * snSets;
    var yr = p.yr * years * RATE * TAX;
    var mo = p.mo * 12 * years * RATE * TAX;
    var rows = { sn: sn, yr: yr, mo: mo };
    var best = Object.keys(rows).sort(function (a, b) { return rows[a] - rows[b]; })[0];
    return { sn: sn, snSets: snSets, snYears: snSets * 3, yr: yr, mo: mo, best: best, p: p };
  }
  var api = { calc: calc, RATE: RATE, TAX: TAX, P: P, yen: yen };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  var $ = function (id) { return document.getElementById(id); };
  var st = { ppl: 1, years: 3 };
  function press(boxId, v) { [].forEach.call(document.querySelectorAll('#' + boxId + ' button'), function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.v) === v)); }); }
  function render() {
    press('pplPick', st.ppl); press('yrPick', st.years);
    var r = calc(st.ppl, st.years);
    var name = { sn: 'ソースネクスト 3年版', yr: '公式の年払い', mo: '公式の月払い' };
    $('rCond').textContent = r.p.label + '・' + st.years + '年使う場合（価格は' + CHECKED + '確認・1ドル' + RATE + '円・公式は消費税10%込みで計算）';
    $('rBig').textContent = 'いちばん安いのは' + name[r.best];
    $('snTotal').textContent = yen(r.sn);
    $('snYear').textContent = yen(r.sn / r.snYears);
    $('snSub').textContent = r.snSets === 1 ? (st.years < 3 ? '3年分の価格（' + st.years + '年でやめても同じ）' : '3年分1回') : '3年分×' + r.snSets + '回';
    $('yrTotal').textContent = yen(r.yr);
    $('yrYear').textContent = yen(r.yr / st.years);
    $('yrSub').textContent = '$' + r.p.yr + '×' + st.years + '年＋消費税';
    $('moTotal').textContent = yen(r.mo);
    $('moYear').textContent = yen(r.mo / st.years);
    $('moSub').textContent = '$' + r.p.mo + '×12か月×' + st.years + '年＋消費税';
    ['sn', 'yr', 'mo'].forEach(function (k) { $('row' + k.charAt(0).toUpperCase() + k.slice(1)).className = k === r.best ? 'win' : ''; });
    var diff = r.yr - r.sn;
    $('rNote').textContent = st.years % 3 === 0
      ? '公式の年払いとの差は約' + yen(Math.abs(diff)) + '（' + (diff > 0 ? '3年版が安い' : '公式が安い') + '）。公式の額はカード会社の換算レートで少し変わります。'
      : '3年版は3年単位なので、' + st.years + '年だけ使う場合は使わない期間の分も払うことになります。';
    if (st.years === 6) $('rNote').textContent += '6年は、3年版を2回買い、どの価格も為替も今と変わらない前提の計算です。';
  }
  document.getElementById('pplPick').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.ppl = Number(b.dataset.v); render(); });
  document.getElementById('yrPick').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; st.years = Number(b.dataset.v); render(); });
  $('ctaSn').addEventListener('click', function () { window.mamoruEvent && mamoruEvent('mamoru_apply_click', { from: 'compare_sourcenext' }); });
  $('ctaOf').addEventListener('click', function () { window.mamoruEvent && mamoruEvent('mamoru_apply_click', { from: 'compare_official' }); });
  render();
})(this);
