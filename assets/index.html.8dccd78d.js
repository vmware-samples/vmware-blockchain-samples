import{_ as l,r as i,o,c,a as s,b as n,d as a,w as p,e}from"./app.be9fb1bc.js";const d="/vmware-blockchain-samples/assets/PrivacyAppK8s.7bb3bfdb.svg",u={},v=e('<h1 id="introduction" tabindex="-1"><a class="header-anchor" href="#introduction" aria-hidden="true">#</a> Introduction</h1><p>The privacy of digital asset custody is a critical requirement for enterprises as they consider moving to blockchains. This gets exacerbated with Central Bank Digital Currencies where governments want to balance accountability with privacy in order to prevent money laundering or tax fraud. VMware Blockchain now provides a solution to this problem. Any ERC20 smart contract can be extended to convert the public tokens to private tokens. These private tokens can be transacted privately, subject to a limit set by the administrator. None, not even the administrator, can see the details of the private transaction, including the source, target or the amount transacted. The platform uses Zero Knowledge Proofs to guarantee that the transaction is valid and ensures that there is no double spending. The privacy solution is currently in Tech Preview - the APIs may change in the future.</p><h1 id="architecture" tabindex="-1"><a class="header-anchor" href="#architecture" aria-hidden="true">#</a> Architecture</h1><h2 id="kubernetes-deployment-overview" tabindex="-1"><a class="header-anchor" href="#kubernetes-deployment-overview" aria-hidden="true">#</a> Kubernetes deployment overview</h2><p><img src="'+d+'" alt="Privacy Depiction"></p><p>The sample application consists of the following components:</p><ul><li><p>Sample Privacy Wallet Application Each user in the system must own a Privacy Wallet to manage their secrets. In order to send private transactions securely, the wallet needs to have an extra secret (besides the Ethereum private key). The wallet communicates with the Privacy Client Library to generate private transaction payloads. It sends transactions to the EthRpc client over JSON RPC.</p></li><li><p>Admin Application The privacy contract administrator deploys the Public Token and the Private Token contracts. It uses the Privacy Client Library to generate the inputs to the Private Token constructor, and calls both constructors. It sends transactions to the EthRpc client over JSON RPC. The Admin Application is also used to set the limits (or budgets) on the amount of tokens that can be transacted privately per user.</p></li><li><p>Smart Contracts As part of the &quot;deploy&quot; command, the admin application deploys two smart contracts - Public Token and Private Token. The Public Token is a standard ERC20 token, with three required modifications. The address of the Private Token is a parameter of the constructor. In addition, it has two additional functions - convertPublicToPrivate and convertPrivateToPublic. The former converts the specified number of ERC20 Public Token to Private Tokens (which can now be transacted privately). The latter converts Private Tokens back to a Public Tokens. The Private Token provides interfaces to Mint and Burn private tokens, and to Transfer tokens privately to another user. It calls cryptographic functions implemented in the platform via EVM pre-compiled contracts.</p></li></ul><h2 id="how-to-deploy-privacy-application" tabindex="-1"><a class="header-anchor" href="#how-to-deploy-privacy-application" aria-hidden="true">#</a> How to deploy privacy application</h2><p>Deployment leverages the helm charts provided with the development kit for privacy application.</p><h3 id="prerequisite" tabindex="-1"><a class="header-anchor" href="#prerequisite" aria-hidden="true">#</a> Prerequisite</h3>',10),m=e(`<h3 id="limitations" tabindex="-1"><a class="header-anchor" href="#limitations" aria-hidden="true">#</a> Limitations</h3><ul><li><p>The privacy capabilities are not currently supported with permission enabled blockchain. VMware Blockchain must be deployed with read and write permissions disabled before trying out privacy.</p></li><li><p>This release supports the following sample application wallets:</p><ul><li>single administrator wallet and CLI console application.</li><li>supports pre-configured set of three user wallets and corresponding CLI console application.</li></ul></li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>user-1 user-2 user-3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>The sample privacy wallets are <em><strong>NOT persistent</strong></em> hence not crash resilient. In event of restarts users should redeploy another instance of privacy application and configure restarted wallet application to leverage the new instance.</li></ul><h3 id="determine-the-required-settings-for-helm-chart-installation" tabindex="-1"><a class="header-anchor" href="#determine-the-required-settings-for-helm-chart-installation" aria-hidden="true">#</a> Determine the required settings for helm chart installation</h3>`,5),b={href:"https://github.com/vmware-samples/vmware-blockchain-samples/tree/master/vmbc-ethereum/privacy/sample-dapps/private-token-transfer/helm",target:"_blank",rel:"noopener noreferrer"},k={href:"https://github.com/vmware-samples/vmware-blockchain-samples/blob/master/vmbc-ethereum/privacy/sample-dapps/private-token-transfer/helm/values.yaml",target:"_blank",rel:"noopener noreferrer"},h=e(`<h4 id="image-blockchain-location-settings" tabindex="-1"><a class="header-anchor" href="#image-blockchain-location-settings" aria-hidden="true">#</a> Image, Blockchain location settings</h4><table><thead><tr><th>Name</th><th>Description</th><th>Value</th><th>Type</th></tr></thead><tbody><tr><td>blockchainUrl</td><td>URL for ETH-RPC service. Determined from the VMBC deployments exposed service.</td><td><code>blockchainUrl=&quot;http://192.168.59.102:32223&quot;</code></td><td>Mandatory</td></tr><tr><td>global.imageCredentials.registry</td><td>Container registry for image downloads</td><td>&quot;&quot;</td><td>Mandatory</td></tr><tr><td>global.imageCredentials.username</td><td>Username to access/download for registry</td><td>&quot;&quot;</td><td>Mandatory</td></tr><tr><td>global.imageCredentials.password</td><td>Password to access/download for registry</td><td>&quot;&quot;</td><td>Mandatory</td></tr><tr><td>global.storageClassName</td><td>Storage class settings for persistent storage</td><td>default: &quot;standard&quot;</td><td>Optional</td></tr></tbody></table><p>The ethRPC service port and their liveness could be determined as following:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>demo<span class="token operator">&gt;</span>kubectl get pods
NAME                                                     READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-8c4c88c45-5rqmj   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s
vmbc-deployment-client-0-ethrpc-8d9b6c67-99sgs           <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s
vmbc-deployment-replica-0-concord-64f6f8fd66-tllf9       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s
vmbc-deployment-replica-1-concord-654d8f998d-65d8w       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s
vmbc-deployment-replica-2-concord-6bdd5bcc74-nw47d       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s
vmbc-deployment-replica-3-concord-6994dd8677-mg6gg       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          95s

demo<span class="token operator">&gt;</span>minikube <span class="token function">service</span> list
<span class="token operator">|</span>-------------<span class="token operator">|</span>-----------------<span class="token operator">|</span>--------------<span class="token operator">|</span>-----------------------------<span class="token operator">|</span>
<span class="token operator">|</span>  NAMESPACE  <span class="token operator">|</span>      NAME       <span class="token operator">|</span> TARGET PORT  <span class="token operator">|</span>             URL             <span class="token operator">|</span>
<span class="token operator">|</span>-------------<span class="token operator">|</span>-----------------<span class="token operator">|</span>--------------<span class="token operator">|</span>-----------------------------<span class="token operator">|</span>
<span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span>.<span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span>
<span class="token operator">|</span> default     <span class="token operator">|</span> client-0-ethrpc <span class="token operator">|</span> <span class="token number">8545</span>/8545    <span class="token operator">|</span> http://192.168.59.102:32223 <span class="token operator">|</span>
<span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span>.<span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span><span class="token punctuation">..</span><span class="token punctuation">..</span><span class="token operator">|</span>
demo<span class="token operator">&gt;</span> <span class="token function">nc</span> <span class="token parameter variable">-v</span> <span class="token number">192.168</span>.59.102 <span class="token number">32223</span>
Connection to <span class="token number">192.168</span>.59.102 <span class="token number">32223</span> port <span class="token punctuation">[</span>tcp/*<span class="token punctuation">]</span> succeeded<span class="token operator">!</span>
 
Verify a ETHRPC API:
<span class="token function">curl</span> <span class="token parameter variable">-X</span> POST <span class="token parameter variable">--data</span> <span class="token string">&#39;{&quot;jsonrpc&quot;:&quot;2.0&quot;,&quot;method&quot;:&quot;eth_gasPrice&quot;,&quot;id&quot;:1}&#39;</span> <span class="token parameter variable">--header</span> <span class="token string">&quot;Content-Type: application/json&quot;</span> http://192.168.59.102:32223
<span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span>:1,<span class="token string">&quot;jsonrpc&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;2.0&quot;</span>,<span class="token string">&quot;method&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;eth_gasPrice&quot;</span>,<span class="token string">&quot;result&quot;</span><span class="token builtin class-name">:</span><span class="token string">&quot;0x0&quot;</span><span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="container-resource-settings" tabindex="-1"><a class="header-anchor" href="#container-resource-settings" aria-hidden="true">#</a> Container resource settings</h4><p>There are default settings tuned for current consumption. You can scale up values if required.</p><p>Resource names (Refer to values.yaml):</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>walletapp, walletcli, admin, admincli.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div>`,8),g={href:"https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/",target:"_blank",rel:"noopener noreferrer"},f=e(`<table><thead><tr><th>Name</th><th>Description</th><th>Example</th></tr></thead><tbody><tr><td>cpuLimit</td><td>max cpu limit</td><td>800m</td></tr><tr><td>cpuRequest</td><td>requested cpu</td><td>700m</td></tr><tr><td>memoryLimit</td><td>max memory limit</td><td>500Mi</td></tr><tr><td>memoryRequest</td><td>requested memory</td><td>400Mi</td></tr></tbody></table><p>Eg.,</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> <span class="token parameter variable">--set</span> <span class="token assign-left variable">resources.walletapp.cpuLimit</span><span class="token operator">=</span>900m <span class="token parameter variable">--set</span> <span class="token assign-left variable">resources.walletapp.memoryLimit</span><span class="token operator">=</span>550Mi
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="helm-chart-installation" tabindex="-1"><a class="header-anchor" href="#helm-chart-installation" aria-hidden="true">#</a> helm chart installation</h4><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>helm <span class="token function">install</span> <span class="token parameter variable">--set</span> <span class="token assign-left variable">global.imageCredentials.registry</span><span class="token operator">=</span><span class="token operator">&lt;</span>registry address<span class="token operator">&gt;</span> <span class="token parameter variable">--set</span> <span class="token assign-left variable">global.imageCredentials.username</span><span class="token operator">=</span><span class="token operator">&lt;</span>username<span class="token operator">&gt;</span> <span class="token parameter variable">--set</span> <span class="token assign-left variable">global.imageCredentials.password</span><span class="token operator">=</span><span class="token operator">&lt;</span>password<span class="token operator">&gt;</span> <span class="token parameter variable">--set</span> <span class="token assign-left variable">blockchainUrl</span><span class="token operator">=</span><span class="token operator">&lt;</span>blockchain Eth RPC URL<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>name of privacy app deployment<span class="token operator">&gt;</span> <span class="token builtin class-name">.</span>

<span class="token comment"># For this sample deployment blockchainUrl=http://192.168.59.102:32223</span>

kubectl get pods
NAME                                                     READY   STATUS    RESTARTS   AGE
vmbc-deployment-client-0-clientservice-8c4c88c45-gsdzt   <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
vmbc-deployment-client-0-ethrpc-8d9b6c67-bw8h6           <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
vmbc-deployment-privacy-admin-7fd48bdc8f-zhcwz           <span class="token number">2</span>/2     Running   <span class="token number">0</span>          73s
vmbc-deployment-privacy-wallet-0                         <span class="token number">2</span>/2     Running   <span class="token number">0</span>          73s
vmbc-deployment-privacy-wallet-1                         <span class="token number">2</span>/2     Running   <span class="token number">0</span>          68s
vmbc-deployment-privacy-wallet-2                         <span class="token number">2</span>/2     Running   <span class="token number">0</span>          62s
vmbc-deployment-replica-0-concord-64f6f8fd66-l8hdf       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
vmbc-deployment-replica-1-concord-654d8f998d-wmtqr       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
vmbc-deployment-replica-2-concord-6bdd5bcc74-blc52       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
vmbc-deployment-replica-3-concord-6994dd8677-rdqct       <span class="token number">1</span>/1     Running   <span class="token number">0</span>          7m19s
 
helm list
NAME                        	NAMESPACE	REVISION	UPDATED                                	STATUS  	CHART                                   	APP VERSION
vmbc-privacy-app-deployment 	default  	<span class="token number">1</span>       	***UTC	deployed	vmbc-privacy-wallet-app-deployment-0.1.0	<span class="token number">1.16</span>.0
vmbc-privacy-test-deployment	default  	<span class="token number">1</span>       	***UTC	deployed	vmbc-0.1.0                              	<span class="token number">1.16</span>.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>To enumerate container image version running on the pods</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl get pods --all-namespaces <span class="token parameter variable">-o</span> <span class="token assign-left variable">jsonpath</span><span class="token operator">=</span><span class="token string">&quot;{..image}&quot;</span> <span class="token operator">|</span><span class="token punctuation">\\</span>
<span class="token function">tr</span> <span class="token parameter variable">-s</span> <span class="token string">&#39;[[:space:]]&#39;</span> <span class="token string">&#39;\\n&#39;</span> <span class="token operator">|</span><span class="token punctuation">\\</span>
<span class="token function">sort</span> <span class="token operator">|</span><span class="token punctuation">\\</span>
<span class="token function">uniq</span> <span class="token parameter variable">-c</span>
    <span class="token number">2</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/clientservice:0.0.0.0.7849
      <span class="token number">8</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/concord-core:0.0.0.0.7849
      <span class="token number">2</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/ethrpc:0.0.0.0.7849
      <span class="token number">2</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/privacy-admin-app:0.0.0.0.7849
      <span class="token number">2</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/privacy-admin-cli:0.0.0.0.7849
      <span class="token number">6</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/privacy-wallet-app:0.0.0.0.7849
      <span class="token number">6</span> blockchain-docker-internal.artifactory.eng.vmware.com/vmwblockchain/privacy-wallet-cli:0.0.0.0.7849
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="privacy-application-demonstration" tabindex="-1"><a class="header-anchor" href="#privacy-application-demonstration" aria-hidden="true">#</a> Privacy application demonstration</h2><p>The following operations are demonstrated by the privacy application:</p><p>Client Administrator application:</p><ul><li>Deploys the privacy application</li><li>Creates privacy budgets for users</li></ul><p>Client Wallet application:</p><ul><li>Configures and registers the user wallet.</li><li>Converts public funds to private funds for anonymous transfer.</li><li>Performs private anonymous transaction to another registered user.</li><li>Performs public transaction to another registered user.</li><li>Converts private funds to public funds.</li></ul><p>The demonstration client wallet applications have canned private keys and initial public balances.</p><h3 id="administrator-workflow" tabindex="-1"><a class="header-anchor" href="#administrator-workflow" aria-hidden="true">#</a> Administrator workflow</h3><p>Administrator application CLI samples to deploy the privacy application and create privacy budgets for all users:</p><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code>kubectl attach vmbc-deployment-privacy-admin-7fd48bdc8f-zhcwz <span class="token parameter variable">-c</span> privacy-admin-cli <span class="token parameter variable">-i</span> <span class="token parameter variable">-t</span>

If you don<span class="token string">&#39;t see a command prompt, try pressing enter.
You must first deploy the privacy application. Use the &#39;</span>deploy<span class="token string">&#39; command.
Enter command (type &#39;</span>h<span class="token string">&#39; for commands &#39;</span>Ctr-D&#39; to quit<span class="token punctuation">)</span>:
 <span class="token operator">&gt;</span> h
Commands:
deploy -- generates a privacy config and deploys the privacy and token contracts.
create-budget <span class="token operator">&lt;</span>user-id<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>amount<span class="token operator">&gt;</span> -- requests creation of a privacy budget <span class="token keyword">for</span> a user.

<span class="token operator">&gt;</span> deploy
Deploying a new privacy application<span class="token punctuation">..</span>.

Successfully deployed privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

You are now ready to configure wallets.

 <span class="token operator">&gt;</span> create-budget user-1 <span class="token number">1000</span>
Budget request <span class="token keyword">for</span> user: user-1 value: <span class="token number">1000</span> was sent to the privacy app
response: ok

 <span class="token operator">&gt;</span> create-budget user-2 <span class="token number">1000</span>
Budget request <span class="token keyword">for</span> user: user-2 value: <span class="token number">1000</span> was sent to the privacy app
response: ok

 <span class="token operator">&gt;</span> create-budget user-3 <span class="token number">1000</span>
Budget request <span class="token keyword">for</span> user: user-3 value: <span class="token number">1000</span> was sent to the privacy app
response: ok
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="wallet-application-cli-workflow-samples" tabindex="-1"><a class="header-anchor" href="#wallet-application-cli-workflow-samples" aria-hidden="true">#</a> Wallet application CLI workflow samples:</h3><ul><li>Wallet converts privacy funds from public funds. These private tokens are then leveraged for anonymous transfers.</li><li>Transfers private funds anonymously between users</li><li>Transfers public funds between users</li><li>Converts privacy funds back to public funds</li></ul><h4 id="user-1-user-2-samples" tabindex="-1"><a class="header-anchor" href="#user-1-user-2-samples" aria-hidden="true">#</a> User-1 &lt;==&gt; User-2 Samples:</h4><p>The samples demonstrates transfers and other works flow between user-1/user-2 wallets. Attaching to wallet CLI, configuring and registering are similar for all users.</p><ul><li>Attaches to wallet user-1 CLI</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> kubectl attach vmbc-deployment-privacy-wallet-0 <span class="token parameter variable">-c</span> privacy-wallet-cli <span class="token parameter variable">-i</span> <span class="token parameter variable">-t</span>
If you don<span class="token string">&#39;t see a command prompt, try pressing enter.

You must first configure the wallet. Use the &#39;</span>config<span class="token string">&#39; command.

Enter command (type &#39;</span>h<span class="token string">&#39; for commands &#39;</span>Ctr-D&#39; to quit<span class="token punctuation">)</span>:
 <span class="token operator">&gt;</span> h
Commands:
config                    -- configures wallets with the privacy application.
show                      -- prints information about the user managed by this wallet.
register <span class="token operator">&lt;</span>user-id<span class="token operator">&gt;</span>        -- requests user registration required <span class="token keyword">for</span> spending coins.
convertPublicToPrivate <span class="token operator">&lt;</span>amount<span class="token operator">&gt;</span>             -- converts the specified amount of public funds to private funds.
transfer <span class="token operator">&lt;</span>amount<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>to-user-id<span class="token operator">&gt;</span> -- transfers the specified amount between users.
public-transfer <span class="token operator">&lt;</span>amount<span class="token operator">&gt;</span> <span class="token operator">&lt;</span>to-user-id<span class="token operator">&gt;</span> -- transfers the specified amount of public funds between users.
convertPrivateToPublic <span class="token operator">&lt;</span>amount<span class="token operator">&gt;</span>             -- converts the specified amount of private funds to public funds.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Configures the wallet and registers the users with privacy application.</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code> <span class="token operator">&gt;</span> config

Successfully configured privacy application
---------------------------------------------------
Privacy contract: 0x44f95010BA6441E9C50c4f790542A44A2CDC1281
Token contract: 0x3d8b57c2D58BB8c8E36626B05fF03381734EAD43

 <span class="token operator">&gt;</span> register
Successfully registered user.

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">0</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">10000</span>
Private balance: <span class="token number">0</span>
Privacy budget: <span class="token number">1000</span>
Last executed tx number: <span class="token number">0</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Creates 250 private funds from public funds.</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> convertPublicToPrivate <span class="token number">250</span>
Successfully sent mint tx. Last added tx number:1
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">1</span><span class="token punctuation">)</span>

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">1</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">9750</span>
Private balance: <span class="token number">250</span> <span class="token operator">==</span><span class="token operator">=</span><span class="token operator">&gt;</span> converted private funds
Privacy budget: <span class="token number">1000</span>
Last executed tx number: <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Transfers private funds to user-2.</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> transfer <span class="token number">50</span> user-2
Processing an anonymous transfer of <span class="token number">50</span> to user-2<span class="token punctuation">..</span>.
Successfully sent transfer tx. Last added tx number:2
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">2</span><span class="token punctuation">)</span>
Anonymous transfer done.

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">2</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">9750</span>
Private balance: <span class="token number">200</span>
Privacy budget: <span class="token number">950</span>
Last executed tx number: <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>Meanwhile user-2 does private fund conversion and notices new transfer of 50 tokens. user-2 then transfers 100 private tokens to user-1.</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">==</span> user-2 <span class="token operator">==</span>
<span class="token operator">&gt;</span> convertPublicToPrivate <span class="token number">100</span>
Successfully sent mint tx. Last added tx number:3
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">3</span><span class="token punctuation">)</span>

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">3</span><span class="token punctuation">)</span>
--------- user-2 ---------
Public balance: <span class="token number">9900</span>
Private balance: <span class="token number">150</span> <span class="token operator">==</span><span class="token operator">==</span><span class="token operator">&gt;</span> Received <span class="token number">50</span> private tokens<span class="token operator">!</span>
Privacy budget: <span class="token number">1000</span>
Last executed tx number: <span class="token number">3</span>

  <span class="token operator">&gt;</span> transfer <span class="token number">100</span> user-1
Processing an anonymous transfer of <span class="token number">100</span> to user-1<span class="token punctuation">..</span>.
Successfully sent transfer tx. Last added tx number:4
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">4</span><span class="token punctuation">)</span>
Anonymous transfer done.

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">4</span><span class="token punctuation">)</span>
--------- user-2 ---------
Public balance: <span class="token number">9900</span>
Private balance: <span class="token number">50</span>
Privacy budget: <span class="token number">900</span>
Last executed tx number: <span class="token number">4</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>User-1 then issues 77 public token transfer to user-2</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">4</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">9750</span>
Private balance: <span class="token number">300</span>  <span class="token operator">==</span><span class="token operator">==</span><span class="token operator">&gt;</span> Received <span class="token number">100</span> private tokens<span class="token operator">!</span>
Privacy budget: <span class="token number">950</span>
Last executed tx number: <span class="token number">4</span>

<span class="token operator">&gt;</span> public-transfer <span class="token number">77</span> user-2
Processing public transfer of <span class="token number">77</span> to user-2<span class="token punctuation">..</span>.
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">4</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">9673</span> <span class="token operator">==</span><span class="token operator">=</span><span class="token operator">&gt;</span> debit of <span class="token number">77</span> tokens
Private balance: <span class="token number">300</span>
Privacy budget: <span class="token number">950</span>
Last executed tx number: <span class="token number">4</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>User-2 receives 77 public tokens from user-1</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> show
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">4</span><span class="token punctuation">)</span>
--------- user-2 ---------
Public balance: <span class="token number">9977</span> <span class="token operator">==</span><span class="token operator">&gt;</span> credit of <span class="token number">77</span> public token
Private balance: <span class="token number">50</span>
Privacy budget: <span class="token number">900</span>
Last executed tx number: <span class="token number">4</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>user-1 converts back private funds to public funds.</li></ul><div class="language-bash line-numbers-mode" data-ext="sh"><pre class="language-bash"><code><span class="token operator">&gt;</span> convertPrivateToPublic <span class="token number">300</span>
Processing a burn operation <span class="token keyword">for</span> <span class="token number">300</span><span class="token punctuation">..</span>.
Successfully sent self-transfer tx as part of burn. Last added tx number:5
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">5</span><span class="token punctuation">)</span>
Successfully sent burn tx. Last added tx number:6
Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">6</span><span class="token punctuation">)</span>
Burn operation done.

Synchronizing state<span class="token punctuation">..</span>.
Ok. <span class="token punctuation">(</span>Last known tx number: <span class="token number">6</span><span class="token punctuation">)</span>
--------- user-1 ---------
Public balance: <span class="token number">9973</span>
Private balance: <span class="token number">0</span> <span class="token operator">==</span><span class="token operator">==</span><span class="token operator">=</span><span class="token operator">&gt;</span> All private tokens converted to public
Privacy budget: <span class="token number">950</span>
Last executed tx number: <span class="token number">6</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="limitation-workflow" tabindex="-1"><a class="header-anchor" href="#limitation-workflow" aria-hidden="true">#</a> limitation workflow</h4><p>To workaround for lack of restart capability, perform the following work flow in event you terminate a wallet.</p><ul><li>You could leverage the restarted instances or optionally uninstall (helm uninstall) and redeploy the privacy application using helm.</li><li>Re-deploy (admin deploy) another privacy application instances</li><li>Retry the privacy workflows described above.</li></ul>`,40);function y(w,x){const r=i("RouterLink"),t=i("ExternalLinkIcon");return o(),c("div",null,[v,s("p",null,[n("Deploy kubernetes based leveraging "),a(r,{to:"/vmbc-deployment/vmbc-four-node-one-client-deployment/"},{default:p(()=>[n("helm charts")]),_:1}),n(".")]),m,s("p",null,[n("Helm chart for privacy application deployment is available "),s("a",b,[n("HERE"),a(t)])]),s("p",null,[n("List of available configurations and default values available in "),s("a",k,[n("values.yaml"),a(t)]),n(".")]),h,s("p",null,[n("Users can optionally override default APP resource settings. The parameter units are based on "),s("a",g,[n("kubernetes semantics"),a(t)]),n(".")]),f])}const T=l(u,[["render",y],["__file","index.html.vue"]]);export{T as default};
