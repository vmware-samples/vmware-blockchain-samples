import { RouteComponentProps } from "react-router-dom";
import Transfer from "../components/Transfer";


export default function TransferPage({history}: RouteComponentProps): JSX.Element {
  return (
    <Transfer history={history} />
  )
}
