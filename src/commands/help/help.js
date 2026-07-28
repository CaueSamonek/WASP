import cmds from '../../entrypoints.js'

// gathers descriptions from all available commands
export default function help(msg){
    const helpText = Object.values(cmds).map(cmd => cmd.description).join('\n\n');
    msg.reply('📜   Available Commands   📜\n\n' + helpText);
}
