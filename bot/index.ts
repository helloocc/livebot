import qrTerm from "qrcode-terminal";
import {
  Contact,
  Friendship,
  Message,
  RoomInvitation,
  ScanStatus,
  WechatyBuilder,
} from "wechaty";
import { FriendshipImpl } from "wechaty/impls";
import { writeFile } from "./utils";
import { handleCmd } from "./command_helper";

let roomFile = "rooms.yml";

function onScan(qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerm.generate(qrcode);

    const qrcodeImageUrl = [
      "https://wechaty.js.org/qrcode/",
      encodeURIComponent(qrcode),
    ].join("");

    console.info(
      "onScan: %s(%s) - %s",
      ScanStatus[status],
      status,
      qrcodeImageUrl
    );
  } else {
    console.info("onScan: %s(%s)", ScanStatus[status], status);
  }
}

async function onLogin(user: Contact) {
  await user.say(`[${user.id}] login`);
  bot.Room.findAll()
    .then(async (roomList) => {
      for (let room of roomList) {
        console.info(room.id, await room.topic());
      }
      writeFile(roomList, roomFile);
      return undefined;
    })
    .catch(console.error);
}

function onLogout(user: Contact) {
  console.info(`${user.name()} logged out`);
}

async function onRoomInvitation(roomInvitation: RoomInvitation) {
  console.info("join room %s", roomInvitation.topic());
  await roomInvitation.accept();
}

async function onFriendship(friend: Friendship) {
  try {
    console.log(`received friend event.`);
    switch (friend.type()) {
      case FriendshipImpl.Type.Receive:
        await friend.accept();
        break;
      case FriendshipImpl.Type.Confirm:
        console.log(`friend ship confirmed`);
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

async function onMessage(msg: Message) {
  let room = msg.room();
  if (room) {
    console.info("Room message discarded");
    return;
  }

  console.info(msg.toString());

  if (msg.self()) {
    console.info("Message discarded because its outgoing");
    return;
  }

  if (msg.age() > 10 * 60) {
    console.info("Message discarded because its TOO OLD(than 2 minutes)");
    return;
  }

  if (
    msg.type() === bot.Message.Type.Text &&
    /^(ding|ping|bing)$/i.test(msg.text())
  ) {
    await msg.say("dong");
    console.info("REPLY: dong");
    return;
  }

  if (msg.type() == bot.Message.Type.Text) {
    handleCmd(bot, msg);
  }
}

const bot = WechatyBuilder.build({
  name: "livebot",
  puppet: "wechaty-puppet-wechat",
  puppetOptions: {
    uos: true,
  },
});

bot
  .on("logout", onLogout)
  .on("login", onLogin)
  .on("room-invite", onRoomInvitation)
  .on("friendship", onFriendship)
  .on("scan", onScan)
  .on("message", onMessage)
  .start()
  .catch(async (e) => {
    console.error("Bot start() fail:", e);
    await bot.stop();
    process.exit(-1);
  });

const welcome = `
| __        __        _           _
| \\ \\      / /__  ___| |__   __ _| |_ _   _
|  \\ \\ /\\ / / _ \\/ __| '_ \\ / _\` | __| | | |
|   \\ V  V /  __/ (__| | | | (_| | |_| |_| |
|    \\_/\\_/ \\___|\\___|_| |_|\\__,_|\\__|\\__, |
|                                     |___/

=============== Powered by Wechaty ===============
-------- https://github.com/wechaty/wechaty --------
          Version: ${bot.version()}

I'm a bot, my superpower is talk in Wechat.
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me to more superpowers!

Please wait... I'm trying to login in...

`;
console.info(welcome);
