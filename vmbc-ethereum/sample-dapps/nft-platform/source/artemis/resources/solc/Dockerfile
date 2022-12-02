# Base image for builder image in the main Dockerfile (has solc version installed already)
FROM athena-docker-local.artifactory.eng.vmware.com/node:14.20-alpine as node
RUN apk update && apk add rsync git
WORKDIR /app
# SIZE --- 120 MB

# Downloads hardhat & Solidity compiler specified in solc.version.json
COPY solc.version.json .
COPY resources/solc/solc.install.json ./package.json
RUN npm i --registry=http://build-artifactory.eng.vmware.com:80/artifactory/api/npm/npm
COPY resources/solc/solc.hardhat.js ./hardhat.config.js
COPY contracts/CompilerCheck.sol ./contracts/CompilerCheck.sol
RUN npm run download-solc-compiler
# SIZE --- 600 MB
