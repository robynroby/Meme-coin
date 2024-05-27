import Cycles "mo:base/ExperimentalCycles";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

import TokenClass "./icrcTokenClass";

actor AUTODEPLOY = {
  stable var myTokenOpt: ?TokenClass.Ledger = null;

  // function to deploy the token canister
  public shared ({ caller }) func deployToken(_name: Text, _symbol: Text, _transferFee: Nat, _decimals: Nat8): async Result.Result<Text, Text> {
    // add the cycles to cater for the canister creation
    Cycles.add(1000000000000);
    // create a token instance class with the
    let myToken = await TokenClass.Ledger({
      initial_mints = [];
      minting_account = {
        owner = caller;
        subaccount = null;
      };
      token_name = _name;
      token_symbol = _symbol;
      decimals = _decimals;
      transfer_fee = _transferFee;
    });
    myTokenOpt := ?myToken;
    let principalID = Principal.fromActor(myToken);
    // return the canister id of the newly created token
    return #ok(Principal.toText(principalID));
  };

  public shared ({ caller }) func getBalance(account: Principal): async Result.Result<Nat, Text> {
    switch (myTokenOpt) {
      case (?myToken) {
        let balance = await myToken.icrc1_balance_of({
          owner = account;
          subaccount = null;
        });
        return #ok(balance);
      };
      case (null) {
        return #err("Token not deployed yet");
      };
    }
  };

  public shared ({ caller }) func transferTokens(to: Principal, amount: Nat): async Result.Result<Text, Text> {
    switch (myTokenOpt) {
      case (?myToken) {
        let result = await myToken.icrc1_transfer({
          from_subaccount = null;
          to = { owner = to; subaccount = null };
          amount = amount;
          fee = null;
          memo = null;
          created_at_time = null;
        });
        switch (result) {
          case (#ok(txIndex)) {
            return #ok("Transfer successful. Transaction index: " # txIndex.toText());
          };
          case (#err(err)) {
            return #err("Transfer failed: " # err.toText());
          };
        };
      };
      case (null) {
        return #err("Token not deployed yet");
      };
    }
  };
};
