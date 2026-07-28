import makeSticker from './sticker.js';

export default {
    sticker: {
        alias: 's',
        description: '*(s) sticker* - Creates a sticker from a valid media file',
        execute: makeSticker
    }
}
