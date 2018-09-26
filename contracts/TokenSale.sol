pragma solidity 0.4.24;

import "./Ownable.sol";
import "./Token.sol";
import "./SafeMath.sol";

contract TokenSale is Ownable {
    using SafeMath for uint256;

    /// @notice Emits when a backer pledges to the project
    /// @param backer The address of the backer
    /// @param amount The number of Wei pledged
    event Pledge(address indexed backer, uint256 amount, uint256 tokens);

    /// @notice Emits when a backer receives a refund
    /// @param backer The address of the refund recipient
    /// @param amount The number of tokens refunded
    event Refund(address indexed backer, uint256 amount);

    /// @notice Emits when a creator withdraws funds
    /// @param creator The address of the project creator
    /// @param amount The number of tokens withdrawn
    event CreatorWithdraw(address indexed creator, uint256 amount);

    // on/off switch for sale
    bool public saleSwitch;

    /// The ERC20 token used for donors of the project
    Token public fueledCoin;

    /// The address of the project's creator
    address public creator;

    /// The minimum number of ETH that must be raised
    uint256 public fundingGoal;

    // The maximum number of ETH allowed to be raised
    uint256 public hardCap;

    // List of donors that made pledges. Very inefficient
    address[] public donors;

    /// Record of pledges that have been made to the project
    mapping(address => uint256) public pledges;

    /// Total number of ETH pledged
    uint256 public totalPledgeAmount;

    // rate of transfer between token and ETH
    uint256 public tokenPrice;

    /// @param _simpleToken Address of ERC20 token used to facilitate the project
    /// @param _fundingGoal Minimum number of tokens required for a successful project
    /// @param _hardCap max number of tokens accepted for the project
    /// @param _price conversion price of token to ETH
    constructor(Token _simpleToken,  uint256 _fundingGoal, uint256 _hardCap,
     uint256 _price) public {

        require(msg.sender != address(0));
        require(_fundingGoal < _hardCap);
        fueledCoin = _simpleToken;
        creator = msg.sender;
        fundingGoal = _fundingGoal;
        hardCap = _hardCap;
        tokenPrice = _price;
        saleSwitch = true;
    }

    /// @dev Require that the modified function is only called by `creator`
    modifier onlyCreator() {
        require(msg.sender == creator);
        _;
    }

    /// @dev Require that the sale is currently `on`
    modifier active() {
        require(saleSwitch == true && totalPledgeAmount < hardCap);
        _;
    }

    /// @dev Require that the modified function occurs after `totalPledgeAmount` exceeds `fundingGoal`
    modifier ended() {
        require(totalPledgeAmount >= fundingGoal && totalPledgeAmount < hardCap);
        _;
    }

    function buyTokens(uint256 _numberOfTokens) public payable active {
        require(_numberOfTokens == msg.value.mul(tokenPrice));
        require(hardCap >= msg.value + totalPledgeAmount);


        if (donors.length == 0) {
            donors.push(msg.sender);
        }
        // very inefficient at scale
        for (uint x = 0;x < donors.length; x++) {
            if (msg.sender == donors[x]){
                break;
            }
            if (x == donors.length - 1) {
                donors.push(msg.sender);
            }
        }
        pledges[msg.sender] += _numberOfTokens;
        totalPledgeAmount += msg.value;

        emit Pledge(msg.sender, msg.value, _numberOfTokens);
    }

    function saleSwitcher() public onlyCreator {
        if (saleSwitch == true) {
            saleSwitch = false;
        } else {
            saleSwitch = true;
        }
    }

    /// @notice Creator function to withdraw funds after a successful project
    function endSale() public ended onlyCreator {

        // transfer all fueledCoins to donors
        for (uint x = 0;x < donors.length;x++) {
            require(fueledCoin.transfer(donors[x], pledges[donors[x]]));
        }
        // transfer the rest to the creator
        require(fueledCoin.transfer(creator, fueledCoin.balanceOf(this)));
        // UPDATE: Let's not destroy the contract here
        // Just transfer the balance to the admin
        uint amount = address(this).balance;
        creator.transfer(amount);
        saleSwitch = false;
        emit CreatorWithdraw(creator, amount);
    }

    /// @notice Refund ETH to sender if they are a valid backer 
    function withdrawRefund() external active {
        require(pledges[msg.sender] > 0);
        uint256 refundAmount;

        refundAmount = pledges[msg.sender]/tokenPrice;
        pledges[msg.sender] = 0;
        totalPledgeAmount -= refundAmount;
        msg.sender.transfer(refundAmount);

    }

    function getSwitch() public view returns(bool) {
        return saleSwitch;
    }

    function getAmountRaised() public view returns(uint256 total) {
        return totalPledgeAmount;
    }

    function getAddressPledge(address _account) public view returns(uint256 balance) {
        return pledges[_account];
    } 

    function balanceOf() public view returns(uint256 balance) {
        return address(this).balance;
    }

    function getDonorList() public view returns (address[] list) {
        return donors;
    }
}
