import { injected } from "../connectors/NetworkConnector"
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from '@ethersproject/providers';


export const Wallet = (props: {className: string}) => {
  const { chainId, account, activate, active, library } = useWeb3React<Web3Provider>()
  const onClick = () => {
    activate(injected)
  }

  return (
    <div className={props.className} style={{margin: '0 1rem 1rem'}}>
      {active ? (
        <button className="btn btn-primary-outline btn-block disabled">
          {account}
        </button>
      ) : (
        <button type="button"
                onClick={onClick}
                className="btn btn-primary-outline btn-block">
        Connect
      </button>
      )}
    </div>
  )
}
