export class State {
  constructor() {
    this.currentUser = null;
  }
  set currentUser(user) { this._currentUser = user; }
  get currentUser() { return this._currentUser; }

  get isAuth() { return !!this._currentUser; }
  get isAdmin() { return this._currentUser?.role === "admin"; }
}
