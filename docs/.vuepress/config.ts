import { defaultTheme } from '@vuepress/theme-default'

export default {
  lang: 'en-US',
  title: 'VMware Blockchain for Ethereum',
  description: 'VMware Blockchain for Ethereum Docs',
  base: '/vmware-blockchain-samples/',
  theme: defaultTheme({
    sidebar: 'auto',
    repo: 'vmware-samples/vmware-blockchain-samples',
    contributors: false,
    editLink: false,
    navbar: [
      // Blockchain Deployment
      {
        text: 'Blockchain Deployment',
        children: [
          {
            text: 'System Requirements and Prerequisites',
            link: '/vmbc-deployment/'
          },
          {
            text: 'Blockchain Deployment without Logging Collector',
            link: '/vmbc-deployment/vmbc-four-node-one-client-deployment'
          },
          {
            text: 'Blockchain Deployment with Logging Collector',
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
        text: 'Block Explorers',
        children: [
          {
            text: "Sirato Explorer",
            link: '/block-explorers/sirato-explorer/'
          },
          {
            text: 'VMware Blockchain Explorer',
            link: '/block-explorers/vmbc-explorer/'
          }
        ]
      },
      // Sample DApps
      {
        text: 'Sample dApps',
        children: [
          {
            text: "NFT Platform",
            link: '/sample-dapps/nft-platform/'
          },
          {
            text: 'ERC20 Swap',
            link: '/sample-dapps/erc20-swap/'
          }
        ]
      }
    ],
  }),
}