pragma solidity ^0.8.4;
import "openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Counters.sol";

contract SupplyChainItem is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    int invocations = 0;
    mapping(address => bool) private perm;

    constructor() ERC721("SupplyChainItem", "ITM") {
        invocations++;
    }

    function newItem(address account) public returns (uint256) {
        // check if sender has permissions to use smart contract
        require(perm[msg.sender]);

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current() + 10;
        _mint(account, newItemId);

        return newItemId;
    }

    function addPerm(address account) public {
        perm[account] = true;
    }

    function delPerm(address account) public {
        perm[account] = false;
    }

    /**
     * @dev See {IERC721-transferFrom}.
     */
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        // check if from and to addresses have permissions to use smart contract
        require(perm[from]);
        require(perm[to]);

        super.transferFrom(from, to, tokenId);
    }

    /**
     * @dev See {IERC721-balanceOf}.
     */
    function balanceOf(address owner) public view virtual override returns (uint256) {
        // check if sender has permissions to use smart contract
        require(perm[owner]);

        return super.balanceOf(owner);
    }
}
