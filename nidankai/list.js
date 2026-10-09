/* 2段階認証の棚卸し。リンクはすべて各社の公式ドメインで 2026-10-09 に開けることを確認したもの。
   保存するのは「選んだサービスのid」と「設定したかどうか」だけで、この端末の localStorage にだけ残す。 */
(function () {
  var CHECKED = '2026年10月9日';
  var GROUPS = [
    { name: 'メール・アカウント（最優先）', items: [
      { id: 'google', name: 'Google（Gmail）', call: '2段階認証プロセス', url: 'https://support.google.com/accounts/answer/185839?hl=ja&co=GENIE.Platform%3DDesktop' },
      { id: 'apple', name: 'Apple Account（iCloud）', call: '2ファクタ認証', url: 'https://support.apple.com/ja-jp/102660' },
      { id: 'microsoft', name: 'Microsoft（Outlook）', call: '2段階認証', url: 'https://support.microsoft.com/ja-jp/accounts-billing/security/how-to-use-two-step-verification-with-your-microsoft-account' },
      { id: 'yahoo', name: 'Yahoo! JAPAN ID', call: 'ワンタイムパスワード', url: 'https://id.yahoo.co.jp/security/otp.html' }
    ] },
    { name: '携帯会社のID', items: [
      { id: 'docomo', name: 'dアカウント（ドコモ）', call: '2段階認証', url: 'https://www.docomo.ne.jp/faq/detail?faqId=242061' },
      { id: 'au', name: 'au ID', call: '2段階認証', url: 'https://www.au.com/au-id/auth-two-factor/' },
      { id: 'softbank', name: 'My SoftBank', call: 'ログイン時の暗証番号の入力設定', url: 'https://www.softbank.jp/mobile/support/contract/mysoftbank/security-setting/' }
    ] },
    { name: 'お金（銀行・カード・決済）', items: [
      { id: 'yucho', name: 'ゆうちょダイレクト', call: '2段階認証・ゆうちょ認証アプリ', url: 'https://www.jp-bank.japanpost.jp/direct/pc/security/dr_pc_sc_ds_drsecurity.html' },
      { id: 'rakutencard', name: '楽天カード（楽天e-NAVI）', call: '第2パスワード', url: 'https://www.rakuten-card.co.jp/security/second-password/' },
      { id: 'paypay', name: 'PayPay', call: '新しい端末はSMSかQRで認証（自分で切り替える設定はなし）', url: 'https://paypay.ne.jp/help/c0374/' }
    ] },
    { name: '証券', items: [
      { id: 'sbi', name: 'SBI証券', call: 'デバイス認証・FIDO（スマホ認証）', url: 'https://www.sbisec.co.jp/ETGate/WPLETmgR001Control?OutSide=on&getFlg=on&burl=search_home&cat1=home&cat2=none&dir=info&file=home_info250324_authentication.html' },
      { id: 'rakutensec', name: '楽天証券', call: 'ログイン追加認証・パスキー', url: 'https://www.rakuten-sec.co.jp/web/security/add_authentication/' },
      { id: 'monex', name: 'マネックス証券', call: '多要素認証', url: 'https://info.monex.co.jp/help/security/mfa/index.html' },
      { id: 'kabucom', name: '三菱UFJ eスマート証券', call: '二要素認証・パスキー', url: 'https://kabu.com/support/security/passkey.html' },
      { id: 'matsui', name: '松井証券', call: '多要素認証', url: 'https://support.matsui.co.jp/faq/show/27649?site_domain=faq' }
    ] },
    { name: '買い物', items: [
      { id: 'amazon', name: 'Amazon', call: '2段階認証', url: 'https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=G3PWZPU52FKN7PW4' },
      { id: 'rakuten', name: '楽天ID（楽天市場）', call: '二要素認証（メールアドレス）', url: 'https://corp.faq.rakuten.net/rakutenid/s/detail/000008187' },
      { id: 'mercari', name: 'メルカリ', call: 'パスキー', url: 'https://help.jp.mercari.com/guide/articles/1876/' }
    ] },
    { name: 'SNS', items: [
      { id: 'line', name: 'LINE', call: 'ログイン許可', url: 'https://help.line.me/line/?contentId=20000112&lang=ja' },
      { id: 'instagram', name: 'Instagram', call: '二段階認証', url: 'https://help.instagram.com/566810106808145/?locale=ja_JP' },
      { id: 'facebook', name: 'Facebook', call: '二段階認証', url: 'https://www.facebook.com/help/148233965247823?locale=ja_JP' },
      { id: 'x', name: 'X', call: '2要素認証', url: 'https://help.x.com/ja/managing-your-account/two-factor-authentication' },
      { id: 'tiktok', name: 'TikTok', call: '2段階認証', url: 'https://www.tiktok.com/support/faq_detail?id=7543604780950624824&category=web_account' }
    ] },
    { name: 'ゲーム・その他', items: [
      { id: 'nintendo', name: 'ニンテンドーアカウント', call: '二段階認証', url: 'https://support.nintendo.com/jp/nintendo_account/login/2fa/index.html' },
      { id: 'psn', name: 'PlayStation Network', call: '2段階認証', url: 'https://www.playstation.com/ja-jp/support/account/2sv-login/' },
      { id: 'dropbox', name: 'Dropbox', call: '2要素認証', url: 'https://help.dropbox.com/ja-jp/account-access/enable-2-factor-authentication' }
    ] }
  ];
  var ALL = []; GROUPS.forEach(function (g) { g.items.forEach(function (it) { ALL.push(it); }); });
  var byId = {}; ALL.forEach(function (it) { byId[it.id] = it; });

  var S = window.MamoruStore;
  var st = S.get('nidankai') || { use: {}, done: {} };
  var sentAll = false;
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function save() { S.set('nidankai', st); }

  function buildPick() {
    $('pickSvc').innerHTML = GROUPS.map(function (g) {
      return '<tr><th>' + esc(g.name) + '</th><td><div class="chips">' + g.items.map(function (it) {
        return '<button type="button" data-id="' + it.id + '">' + esc(it.name) + '</button>';
      }).join('') + '</div></td></tr>';
    }).join('');
  }

  function render() {
    [].forEach.call(document.querySelectorAll('#pickSvc button'), function (b) { b.setAttribute('aria-pressed', String(!!st.use[b.dataset.id])); });
    var used = ALL.filter(function (it) { return st.use[it.id]; });
    var done = used.filter(function (it) { return st.done[it.id]; }).length;
    $('dAns').textContent = done;
    $('dTot').textContent = used.length;
    var btn = $('dBtn');
    if (!used.length) {
      $('myList').innerHTML = '<p class="note">上で、使っているサービスを押して選んでください。</p>';
      btn.disabled = true; btn.textContent = '使っているサービスを選ぶ';
      return;
    }
    btn.disabled = false;
    btn.textContent = done === used.length ? 'すべて設定済み' : '次に設定するものへ';
    $('myList').innerHTML = '<table class="svc"><tr><th>サービス</th><th>設定</th></tr>' + used.map(function (it) {
      var d = !!st.done[it.id];
      return '<tr id="row-' + it.id + '"' + (d ? ' class="ok"' : '') + '><td><b>' + esc(it.name) + '</b><span class="how">呼び名: ' + esc(it.call) + '</span>' +
        '<a href="' + esc(it.url) + '" target="_blank" rel="noopener" class="go" data-id="' + it.id + '">公式の設定ページを開く</a></td>' +
        '<td class="st"><button type="button" class="mk" data-id="' + it.id + '" aria-pressed="' + d + '">' + (d ? '設定した' : 'まだ') + '</button></td></tr>';
    }).join('') + '</table><p class="src">リンク先は各社の公式ページ（' + CHECKED + '確認）。画面の名前は変わることがあります。</p>';
    if (done === used.length && !sentAll) { sentAll = true; window.mamoruEvent && mamoruEvent('mamoru_2fa_all_done'); }
  }

  $('pickSvc').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var id = b.dataset.id;
    if (st.use[id]) { delete st.use[id]; delete st.done[id]; } else st.use[id] = 1;
    save(); render();
  });
  $('myList').addEventListener('click', function (e) {
    var b = e.target.closest('button.mk');
    if (b) { var id = b.dataset.id; if (st.done[id]) delete st.done[id]; else st.done[id] = 1; save(); render(); return; }
    var a = e.target.closest('a.go');
    if (a && window.mamoruEvent) mamoruEvent('mamoru_2fa_link_click'); // どのサービスかは送らない
  });
  $('dBtn').addEventListener('click', function () {
    var next = ALL.filter(function (it) { return st.use[it.id] && !st.done[it.id]; })[0];
    var el = next ? $('row-' + next.id) : $('myList');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('clearAll').addEventListener('click', function () {
    S.clearAll(); st = { use: {}, done: {} }; sentAll = false; render();
    $('clearAll').textContent = 'この端末の記録を消しました';
  });

  buildPick();
  render();
})();
