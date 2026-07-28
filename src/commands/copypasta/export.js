import * as copypasta from './copypasta.js'

export default {
    copy: {
        alias: 'c',
        description: "*(c) copy `name` `text`*: stores `text` under `name`",
        execute: copypasta.copy
    },
    
    paste: {
        alias: 'p',
        description: "*(p) paste `name`*: sends the text stored in `name`",
        execute: copypasta.paste
    },

    copylist: {
        alias: 'cl',
        description: "*(cl) copylist*: lists all stored copypastas",
        execute: copypasta.copyList
    }
}
