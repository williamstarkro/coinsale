var Token = artifacts.require("./Token.sol");
var u = require("./util.js");
var BN = web3.BigNumber;

var ownerBalance = new BN('100e18');
account1Balance = new BN('0');
account2Balance = new BN('0');

contract('Token', function(accounts) {
    let [owner, account1, account2] = accounts;

    it("Test initialization", async function() {

        let token = await Token.new(ownerBalance);
        await u.assertBalance(token, owner, ownerBalance);
        let supply = await token.supply.call();
        assert.equal(supply.toString(), ownerBalance.toString(), "IDK");
    });

    it("Transfer 1 token from owner to account1.", async function() {
        var amount = new BN('1e18');
        let token = await Token.new(ownerBalance);
        ownerBalance = ownerBalance.minus(amount);
        account1Balance = account1Balance.plus(amount);

        await token.transfer(account1, amount, {from: owner});

        await u.assertBalance(token, owner, ownerBalance, "Owner balance not updated after transfer");
        await u.assertBalance(token, account1, account1Balance, "Account1 balance not updated after transfer");

        await token.transfer(owner, amount, {from: account1});
    });

    it("Test approved 2 token transfer from owner to account2 with account1 as intermediary", async function() {
      var amount = new BN(2e18);
      let token = await Token.new(ownerBalance);
      ownerBalance = ownerBalance.minus(amount);
      account2Balance = account2Balance.plus(amount);

      await token.approve(account1, amount, {from: owner});
      let allowance = await token.allowance.call(owner, account1);
      assert.equal(allowance.valueOf(), amount, "Allowance not updated by call to approve");

      await token.transferFrom(owner, account2, amount, {from: account1});
      
      await u.assertBalance(token, owner, ownerBalance, "owner balance not updated after transfer");
      await u.assertBalance(token, account2, account2Balance, "Investor balance not updated after transfer");

      await token.transfer(owner, amount, {from: account2});
    });
});
