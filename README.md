# 会話ボックス内HTMLプラグイン

バージョン: **1.0.0** / 作成日: **2026-10-27**

TyranoScriptの `.ks` の本文にHTMLを直接書き、会話ボックス内の文字を装飾するプラグインです。文字送り、クリック待ち、改ページはTyranoScriptの仕組みを使います。

```text
こんにちは。<strong>ここは太字</strong>です。[r]
<span style="color:#ffd166;">ここだけ色を変えます。</span>[p]
```

## 導入する

1. このフォルダの **`data` フォルダ**を、導入先プロジェクトの `index.html` と同じ階層へコピーし、既存の `data` に統合します。上書き対象はこのプラグインとサンプルのファイルだけです。導入先の `index.html` や `first.ks` は配布物に含まれていません。
2. 導入先の `index.html` を開き、次のTyrano本体の読み込み行を探します。

   ```html
   <script src="./tyrano/plugins/kag/kag.tag.js"></script>
   ```

   **その直後**に、次の1行を追加します。

   ```html
   <script src="./data/others/plugin/message_html/message_html.js"></script>
   ```

   最終的に次の順序になります。`async` や `defer` は付けず、起動前にこの順で読み込んでください。

   ```html
   <script src="./tyrano/plugins/kag/kag.tag.js"></script>
   <script src="./data/others/plugin/message_html/message_html.js"></script>
   ```

3. プレビューを閉じて開き直します。以後は `.ks` の通常の本文に、上の例のようにHTMLを書けます。`[html]` / `[endhtml]` で囲む必要はありません。

ゲームへの導入にNode.jsやnpmは不要です。

## サンプルを試す

実行されるシナリオに、次の1行を追加します。例えば `first.ks` の初期化後、タイトル画面へジャンプする前に置けます。

```text
[call storage="message_html_sample.ks"]
```

サンプルでは太字、色、CSSクラス、変数、クリック待ち、ルビ、画像、HTMLの有効・無効の切り替えを確認できます。画面をクリックして進めると、最後に `[return]` で呼び出し元へ戻ります。

サンプルは現在のメッセージを消去し、`message0` の表ページを表示します。開始直後など、サンプル用に画面を使える場所から呼び出してください。背景・タイトルシナリオ・キャラクター画像への依存はありません。

## 同梱内容

```text
message_html_plugin/
├─ README.md                         導入手順とサンプルの呼び出し方
├─ はじめに.txt                      説明書の案内
├─ VERSION.txt                       バージョン
├─ CHANGELOG.md                      更新履歴
├─ CONTENTS.sha256                   同梱ファイルのSHA-256一覧
├─ docs/
│  ├─ USAGE.md                       対応タグ、書き方、よくある質問
│  └─ COMPATIBILITY.md               動作確認環境と確認範囲
└─ data/
   ├─ others/plugin/message_html/
   │  ├─ message_html.js             プラグイン本体
   │  └─ examples/
   │     ├─ sample.css               サンプル用CSS
   │     └─ sample_icon.svg          サンプル用アイコン
   └─ scenario/
      └─ message_html_sample.ks      呼び出し可能なサンプル
```

プラグインの動作に必須なのは `message_html.js` と `index.html` の読み込み行です。サンプルを使わない場合、`examples` フォルダと `message_html_sample.ks` は省略できます。

この配布物はプラグインと専用サンプルをまとめたものです。TyranoScript本体は導入先プロジェクトのものを使用します。

## 更新する・取り外す

- 更新する場合: `message_html.js` を新しい版に差し替え、プレビューを開き直します。`index.html` の読み込み行は1行だけにします。
- 一時的に無効にする場合: シナリオで `[message_html enabled=false]` を使います。`[message_html enabled=true]` で再び有効にします。
- 取り外す場合: `index.html` に追加した読み込み行を削除し、プレビューを開き直します。シナリオ中の `[message_html]` とサンプルの呼び出しも削除し、HTMLで書いた部分を通常の本文やTyranoのタグへ置き換えてください。

詳しい書き方は [docs/USAGE.md](docs/USAGE.md)、検証した環境と互換性の範囲は [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) を参照してください。
