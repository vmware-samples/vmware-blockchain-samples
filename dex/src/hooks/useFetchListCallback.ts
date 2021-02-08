

import {useCallback} from "react";
import {Contract} from "@ethersproject/contracts";
import ERC20ABI from "../abi/ERC20.abi.json";
import tkns from '../constants/token-list.json'
import { ERC20 } from "../types/token";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { BigNumber } from "ethers";

export function useFetchListCallback(): () => Promise<Array<ERC20>>  {
  const {account, library, active}: Web3ReactContextInterface = useWeb3React()

  return useCallback(async function () {
      const balances: Array<ERC20> = [];

      if (active) {
        for (const token of tkns.tokens) {
          // @ts-ignore
          const erc20 = new Contract(token.contractAddress, ERC20ABI, library.getSigner());

          const balance = await erc20.balanceOf(account);
          const decimals = await erc20.decimals();
          const divideBy = BigNumber.from(10).pow(decimals)

          balances.push({
            name: await erc20.name(),
            symbol: await erc20.symbol(),
            balance: balance.div(divideBy).toNumber()
          });
        }
      }

      return balances;
    }, [account, active, library]);
}
