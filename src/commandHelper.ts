import { Contact, log, Message, Wechaty } from "wechaty";
import { getRoomList, updateRoom } from "./db/room";
import { RoomEntity } from "./entity/room";

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
    console.log(cmdText);
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
  let talker = msg.talker();
  let valid = validateCmd(msg.text());
  if (!valid) {
    return;
  }

  let cmd = valid[0];
  let realText = valid[1];

  try {
    switch (cmd) {
      case Command.query:
        await query(talker, realText);
        break;
      case Command.addRoom:
        await addRoom(bot, talker, realText);
        break;
      case Command.flushRoom:
        await flushRoom(bot);
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

async function query(talker: Contact, realText: string) {
  let roomList = await getRoomList(realText);
  let reply = "No reuslt";
  if (Array.isArray(roomList) && roomList.length) {
    let roomTopics = roomList.map((item) => item.topic);
    reply = "";
    for (let i in roomTopics) {
      reply += `${Number(i) + 1}. ${roomTopics[i]}\n`;
    }
  }

  await talker.say(reply);
}

async function addRoom(bot: Wechaty, talker: Contact, realText: string) {
  let reg: RegExp = new RegExp(`${realText}`, "i");
  let find_rooms = await bot.Room.findAll({ topic: reg });
  log.info(`find room: ${find_rooms}`);
  if (find_rooms) {
    for (let room of find_rooms) {
      if (await room.has(talker)) {
        await talker.say(`exist in room: ${await room.topic()}`);
        break;
      }

      try {
        await room.add(talker);
      } catch (e) {
        console.error(e);
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
    .catch(console.error);
}

export { handleCmd };
