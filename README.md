# HakomiSan-DiscordTTSBOT

## HakomiSan-DiscordTTSBOT(通称: はこみさん)とは 
はこみさんはオープンな読み上げBOTです

音声合成エンジンにVoiceVoxを使用し品質の良い音声が生成されます。

しかし、CPU版VoiceVoxを使用している場合は遅延の大きさは避けられませんので、可能であればGPU版の使用をおすすめします

また、なるべく簡単に扱えるようにしています

### 既知の問題
既知の問題として、初回の読み上げまでが遅い問題があります

## 準備
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
- ※オプション: 外部のVoiceVoxを使う場合
```
./init_noVoiceVox.sh
```

### 必要なライブラリのインストールとconfig.jsonが生成されますので、config.jsonのtokenに自分のBOTのトークンを貼り付けます
```
{
  "prefix": ">",
  "token": "-----ここにトークンを貼り付け-----",
  "url": "http://localhost:50021"
}
```
- ※オプション: 外部のVoiceVoxを使う場合
```{
  "prefix": ">",
  "token": "-----ここにトークンを貼り付け-----",
  "url": "-----ここにVoiceVoxのサーバのURLを貼り付け-----"
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
- ※オプション: 外部のVoiceVoxを使う場合
```
./run_noVoiceVox.sh
```

### botを停止するにはCtrl+Cを押します

### Docker上で動作しているVoiceVoxを停止するには以下のコマンドを実行します
- CPU版とGPU版を切り替えるためにはこのコマンドで一旦停止させなければいけません
```
./stopVoiceVox.sh
```

## 開発環境&推奨環境
開発にはWindows11 + WSL2(Ubuntu 20.04LTS)を使っていますので、推奨環境としてWSL2(Ubuntu 20.04LTS)もしくはUbuntu 20.04LTSをおすすめします

## 著作権表示
本プロジェクトのライセンスはGPLv3です  
詳細はLICENSEに記載されています

voicevox.tsは以下のプロジェクトの一部を利用しています  
https://github.com/ddPn08/voicevox-api-client  
Copyright (c) 2022 ddPn08  
Released under the MIT license  
https://opensource.org/licenses/mit-license.php
