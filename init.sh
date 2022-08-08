#もしconfig.jsonが存在してないなら新規作成
if [ ! -e config.json ]; then

    #設定ファイルを新規作成
    touch config.json

    #設定ファイルのテンプレートを書き込み
    echo -e "{\n    \"token\": \"token\"\n}" >> config.json
fi

#
rm -rf node_modules
npm install