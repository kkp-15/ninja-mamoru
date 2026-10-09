# mamoru（サイバー攻撃・個人情報流出から自分を守る）作業ルール

公開先: https://mamoru.kkpwebninja.com/ （Cloudflare Pages: ninja-mamoru。push で自動デプロイ。配信前に *.md・tests・_dev を削除）

## このサイトの絶対ルール（2026-10-09 ユーザー指示「デリケートなサイトなので個人情報の取扱には気をつけて」）
- パスワード・メールアドレス・電話番号・カード番号・氏名などの**入力欄を作らない**（強度診断・流出チェックもしない）。はい/いいえ・選択だけ
- 選んだ内容はサーバーにもどこにも**送らない**。保存は localStorage（キーは `mamoru:` で始まる）だけ。保存するのはサービスのidとチェック状態だけ。各ツールに「この端末の記録を消す」ボタン。**URLのクエリに入れない**
- GA4 は回数だけ（mamoru_check_done / mamoru_quiz_done / mamoru_2fa_all_done / mamoru_2fa_link_click / mamoru_komattara_pick / mamoru_next_click / mamoru_apply_click）。送るのは page と from（場所）だけ。回答・サービス名は送らない（ga.js の mamoruEvent を使う）
- **広告（AdSense）は入れない**。入れるなら必ずユーザー承認。外部スクリプトは GA4 だけ。CSP は _headers（インラインの script・style 属性は使えない）
- 外部リンクは各社・公的機関の**公式ドメインだけ**。公式サイト内で実在を確かめたURL、確認日を記録。短縮URLは使わない
- 詐欺の実例は手口の要点を自分の言葉で書き直す（フィッシング対策協議会は画像・文面の転載に相談を求めている）。偽URL・実在の個人の電話番号やメールアドレスは載せない（tests/quiz.test.mjs で検査）
- 会員限定の情報源の文言・名前は出さない。数字は一次資料の本文で確かめ、出典と確認日をつける
- JSON-LD の author は「web忍者の砦」

## 年に一度・価格が変わったら直す所
- password/compare.js の価格（ソースネクスト 17,980/27,980円、公式 $47.88/$71.88・$4.99/$7.99）・為替（三菱UFJ TTS）・確認日。tests/compare.test.mjs の期待値も
- password/index.html の価格表・出典
- nidankai/list.js のリンク（各社のヘルプはURLが変わりやすい）
