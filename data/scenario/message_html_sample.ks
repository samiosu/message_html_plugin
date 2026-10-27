;[call storage="message_html_sample.ks"] で呼び出してください。
;画面の解像度やプロジェクト固有の背景・タイトル・キャラクターに依存しないサンプルです。
;現在のメッセージを消去し、message0 の表ページを表示します。
[loadcss file="./data/others/plugin/message_html/examples/sample.css"]
[cm]
[current layer="message0" page="fore"]
[layopt layer="message0" visible=true]
[message_html enabled=true]

通常の文章に<strong>太字</strong>や<em>斜体</em>を混ぜられます。[r]
<span style="color:#ffd166;">色の変更</span>、<u>下線</u>、<s>取り消し線</s>も使えます。[p]

<span class="message-html-accent">CSSファイルの色と太字です。</span>[r]
<span class="message-html-large">少し大きな文字です。</span>[r]
<span class="message-html-note">クラス名で装飾を指定できます。</span>[p]

[eval exp="tf.message_html_sample_name='あかね'"]
<span style="color:#8be9fd;">こんにちは、<strong>[emb exp="tf.message_html_sample_name"]</strong>さん。[l][r]
クリック待ちと改行を挟んでも、装飾を引き継ぎます。</span>[p]

<ruby>漢字<rt>かんじ</rt></ruby>のルビを表示できます。<br>
同梱アイコン<img src="./data/others/plugin/message_html/examples/sample_icon.svg" alt="星" width="24" height="24">も本文に入れられます。[p]

&amp;lt;strong&amp;gt; と書けば、&lt;strong&gt; という文字になります。[r]
&amp;amp; と書けば、&amp; を表示できます。[p]

[message_html enabled=false]
<strong>無効にするとタグも文字として表示します。</strong>[p]
[message_html enabled=true]

<strong>再びHTMLを有効にしました。</strong>[r]
サンプルは終了です。クリックすると呼び出し元に戻ります。[p]
[cm]
[return]
