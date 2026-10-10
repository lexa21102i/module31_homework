import { User } from "../models/User";

export const UserService = {
  getAll: () => User.getAll(),
  add: (login, password, role = "user") => {
    if (User.findByLogin(login)) throw new Error("Пользователь уже существует");
    User.save(new User(login, password, role));
  },
  remove: (login) => User.remove(login),
};