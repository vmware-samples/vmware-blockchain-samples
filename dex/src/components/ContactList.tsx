import {CdsDatalist} from '@clr/react/datalist';
import { accounts } from '../constants/accounts';

export default function ContactList(props: any) {
  return (
  <CdsDatalist control-width="shrink">
    <label>{props.label}</label>
    <input placeholder="Select User or Paste Address" onChange={props.onChange} name={props.name}/>
    <datalist>
      {Object.entries(accounts).map(([userName, account]) => <option value={account}>{userName}</option>)}
    </datalist>
  </CdsDatalist>

  )
}
