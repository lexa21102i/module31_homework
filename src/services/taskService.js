import { Task } from "../models/Task";
import { getFromStorage, setToStorage } from "../utils";

const KEY = "tasks";

export const TaskService = {
  getAll() {
    return getFromStorage(KEY);
  },

  getForUser(user) {
    const all = this.getAll();
    return user.isAdmin ? all : all.filter((t) => t.userId === user.id);
  },

  add(task) {
    const all = this.getAll();
    all.push(task);
    setToStorage(all, KEY);
    return task;
  },

  update(id, patch) {
    const all = this.getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    setToStorage(all, KEY);
    return all[idx];
  },

  remove(id) {
    const all = this.getAll().filter((t) => t.id !== id);
    setToStorage(all, KEY);
  },

  removeByUser(userId) {
    const all = this.getAll().filter((t) => t.userId !== userId);
    setToStorage(all, KEY);
  },
};