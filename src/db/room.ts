import { Like } from "typeorm";
import { RoomEntity } from "./entity/room";
import { AppDataSource } from "./data-source";

const db = AppDataSource.initialize();

async function createRoom(room: RoomEntity) {
  db.then(async () => {
    console.log("Inserting a new room into the database...");
    await AppDataSource.manager.save(room);
    console.log("Saved a new room: " + room);
  }).catch((error) => console.log(error));
}

async function queryRoom(botID: string, keyword: string) {
  console.log(`query keyword: ${keyword}`);
  let dbData = await db
    .then(async () => {
      console.log("Loading rooms from the database...");
      const rooms = await AppDataSource.manager.find(RoomEntity, {
        where: {
          member_ids: Like(`%${botID}%`),
          topic: Like(`%${keyword}%`),
        },
        order: {
          member_num: "DESC",
        },
      });
      console.log("Loaded room nums: " + rooms.length);
      return rooms;
    })
    .catch((error) => {
      console.log(error);
    });

  if (dbData) {
    return dbData;
  }
  return [];
}

async function updateRoom(newRoom: RoomEntity) {
  db.then(async () => {
    console.log("Inserting a new room into the database...");
    let dbRoom = await AppDataSource.manager.findOne(RoomEntity, {
      where: { room_id: newRoom.room_id },
    });
    if (dbRoom) {
      dbRoom.topic = newRoom.topic;
    } else {
      dbRoom = newRoom;
    }

    await AppDataSource.manager.save(dbRoom);
    console.log(`"Save room: [${dbRoom.room_id}-${dbRoom.topic}]`);
  }).catch((error) => console.log(error));
}

export { createRoom, queryRoom, updateRoom };
