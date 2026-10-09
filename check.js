/* 守り度チェックの判定（入力は はい/いいえ だけ。どこにも送らない）
   ITEMS の並び順＝「今日やること」の優先順。いいえ の項目を上から3つ出す。 */
(function (root) {
  var ITEMS = [
    { id: 'reuse', q: '同じパスワードを、ほかのサイトでも使っていない', sub: '特にメール・銀行・カード・通販',
      todo: '使い回しをやめる（メールとお金のサイトから）', how: '1つ漏れると、同じパスワードの全部に入られます。まずメール、次にお金のサイトを、ほかと違うパスワードに変えます。', link: '/password/#tsukaimawashi', linkText: '変える順番と、覚えなくて済む方法' },
    { id: 'mail2fa', q: 'メールのアカウントに2段階認証を設定している', sub: 'Gmail・iCloudメール・Yahoo!メールなど',
      todo: 'メールに2段階認証を設定する', how: 'ほかのサイトの「パスワードを忘れた」の再設定はメールに届きます。メールを取られると、そこから次々に入られます。', link: '#how-2fa', linkText: '各社の公式の設定ページ' },
    { id: 'link', q: 'メールやSMSのリンクから、ログインや支払いの画面を開かない', sub: '公式アプリかブックマークから開いている',
      todo: 'メール・SMSのリンクからログインしない', how: '偽サイトへ誘導するフィッシングの報告は、2025年に約245万件（警察庁）。見た目では見分けにくいので、ログインは公式アプリかブックマークから。', link: '#how-link', linkText: '見分け方より「開かない」が確実な理由' },
    { id: 'money2fa', q: '銀行・証券・カードのログインに追加の認証を設定している', sub: 'ワンタイムパスワード・アプリでの承認・パスキーなど',
      todo: 'お金のサイトに追加の認証を設定する', how: 'パスワードが漏れても、本人の端末がなければ入れなくなります。証券口座は日本証券業協会の指針で必須化が進んでいます。', link: '#how-money', linkText: '設定の場所と、証券口座の守り方' },
    { id: 'update', q: 'スマホ・パソコンのOSやアプリを自動更新にしている', sub: '更新のお知らせを放置していない',
      todo: 'OSとアプリを自動更新にする', how: '更新には、見つかった弱点をふさぐ修正が入っています。自動にしておけば手間はかかりません。', link: '#how-update', linkText: 'iPhone・Android・Windowsの設定場所' },
    { id: 'pm', q: 'パスワード管理アプリを使っている', sub: 'Googleパスワードマネージャー・iPhoneの「パスワード」・1Passwordなど',
      todo: 'パスワード管理アプリを使い始める', how: 'サイトごとに違うパスワードを全部覚えるのは無理です。アプリに覚えさせれば、使い回しをやめても困りません。無料のものもあります。', link: '/password/', linkText: '無料と有料の違い・選び方' },
    { id: 'card', q: 'クレジットカードの利用通知をオンにしている', sub: 'または明細を月に何度か見ている',
      todo: 'カードの利用通知をオンにする', how: 'カード会社の補償は「届け出から60日前まで」のように期限があります。早く気づくことが大事です。', link: '/komattara/#card', linkText: '身に覚えのない請求を見つけたら' },
    { id: 'sns', q: '使っていないSNSやサービスのアカウントを放置していない', sub: '退会したか、パスワードと2段階認証を整えている',
      todo: '使っていないアカウントを片づける', how: '使っていなくても、ログインできる限り不正ログインの対象です。使わないなら退会、残すなら2段階認証を。', link: '/komattara/#sns', linkText: '乗っ取られたときの公式の窓口' }
  ];

  // answers: { id: 1(はい) | 0(いいえ) }
  function judge(answers) {
    var answered = 0, yes = 0, no = [];
    ITEMS.forEach(function (it) {
      var v = answers[it.id];
      if (v === 1 || v === 0) answered++;
      if (v === 1) yes++;
      if (v === 0) no.push(it);
    });
    var level;
    if (yes === ITEMS.length) level = 'all';
    else if (no.length <= 2) level = 'good';
    else if (no.length <= 5) level = 'mid';
    else level = 'low';
    return { total: ITEMS.length, answered: answered, yes: yes, complete: answered === ITEMS.length, top: no.slice(0, 3), rest: no.slice(3), level: level };
  }

  var api = { ITEMS: ITEMS, judge: judge };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MamoruCheck = api;
})(this);
