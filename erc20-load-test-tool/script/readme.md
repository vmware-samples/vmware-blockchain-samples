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
