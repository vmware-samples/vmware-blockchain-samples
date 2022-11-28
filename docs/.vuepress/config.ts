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
        link: '/other-docs/quick-start-guide',
      },
      // Privacy
      {
        text: 'Privacy',
        link: '/privacy/',
      },
      // Deployment
      {
        text: 'Deployment',
        link: '/deployment/deployment',
      },
      // Permissioning
      {
        text: 'Permissioning',
        link: '/permissioning/permisisoning',
      },
      // Block Explorer
      {
        text: 'Block Explorer',
        link: '/block-explorer/explorer',
      },
      // Sample DApps
      {
        text: 'Sample DApps',
        link: '/README',
        children: [{
          text: "Artemis",
          link: '/sample-dapps/artemis/artemis'
        },
        {
          text: 'ERC20 Swap',
          link: '/sample-dapps/erc20-swap/erc20-swap'
        }]
      }
    ],
  }),
}