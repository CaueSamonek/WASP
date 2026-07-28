// general utilities

export function normalizeString(str){
    return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .toLowerCase()
            .trim();
}

export function capitalize(string){
    return string.toLowerCase().replace(/\b\p{L}/gu, c => c.toUpperCase());
}
