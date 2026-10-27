const htmlAssetPattern =
  /<(?:script[^>]*\ssrc|link[^>]*\srel="(?:modulepreload|stylesheet)"[^>]*\shref)="([^"]+)"/g;
// Static imports only: a dynamic import("./x.js") is a lazy chunk and stays out of the initial bundle.
const staticImportPattern = /\bimport\s*(?:[\w$*{},\s]+from\s*)?["']\.\/([^"']+\.js)["']/g;

export type ReadAsset = (assetPath: string) => Promise<string>;

export const findHtmlAssets = (html: string): string[] =>
  [...html.matchAll(htmlAssetPattern)]
    .map((match) => match[1] ?? '')
    .filter((url) => !/^(?:[a-z]+:)?\/\//i.test(url) && !url.startsWith('data:'))
    .map((url) => url.replace(/^\.?\//, ''));

export const findStaticImports = (code: string): string[] =>
  [...code.matchAll(staticImportPattern)].map((match) => match[1] ?? '');

const directoryOf = (assetPath: string): string =>
  assetPath.includes('/') ? assetPath.slice(0, assetPath.lastIndexOf('/') + 1) : '';

export const findInitialChunks = async (html: string, readAsset: ReadAsset): Promise<string[]> => {
  const pending = findHtmlAssets(html);
  const seen = new Set<string>();
  for (let assetPath = pending.shift(); assetPath !== undefined; assetPath = pending.shift()) {
    if (seen.has(assetPath)) continue;
    seen.add(assetPath);
    if (assetPath.endsWith('.js')) {
      const imports = findStaticImports(await readAsset(assetPath));
      pending.push(...imports.map((imported) => `${directoryOf(assetPath)}${imported}`));
    }
  }
  return [...seen].sort();
};

export const matchesSizeLimitGlob = (assetPath: string, glob: string): boolean => {
  const pattern = glob
    .replace(/^dist\//, '')
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('[^/]*');
  return new RegExp(`^${pattern}$`).test(assetPath);
};
