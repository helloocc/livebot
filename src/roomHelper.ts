import { Contact, log, Room, Wechaty } from "wechaty";
import { DefaultRoom } from "./constant";
import { RoomEntity } from "./db/entity/room";
import { queryRoom, updateRoom } from "./db/room";

async function addRoom(bot: Wechaty, talker: Contact, realText: string) {
  let rooms: Room[] = await findRoom(bot, realText);
  if (Array.isArray(rooms) && rooms.length) {
    for (let room of rooms) {
      let topic = await room.topic();
      if (await room.has(talker)) {
        await talker.say(`你已经在 [${topic}] 群`);
        break;
      }

      try {
        log.info(`invite [${await talker.alias()}] to room: [${topic}]`);
        await talker.say(`已邀请你进 [${room.topic}] 群，请稍候`);
        await room.add(talker);
        break;
      } catch (e) {
        log.error(e);
      }
    }
  } else {
    await talker.say(`暂时没有 [${realText}] 相关群`);
  }
}

async function findRoom(bot: Wechaty, realText: string) {
  let reg: RegExp = new RegExp(`${realText}`, "i");
  let loadRooms = [];

  let dbRoomIds: string[] = (await queryRoom(realText)).map(
    (item) => item.room_id
  );
  log.info(`find db rooms: [${dbRoomIds.length}]`);
  if (dbRoomIds.length == 0) {
    loadRooms = await bot.Room.findAll({ topic: reg });
  }

  for (let id of dbRoomIds) {
    loadRooms.push(await bot.Room.find({ id: id }));
  }
  log.info(`find rooms: [${loadRooms}]`);
  return loadRooms;
}

async function queryRoomlist(talker: Contact, realText: string) {
  let rooms: RoomEntity[] = await queryRoom(realText);
  let reply: string = "No reuslt";
  if (Array.isArray(rooms) && rooms.length) {
    let roomTopics = rooms.map((item) => item.topic);
    reply = "";
    for (let i in roomTopics) {
      reply += `${Number(i) + 1}. ${roomTopics[i]}\n`;
    }
  }
  await talker.say(reply);
}

async function flushRoom(bot: Wechaty) {
  bot.Room.findAll()
    .then(async (roomList) => {
      for (let room of roomList) {
        let roomEntity = new RoomEntity();
        roomEntity.room_id = room.id;
        roomEntity.topic = await room.topic();

        let memberList = await room.memberAll();
        let memberIds = memberList.map((item) => item.id);
        roomEntity.member_ids = memberIds.toString();
        roomEntity.member_num = memberIds.length;
        await updateRoom(roomEntity);
      }
      await bot.currentUser.say("room list:" + roomList.length);
    })
    .catch(log.error);
}

async function doBroadcast(
  bot: Wechaty,
  text: string,
  roomTag: string = DefaultRoom
) {
  let rooms: Room[] = await findRoom(bot, roomTag);
  for (let room of rooms) {
    await room.say(text);
  }
}
export { addRoom, doBroadcast, flushRoom, findRoom, queryRoomlist };
