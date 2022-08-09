# HakomiSan-DiscordTTSBOT
## HakomiSan-DiscordTTSBOTとは 
簡単に言えば読み上げBOTです

音声合成エンジンにVoiceVoxを使用し品質の良い音声が生成されます

また、なるべく簡単に扱えるようにしています
## 使い方
リポジトリをクローンしinit.shを実行します
```
./init.sh
```
そうすると初期化処理が走り必要なライブラリのインストールとconfig.jsonが生成されますので、config.jsonのtokenに自分のBOTのトークンを貼り付けます
```
{
  "prefix": ">",
  "token": "-----ここにトークンを貼り付け-----"
}
```

run.shを実行すればすぐにBOTが起動します
```
./run.sh
```
