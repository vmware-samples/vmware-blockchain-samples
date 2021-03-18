import { injected } from "../connectors/NetworkConnector"
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from '@ethersproject/providers';


export const Wallet = (props: {className: string}) => {
  const { account, activate, active } = useWeb3React<Web3Provider>()
  const onClick = () => {
    console.log(active);
    console.log(account);

    activate(injected)
  }

  return (
    <div className={props.className} style={{margin: '0 1rem 1rem'}}>
      {active ? (
        <button className="btn btn-primary-outline btn-block">
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
