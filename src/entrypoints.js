import fs from 'fs';

// to be relative just to this fileD
import {URL} from 'node:url'

// lookup table with every command name and aliases
const cmd_lookup = {}

// called automatically once
// reads each directory searching for 'export.js' and aggregates commands information

const cmds = [];
async function loadEntrypoints() {
    const dirs = fs.readdirSync(new URL("./commands", import.meta.url),
                            { withFileTypes: true }).filter(d => d.isDirectory());
    // for each command
    for (const dir of dirs){
        // gets command entry
        const entry = (await import(`./commands/${dir.name}/export.js`)).default
        
        // stores a list of commands without alias duplication
        cmds.push(...Object.values(entry));
        
        // maps the name and the alias to the same cmd object
        for (const [name, cmd] of Object.entries(entry)) {
            cmd_lookup[name] = cmd

            if (cmd.alias)
                cmd_lookup[cmd.alias] = cmd;
        }
    }
}

// returns the command information
export function getCommand(cmdName){
    return cmd_lookup[cmdName]
}

loadEntrypoints();
export default cmds; // exports the simple list of commands (useful for a help command)
