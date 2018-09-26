
var fueledCoin = artifacts.require("./Token.sol");
var tokenSale = artifacts.require("./TokenSale.sol");
var BN = web3.BigNumber;

module.exports = function(deployer) {
    deployer.deploy(fueledCoin, new BN(100e18)).then(function() {
        var goal = 20e16;
        var cap = 30e16;
        var tokenPrice = 100; // 0.01 ETH
      return deployer.deploy(tokenSale, fueledCoin.address, goal, cap, tokenPrice);
    });
  };