import { InjectedConnector } from '@web3-react/injected-connector'
import { NetworkConnector } from '@web3-react/network-connector'

const RPC_URLS: { [chainId: number]: string } = {
  1: "http://50.18.241.122:32010" as string,
}

export const injected = new InjectedConnector({ supportedChainIds: [2018, 5000] })

export const network = new NetworkConnector({
  urls: { 1: RPC_URLS[1] },
  defaultChainId: 5000
})

