echo "deploying smart contacts on vmbc"
npm run deploy:concord

echo "sleeping for 10s"
sleep 10

npm run start:concord
