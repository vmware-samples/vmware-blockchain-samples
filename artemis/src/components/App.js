import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import DigitalArt from '../abis/DigitalArt.json'
import Card from './Card'
import Navbar from './Navbar'
import Popup from './Popup'
import Button from '@material-ui/core/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

class App extends Component {
 
  async componentDidMount(){
    await this.loadWeb3()
    await this.loadBlockchain()
  }
  async loadWeb3(){
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
      window.ethereum.on('accountsChanged', function (accounts) {
        window.location.reload();
      })
    }
    else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else{
      window.alert('Non-Ethereum browser detected. Use MetaMask!')
    }
  }

  //Mint function call mint in smart contract then loads then calls loadNewValues to display new token
  mint=(title,image,artist)=> {

    this.state.contract.methods.mint(title,image,artist).send({from: this.state.account}).once('receipt',(receipt)=>{
      this.loadNewValues()
    })
  }
  //Trnasfer function call approveTransfe in smart contract then reloads page
  transfer=(to)=>{
    const currOwner=this.state.account
    const tokenId=this.state.currentToken
    this.state.contract.methods.approveTransfer(currOwner,to,tokenId).send({from: this.state.account}).once('receipt',(receipt)=>{
      this.setState({clickPop:false})
      window.location.reload();

  })

  }


  // Sets latest token and token owner
  async loadNewValues(){
    const web3= window.web3
    const netId = await web3.eth.net.getId()
    const netData = DigitalArt.networks[netId]

      const abi = DigitalArt.abi
      const address = netData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })

    
        const art=await contract.methods.DigitalArtArr(totalSupply-1).call()

        this.setState({
          digitalArts:[...this.state.digitalArts, art]
        })
    
          const ownTok=await contract.methods.getOwnerToken(totalSupply-1).call()
          this.setState({
            ownerToken:[...this.state.ownerToken, ownTok]
            
          })
     //console.log(this.state.digitalArts)    
  }

  //Load all tokens created
  async loadBlockchain(){
    const web3= window.web3
    const accounts=await web3.eth.getAccounts()
    this.setState({account: accounts[0]})

    const netId = await web3.eth.net.getId()
    const netData = DigitalArt.networks[netId]
    if(netData) {
      const abi = DigitalArt.abi
      const address = netData.address
      const contract = new web3.eth.Contract(abi, address)
      this.setState({ contract })
      const totalSupply = await contract.methods.totalSupply().call()
      this.setState({ totalSupply })
      //Loading Art
      for(var i=1;i<=totalSupply;i++){
        const art=await contract.methods.DigitalArtArr(i-1).call()
        console.log(art)
        this.setState({
          digitalArts:[...this.state.digitalArts, art]
          
        })
      }
      for(var i=1;i<=totalSupply;i++){
        const ownTok=await contract.methods.getOwnerToken(i-1).call()
        this.setState({
          ownerToken:[...this.state.ownerToken, ownTok]
          
        })
      }
      console.log(this.state.ownerToken)
    } else {
      window.alert('Smart contract not deployed to detected network.')
    }

  }
  constructor(props) {
    super(props);
    // Don't call this.setState() here!
    this.state = {clickPop:false,account: '' ,contract: null,totalSupply: 0, digitalArts:[],ownerToken:[],currentToken:'',currentStateOwner:[],};

    this.clickedPop = this.clickedPop.bind(this);
  }

  //Changes state to display transaction history popup
  clickedPop(e,data){    
    this.setState({clickPop:true, currentToken:data,currentStateOwner:this.state.ownerToken[data]});
    console.log(e,data)
  }
  //Implented backbutton in transaction history popup
  backButton = () => {
    this.setState({clickPop:false})
  }

  
  render() {
    return (
      <div style={{backgroundColor: "#fff"}}> 
        <div className="App" >
          <Navbar
        
          currentUser={this.state.account}
          />
        </div>
        <div className="container-fluid mt-5" >
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              {/* Displaying mint form and calling mint onSubmit */}
              <div className="min">
                <h4> Mint New Digital Art</h4>
                <form onSubmit={(event)=>{
                  event.preventDefault()
                  const title= this.state.title.value
                  const image= this.state.image.value
                  const artist= this.state.artist.value

                  this.mint(title,image,artist)
                }}>
                <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='Title'
                    ref={(input) => { this.state.title= input }}
                    
                  />
                <input
                    type='text'
                    className='form-control mb-2'
                    placeholder='Image URL'
                    ref={(input) => { this.state.image= input }}
                    
                  />
                <input
                    type='text'
                    className='form-control mb-2'
                    placeholder='Artist Name'
                    ref={(input) => { this.state.artist= input }} 
                  />
                  <input
                    type='submit'
                    value='Mint'
                    className='button'
                  />
                </form>
              </div>
            </main>
          </div>
          <div className='App' style={{backgroundColor: "#000"}}>
  
          </div>
          <hr/>
          {/* Populates card items with token values */}
          <div className="marg" >
            {this.state.digitalArts.map((art,key) =>{
              return (<div key={key} className="col-md-3 mb-3">

                <Card
                  title = {art.title}
                  imageUrl = {art.image}
                  artist = {art.artistName}
               />
              
            <button className="card-btn" onClick={((e) => this.clickedPop(e, art.tokId))}>Transfer</button>

              </div> )              
            })}
              {/* Displays popup  */}
              <Popup trigger={this.state.clickPop} setTrigger={this.state.clickPop}>
                <h3 className="transHeader">Transaction History</h3>
                <Button className="back-btn" startIcon={<ArrowBackIcon />}onClick={this.backButton}>Back</Button>

                {this.state.currentStateOwner.map((item, index) => <li className='spacing' key={index}>{item}</li>)}                      
                    
                <form onSubmit={(event)=>{
                  event.preventDefault()
                  const to= this.state.to.value
                  this.transfer(to)
                  }}>
                  <input
                    type='text'
                    className='form-control mb-2'
                    placeholder='Transfer Address'
                    ref={(input) => { this.state.to= input }} 
                  />
                  <input
                    type='submit'
                    value='Send'
                    className='sendButton'
                  />
                </form>
              </Popup>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
