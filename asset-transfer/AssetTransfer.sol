pragma solidity ^0.5.0;

contract AssetTransfer {
  mapping (bytes32 => uint8) public nameToAssets;
  bytes32[] nameList;
  address sender;

  /*
  ** Initializes the name list; number of assets for each person is by default 0 
  */
  constructor (bytes32[] memory _nameList) public {
    nameList = _nameList;
    sender = msg.sender;
  }

  /*
  ** Tranfer an asset 'from' one person 'to' another person
  */
  function transferAsset(bytes32 from, bytes32 to) public {
    require(validName(from) && validName(to));
    require(validToSell(from));
  
    nameToAssets[from] -= 1;
    nameToAssets[to] += 1;
  }

  /*
  ** Add an asset for 'who'
  */
  function buyAsset(bytes32 who) public {
    require(validName(who));
  
    nameToAssets[who] += 1;
  }

  /*
  ** Remove an asset for 'who'
  */
  function useAsset(bytes32 who) public {
    require(validName(who));
    require(validToSell(who));

    nameToAssets[who] -= 1;
  }

  /*
  ** Return number of assets with 'who'
  */
  function getNumberOfAssets(bytes32 who) view public returns (uint8) { 
    require(validName(who));
    return nameToAssets[who];
  }

  /*
  ** Add a person 'who' in the name list
  */
  function addName(bytes32 who) public {
    require(!validName(who));
    nameList.push(who);
  }
  
  /*
  ** Remove a person 'who' from the name list
  */
  function removeName(bytes32 who) public {
    bool found = false;
    for(uint i = 0; i < nameList.length; ++i) {
      if(nameList[i] == who) {
        nameList[i] = nameList[nameList.length - 1];
        delete nameList[nameList.length-1];
        --nameList.length;
        found = true;
        return;
      }
    }
    require(found != false);
  }

  /*
  ** Verify if 'who' is a valid name
  */
  function validName(bytes32 who) view public returns (bool) {
    for(uint i = 0; i < nameList.length; ++i) {
      if(nameList[i] == who) {
        return true;
      }
    }
    return false;
  }

  /*
  ** Verify if 'who' is valid to sell (at least has one asset)
  */
  function validToSell(bytes32 who) view public returns (bool) {
    if(nameToAssets[who] > 0) {
      return true;
    }
    return false;
  }

  function getSender() view public returns (address) {
    return sender;
  }
}

