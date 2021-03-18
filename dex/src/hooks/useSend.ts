import { Contract } from "@ethersproject/contracts";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import ERC20ABI from "../abi/ERC20.abi.json";
import { useWeb3React } from "@web3-react/core";
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";
import { ChangeEvent, FormEvent, useState } from "react";


export default function useTranferTokensForm(tokenAddress: string, callback: any) {
  const [inputs, setInputs] = useState<{ [key: string]: any }>({recipient: '', amount: undefined})
  const { library, active }: Web3ReactContextInterface = useWeb3React()
  const erc20 = new Contract(tokenAddress, ERC20ABI, library.getSigner())

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>, callback: void): void => {
    event.persist()

    if (event.target.name) {
      inputs[event?.target?.name] = event?.target?.value
    }

    setInputs(inputs)
  }

  const handleSubmit = async function (event: FormEvent<HTMLFormElement>): Promise<boolean> {
    event?.preventDefault()

    const decimals = await erc20.decimals()
    const amount = (Number(inputs.amount) * (10 ** decimals)).toString()
    let response: TransactionResponse | boolean = false

    if (active) {
      response = await erc20.transfer(inputs.recipient, amount) as TransactionResponse
      await response.wait()
    }

    return callback(response)
  }

  return { handleSubmit, inputs, handleInputChange, setInputs }
}



