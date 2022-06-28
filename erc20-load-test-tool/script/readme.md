# Multi-Dapp Run Script

# Overview

Python script to run multiple instances of [ERC20 load test tool](../README.md), with an option to share contract address among them.

# Setup

Install the dependencies.
```bash
$ cd script
$ pip3 install -r requirements.txt
```
Install the following tools.

* [JDK 11](https://adoptopenjdk.net/installation.html)
* [Maven](https://maven.apache.org/install.html)

# RUN

1. Edit `.env` file, to change ENVIRONMENT variables
```bash
$ vi .env
```

2. Run the script
```bash
$ ./run.sh
```

3. To check the logs
```bash
$ cat nohup.out
```

4. (optional) To enable wavefront, login into vmwaresaas.jfrog.io and set WAVEFRONT_TOKEN in .env file
```bash
$ docker login vmwaresaas.jfrog.io -u '<username>' -p '<password>'
$ vi .env
$ export MANAGEMENT_METRICS_EXPORT_WAVEFRONT_ENABLED=true
$ export WAVEFRONT_TOKEN=<your_token>
```
