export const getFromStorage = (key) =>
  JSON.parse(localStorage.getItem(key) || "[]");

export const setToStorage = (data, key) =>
  localStorage.setItem(key, JSON.stringify(data));

export const addToStorage = (obj, key) => {
  const data = getFromStorage(key);
  data.push(obj);
  setToStorage(data, key);
};

export const generateTestUser = function (User) {
  // НЕ чистим весь localStorage — иначе теряем задачи
  const users = getFromStorage("users");
  if (!users.length) {
    const admin = new User("admin", "admin", "admin");
    const test = new User("test", "qwerty123", "user");
    User.save(admin);
    User.save(test);
  }
};