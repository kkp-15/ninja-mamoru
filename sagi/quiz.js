/* 詐欺メール・SMSの見分けトレーニング。
   問題の文面は、公的機関・業界団体・各社が公開している実例と注意喚起をもとに、手口の要点を書き直したもの（丸写ししない）。
   偽のURLや実在の個人の電話番号・メールアドレスは載せない。誘導先は「特徴」だけを書く。
   回答は保存も送信もしない。GA4 には「トレーニング完了」の回数だけを送る。 */
(function (root) {
  var Q = [
    { kind: 'SMS', from: '国税庁（と名乗る送り主）',
      body: '還付金があります。期限内に下のリンクから手続きしてください。',
      link: '国税庁と関係のない「.com」のアドレス',
      opts: ['還付金の金額と振込日が本文に書かれていないから', '国税庁はSMSにURLを載せた案内を送らないから', '送り主の名前が税務署ではなく国税庁だから'], ok: 1,
      why: '国税庁は「ショートメッセージにURLを記載した案内を送信することはありません」と公表しています。納付の求めや差押えをSMS・メール・LINEで送ることもありません。',
      src: ['国税庁「不審なメールや電話にご注意ください」', 'https://www.nta.go.jp/information/attention/attention.htm'] },
    { kind: 'メール', from: 'e-Tax（と名乗る送り主）',
      body: 'メッセージボックスに新しい通知があります。スマホ用の公式アプリを入れて確認してください（Android向け）。',
      link: '国税と関係のないアドレスで、アプリのファイルが落ちてくる',
      opts: ['スマホ用のe-Taxアプリは提供されていないから', '「メッセージボックス」という言葉を使っているから', '届いた通知の件数が本文に書かれていないから'], ok: 0,
      why: 'フィッシング対策協議会は、2026年9月30日時点でスマートフォン用のe-Taxアプリは提供されていないと注意しています。メールやSMSから入れさせるアプリは、乗っ取りや情報を抜くための不正アプリのことがあります。',
      src: ['フィッシング対策協議会 緊急情報（2026年9月30日）', 'https://www.antiphishing.jp/news/alert/etaxmal_20260930.html'] },
    { kind: 'SMS', from: '日本郵便（と名乗る送り主）',
      body: 'お荷物をお届けしましたが不在のため持ち帰りました。再配達はこちらから。',
      link: '末尾が「.top」のアドレス',
      opts: ['日本郵便はSMSで不在の連絡をしていないから', 'お問い合わせ番号（追跡番号）が書かれていないから', '再配達の受付の時間帯が書かれていないから'], ok: 0,
      why: '日本郵便は、ショートメールでの不在連絡はしておらず、Webサイトのアドレスに「.com」「.net」「.top」を使っていないと公表しています。',
      src: ['日本郵便「郵便局などを装った不審な電話、メール、SMS…にご注意ください」', 'https://www.japanpost.jp/news/fraud-mail/'] },
    { kind: 'SMS', from: 'ヤマト運輸（と名乗る送り主）',
      body: '住所が不明なため荷物を保管しています。住所の確認と再配達の手数料のお支払いをお願いします。',
      link: 'ヤマト運輸と関係のないアドレス',
      opts: ['再配達の手数料の金額がとても安すぎるから', '宛名と荷物の送り主の名前が書かれていないから', 'ヤマトはSMSで住所確認や料金の請求をしないから'], ok: 2,
      why: 'ヤマト運輸は、SMSでの不在連絡やお届け予定のお知らせはしておらず、住所の確認や再配達料金の請求もしないと案内しています。',
      src: ['ヤマト運輸 重要なお知らせ', 'https://www.yamato-hd.co.jp/important/info_181212.html'] },
    { kind: 'メール', from: '国勢調査（と名乗る送り主）',
      body: 'オンラインで回答すると記念品がもらえます。回答は義務です。下のリンクから回答してください。',
      link: 'アドレスの後ろのほうに「kokusei」と入っているが、役所のアドレスではない',
      opts: ['アドレスに「kokusei」の文字が入っているから', '国勢調査の回答依頼は封書で届き、メールでは来ないから', '記念品の中身と届く時期が書かれていないから'], ok: 1,
      why: 'フィッシング対策協議会は、国勢調査の回答依頼は封書で配られ、メールでは行われていないと注意しています。アドレスのどこかに正しそうな言葉が入っていても、本物とは限りません。',
      src: ['フィッシング対策協議会 緊急情報（2025年9月22日）', 'https://www.antiphishing.jp/news/alert/kokusei_20250922.html'] },
    { kind: 'メール', from: '日本年金機構（と名乗る送り主）',
      body: '国民年金保険料が未納です。期限までに支払わないと財産を差し押さえます。PayPayで支払えます。',
      link: '途中で別のアドレスを経由し、最後は本物のPayPayの送金画面が開く',
      opts: ['最後に開くPayPayの送金画面が本物ではないから', '画面が本物でも、払えという連絡そのものが偽物だから', '差し押さえる日付が本文に書かれていないから'], ok: 1,
      why: 'フィッシング対策協議会は、未納や差押えで脅し、本物のPayPayの送金機能を悪用して送金させる手口を報告しています。画面が本物でも、お金の行き先は相手の口座です。',
      src: ['フィッシング対策協議会 緊急情報（2026年5月18日）', 'https://www.antiphishing.jp/news/alert/nenkin_20260518.html'] },
    { kind: 'メール', from: '銀行（と名乗る送り主）',
      body: 'ワンタイム認証が未設定です。お取引の目的とお客さま情報の再確認のため、ログインしてください。',
      link: '銀行名の綴りを少し崩したアドレス',
      opts: ['綴りが違ううえ、銀行はメールでIDを聞かないから', '「ワンタイム認証」という言葉が銀行らしくないから', '件名が長く、お客さまの名前が入っていないから'], ok: 0,
      why: 'フィッシング対策協議会は、銀行名を崩した綴りのアドレスへ誘導する事例を報告しています。警察庁も、金融機関がID・パスワードをメールやSMSで聞くことはないとしています。',
      src: ['フィッシング対策協議会 緊急情報（2026年4月10日）／警察庁「フィッシング対策」', 'https://www.antiphishing.jp/news/alert/IB_20260410.html'] },
    { kind: 'SMS', from: 'ドコモ（と名乗る送り主）',
      body: 'ご利用料金の確認が必要です。こちらからログインしてください。',
      link: 'アドレスに「docomo」という文字が入っている',
      opts: ['料金の金額と支払いの期限が書かれていないから', '「docomo」入りでも公式ドメインの一覧にないから', 'ログインを求める文が短く、説明が足りないから'], ok: 1,
      why: 'NTTドコモは公式のSMSで使うドメインの一覧を公開していて、一覧にないURLは「docomo」を含んでいても公式ではないとしています。',
      src: ['NTTドコモ 公式SMSで使うドメインの一覧', 'https://www.docomo.ne.jp/info/anti-phishing/confirmation/'] },
    { kind: 'メール', from: 'Amazon（と名乗る送り主）・送信元は日本のプロバイダのふつうのアドレス',
      body: 'お客さまのアカウントに利用制限をかけました。解除するには情報を更新してください。',
      link: 'Amazonの名前がアドレスの一部に入った、関係のないドメイン',
      opts: ['送信元が、日本のプロバイダの普通のアドレスだから', 'Amazonの名前が入っただけの別のドメインだから', '利用制限の理由と期間が本文に書かれていないから'], ok: 1,
      why: 'フィッシング対策協議会は、国内のプロバイダの乗っ取られたアカウントから送られ、Amazonなどの名前をドメインの一部に入れた無関係のサイトへ誘導する事例を報告しています。送信元のアドレスでは見分けられません。見るのはリンク先のドメインです。',
      src: ['フィッシング対策協議会 緊急情報（2026年6月26日）', 'https://www.antiphishing.jp/news/alert/isp_20260626.html'] },
    { kind: 'メール', from: 'ポイントサービス（会社名なし）',
      body: 'おめでとうございます。ポイントが当選しました。Android専用の受け取りアプリから受け取ってください。',
      link: '「point」など正しそうな言葉が入った「.com」のアドレス',
      opts: ['当選したポイントの有効期限が書かれていないから', 'メールのリンクからアプリを入れさせる手口だから', '当選したポイントの数があまりに多すぎるから'], ok: 1,
      why: 'フィッシング対策協議会は、Android限定のアプリを入れさせるメールが急増しているとし、リンクへのアクセスやアプリのインストールをしないよう注意しています。',
      src: ['フィッシング対策協議会 緊急情報（2026年9月8日）', 'https://www.antiphishing.jp/news/alert/malapp_20260908.html'] }
  ];
  var api = { Q: Q };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  var $ = function (id) { return document.getElementById(id); };
  var i = 0, score = 0, answered = false, sent = false;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function show() {
    var q = Q[i]; answered = false;
    $('qProg').textContent = (i + 1) + ' / ' + Q.length + '問';
    $('qMsg').innerHTML = '<p class="m-kind">' + esc(q.kind) + '　送り主: ' + esc(q.from) + '</p><p class="m-body">' + esc(q.body) + '</p><p class="m-link">［リンク］' + esc(q.link) + '</p>';
    var order = q.opts.map(function (o, k) { return k; });
    for (var n = order.length - 1; n > 0; n--) { var r = Math.floor(Math.random() * (n + 1)); var t = order[n]; order[n] = order[r]; order[r] = t; }
    $('qOpts').innerHTML = order.map(function (k) { return '<button type="button" data-k="' + k + '">' + esc(q.opts[k]) + '</button>'; }).join('');
    $('qFb').hidden = true; $('qFb').innerHTML = '';
    $('dBtn').disabled = true; $('dBtn').textContent = '答えを選んでください';
    $('dScore').textContent = score;
  }
  function answer(k) {
    if (answered) return; answered = true;
    var q = Q[i], ok = k === q.ok;
    if (ok) score++;
    [].forEach.call($('qOpts').querySelectorAll('button'), function (b) {
      var bk = Number(b.dataset.k); b.disabled = true;
      if (bk === q.ok) b.className = 'right'; else if (bk === k) b.className = 'wrong';
    });
    $('qFb').hidden = false;
    $('qFb').innerHTML = '<p class="fb-h ' + (ok ? 'ok' : 'ng') + '">' + (ok ? '正解' : 'ちがいます') + '　見るべき所: ' + esc(q.opts[q.ok]) + '</p><p>' + esc(q.why) + '</p><p class="src">出典: <a href="' + esc(q.src[1]) + '" target="_blank" rel="noopener">' + esc(q.src[0]) + '</a>（2026年10月9日確認）</p>';
    $('dScore').textContent = score;
    $('qFb').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('dBtn').disabled = false; $('dBtn').textContent = i + 1 < Q.length ? '次の問題へ' : '結果を見る';
  }
  function finish() {
    $('quiz').hidden = true; $('qEnd').hidden = false; document.body.classList.add('dockOff');
    $('eScore').textContent = Q.length + '問中 ' + score + '問 正解';
    if (!sent) { sent = true; window.mamoruEvent && mamoruEvent('mamoru_quiz_done'); }
    $('qEnd').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  $('qOpts').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) answer(Number(b.dataset.k)); });
  $('dBtn').addEventListener('click', function () {
    if (!answered) return;
    if (i + 1 < Q.length) { i++; show(); $('quiz').scrollIntoView({ behavior: 'smooth', block: 'start' }); } else finish();
  });
  $('again').addEventListener('click', function () { i = 0; score = 0; sent = false; $('qEnd').hidden = true; $('quiz').hidden = false; document.body.classList.remove('dockOff'); show(); $('quiz').scrollIntoView({ block: 'start' }); });
  show();
})(this);
