import { Contact, log, Message, Room, Wechaty } from "wechaty";
import { getRoomList, updateRoom } from "./db/room";
import { RoomEntity } from "./entity/room";
import { DefaultRoom } from "./constant";

class Command {
  static help = "帮助";
  static addRoom = "加群";
  static sellTicket = "出票";
  static query = "查询";
  static flushRoom = "flush_room";

  static getCmdList(): string[] {
    let cmdText: string[] = [
      this.help,
      this.addRoom,
      this.sellTicket,
      this.query,
      this.flushRoom,
    ];
    log.info(cmdText.toString());
    return cmdText;
  }
}

function validateCmd(msgText: string) {
  msgText = msgText.trim();
  if (msgText[0] == "#" || msgText == "＃") {
    msgText = msgText.slice(1);
  }

  for (let cmd of Command.getCmdList()) {
    let reg = new RegExp(`^${cmd}`, "i");
    let is_cmd = reg.test(msgText);
    if (is_cmd) {
      let realText = msgText.replace(cmd, "").trim();
      log.info(cmd, realText);
      return [cmd, realText];
    }
  }
}

async function handleCmd(bot: Wechaty, msg: Message) {
  let talker = null;
  if (msg.self()) {
    talker = msg.listener();
  } else {
    talker = msg.talker();
  }

  let valid = validateCmd(msg.text());
  if (!valid) {
    return;
  }

  let cmd = valid[0];
  let realText = valid[1];

  try {
    switch (cmd) {
      case Command.query:
        await queryRoomlist(talker, realText);
        break;
      case Command.addRoom:
        await addRoom(bot, talker, realText);
        break;
      case Command.flushRoom:
        await flushRoom(bot);
        break;
      case Command.sellTicket:
        await sellTicket(bot, talker, realText);
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

async function queryRoomlist(talker: Contact, realText: string) {
  let rooms: RoomEntity[] = await getRoomList(realText);
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

async function findRoom(bot: Wechaty, realText: string) {
  let reg: RegExp = new RegExp(`${realText}`, "i");
  let rooms: Room[] = await bot.Room.findAll({ topic: reg });
  log.info(`find rooms: [${rooms}]`);
  return rooms;
}

async function addRoom(bot: Wechaty, talker: Contact, realText: string) {
  let rooms: Room[] = await findRoom(bot, realText);
  if (rooms) {
    for (let room of rooms) {
      if (await room.has(talker)) {
        await talker.say(`exist in room: ${await room.topic()}`);
        break;
      }

      try {
        await room.add(talker);
      } catch (e) {
        log.error(e);
      }
    }
  }
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

async function sellTicket(bot: Wechaty, talker: Contact, realText: string) {
  let rooms: Room[] = await findRoom(bot, DefaultRoom);
  if (rooms) {
    for (let room of rooms) {
      if (await room.has(talker)) {
        await talker.say(room.toString());
        await room.say(realText);
      }
    }
  }
}

export { handleCmd };
