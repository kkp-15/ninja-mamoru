/* 守り度チェックの画面。回答は MamoruStore（この端末の localStorage）にだけ残す。
   GA4 に送るのは「チェック完了」の回数だけで、回答の中身は送らない。 */
(function () {
  var C = window.MamoruCheck, S = window.MamoruStore;
  var $ = function (id) { return document.getElementById(id); };
  var ans = S.get('check') || {};
  var sentDone = false;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function buildTable() {
    $('chk').innerHTML = C.ITEMS.map(function (it, i) {
      return '<tr data-id="' + it.id + '"><th scope="row"><span class="no">' + (i + 1) + '.</span>' + esc(it.q) +
        '<small>' + esc(it.sub) + '</small></th><td><div class="yn" role="group" aria-label="' + esc(it.q) + '">' +
        '<button type="button" data-v="1">はい</button><button type="button" data-v="0">いいえ</button></div></td></tr>';
    }).join('');
    $('dTot').textContent = C.ITEMS.length;
  }

  function linkHtml(it) {
    var ext = /^https?:/.test(it.link);
    return '<a href="' + esc(it.link) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(it.linkText) + '</a>';
  }

  function render() {
    [].forEach.call(document.querySelectorAll('#chk tr'), function (tr) {
      var v = ans[tr.dataset.id];
      tr.className = (v === 1 || v === 0) ? 'done' : '';
      [].forEach.call(tr.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', String(Number(b.dataset.v) === v)); });
    });
    var r = C.judge(ans);
    $('dAns').textContent = r.answered;
    var btn = $('dBtn');
    if (!r.complete) {
      btn.disabled = true;
      btn.textContent = (r.total - r.answered) + '問のこっています';
      $('result').hidden = true;
      return;
    }
    btn.disabled = false;
    btn.textContent = '結果を見る';
    $('result').hidden = false;
    $('rScore').textContent = '8問中「はい」は ' + r.yes + ' 問';
    $('rBig').textContent = {
      all: 'すべて「はい」。基本はできています',
      good: 'あと少し。今日やるのはこれだけ',
      mid: '今日やることを上から順に',
      low: 'まずは上の1つから'
    }[r.level];
    if (r.top.length) {
      $('rTodo').innerHTML = '<tr><th class="n">順</th><th>今日やること</th></tr>' + r.top.map(function (it, i) {
        return '<tr><td class="n">' + (i + 1) + '</td><td><b>' + esc(it.todo) + '</b><span class="how">' + esc(it.how) + '</span>' + linkHtml(it) + '</td></tr>';
      }).join('');
      $('rTodo').hidden = false;
    } else {
      $('rTodo').innerHTML = '';
      $('rTodo').hidden = true;
    }
    $('rRest').textContent = r.rest.length ? 'ほかに「いいえ」だったもの: ' + r.rest.map(function (it) { return it.todo; }).join('／') + '。上の3つが終わってから。' : '';
    var needPm = ans.pm === 0 || ans.reuse === 0;
    $('rNext').innerHTML = needPm
      ? 'サイトごとに違うパスワードを覚えるのは無理なので、管理アプリに任せます。無料のGoogle・Appleで始めても構いません。<br><a class="btn" href="/password/" id="nextLink">パスワード管理アプリの選び方を見る</a>'
      : (r.level === 'all'
        ? '次は、使っているサービスの2段階認証を1つずつ確かめると、さらに固くなります。<br><a class="btn" href="/nidankai/" id="nextLink">2段階認証の棚卸しへ</a>'
        : 'リンクから開かない練習には、実際の手口で見分けるトレーニングが役に立ちます。<br><a class="btn" href="/sagi/" id="nextLink">詐欺メール・SMSの見分けトレーニング</a>');
    if (!sentDone) { sentDone = true; window.mamoruEvent && mamoruEvent('mamoru_check_done'); }
  }

  $('chk').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = b.closest('tr').dataset.id;
    var wasComplete = C.judge(ans).complete;
    ans[id] = Number(b.dataset.v);
    S.set('check', ans);
    render();
    if (!wasComplete && C.judge(ans).complete) $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('dBtn').addEventListener('click', function () { $('result').scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  $('again').addEventListener('click', function () { ans = {}; S.set('check', ans); sentDone = false; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('clearAll').addEventListener('click', function () {
    S.clearAll(); ans = {}; sentDone = false; render();
    $('clearAll').textContent = 'この端末の記録を消しました';
  });
  $('jumpKomattara').addEventListener('click', function () { window.mamoruEvent && mamoruEvent('mamoru_next_click', { from: 'top_jump' }); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('#nextLink'); if (a && window.mamoruEvent) mamoruEvent('mamoru_next_click', { from: 'check_result' });
  });

  // 結果が画面に入ったら下のバーを隠す（結果の中のボタンと重ねない）
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (en) { document.body.classList.toggle('dockOff', en.isIntersecting); }); }, { threshold: 0.15 }).observe($('result'));
  }

  buildTable();
  render();
})();
