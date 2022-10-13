// SPDX-License-Identifier: MIT
/**
 * @file Exchange.sol
 * @date created 1st Sept 2022
 * @date last modified 7th Sept 2022
 */

pragma solidity ^0.8.0;

import "./PaymentToken.sol";
import "./SecurityToken.sol";
import "./Factory.sol";

contract Exchange is Factory{

    PaymentToken public pt;
    address private owner;
    uint private tx_number;

    /**
     * @dev map of tx number to tx details
     */
    mapping(uint=>tx_details) private deadlines;
    mapping(string=>address) private stAddress;

    /**
     * @dev Structure of tx details
     */
    struct tx_details {
        SecurityToken st;
        address market_maker;
        address treasury;
        uint bonds;
        uint deadline;
        bool isPresent;
    }

    constructor (string memory _pt_name, string memory _pt_symbol) {
        deployNewPT(_pt_name, _pt_symbol);
        owner = msg.sender;
        tx_number = 0;
    }

    /**
     * @dev Throws error if called by any account other than the owner.
     */
    modifier onlyOwner() {
        require(owner == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    event approvalRequired(uint tx_number, address from, address to, uint amount);

    /**
     * @dev deploys Payment Token.
     * called in constructor, private function.
     */
    function deployNewPT (string memory _name, string memory _symbol) private returns (address){
        pt = new PaymentToken(_name, _symbol, 0);
        return address(pt);
    }

    /**
     * @dev Mints new PT and transfer to the Market Maker
     * Only be called by the owner
     */
    function mintAndTransferPT(uint256 amount, address marketMaker) public onlyOwner{
        pt.mintAndTransfer(amount, marketMaker);
    }

    /**
     * @dev Mint new ST (bond series) and transfer it to Treasury
     * Only be called by the owner
     */
    function mintAndTransferST(string memory isin, address recipient, uint8 interest_rate, uint8 cost_in_pt, uint maturity_date, uint256 bond_amount) public onlyOwner{
        SecurityToken st = SecurityToken(deployNewST(address(this), isin, interest_rate, cost_in_pt, maturity_date,bond_amount));
        st.transfer(recipient, bond_amount);
        stAddress[isin]= address(st);
    }

    /**
     * @dev Function to swap tokens, emits paynment approval events. Creates the tx details and add it to "deadlines" map
     * returns the tx_number
     */
    function swapTokens(address market_maker, address treasury, string memory isin, uint bonds) external onlyOwner returns (uint){
        require(st_map[isin].isPresent == true, "ISIN not present");
        SecurityToken st = SecurityToken(st_map[isin].st);
        tx_number = tx_number + 1;
        deadlines[tx_number].isPresent = true;
        deadlines[tx_number].st = st;
        deadlines[tx_number].market_maker = market_maker;
        deadlines[tx_number].treasury = treasury;
        deadlines[tx_number].bonds = bonds;
        deadlines[tx_number].deadline = block.timestamp + 1 minutes;
        emit approvalRequired(tx_number, market_maker, address(this), st.totalCost(bonds));
        emit approvalRequired(tx_number, treasury, address(this), bonds);
        return tx_number;
    }

    /**
     * @dev Function to transfer tokens from MM to Treasury and vice versa, accepts the "tx_number" as input
     * Atomic fucntion
     * checks for dealine exceeded and tx_number validity
     */
    function _swapTokens(uint _tx_number) public onlyOwner {
        require(deadlines[_tx_number].isPresent == true, "Transaction not present");
        require(deadlines[_tx_number].deadline >= block.timestamp, "deadline exeeced to approve the tx");

        address market_maker = deadlines[_tx_number].market_maker;
        address treasury = deadlines[_tx_number].treasury;
        uint bonds = deadlines[_tx_number].bonds;
        SecurityToken st = deadlines[_tx_number].st;

        require(
            pt.allowance(market_maker, address(this)) >= st.totalCost(bonds),
            "PT allowance too low"
        );
        require(
            st.allowance(treasury, address(this)) >= bonds,
            "ST allowance too low"
        );

        pt.transferFrom(market_maker, treasury, st.totalCost(bonds));
        st.transferFrom(treasury, market_maker, bonds);
    }

    /**
     * @dev Function to get PT balance for an account
     */
    function get_balance_pt(address account) public view onlyOwner returns (uint256) {
        return pt.balanceOf(account);
    }

    /**
     * @dev Function to get ST balance for an account and ISIN value
     */
    function get_balance_st(address account, string memory isin) public view onlyOwner returns (uint256) {
        require(st_map[isin].isPresent == true, "ISIN not present");
        return st_map[isin].st.balanceOf(account);
    }

    /**
     * @dev Function to get ST address based on ISIN value
     */
    function getStAddress(string memory isin) public view onlyOwner returns (address) {
        require(st_map[isin].isPresent == true, "ISIN not present");
        return stAddress[isin];
    }

    /**
     * @dev Function to get PT address
     */
    function getPtAddress() public view onlyOwner returns (address) {
        return address(pt);
    }
}