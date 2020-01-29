export default class User {
  constructor() {
    this._gold = 0;
  }

  get gold() {
    return this._gold;
  }
  set gold(val) {
    //console.log("changing user gold value to " + val);
    this._gold = val;
  }

  verifyTransaction(transactionCost) {
    if (this._gold - transactionCost < 0) {
      console.log('User cannot afford this transaction');
      return false;
    } else {
      this._gold -= transactionCost;
      return true;
    }
  }
}
