import {Socket} from 'swan-api';
import {getCommand} from './entrypoints.js';
import {normalizeString} from '#utils';

const cmdMarker = '!'
const loopLimit = 5;
let loopCounter = 0;

// generic handler
export default async function processMessage(msg) {
    // process commands only
    if (!msg.text.startsWith(cmdMarker))
        return;
   
    // the bot can parse its own messages
    if (msg.fromMe) {
        // but it stops when reaches 'loopLimit' commands consecutively
        if (++loopCounter >= loopLimit) {
            loopCounter=0;
            return msg.reply('Loop Detected! Reseting...');
        }
    } else
        loopCounter=0;

    // extract (cmd, args) from the message text
    const [, txt_cmd, txt_args = ""] = msg.text.trim().match(/^(\S+)\s*([\s\S]*)$/);
    
    const cmdName = normalizeString(txt_cmd);// normalize the extracted command
    msg.text = txt_args; // overwrites message's text to remove the command name from it

    // who sent the command and where
    const contactName = (await msg.getContact()).name;
    const chatName = (await msg.getChat()).name;

    // logs on terminal
    const msg_log = `{\nuser:${contactName}\nchat:${chatName}\
                \ncmd : ${cmdName}\nmsg : ${msg.text}\n}`
    console.log(msg_log);

    // gets command by cmdName from adapter and runs it on the processed message
    const cmd = getCommand(cmdName);
    await cmd?.execute(msg);
}


//creates SWAN socket and process new messages
const sock = new Socket();
sock.on('ready', () => {
    console.log("===== BOT ON =====");
    sock.on("newMessage", message => processMessage(message));
});
