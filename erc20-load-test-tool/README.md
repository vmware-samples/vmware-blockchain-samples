# ERC-20 Load Testing Tool

# Overview

This is a sample load testing tool to
transfer [SecurityToken](../hardhat/contracts/SecurityToken.sol)
from a sender to one or more recipient accounts at a controlled pace
using [web3j](https://github.com/web3j/web3j) library.

# Setup

Install the following tools.

* [JDK 11](https://adoptopenjdk.net/installation.html)
* [Maven](https://maven.apache.org/install.html)

# Build

```shell
$ git clone https://github.com/vmware-samples/vmware-blockchain-samples.git
$ cd vmware-blockchain-samples/erc20-load-test-tool
$ mvn clean install
```

# Run

## Single Instance
Configure [application.yml](src/main/resources/config/application.yml) as per your test requirement
and Ethereum client deployment. Run the following command to start the load test.

```shell
$ mvn spring-boot:run
# Ctrl+C to stop once the test is done. 
```

Running from JAR file

```shell
$ java -jar target/erc20-benchmark-1.0-SNAPSHOT.jar
```

## Multiple Instances
Check out [multi-dapp-script](script/)

# Monitor

Optionally configure [application.yml](./src/main/resources/config/application.yml) to enable
exporting metrics to one or more monitoring tools.

* [Chart.js](https://www.chartjs.org/) (default)
* [Wavefront Proxy](https://hub.docker.com/r/wavefronthq/proxy)
* [Prometheus](https://prometheus.io/docs/prometheus/latest/installation/)

# Logs and Results

For logs 
```shell
$ cd output/logs/ 
```

For results
```shell
$ cd output/result/ 
```
