var revertError = "VM Exception while processing transaction: revert";

module.exports = {
    createProject: createProject,
    assertBalance: assertBalance,
    shouldRevert: shouldRevert,
};

function createProject(Project, token) {
    var goal = 20e16;
    var cap = 30e16;
    var tokenPrice = 100;
    return Project.new(token, goal, cap, tokenPrice);
}

async function assertBalance(token, addr, targetBalance, msg) {
  var balance = await token.balanceOf.call(addr);
  if(!msg) {
      msg = targetBalance.toExponential()+" should have been in account "+addr.toString(16);
  }
  if(typeof targetBalance == "object") {
      // targetBalance better be a BigNumber!
      targetBalance = targetBalance.toString(10);
  }
  assert.equal(balance.toString(10), targetBalance, msg);
}

async function shouldRevert(action, message) {
  try {
      await action;
  } catch(error) {
      assert.equal(error.message, revertError, message);
      return;
  }
  assert.equal(false, true, message);
}