

# From Alpine 3.14 as the Base Image
FROM alpine:3.14

# Maintainer
LABEL maintainer = "snallayan@vmware.com"

# Desc
LABEL description="VMware Blockchain Starter Kit - ERC20 Swap"

# Copy the sample applications
COPY . /workspace/erc20-swap
# COPY ./erc20-load-test-tool /workspace/erc20-load-test-tool



# Install Dependencies
RUN apk add --update nodejs=14.19.0-r0
RUN apk add --update npm=7.17.0-r0

# Run build Commands
WORKDIR /workspace/erc20-swap

RUN npm install
RUN npm run clean
# RUN npm run build
# RUN npm run deploy:concord
# RUN npm run start

# Expose Ports
EXPOSE 3000

# Enviroinment Variables
ENV VMBC_CHAIN_ID=5000
ENV VMBC_URL=http://host.docker.internal:8545

CMD ./run.sh

# docker build -f Dockerfile -t vmbc-erc20-swap-kit:1 .
