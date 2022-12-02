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
      // VMBC Deployment
      {
        text: 'VMBC Deployment',
        children: [
          {
            text: 'VMBC Deployment without Logging',
            link: '/vmbc-deployment/vmbc-four-node-one-client-deployment'
          },
          {
            text: 'VMBC Deployment with Logging',
            link: '/vmbc-deployment/vmbc-four-node-one-client-deployment-with-logging'
          }
        ]
      },
      // Privacy
      {
        text: 'Privacy',
        link: '/privacy/',
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
        children: [
          {
            text: "NFT Platform",
            link: '/sample-dapps/nft-platform/'
          },
          {
            text: 'ERC20 Swap',
            link: '/sample-dapps/erc20-swap/'
          },
          {
            text: 'ERC20 Test Tool',
            link: '/sample-dapps/erc20-test-tool/'
          }
        ]
      }
    ],
  }),
}