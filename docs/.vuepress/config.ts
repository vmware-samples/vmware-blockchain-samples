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
      // Quick Start Guide
      {
        text: 'Quick Start Guide',
        link: '/quick-start-guide',
      },
      // Accountable Privacy
      {
        text: 'Privacy',
        link: '/privacy/privacy',
      },
      // Deployment
      {
        text: 'Deployment',
        link: '/deployment/deployment',
      },
      // Permissioning
      {
        text: 'Permissioning',
        link: '/permissioning/permissioning',
      },
      // Block Explorer
      {
        text: 'Block Explorer',
        link: '/block-explorer/block',
      },
      // Sample DApps
      {
        text: 'Sample DApps',
        link: '/sample-dapps',
        children: [{
          text: "Artemis",
          link: '/sample-dapps/artemis'
        },
        {
          text: 'ERC20 Swap',
          link: '/sample-dapps/erc20-swap'
        }]
      }
    ],
  }),
}