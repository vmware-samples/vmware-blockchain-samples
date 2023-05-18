// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "./@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./@openzeppelin/contracts/utils/Counters.sol";
import "./userReg.sol";

contract DigitalArt is ERC721,ERC721Enumerable,ERC721URIStorage {

    using Strings for uint256;
    using Counters for Counters.Counter;

    // set NFTs structure
    struct Art {
        string title;
        string image;
        string artistName;
        uint tokId;
    }

    Counters.Counter private _tokenIds;

    mapping(uint256 => string) private _tokenURIs;
    mapping(address => uint256) public ownersMap;
    mapping(uint256 => address[]) public tokensMap;

    Art[] public DigitalArtArr;
    address[] public owners;
    mapping(string=>bool) _DigitalArtExists;

    userReg public userRegInstance;
    bool userRegEnable;
    error UnRegisteredUser (address user);
    address deployedUserRegContractAddress;
    event USRcontractAddress(address useraddr);

    constructor(address userRegContractAddress, bool _userRegEnable) ERC721("DigitalArt","ART") {
        userRegInstance = userReg(userRegContractAddress);
        userRegEnable = _userRegEnable;
        deployedUserRegContractAddress = userRegContractAddress;
    }

    function setUserRegistration(address userRegContractAddress) public {
        userRegInstance = userReg(userRegContractAddress);
    }

    function checkUserRegistration(address userAddress) private view returns (bool) {
        if (userRegEnable == false)
            return true;
        else if (userRegInstance.isUserRegisterAddr(userAddress) == 2)
            return true;
        else 
            return false;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, amount);
    }    
    
    function tokenURI(uint256 tokenId) public view virtual override(ERC721,ERC721URIStorage) returns (string memory) {
        require(_exists(tokenId), "ERC721URIStorage: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();

        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }

        return super.tokenURI(tokenId);
    }

    // calls mint updates tokenMap, Incremnts tokenId, checks if the same title has been previously used
    function mint(string memory title,string memory image,string memory artistName,address addr)public{
         emit USRcontractAddress(deployedUserRegContractAddress);
        
    //   if (userRegEnable && (userRegInstance.isUserRegisterAddr(addr) != 2)) {
    //         revert UnRegisteredUser({
    //             user: addr
    //         });
    //     }
    //}
        address user=0xbc5cAAec4eFe7a9562585dcF4Cb5670084290aDb;
        if (userRegEnable) { 
            //if (userRegInstance.getCurrentUserIndex() > 10) {
                if (userRegInstance.isUserRegisterAddr(user) != 2) {
                    revert UnRegisteredUser({
                        user: addr
                    });
                }
        }

        require(!_DigitalArtExists[title]);
        uint _id=_tokenIds.current();
        DigitalArtArr.push(Art(title,image,artistName,_id));

        _safeMint(msg.sender,_id);

        owners.push(ownerOf(_id));

        tokensMap[_id].push(msg.sender);

        _DigitalArtExists[title] = true;
        _tokenIds.increment();
    }

    //gets list of owners of the token based on tokenId
    function getOwnerToken(uint256 tokenId) public view returns (address[] memory){
        return tokensMap[tokenId];
    }

    // calls safetransfer and maps address to token in tokensMap
    function approveTransfer(address to, uint256 tokenId) public  {
        safeTransferFrom(msg.sender, to, tokenId);
        // Check if you can transfer to yourself
        tokensMap[tokenId].push(to);
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual override {
        require(_exists(tokenId), "ERC721URIStorage: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }

    function _burn(uint256 tokenId) internal virtual override (ERC721, ERC721URIStorage) {
        super._burn(tokenId);
        if (bytes(_tokenURIs[tokenId]).length != 0) {
            delete _tokenURIs[tokenId];
        }
    }

}