import {MessageMedia} from 'swan-api';

// creates a sticker
export default async function makeSticker(msg){
    // works on the quoted message, if it exists
    const m = msg.quoted ? msg.quoted : msg;
    
    // must have media or be a URL
    if (!m.media && !m.text.startsWith('http'))
        return msg.reply('Invalid Media');

    // downloads attached media or gets the URL
    const media = m.media ? await m.downloadMedia() : await MessageMedia.fromUrl(m.text);

    // parses sticker format parameters, 'all' resolves to all possible formats
    let formats = msg.text.split(/\s+/);
    if (msg.text.includes('all'))
        formats = ['fill', 'full', 'crop', 'circle', 'rounded']

    try {
        // sends a sticker for each selected format
        for (const format of formats)
            await msg.reply(media, {
                asSticker: true,
                stickerPack: 'WASP Pack',
                stickerAuthor: 'WASP Bot',
                stickerType: format,
            });
    } catch (e){
        m.reply('Error While Creating Sticker');
        console.log(`\n\n-------\n${e}\n--------\n\n`)
    }
}

