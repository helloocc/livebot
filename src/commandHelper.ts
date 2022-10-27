import { Contact, log, Message, Room, Wechaty } from "wechaty";
import { Command, DefaultRoom } from "./constant";
import { Reply } from "./reply";
import {
  findRoom,
  queryRoomlist,
  flushRoom,
  doBroadcast,
  addRoom,
} from "./roomHelper";

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
  let valid = validateCmd(msg.text());
  if (!valid) {
    return;
  }

  let talker = undefined;
  if (msg.self()) {
    talker = msg.listener();
  } else {
    talker = msg.talker();
  }

  let room = msg.room();
  let conversation = undefined;
  if (room) {
    conversation = room;
  } else {
    conversation = talker;
  }

  let cmd = valid[0];
  let realText = valid[1];

  try {
    switch (cmd) {
      case Command.query:
        await queryRoomlist(bot, talker, realText);
        break;
      case Command.addRoom:
        await addRoom(bot, talker, realText);
        break;
      case Command.flushRoom:
        await flushRoom(bot);
        break;
      case Command.sellTicket:
        await sellTicket(bot, conversation, realText);
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

async function sellTicket(
  bot: Wechaty,
  conversation: Contact | Room,
  realText: string
) {
  let reg = new RegExp(`联系方式|微信|vx|wx`, "i");
  let satisfy = reg.test(realText);
  if (!satisfy) {
    await conversation.say(Reply.needContactInfo);
    return;
  }

  let ticketInfo = `【出票】\n\n${realText}`;
  doBroadcast(bot, ticketInfo, DefaultRoom);
}

export { handleCmd };
