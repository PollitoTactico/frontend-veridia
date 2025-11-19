export const isValidType = (file, types) => types.includes(file.type);
export const isValidSize = (file, max) => file.size <= max;
