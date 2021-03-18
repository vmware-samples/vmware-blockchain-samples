import { BigNumber } from "@ethersproject/bignumber";

export interface ERC20 {
  name: string,
  symbol: string,
  balance: string,
  address: string
}

export interface ERC20Contract {
  name(): string,
  symbol(): string,
  balance(): number,
  totalSupply(): BigNumber,
  balanceOf(account: string): BigNumber,
  transfer(recipient: string, amount: BigNumber): boolean,
  allowance(owner: string, spender: string): BigNumber,
  approve(spender: string, amount: BigNumber): boolean,
  transferFrom(sender: string, recipient: string, amount: BigNumber): boolean
}
