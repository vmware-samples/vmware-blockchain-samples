const { assert } = require('chai')

const DigitalArt=artifacts.require('./DigitalArt.sol')

require('chai').use(require('chai-as-promised')).should()

contract('DigitalArt',(accounts)=>{
 let contract

 before(async()=>{
    contract = await DigitalArt.deployed()
 })
    describe('deployment',async() => {
        it('deploys successfully',async()=>{
           
            const address=contract.address

            assert.notEqual(address,'')
            assert.notEqual(address,0x0)
            assert.notEqual(address,null)
            assert.notEqual(address,undefined)

        })
        it('has a name', async ()=> {
            const name=await contract.name()
            assert.equal(name,'DigitalArt')
        })
        it('has a symbol', async ()=> {
            const symbol=await contract.symbol()
            assert.equal(symbol,'ART')
        })

    })
    describe('minting',async()=>{
        it('creates new token',async()=>{
            await contract.mint('Itachi Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/0','Leonardo Da Vinci')
            await contract.mint('Madara Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/1','Micheal Angelo')
            await contract.mint('Shisui Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/2','Raphael')
            await contract.mint('Sasuke Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/3','Donatello')
            const totalSupply=await contract.totalSupply()
            assert.equal(totalSupply,4)
            // const ownr=await contract.ownerOf(0)
           // assert.equal(art.title,'Itachi Uchiha')
            // assert.equal(ownr,'0x20F9b401954fe75c226074dD758E75E1E7e93Aa6')
        })

    })
    // describe('indexing',async ()=>{
    //     it('list art', async () =>{
    //         await contract.mint('Madara Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/1','Micheal Angelo')
    //         await contract.mint('Shisui Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/2','Raphael')
    //         await contract.mint('Sasuke Uchiha','http://my-json-server.typicode.com/abcoathup/samplenft/tokens/3','Donatello')
    //         const totalSupply=await contract.totalSupply()
           

    //         for(var i=1;i<=totalSupply;i++){
    //           const art=await contract.methods.DigitalArtArr(i-1).call()
    //           result.push(art)  
    //         }

    //         console.log(result)
    //     })
    // })
    
    describe('transfer',async()=>{
        it('transHistory',async()=>{

        //    const ownTok= await contract.getOwnerToken(0)

        //     console.log('Owner of Token'+ ownTok)
        })
        it('transfers',async()=>{
            const ownr=await contract.ownerOf(0)
            console.log('ownr1: '+ownr)

            await contract.approveTransfer(ownr,'0xC1E52C93eb8d15f6c1bA84983439aCdee560C68f',0)
            const ownr2=await contract.ownerOf(0)

            console.log('ownr2: '+ownr2)
     
            // assert.equal(newOwn,'0x6aA8d1301e598398Fe59F3B2932e335a5453AF83')
            await contract.transferFrom('0xC1E52C93eb8d15f6c1bA84983439aCdee560C68f','0x0BE41D8b7a4bb696E71C45Ffc249185DA8CDf4F1',0)
            const ownr3=await contract.ownerOf(0)
            console.log('ownr3: '+ownr3)

            const ownTok= await contract.getOwnerToken(0)
            // const ownTok1= await contract.getOwnerToken(1)

            console.log('Owner of Token'+ ownTok)
            // console.log('Owner of Token'+ ownTok1)

        })

    })
})