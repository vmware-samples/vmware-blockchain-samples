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
        link: '/deployment/',
      },
      // Permissioning
      {
        text: 'Permissioning',
        link: '/permissioning/',
      },
      // Block Explorer
      {
        text: 'Block Explorer',
        link: '/explorer/',
      },
      // Sample DApps
      {
        text: 'Sample DApps',
        link: '/README',
        children: [{
          text: "Artemis",
          link: '/sample-dapps/artemis/'
        },
        {
          text: 'ERC20 Swap',
          link: '/sample-dapps/erc20-swap/'
        }]
      }
    ],
  }),
}