import fs from 'fs';
import {normalizeString} from '#utils';
import path from 'path';

// file with pairs (key,value) of each copypasta
const DIR = path.dirname(new URL(import.meta.url).pathname);
const DB_FILE = path.join(DIR, 'copies.json')

// load and save of copypastas
if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, "{}");
const copypastas = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
function newCopypasta(key, value) {
    copypastas[key] = value;
    fs.writeFileSync(DB_FILE, JSON.stringify(copypastas, null, 4), "utf8");
}


// list stored copypastas
export function copyList(msg) {
    const keys = Object.keys(copypastas);
    if (keys.length)
        msg.reply('Stored Copypastas:\n' + keys.join('\n'));
    else
        msg.reply('No stored copypastas.');
}

// stores a new copypasta
export function copy(msg) {
    const name = msg.text.split(/\s+/)[0];
    let text = msg.text.slice(name.length+1);
    if (!text){
        text = msg.quoted?.text;
        if (!text)
            return;
    }

    const copypasta_name = normalizeString(name);
    newCopypasta(copypasta_name, text);
    msg.reply(`Copypasta "${copypasta_name}" stored.`);
}

// paste a stored copypasta
export function paste(msg) {
    const name = normalizeString(msg.text);
    if (!name) return;
    msg.reply(copypastas[name] || `Copypasta "${name}" not found`);
}
