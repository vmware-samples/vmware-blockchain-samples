# Copyright 2019 VMware, all rights reserved.
# This software is released under MIT license.
# The full license information can be found in LICENSE in the root directory of this project.

FROM athena-docker-local.artifactory.eng.vmware.com/helen:prereqs-v2
WORKDIR /source
COPY . /source
RUN apt-get -y update
RUN apt-get install -y git
RUN apt-get update -yq \
    && apt-get install curl gnupg -yq \
    && curl -sL https://deb.nodesource.com/setup_8.x | bash \
    && apt-get install nodejs -yq
RUN apt-get install -y software-properties-common
RUN echo | add-apt-repository ppa:ethereum/ethereum
RUN apt-get update -y
RUN echo | npm install web3@0.20.1
RUN npm install --save httpheaderprovider
RUN npm install --global mocha
RUN apt-get install -y vim
