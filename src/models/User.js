import { BaseModel } from "./BaseModel";
import { getFromStorage, addToStorage } from "../utils";

export class User extends BaseModel {
  constructor(login, password, role = "user") {
    super();
    this.login = login;
    this.password = password;
    this.role = role;
    this.storageKey = "users";
  }

  get isAdmin() {
    return this.role === "admin";
  }

  get hasAccess() {
    const users = getFromStorage(this.storageKey);
    return users.some(
      (u) => u.login === this.login && u.password === this.password
    );
  }

  static save(user) {
    addToStorage(user, user.storageKey);
    return true;
  }

  static getAll() {
    return getFromStorage("users");
  }

  static findByLogin(login) {
    return getFromStorage("users").find((u) => u.login === login) || null;
  }

  static remove(login) {
    const users = getFromStorage("users").filter((u) => u.login !== login);
    localStorage.setItem("users", JSON.stringify(users));
  }
}