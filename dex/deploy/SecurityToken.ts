/* eslint-disable import/no-anonymous-default-export */
export default async (
  {getNamedAccounts, deployments, getChainId}: {getNamedAccounts: any, deployments: any, getChainId: any}) => {
  const {deploy} = deployments;
  const {deployer, owner}  = await getNamedAccounts();


  await deploy('SecurityToken', {
    from: 'c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3',
    args: ["GenericSecurityToken", "GST", 1000000],
  });
};
