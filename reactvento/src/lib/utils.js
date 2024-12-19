import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function SEOfy(string) {
  // Convert the string to SEO
  let seoString = string.toLowerCase();
  seoString = seoString.replace(/[^a-z0-9\s-]/g, '');
  seoString = seoString.replace(/\s+/g, '-');
  seoString = seoString.replace(/-+/g, '-');
  seoString = seoString.replace(/^-+|-+$/g, '');

  return seoString;
};

export function parsePrice(price) {
  price = price.trim();
  let symbol;
  let start = false;

  if (isNaN(price.charAt(0))) {
    symbol = price.charAt(0);
    start = true;
  }

  else if (isNaN(price.charAt(price.length - 1))) {
    symbol = price.charAt(price.length - 1);
  }

  if (start) {
    price = price.substring(1);
  } else {
    price = price.substring(0, price.length - 1);
  }

  return {
    symbol,
    start,
    price: parseFloat(price.replace(/[^0-9.]/g, ''))
  };
}
let defaultAllowedTags = [
  'p', 'br', 'hr', 'em', 'strong', 'b', 'i', 'u',
  'ul', 'ol', 'li', 'div', 'span', 'a', 'img', 'table',
  'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'caption',
  'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'footer', 'header', 'section', 'article', 'aside', 'nav',
  'figure', 'figcaption'
];
export function stripHtmlTags(input, allowedTags = defaultAllowedTags) {
  // Define a list of allowed tags for rich text editors

  let disallowedTagsRegex = new RegExp(`<\/?([a-zA-Z0-9-]+)([^>]*?)>`, 'gi');
  input = fromHtmlEntities(input);
  return input.replace(disallowedTagsRegex, (match, tagName, attributes) => {

    if (allowedTags.includes(tagName.toLowerCase())) {
      return match;
    }
    return '';
  });
}
export const extractLinks = (inputString) => {
  const regex = /(<a.*?href=["'](.*?)["'].*?>(.*?)<\/a>)/gi;
  const result = [];
  let match;

  // Iterate through all matches of the <a> tag
  while ((match = regex.exec(inputString)) !== null) {
    const [fullMatch, , url, linktext] = match;
    const textBeforeLink = inputString.slice(0, match.index).trim();

    result.push({
      text: stripHtmlTags(textBeforeLink, []),
      linktext: stripHtmlTags(linktext.trim(), []),
      url: url.trim(),
    });

    inputString = inputString.slice(match.index + fullMatch.length).trim();
    regex.lastIndex = 0;
  }


  if (inputString) {
    result.push({ text: inputString, linktext: "", url: "" });
  }

  return result;
};

export const fromHtmlEntities = function (string) {
  const parser = new DOMParser();
  return parser.parseFromString(string, "text/html").documentElement.textContent;
};