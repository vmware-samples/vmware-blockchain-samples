#!/bin/bash
echo "Starting grpc server :${PRIVACY_WALLET_GRPC_SERVICE_LISTEN_URL} !!"

# start c++ based privacy grpc library service
exec /app/privacy-wallet-service ${PRIVACY_WALLET_GRPC_SERVICE_LISTEN_URL}
