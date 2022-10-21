import { readFile } from "./utils";

const configFile = "conf.yml";
let conf = readFile(configFile);

let DefaultRoom = conf["defaultRoom"];
export { DefaultRoom };
