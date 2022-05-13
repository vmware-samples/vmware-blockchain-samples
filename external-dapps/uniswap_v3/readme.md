# Uniswap Contracts Deploy Script

# Overview

Python script to deploy uniswap_v3_core contracts on VMBC.

# Setup

```bash
$ cd external-dapps
$ git clone https://github.com/Uniswap/v3-core.git
$ mv v3-core/contracts/* uniswap_v3/contracts_v3core
```

Install the dependencies.
```bash
$ cd uniswap_v3
$ pip3 install -r requirements.txt
```

# RUN

1. Edit `.env` file, to change ENVIRONMENT variables
```bash
$ vi .env
$ source .env
```

2. Run the script
```bash
$ python3 deploy.py
```

3. Copy the contract address
