# HakomiSan-DiscordTTSBOT
## HakomiSan-DiscordTTSBOTとは 
簡単に言えば読み上げBOTです

音声合成エンジンにVoiceVoxを使用し品質の良い音声が生成されます

また、なるべく簡単に扱えるようにしています
## 使い方
Node.jsとDockerが必要ですがここではインストール方法は割愛します

### リポジトリをクローンしinit.shを実行します
```
./init.sh
```
### 初期化処理が走り必要なライブラリのインストールとconfig.jsonが生成されますので、config.jsonのtokenに自分のBOTのトークンを貼り付けます
```
{
  "prefix": ">",
  "token": "-----ここにトークンを貼り付け-----"
}
```
### run.shを実行すればすぐにBOTが起動します
```
./run.sh
```
## 開発環境&推奨環境
開発にはWindows11 + WSL2(Ubuntu 20.04LTS)を使っていますので、推奨環境としてWSL2(Ubuntu 20.04LTS)もしくはUbuntu 20.04LTSをおすすめします
