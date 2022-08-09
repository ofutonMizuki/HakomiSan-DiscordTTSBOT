# HakomiSan-DiscordTTSBOT
## HakomiSan-DiscordTTSBOT(通称: はこみさん)とは 
はこみさんは読み上げBOTです

音声合成エンジンにVoiceVoxを使用し品質の良い音声が生成されます。しかし、CPU版VoiceVoxを使用している以上は遅延の大きさは避けられませんので可能であればGPU版の使用をおすすめします

また、なるべく簡単に扱えるようにしています
### 既知の問題
既知の問題として、起動初回時の読み上げまでが遅い問題があります
## 使い方
Node.jsとDockerが必要ですがここではインストール方法は割愛します

### リポジトリをクローンしinit.shを実行します
- CPU版の場合
```
./init.sh
```
- GPU版の場合
```
./init_GPU.sh
```
### 必要なライブラリのインストールとconfig.jsonが生成されますので、config.jsonのtokenに自分のBOTのトークンを貼り付けます
```
{
  "prefix": ">",
  "token": "-----ここにトークンを貼り付け-----"
}
```
### run.shを実行すればすぐにBOTが起動します
- CPU版の場合
```
./run.sh
```
- GPU版の場合
```
./run_GPU.sh
```
### botを停止するにはCtrl+Cを押します
### Docker上で動作しているVoiceVoxを停止するには以下のコマンドを実行します
- CPU版とGPU版を切り替えるためにはこのコマンドで一旦停止させなければいけません
```
./stopVoiceVox.sh
```
## 開発環境&推奨環境
開発にはWindows11 + WSL2(Ubuntu 20.04LTS)を使っていますので、推奨環境としてWSL2(Ubuntu 20.04LTS)もしくはUbuntu 20.04LTSをおすすめします
