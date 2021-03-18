import { TransactionResponse } from "@ethersproject/abstract-provider";
import { FormEvent } from "react";
import { useParams } from 'react-router';
import { ROUTES } from '../constants/routes';
import useTranferTokensForm from '../hooks/useSend';
import ContactList from './ContactList';

type Props = {
  history: any
}

export default function Transfer({history}: Props) {
  let transferring = false
  // @ts-ignore
  const {tokenAddress} = useParams()
  const callback = (response: TransactionResponse | boolean) => {
    history.push(ROUTES.PORTFOLIO)
    transferring = false
    return response
  }
  const {inputs, handleSubmit, handleInputChange} = useTranferTokensForm(tokenAddress, callback)

  const formSumbmit = (event: FormEvent<HTMLFormElement>) => {
    transferring = true
    handleSubmit(event)
  }

  return (
    <div className="card">
      <div className="card-header">Send {tokenAddress}</div>
      {transferring ? <span className="spinner"></span> :
      <form onSubmit={formSumbmit} className="clr-form clr-form-horizontal">
        <ContactList label="Who" onChange={handleInputChange} name="recipient" value={inputs.recipient}></ContactList>

        <div className="clr-form-control">
          <div className="clr-control-label">Amount</div>
          <div className="clr-control-wrapper">
            <div className="clr-input-wrapper">
              <input className="clr-input"
                     name="amount"
                     type="text"
                     value={inputs.amount}
                     onChange={handleInputChange} />
            </div>
          </div>
        </div>
        <button type="submit" className="btn btn-primary">Transfer</button>
      </form>
      }
    </div>
  )
}
