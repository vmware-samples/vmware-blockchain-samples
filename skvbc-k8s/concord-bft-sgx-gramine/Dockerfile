# NOTES:
# 1. The Dockerfile does not have an entry point because everything has to be managed outside of it.
# 2. Please do not install anything directly in this file.
#   You need to use "install_deps_release.sh" - we want to keep a possibility to develop w/o docker.
# 3. If a tool or library that you install in the "install_deps_release.sh" is needed only for building 3rd party
#   tools/libraries please uninstall them after the script run - we want to keep image' size minimal.
#   For example wget and pip-tools.

FROM ubuntu:20.04

RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y curl gnupg2 binutils

RUN curl -fsSLo /usr/share/keyrings/gramine-keyring.gpg https://packages.gramineproject.io/gramine-keyring.gpg
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/gramine-keyring.gpg] https://packages.gramineproject.io/ focal main' > /etc/apt/sources.list.d/gramine.list

RUN curl -fsSLo /usr/share/keyrings/intel-sgx-deb.key https://download.01.org/intel-sgx/sgx_repo/ubuntu/intel-sgx-deb.key
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/intel-sgx-deb.key] https://download.01.org/intel-sgx/sgx_repo/ubuntu focal main' > /etc/apt/sources.list.d/intel-sgx.list

RUN apt-get update

RUN DEBIAN_FRONTEND=noninteractive apt-get install -y gramine \
    sgx-aesm-service \
    libsgx-aesm-launch-plugin \
    libsgx-aesm-epid-plugin \
    libsgx-aesm-quote-ex-plugin \
    libsgx-aesm-ecdsa-plugin \
    libsgx-dcap-quote-verify \
    psmisc

RUN DEBIAN_FRONTEND=noninteractive apt-get update && apt-get -y --no-install-recommends install \
        autoconf \
        automake \
        bison \
        build-essential \
        clang-9 \
        clang-format-10 \
        clang-tidy-10 \
        curl \
        flex \
        gdb \
        gdbserver \
        git \
        iproute2 \
        iptables \
        less \
        libtool \
        llvm-9 \
        lzip \
        net-tools \
        parallel \
        pkg-config \
        psmisc \
        python3-pip \
        python3-setuptools \
        python3-dev \
        sudo \
        vim \
        wget

RUN    DEBIAN_FRONTEND=noninteractive apt-get -y --no-install-recommends install \
        libbz2-dev \
        liblz4-dev \
        libs3-dev \
        libsnappy-dev \
        libssl-dev \
        libz-dev \
        libzstd-dev

RUN    pip3 install --upgrade wheel && pip3 install --upgrade trio && pip3 install --upgrade pip
RUN    pip3 install \
        eliot eliot-tree \
        tatsu==4.4.0 \
        pytest \
        pycryptodome \
        ecdsa \
        protobuf==3.15.8 \
        grpcio==1.37.1 \
        grpcio-tools==1.37.1 \
        psutil==5.9.1 \
        cryptography==3.3.2

WORKDIR /root

COPY Makefile.sgx /root
COPY skvbc_replica.manifest.template /root
COPY skvbc_replica /root
COPY create_tls_certs.sh /root
COPY GenerateConcordKeys /root
COPY enclave-key.pem /root/.config/gramine/
COPY ./lib /usr/local/lib
COPY ./certs /root/certs

#RUN ./create_tls_certs.sh 5 
RUN ./GenerateConcordKeys -f 1 -n 4 -r 0 -o setA_replica_

RUN ls -ltr /root

RUN make -f Makefile.sgx SGX=1

ENV replica_number 0
CMD ["sh", "-c", "gramine-sgx skvbc_replica -k setA_replica_ -i ${replica_number}"]
