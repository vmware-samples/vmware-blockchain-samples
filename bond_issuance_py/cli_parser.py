import argparse
import os
from enum import Enum
from bond_poc import deploy_exchange, set_pt, mint_st, close_issuance, swap_tokens,set_env_var,setup_w3,mint_pt,get_balance

class OperationType(str, Enum):
    """
    class for defining operation type
    """

    DEPLOY_EXCHANGE= "deploy"
    MINT_PT = "mint_pt"
    MINT_ST = "mint_st"
    SWAP = "swap"
    CLOSE_ISSUANCE = "close_issuance"
    GET_BALANCE = "get_balance"

def main():
    parser = argparse.ArgumentParser(description='Run Bond POC')
    # deploy exchange and PT
    set_env_var()
    host = os.environ['HOST']

    parser.add_argument('--PTName',  action='store', type=str, help='Name of payment token')
    parser.add_argument('--PTSymbol', action='store',type=str, help='symbol of payment token')
    parser.add_argument('--operation', action='store',type=str, help='value can be deploy, mint_st, mint_pt, swap, close_issuance or get_balance',required=True)

    # mint PT
    parser.add_argument('--MMNumber', action='store',type=int, help='Market maker number(permissible value is 0,1,2)')
    parser.add_argument('--PTAmountMint', action='store',type=int, help='PT amount to be minted for a Market maker')

    # swap
    parser.add_argument('--STAmountSwap', action='store',type=int, help='ST amount to be to be swapped')
    parser.add_argument('--ISIN', action='store',type=str, help='ISIN of a ST')
    parser.add_argument('--Account', action='store',type=str, help='Account address')
    parser.add_argument('--delay', action='store',type=bool, help='whether introduce delay in swap',default=False)

    args = parser.parse_args()

    setup_w3(host)


    if args.operation.lower() == OperationType.DEPLOY_EXCHANGE:
        deploy_exchange(args.PTName, args.PTSymbol)
        set_pt()
    elif args.operation.lower() == OperationType.MINT_ST:
        mint_st()
    elif args.operation.lower() == OperationType.MINT_PT:
        mint_pt(args.MMNumber, args.PTAmountMint)
    elif args.operation.lower() == OperationType.SWAP:
        swap_tokens(args.MMNumber, args.STAmountSwap, args.ISIN, args.delay)
    elif args.operation.lower() == OperationType.CLOSE_ISSUANCE:
        close_issuance()
    elif args.operation.lower() == OperationType.GET_BALANCE:
        if args.ISIN:
            get_balance(args.Account, args.ISIN)
        else:
            get_balance(args.Account)
    else:
        print("Invalid operation")


if __name__ == "__main__":
    main()
