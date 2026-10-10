import { appState } from "../app";
import { User } from "../models/User";

export const authUser = function (login, password) {
  const stored = User.findByLogin(login);
  if (!stored || stored.password !== password) return false;

  const user = new User(stored.login, stored.password, stored.role);
  user.id = stored.id;             
  appState.currentUser = user;
  return true;
};

export const logout = function () {
  appState.currentUser = null;
};