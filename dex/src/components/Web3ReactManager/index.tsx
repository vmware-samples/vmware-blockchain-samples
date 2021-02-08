import { useEagerConnect } from '../../hooks'


export default function Web3ReactManager({ children }: { children: JSX.Element }) {
  useEagerConnect()

  return children
}
