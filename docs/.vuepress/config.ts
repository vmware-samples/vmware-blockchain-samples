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
        link: '/other-docs/vmbc-ethereum-overview',
      },
      // Privacy
      {
        text: 'Privacy',
        link: '/privacy/',
      },
      // K8S-Provisioning
      {
        text: 'Provisioning',
        children: [
          {
            text: 'VMBC Ethereum without Logging',
            link: '/helm-provisioning/vmbc-four-node-one-client-deployment'
          },
          {
            text: 'VMBC Ethereum with Logging',
            link: '/helm-provisioning/vmbc-four-node-one-client-deployment-with-logging'
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