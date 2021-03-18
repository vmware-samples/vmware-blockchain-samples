import { ClarityIcons, nodeIcon } from '@clr/core/icon'
import { CdsIcon } from '@clr/react/icon';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useFetchListCallback } from '../hooks/useFetchListCallback';
import { ERC20 } from "../types/token";

ClarityIcons.addIcons(nodeIcon);

export default function PortfolioTable(props: any) {
  const tokens = useFetchListCallback()
  const [tokenList, setTokeList] = useState([])
  const tableStyles = {
    verticalAlign: 'middle'
  }

  useEffect(() => {
    const renderTableData = async () => {
      // @ts-ignore
      const tkns: ERC20[] = await tokens()
      const tknList = tkns.map((token: ERC20) => {
        return (
          <tr key={token.address}>
              <td className="left"><CdsIcon shape="node" /> {token.name}</td>
              <td>{token.symbol}</td>
              <td>{token.balance}</td>
              <td>
                <div className="btn-group btn-sm">
                  <Link to={ROUTES.TRANSFER + "/" + token.address} className="btn btn-primary-outline">Send</Link>
                </div>
              </td>
          </tr>
          )
        })
        // @ts-ignore
        setTokeList(tknList)
      }

    renderTableData()

  }, [tokens])

    return (
       <div className="container">
          <table className="table" style={tableStyles}>
             <tbody>
                {tokenList.length ? tokenList.map(el => el)
                : <tr><td><span className="spinner"></span></td></tr>}
             </tbody>
          </table>
       </div>
    )
}

