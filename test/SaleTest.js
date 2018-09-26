var Token = artifacts.require("./Token.sol");
var Project = artifacts.require("./TokenSale.sol");
var u = require("./util.js");
var BN = web3.BigNumber;

var ownerBalance = new BN('100e18');

contract('TokenSale', function(accounts) {
    let [owner, backer1, backer2, backer3] = accounts;
    let project, token;

    it("Test initialization", async function() {

        token = await Token.new(ownerBalance);
        // Project sanity check
        project = await u.createProject(Project, token.address);
        await token.transfer(project.address, ownerBalance, { from: owner })
        let projectCreator = await project.creator.call();
        assert.equal(projectCreator.toString(16), owner, "Creator should be first in 'accounts'");

    });

    it("Test pledge", async function() {
        let amount = new BN(2e18);
        let pledge = new BN('20000000000000000');

        await project.buyTokens(amount, {from: backer1, value: pledge});
    
        let pledged = await project.totalPledgeAmount.call();
        assert.equal(pledge.toString(16), pledged.toString(16), "Project pledge amount incorrect");

        let projectBalance = await project.balanceOf();
        assert.equal(pledge.toString(16), projectBalance.toString(16), "Project ETH amount incorrect");

        let backer1Pledge = await project.pledges.call(backer1);
        assert.equal(amount.toString(16), backer1Pledge.toString(16), "Backer1 pledge amount incorrect");
    });

    it("Unsuccessful crowdsale", async function() {
        let amount = new BN(16e18);
        let pledge = new BN('160000000000000000');

        await project.buyTokens(amount, {from: backer2, value: pledge});

        let pledged = await project.totalPledgeAmount.call();
        assert.equal(new BN(18e16).toString(16), pledged.toString(16), "Project pledge amount incorrect");

        let projectBalance = await project.balanceOf();
        assert.equal(new BN(18e16).toString(16), projectBalance.toString(16), "Project ETH amount incorrect");

        await u.shouldRevert(project.endSale(), "Cannot withdraw unless goal is met");
    });

    it("Withdraw funds", async function() {
        let amount = new BN(4e18);
        let pledge = new BN('40000000000000000');

        await project.buyTokens(amount, {from: backer3, value: pledge});
        let goal = await project.fundingGoal.call()
        let pledged = await project.totalPledgeAmount.call();
        let donors = await project.getDonorList.call();
        let projectTokens = await token.balanceOf.call(project.address);
        let donor1Pledge = await project.getAddressPledge(accounts[1]);
        assert.equal(goal.toString(), new BN('20e16').toString(), "Sanity check on funding goal");
        assert.equal(pledged.toString(), new BN('22e16').toString(), "Pledge total isn't right");
        assert.equal(donors[0], accounts[1], "Sanity check for donor list");
        assert.equal(projectTokens.toString(), new BN('100e18').toString(), "Sanity check for token supply");
        assert.equal(donor1Pledge.toString(), new BN('2e18'), "Sanity check on donor1's pledge")
        console.log(token.address);

        await project.endSale();
        
        let projectBalance = await project.balanceOf();
        assert.equal(new BN(0).toString(16), projectBalance.toString(16), "Creator ETH amount incorrect");

        let backer1Pledge = await token.balanceOf(backer1);
        assert.equal(backer1Pledge.toString(16), new BN('2e18').toString(16), "Backer1 did not receive their tokens");

        let backer2Pledge = await token.balanceOf(backer2);
        assert.equal(new BN(16e18).toString(16), backer2Pledge.toString(16), "Backer2 did not receive their tokens");

        let backer3Pledge = await token.balanceOf(backer3);
        assert.equal(new BN(4e18).toString(16), backer3Pledge.toString(16), "Backer3 did not receive their tokens");
    });

});