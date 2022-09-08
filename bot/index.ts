import qrTerm from 'qrcode-terminal'
import {
    Contact, Message, ScanStatus, WechatyBuilder
} from 'wechaty'

function onScan(qrcode: string, status: ScanStatus) {
    if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
        qrTerm.generate(qrcode)

        const qrcodeImageUrl = [
            'https://wechaty.js.org/qrcode/',
            encodeURIComponent(qrcode),
        ].join('')

        console.info('onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
    } else {
        console.info('onScan: %s(%s)', ScanStatus[status], status)
    }

}

function onLogin(user: Contact) {
    console.info(`${user.name()} login`)
}

function onLogout(user: Contact) {
    console.info(`${user.name()} logged out`)
}

async function onMessage(msg: Message) {
    console.info(msg.toString())

    if (msg.self()) {
        console.info('Message discarded because its outgoing')
        return
    }

    if (msg.age() > 2 * 60) {
        console.info('Message discarded because its TOO OLD(than 2 minutes)')
        return
    }

    if (msg.type() !== bot.Message.Type.Text
        || !/^(ding|ping|bing|code)$/i.test(msg.text())
    ) {
        console.info('Message discarded because it does not match ding/ping/bing/code')
        return
    }

    await msg.say('dong')
    console.info('REPLY: dong')

}


const bot = WechatyBuilder.build({
    name: 'livebot',
    puppet: 'wechaty-puppet-wechat',
    puppetOptions: {
        uos: true
    }

})

bot
    .on('logout', onLogout)
    .on('login', onLogin)
    .on('scan', onScan)
    .on('message', onMessage)
    .start()
    .catch(async e => {
        console.error('Bot start() fail:', e)
        await bot.stop()
        process.exit(-1)
    })

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

`
console.info(welcome)
