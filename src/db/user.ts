import { AppDataSource } from "./data-source";
import { User } from "../entity/user";

const db = AppDataSource.initialize();

async function createUser(user: User) {
  db.then(async () => {
    console.log("Inserting a new user into the database...");
    await AppDataSource.manager.save(user);
    console.log("Saved a new user with id: " + user.id);
  }).catch((error) => console.log(error));
}

async function getUser() {
  db.then(async () => {
    console.log("Loading users from the database...");
    const users = await AppDataSource.manager.find(User);
    console.log("Loaded users: ", users);
  }).catch((error) => console.log(error));
}
