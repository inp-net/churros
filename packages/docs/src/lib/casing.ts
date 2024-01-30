export function kebabToCamel(str: string) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function kebabToPascal(str: string) {
    return kebabToCamel(str).replace(/^[a-z]/, (letter) => letter.toUpperCase());
}

export function camelToKebab(str: string) {
    return str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
} 

export function pascalToKebab(str: string) {
    return camelToKebab(str.replace(/^[A-Z]/, (letter) => letter.toLowerCase()));
}
