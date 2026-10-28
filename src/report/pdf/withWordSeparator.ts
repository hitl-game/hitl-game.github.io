// PDF/UA needs the space between words inside the marked content, including at the end of a block.
export const withWordSeparator = (text: string): string => `${text} `;
