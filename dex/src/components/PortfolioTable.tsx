import { ClarityIcons, nodeIcon } from '@clr/core/icon'
import { CdsIcon } from '@clr/react/icon';
import { useEffect, useState } from 'react';
import { useFetchListCallback } from '../hooks/useFetchListCallback';
import { ERC20 } from "../types/token";

ClarityIcons.addIcons(nodeIcon);

export default function PortfolioTable(props: any) {
  const tokens = useFetchListCallback()
  const [state, setState] = useState([])
  const tableStyles = {
    verticalAlign: 'middle'
  }

  useEffect(() => {
    const renderTableData = async () => {
      // @ts-ignore
      const tkns: ERC20[] = await tokens()
      const tokenList = tkns.map((token: ERC20) => {
        return (
          <tr>
              <td className="left"><CdsIcon shape="node" /> {token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.balance}</td>
              <td>
                <div className="btn-group btn-sm">
                  <button className="btn btn-primary-outline">Send</button>
                  <button className="btn btn-primary-outline">Recieve</button>
                </div>
              </td>
          </tr>
          )
        })
        // @ts-ignore
        setState(tokenList)
      }

    renderTableData()

  }, [tokens])

    return (
       <div className="container">
          <table className="table" style={tableStyles}>
             <tbody>
                {state.map(el => el)}
             </tbody>
          </table>
       </div>
    )
}

