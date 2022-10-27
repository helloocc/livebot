import "reflect-metadata";
import { DataSource } from "typeorm";
import { RoomEntity } from "./entity/room";
import { User } from "./entity/user";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "livebot.sqlite",
  synchronize: true,
  logging: false,
  entities: [RoomEntity, User],
  migrations: [],
  subscribers: [],
});
