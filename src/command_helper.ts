import { Contact, log, Message, Wechaty } from "wechaty";

class Command {
  static addRoom = "加群";
  static sellTicket = "出票";
  static help = "帮助";

  static getCmdList(): string[] {
    let cmdText: string[] = [this.addRoom, this.sellTicket, this.help];
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

  if (cmd == Command.addRoom) {
    addRoom(bot, talker, realText);
  }
}

async function addRoom(bot: Wechaty, talker: Contact, realText: string) {
  let reg: RegExp = new RegExp(`${realText}`, "i");
  let find_rooms = await bot.Room.findAll({ topic: reg });
  log.info(`find room: ${find_rooms}`);
  if (find_rooms) {
    for (let room of find_rooms) {
      if (await room.has(talker)) {
        await talker.say(`exist in room: ${await room.topic()}`);
        continue;
      }

      try {
        await room.add(talker);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

export { handleCmd };
