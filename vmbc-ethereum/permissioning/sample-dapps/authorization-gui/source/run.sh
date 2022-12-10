echo "Deploying erc-20 smart contact on vmbc"
npm run deploy

echo "sleeping for 10s"
sleep 10

npm run start-for-container