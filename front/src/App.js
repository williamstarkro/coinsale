import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";

import { drizzleConnect } from "drizzle-react";
import { ContractData, ContractForm } from "drizzle-react-components";

class App extends Component {
  render() {
    const { drizzleStatus, accounts } = this.props;
    console.log(accounts);

    if (drizzleStatus.initialized) {
      return (
        <div className="App">
          <header className="App-header">
            <h1 className="App-title">Fueled Sale</h1>
              <div>
              <p>
              <strong>Funding Goal</strong>:{" "}
              <ContractData
                contract="TokenSale"
                method="fundingGoal"
              />{" "}
              <strong>Hard Cap</strong>:{" "}
              <ContractData
                contract="TokenSale"
                method="hardCap"
              />
              </p>
              </div>
            <p>
              <strong>Total amount pledged</strong>:{" "}
              <ContractData
                contract="TokenSale"
                method="totalPledgeAmount"
              />
            </p>
            <h3>Send Tokens</h3>
          </header>
          <br/>
          <div className="App-intro">
            <ContractForm
              contract="TokenSale"
              method="buyTokens"
              labels={["Tokens to receive"]}
            />
          </div>
          <br/>
          <h3> End the Sale </h3>
          <ContractForm
              contract="TokenSale"
              method="endSale"
            />
        </div>
      );
    }

    return <div>Loading dapp...</div>;
  }
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    TokenSale: state.contracts.TokenSale
  };
};

const AppContainer = drizzleConnect(App, mapStateToProps);
export default AppContainer;