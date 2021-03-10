# ERC-20 Load Testing Tool

# Overview

This is a sample load testing tool to
transfer [SecurityToken](../hardhat/contracts/SecurityToken.sol)
from a sender to a recipient account at a controlled pace
using [web3j](https://github.com/web3j/web3j) library.

# Setup

Install the following tools.

* [JDK 11](https://adoptopenjdk.net/installation.html)
* [Maven](https://maven.apache.org/install.html)

# Build

```shell
$ git clone https://github.com/vmware-samples/vmware-blockchain-samples.git
$ cd vmware-blockchain-samples/web3j
$ mvn clean install
```

# Run

Configure [application.yml](src/main/resources/config/application.yml) as per your test requirement
and Ethereum client deployment. Run the following command to start the load test.

```shell
$ mvn spring-boot:run
# Ctrl+C to stop once the test is done. 
```

# Monitor

Monitor the test using [Chart.js](https://www.chartjs.org/) on port 8080. If you would like to send
metrics to Wavefront, you could configure it and start a Wavefront Proxy using the following
command.

```shell
$ docker run -d -e WAVEFRONT_URL=YOUR_WAVEFRONT_URL -e WAVEFRONT_TOKEN=YOUR_API_TOKEN -p 2878:2878 wavefronthq/proxy:latest
```
