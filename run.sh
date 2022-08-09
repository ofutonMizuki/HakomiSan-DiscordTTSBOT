docker run --name "voicevox" --rm -it -d -p '127.0.0.1:50021:50021' voicevox/voicevox_engine:cpu-ubuntu20.04-latest
npx ts-node ./src/main.ts ../config.json
