# WASP

**WASP** (**W**hatsApp **A**utomation **S**ample **P**roject) is an example project for a modular WhatsApp bot built with Node.js. It provides a command-based system for extending bot functionality, with support for stickers, copypasta storage, web scraping, and utility commands.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Commands](#commands)
  - [Help](#help)
  - [Sticker](#sticker)
  - [Copypasta](#copypasta)
  - [RU Menu](#ru-menu)
- [Architecture](#architecture)
- [Dependencies](#dependencies)
- [License](#license)

## Features

- WhatsApp message handling entirely through [SWAN](https://github.com/cauesamonek/SWAN)
- Modular command architecture - drop a folder in `src/commands` and it's auto-loaded
- Sticker generation from media files or URLs, in multiple formats
- Persistent copypasta storage (save and recall text snippets by name)
- Automatic extraction of UFPR Restaurant University (RU) menus
- Built-in loop protection to avoid the bot replying to itself indefinitely
- A `help` command that auto-generates its list from every other command's metadata

## Project Structure

```
LICENSE
README.md
package.json
src
├── main.js
├── utils.js
├── entrypoints.js
└── commands
    ├── copypasta
    │   ├── copypasta.js
    │   └── export.js
    ├── help
    │   ├── export.js
    │   └── help.js
    ├── ru
    │   ├── export.js
    │   └── ru.js
    └── sticker
        ├── export.js
        └── sticker.js
```

## Installation

**Prerequisites:** Node.js 18+ and a WhatsApp account to link as the bot.

Clone the repository:

```bash
git clone https://github.com/CaueSamonek/WASP.git
cd WASP
```

Install dependencies:

```bash
npm install
```

Start the bot:

```bash
npm start
```

A QR code will appear in the terminal. Scan it with the WhatsApp account you want the bot to run on, and wait for the confirmation message:

```
===== BOT ON =====
```

Session data is saved locally, so you only need to scan the QR code once - subsequent runs reconnect automatically.

## Commands

Even though the bot receives every new message, it only reacts to valid commands: a message starting with the predefined command marker `!`, followed by an existing command name or alias. Commands work in both private chats and groups the bot participates in.

### Help

Displays all available commands. `help` doesn't know the details of each command - it just iterates over the `commands` directory and prints the `description` field from each `export.js`.

```
!help
```

Output:

```
📜   Available Commands   📜

*(s) sticker* - Creates a sticker from a valid media file.

*(c) copy `name` `text`*: stores `text` under `name`.

*(p) paste `name`*: sends the text stored in `name`.

*(cl) copylist*: lists all stored copypastas.

*(h) help* - Show this list

*ru `campus`*- send the available menu of the selected campus (if empty, defaults to centro politécnico)
```

---

### Sticker

Creates stickers from images, videos, or URLs, using `MessageMedia` from SWAN to download attached media or fetch media from a URL.

```
!sticker
```

or

```
!s
```

Supports multiple sticker formats (defaults to `fill` if not specified):

- `fill`
- `full`
- `crop`
- `circle`
- `rounded`

Use `all` to generate every format at once (it will send 5 stickers consecutively).

Examples:

```
!s
!s fill      // same as above
!s full
!s circle
!s all        // sends one sticker per format
```

Reply to a media message with `!s` (or `!sticker`) to convert that media into a sticker.

---

### Copypasta

Stores and retrieves text snippets ("copypastas") by name. Entries persist locally in `src/commands/copypasta/copies.json`.

**Store a copypasta**

```
!copy name text
```

or

```
!c name text
```

Examples:

```
!c first This is my first copypasta, so I'll be gentle and not save a 9999-word text
!copy hello Hello world!
```

You can also omit the text and reply to an existing message - the quoted message's content is stored instead.

**Retrieve a copypasta**

```
!paste name
```

or

```
!p name
```

Examples:

```
!paste first
!p hello
```

Sends the stored text, or an error reply if the name doesn't exist.

**List stored copypastas**

```
!copylist
```

or

```
!cl
```

Sends just the names of all stored copypastas (not their content).

---

### RU Menu

Fetches and parses UFPR Restaurant University (RU) menus directly from the university's site.

```
!ru campus
```

Automatically extracts:

- Menu items (breakfast, lunch, dinner)
- Dietary restriction icons
- Menu images, when the page provides them as images instead of text

**Available `campus` options:**

- `centro-politecnico`
- `jardim-botanico`
- `central`
- `agrarias`
- `matinhos`
- `cem`
- `palotina`
- `jandaia-do-sul`
- `mirassol`
- `toledo`

**Shortcuts:**

| Shortcut   | Campus              |
| ---------- | -------------------- |
| *(empty)*  | Centro Politécnico (default) |
| `poli`     | Centro Politécnico   |
| `botanico` | Jardim Botânico      |

Example:

```
!ru
```

Output snippet (single day):

```
===== Terça-Feira 28/07/2026 =====

Café da manhã
   - Pão francês ou integral com ovo mexido 🌾🥚
   - Opção vegana: pão francês ou integral com pasta de abacate 🌾🌱
   - Mamão 🌱

Almoço
   - Filé de frango ao molho de laranja 🥩
   - Opção vegana: falafel 🌾🌱
   - Jardineira de legumes 🌱
   - Saladas de folhosas e beterraba ralada 🌱
   - Molho para saladas: vinagrete 🌱
   - Creme de abacaxi 🥛

Jantar
   - Pastel de carne moída 🌾🥩
   - Opção vegana: pastel de lentilha com milho 🌾🌱
   - Sopa califórnia 🌾🥩
   - Saladas de folhosas e berinjela 🌱
   - Molho para saladas: vinagrete 🌱

LEGENDA
🌱 Indicado para veganos
🥩 Contêm produtos de origem animal
🐖 Contêm produtos de origem suína
🥛 Contém leite e/ou derivados
🥚 Contêm ovos
🌾 Contém glúten
⚠️ Contém ingrediente(s) potencialmente alergênico(s)
```

---

## Architecture

Commands live in independent modules under `src/commands/`. A typical command folder looks like:

```
command/
├── command.js
└── export.js
```

- **`command.js`** - the command's logic. Can be split across multiple files and be as complex as needed.
- **`export.js`** - exposes the command's metadata in a standard shape:

```javascript
export default {
    command: {
        alias: "cmd",
        description: "Command description",
        execute: commandFunction
    }
}
```

All commands are discovered and loaded through `src/entrypoints.js`, which scans `src/commands/` at startup, imports each `export.js`, and builds a lookup table mapping both command names and aliases to their handler. To add a new command, just create a new folder under `src/commands/` following this structure - no manual registration needed.

## Dependencies

Main dependencies:

- [`swan-api`](https://github.com/cauesamonek/SWAN) - WhatsApp communication layer.
- [`axios`](https://axios-http.com/) - HTTP requests (RU menu scraping)
- [`cheerio`](https://cheerio.js.org/) - HTML parsing (RU menu scraping)
- [`sharp`](https://sharp.pixelplumbing.com/) - image processing (sticker generation)

## License

[MIT](LICENSE)
