import { BaseModel } from "./BaseModel";

export class Task extends BaseModel {
  constructor({ title, description = "", status = "backlog", userId, userName }) {
    super();
    this.title = title;
    this.description = description;
    this.status = status;
    this.userId = userId;
    this.userName = userName;
    this.createdAt = Date.now();
  }

  static get STATUSES() {
    return ["backlog", "ready", "inprogress", "finished"];
  }
  static get NEXT() {
    return { backlog: "ready", ready: "inprogress", inprogress: "finished", finished: null };
  }
  static get PREV() {
    return { ready: "backlog", inprogress: "ready", finished: "inprogress", backlog: null };
  }
  static get TITLES() {
    return { backlog: "Backlog", ready: "Ready", inprogress: "In Progress", finished: "Finished" };
  }
}