# Bond Issuance Python Dapp

Commands to run this project.

Install the requirements.

```shell
pip3 install -r requirements.txt
```

Change <ethereum_client_ip> in .env file and then run following command:

```shell
cd vmbc-eth-sdk/tools/bond_issuance_py
```

Deploy exchange contract

```shell
python cli_parser.py --PTName NIS --PTSymbol NIS --operation deploy
```

Mint PT for Market Makers

```shell
python cli_parser.py --operation mint_pt --MMNumber 1 --PTAmountMint 1000    
```
```shell
python cli_parser.py --operation mint_pt --MMNumber 0 --PTAmountMint 1000 
```

Mint ST

```shell
python cli_parser.py --operation mint_st
```

Swap tokens

```shell
python cli_parser.py --operation swap  --MMNumber 0 --STAmountSwap 1 --ISIN ABCD0001
```

Close issuance

```shell
python cli_parser.py --operation close_issuance
```

Get balance for a specific account

```shell
# for all ISIN and PT
 python cli_parser.py --operation get_balance --Account <account_address>
 
 # for specific ISIN and PT
 python cli_parser.py --operation get_balance --Account <account_addess> --ISIN ABCD0002

```

Simulate deadline exceeded
```shell
 python cli_parser.py --operation swap  --MMNumber 0 --STAmountSwap 1 --ISIN ABCD0001 --delay True
```
