pragma solidity ^0.8.4;
import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

contract SupplyChainItem is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    int invocations = 0;

    constructor() ERC721("SupplyChainItem", "ITM") {
        invocations++;
    }

    function newItem(address account) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current() + 10;
        _mint(account, newItemId);

        return newItemId;
    }
}
