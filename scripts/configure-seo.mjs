// Run only after checking HTTPS, .html routing, www redirects and Workers redirect.
import { readFile, writeFile } from 'node:fs/promises';
const args = process.argv.slice(2);
const originArg = args.find(arg => arg.startsWith('--origin='));
if (!originArg || !args.includes('--routing-verified')) {
  throw new Error('Verify production routing first; then use --origin=https://dreambakerz.com --routing-verified');
}
const origin = new URL(originArg.slice('--origin='.length));
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw new Error('Use a bare HTTPS production origin.');
const root = new URL('../', import.meta.url);
const pages = ['index','catalog','order','about','contact'];
for (const page of pages) {
  const path = new URL(`${page}.html`, root);
  let html = await readFile(path, 'utf8');
  const url = new URL(page === 'index' ? '/' : `/${page}.html`, origin).href;
  const image = new URL('/assets/cakes/optimized/share.jpg', origin).href;
  html = html.replace(/<link rel="canonical"[^>]*>\n?/g, '').replace(/<meta property="og:url"[^>]*>\n?/g, '');
  html = html.replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${image}">`);
  html = html.replace('</head>', `  <link rel="canonical" href="${url}">\n  <meta property="og:url" content="${url}">\n</head>`);
  await writeFile(path, html);
}
const locations = pages.map(page => new URL(page === 'index' ? '/' : `/${page}.html`, origin).href);
await writeFile(new URL('sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locations.map(url => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(new URL('robots.txt', root), `User-agent: *\nAllow: /\nDisallow: /docs/\nDisallow: /scripts/\nDisallow: /tests/\nSitemap: ${new URL('/sitemap.xml', origin).href}\n`);
console.log('Production canonicals, absolute social images, sitemap and robots configured. No deployment performed.');
