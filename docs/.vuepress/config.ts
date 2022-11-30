import { defaultTheme } from '@vuepress/theme-default'

export default {
  lang: 'en-US',
  title: 'VMware Blockchain Ethereum Developer Kit',
  description: 'Description goes Here',
  base: '/vmware-blockchain-samples/',
  theme: defaultTheme({
    sidebar: 'auto',
    repo: 'vmware-samples/vmware-blockchain-samples',
    contributors: false,
    editLink: false,
    navbar: [
      // VMBC Ethereum Overview
      {
        text: 'VMBC Ethereum Overview',
        link: '/vmbc-ethereum-overview',
      },
      // Privacy
      {
        text: 'Privacy',
        link: '/privacy/',
      },
      // VMBC Provisioning
      {
        text: 'Provisioning',
        children: [
          {
            text: 'VMBC Ethereum without Logging',
            link: '/vmbc-ethereum/vmbc-four-node-one-client-deployment'
          },
          {
            text: 'VMBC Ethereum with Logging',
            link: '/vmbc-ethereum/vmbc-four-node-one-client-deployment-with-logging'
          }
        ]
      },
      // Permissioning
      {
        text: 'Permissioning',
        link: '/permissioning/',
      },
      // Block Explorer
      {
        text: 'Block Explorer',
        link: '/block-explorers/vmbc-explorer/',
      },
      // Sample DApps
      {
        text: 'Sample DApps',
        link: '/README',
        children: [{
          text: "NFT Platform",
          link: '/vmbc-ethereum/sample-dapps/nft-platform/'
        },
        {
          text: 'ERC20 Swap',
          link: '/vmbc-ethereum/sample-dapps/erc20-swap/'
        }]
      }
    ],
  }),
}