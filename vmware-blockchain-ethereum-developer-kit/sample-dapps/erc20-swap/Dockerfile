# From Alpine 3.14 as the Base Image
FROM athena-docker-local.artifactory.eng.vmware.com/node:14-alpine

# Desc
LABEL description="Ethereum Sample DApp: ERC20 Swap"

# Copy the sample applications
COPY . /workspace/erc20-swap

# Run build Commands
WORKDIR /workspace/erc20-swap

RUN apk add git
RUN npm install --registry=http://build-artifactory.eng.vmware.com:80/artifactory/api/npm/npm
RUN npm run clean

# Expose Ports
EXPOSE 3000

# Enviroinment Variables
ENV VMBC_CHAIN_ID=5000
ENV VMBC_URL=http://host.docker.internal:8545

CMD ./run.sh
