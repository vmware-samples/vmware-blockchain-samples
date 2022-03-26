version=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}')
echo version "$version"
if [[ "$version" == "11"* ]]; then
    echo Java version is 11
    source .env
    nohup python3 run-dapp.py &
else
    echo Java version is not 11
fi


