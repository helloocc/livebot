import { dump, load } from "js-yaml";
import * as fs from "fs";
let ROOMFILE = "rooms.yml";

function readFile(fileName: string) {
  let fileData = load(fs.readFileSync(fileName, "utf-8"));
  console.info("read file:%s success", fileName);
  return fileData;
}

function writeFile(data: any, fileName: string) {
  let yamlStr = dump(data);
  fs.writeFileSync(fileName, yamlStr, "utf-8");
  console.info("write file:%s success", fileName);
}

export { readFile, writeFile, ROOMFILE };
