import axios from 'axios';
import * as cheerio from 'cheerio';
import {capitalize} from '#utils';
import {MessageMedia} from 'swan-api';

// existing dietary restrictions on the menu
const RESTRICTIONS = {
    vegano:  {icon: '🌱', desc: 'Indicado para veganos'},
    carne:   {icon: '🥩', desc: 'Contêm produtos de origem animal'},
	suino:   {icon: '🐖', desc: 'Contêm produtos de origem suína'},
    lactose: {icon: '🥛', desc: 'Contém leite e/ou derivados'},
    ovo:     {icon: '🥚', desc: 'Contêm ovos'},
    gluten:  {icon: '🌾', desc: 'Contém glúten'},
    alergic: {icon: '⚠️',  desc: 'Contém ingrediente(s) potencialmente alergênico(s)'}
};

// simplifies access and verification
const ICON_SET = new Set(Object.values(RESTRICTIONS).map(r => r.icon));
const hasIcon = (str) => {
    for (const ic of ICON_SET)
        if (str.includes(ic))
            return true;
    return false;
};

// simple parser to accept abbreviations like 'botanico' for 'jardim-botanico'
function getCampus(campus){
    switch (campus){
        case "": case "poli": return "centro-politecnico"
        case "botanico": return "jardim-botanico"
        default: return campus;
    }
}

// fetches the menu page and extracts its data
export default async function ru(msg){
    try {
        const campus = getCampus(msg.text) // gets the campus name for the URL
        const menuURL = `https://p4e.ufpr.br/ru/cardapio-ru-${campus}/`;
        const response = await axios.get(menuURL);
        const $ = cheerio.load(response.data);

		let menu = '';
		let imagens = [];
        // extracts information from HTML nodes
		$('p').each((i, p) => {
			const date = $(p).text().trim();

			// must be a date
			if (!/\d{2}\/\d{2}\/\d{4}/.test(date))
				return;

			let el = $(p).next();
			while (el.length && !el.is('p')) {
				if (el.is('figure.wp-block-table')) {
					menu += `\n===== *${date}* =====\n`;
					el.find('tr').each((j, row) => {
						$(row).find('td').each((i, td) => {
							const nodes = $(td).contents().toArray();
							const lines = [];
							let current = null;

							for (const node of nodes) {
								const el = $(node);

								// text = new line (new menu item)
								if (node.type === 'text' || (node.type === 'tag' && el.text().trim())) {
									let text = el.text().replace(/\s+/g, ' ').trim();
									if (!text)
										continue;

									const parts = text.split('\n');
									for (const part of parts) {
										const p = part.replace(/^e\s+/i,'').trim();
										if (!p) continue;

										const clean = p.charAt(0).toUpperCase() + p.slice(1);
										current = { text: clean, icons: '' };
										lines.push(current);
									}

									continue;
								}

								// img = adds restriction icon to the current item
								if (node.type === 'tag' && node.name === 'img' && current) {
									const title = el.attr('title');

									for (const { icon, desc } of Object.values(RESTRICTIONS)) {
										if (title === desc) {
											current.icons += icon;
											break;
										}
									}
								}
							}

							lines.forEach(({text, icons}) => {
								if (/Café da manhã|Almoço|Jantar/i.test(text))
									menu += `\n*${text}*\n`;
								else
									menu += `   - ${text} ${icons}\n`;
							})
						})
					})
				} else {
					const img = el.find('img').first();
					if (!img.length)
						return;
                    
                    // on some days, the menu can be one or more images
					const src = img.attr('src');
					const [, mime, base64] = src.match(/^data:(.+?);base64,(.+)$/s) || [];
					imagens.push({dia: date, base64: base64.replace(/\s+/g, '')});
				}

				el = el.next();
			}
		});
        
        // empty menu check
		if (menu.trim() == "")
			throw "Empty Menu"

		// adds the campus name at the beginning of the menu and the caption at the end
		menu = `${capitalize(campus.replace('-', ' '))}\n${menu}\n\n*Caption:*\n`;
		for (const { icon, desc } of Object.values(RESTRICTIONS))
			menu += `${icon} ${desc}\n`;	

		// sends the text menu first
		await msg.reply(menu);

		// remove possible duplicates from the images
		imagens = imagens.filter((img, i) =>
					imagens.findIndex(x => x.base64 === img.base64) === i);
        // sends the images
		for (const img of imagens)
			await msg.reply(new MessageMedia(Buffer.from(img.base64, 'base64'), 'image/png'), {caption: img.dia});

    } catch(e){
		console.log(e)
        msg.reply('Error While Getting Menu');
    }
}
