import { readFile } from "./utils";

const configFile = "conf.yml";
let conf = readFile(configFile);
let DefaultRoom = conf["defaultRoom"];

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
    return cmdText;
  }
}

export { Command, DefaultRoom };
