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

Optionally configure [application.yml](./src/main/resources/config/application.yml) to enable
exporting metrics to one or more monitoring tools.

* [Chart.js](https://www.chartjs.org/) (default)
* [Wavefront Proxy](https://hub.docker.com/r/wavefronthq/proxy)
* [Influxdb](https://hub.docker.com/_/influxdb)
* [Prometheus](https://prometheus.io/docs/prometheus/latest/installation/)
