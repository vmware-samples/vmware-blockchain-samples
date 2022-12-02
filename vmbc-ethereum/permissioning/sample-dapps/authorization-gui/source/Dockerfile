# From Alpine 3.14 as the Base Image
FROM athena-docker-local.artifactory.eng.vmware.com/node:14-alpine

LABEL description="Ethereum Sample DApp: Permissioning"

COPY . /workspace/permissioning

WORKDIR /workspace/permissioning

RUN apk add git rsync
RUN npm install --registry=http://build-artifactory.eng.vmware.com:80/artifactory/api/npm/npm

# Enviroinment Variables
ENV VMBC_CHAIN_ID=5000
ENV VMBC_URL=http://host.docker.internal:8545

# Expose Ports
EXPOSE 4300

CMD ./run.sh