# Multi-Dapp Run Script

# Overview

Python script to run multiple instances of ERC20 load test tool, with option to share contract address among them.

# Setup

Install the dependencies.
```bash
$ cd script
$ pip3 install -r requirements.txt
```

# RUN

1. Edit `.env` file, to change ENVIRONMENT variables
```bash
$ vi .env
```

2. Load ENVIRONMENT variables
```bash
$ source .env
```

3. Run the script
```bash
$ python3 run-dapp.py
```
