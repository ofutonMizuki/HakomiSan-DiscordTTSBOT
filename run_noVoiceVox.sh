rm -r wav/
mkdir wav

./register.sh

npx ts-node ./src/main.ts ../config.json
