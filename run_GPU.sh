docker run --name "voicevox" --rm -d --gpus all -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:nvidia-ubuntu20.04-latest

rm -r wav/
mkdir wav

./register.sh

npx ts-node ./src/main.ts ../config.json
