# 使い方

導入手順は [README.md](../README.md) を参照してください。ここでは、導入後に `.ks` に書く内容を説明します。

## 基本

HTMLをTyranoScriptの通常の本文に混ぜて書きます。

```text
普通の文章、<strong>太字</strong>、<em>斜体</em>。[r]
<span style="color:#ffd166; font-size:36px;">色とサイズを変えます。</span>[p]
```

`[html]` / `[endhtml]` は、従来どおり画面最前面へHTMLを表示するためのタグです。会話ボックス内に表示する場合は使用しません。

## 対応するHTMLタグ

| 用途 | タグ |
| --- | --- |
| スタイルを指定する領域 | `span` |
| 太字 | `b`, `strong` |
| 斜体 | `i`, `em`, `var` |
| 下線・取り消し線 | `u`, `s`, `del` |
| 文字サイズ・上付き・下付き | `small`, `big`, `sup`, `sub` |
| コード表記など | `code`, `kbd`, `samp`, `abbr`, `mark` |
| ルビ | `ruby`, `rb`, `rt`, `rp` |
| 改行・改行可能位置 | `br`, `wbr` |
| インライン画像 | `img` |

会話文用のインラインHTMLに対応しています。`div`, `p`, 見出し、表、`a`, `script`, `iframe`, フォームなど、一覧にないタグは文字として表示します。JavaScriptのイベント属性は引き継ぎません。シナリオの移動には通常の `[link]` / `[glink]` を使ってください。

`style`, `class`, `title`, `lang`, `dir` を指定できます。`img` では、さらに `src`, `alt`, `width`, `height` を指定できます。

## 改行・クリック待ち・改ページ

```text
1行目です。[r]
2行目です。<br>
ここでクリックを待ちます。[l]
続きです。[p]
次のページです。[p]
```

- `.ks` の物理的な改行は、従来どおり画面の改行になりません。`[r]` または `<br>` を使います。
- `<br>` は改行だけを行います。クリック待ちは `[l]`、クリック待ちと改ページは `[p]` を使います。
- HTMLタグとその属性は、途中で改行せず1行に書いてください。

## 装飾の入れ子とTyranoのタグ

```text
[eval exp="tf.message_html_name='あかね'"]
<span style="color:#8be9fd;">こんにちは、<strong>[emb exp="tf.message_html_name"]</strong>さん。[l][r]
クリックを待った後も同じ色です。</span>[p]
```

`[r]`, `[l]`, `[emb]`, `[font]` や物理的な改行を挟んでも、開いているHTMLの装飾タグを引き継ぎます。HTMLタグは同じページ内で閉じてください。

`[p]`, `[cm]`, `[ct]`, `[er]` による改ページ・消去で、装飾の継続状態をリセットします。次のページまで装飾する場合は、次のページでも開始タグを書きます。

`[emb]` の値に対応するHTMLタグが含まれている場合、その値もHTMLとして解釈します。タグ自体を文字として表示したい値は、次のエンティティ表記を使ってください。

## タグ自体を文字として表示する

```text
&lt;strong&gt;太字&lt;/strong&gt; と表示します。[p]
```

この例の画面表示は `<strong>太字</strong>` です。エンティティを解釈した結果が再びHTMLタグとして解釈されることはありません。

| 表示したい文字 | `.ks` に書く表記 |
| --- | --- |
| `<` | `&lt;` |
| `>` | `&gt;` |
| `&` | `&amp;` |
| `[` | `&#91;` |
| `]` | `&#93;` |
| バックスラッシュ | `&#92;` |

HTMLの解釈より先に `.ks` のパーサーが動きます。HTML属性に角括弧やバックスラッシュを書く場合は、上のエンティティ表記を使います。

## CSSクラスを使う

```text
[loadcss file="./data/others/plugin/message_html/examples/sample.css"]
<span class="message-html-accent">CSSファイルのスタイルを使います。</span>[p]
```

同梱CSSには `message-html-accent`, `message-html-large`, `message-html-note` というサンプル用クラスがあります。独自のCSSを使う場合も同じように `[loadcss]` で読み込めます。

`char`, `current_span`, `entity`, `fill`, `stroke`, `dummy`, `animchar`, `text-shadow`, `text-stroke`, `message-html-atom` は内部処理に使うクラス名です。HTMLの `class` に書いても取り除かれるため、装飾には独自の名前を付けてください。

## ルビ

```text
<ruby>漢字<rt>かんじ</rt></ruby>を表示します。[p]
```

HTMLの `ruby` は、親文字と読みをまとめて1要素として表示します。複数の漢字を1つの `ruby` で囲むと、そのグループが一度に現れます。通常の `[ruby text="かん"]漢` も引き続き使えます。

## 画像

```text
ここに<img src="./data/others/plugin/message_html/examples/sample_icon.svg" alt="星" width="24" height="24">画像を入れます。[p]
```

画像のパスは、シナリオファイルの位置ではなく **`index.html` の位置**を基準に書きます。通常の画像なら `./data/image/example.png` のように指定します。

画像は1要素として文字送りの順番に現れます。`width` と `height` を付けると、読み込み前後のレイアウトが安定します。画像ファイルはゲームの配布時にも含めてください。

## 一時的に無効にする

```text
[message_html enabled=false]
<strong>ここではタグも文字として表示します。</strong>[p]
[message_html enabled=true]
<strong>ここから再び太字です。</strong>[p]
```

起動時は有効です。有効・無効の設定はセーブ用のゲーム状態に含まれます。切り替えると、その時点で継続している装飾タグの状態もリセットします。

## バックログ・読み上げ・セーブ

- バックログにもHTMLの装飾を反映します。バックログ画面独自のCSSがある場合、最終的な見た目はそのCSSの影響も受けます。
- 読み上げとオートの待ち時間には、タグを除いた本文を渡します。HTMLルビの読みは除き、画像には `alt` の文字列を使います。
- 装飾の継続状態は `kag.stat.message_html` に保持し、通常のセーブ用データに含めます。検証範囲の詳細は [COMPATIBILITY.md](COMPATIBILITY.md) を参照してください。

## よくある質問

### タグが文字として表示される

`index.html` の読み込み順とファイルの配置を確認し、プレビューを閉じて開き直してください。`[message_html enabled=false]` で無効にしていないか、対応一覧にないタグを使っていないかも確認します。

### HTMLではなく画面全体の領域に表示される

会話ボックスの本文として書く場合は、`[html]` / `[endhtml]` で囲みません。

### HTML属性の途中でTyranoのタグとして解釈される

HTML属性中の `[` と `]` を `&#91;` と `&#93;` に置き換えます。HTMLタグの途中で改行していないかも確認してください。

### 画像が表示されない

`src` を `index.html` 基準で指定しているか、指定した画像を導入先にもコピーしたか確認します。同梱サンプルでは `sample_icon.svg` を使うので、`examples` フォルダもコピーしてください。

### 別のプラグインと併用したい

通常のTyranoのタグとの組み合わせを対象に検証しています。メッセージ描画を書き換えるプラグインとの併用では、両方の描画機能を実際に確認してください。確認済みの範囲は [COMPATIBILITY.md](COMPATIBILITY.md) に記載しています。
