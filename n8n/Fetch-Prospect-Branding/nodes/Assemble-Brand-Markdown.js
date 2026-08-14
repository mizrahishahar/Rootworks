const raw = $input.first().json;
const brand = (raw && raw.body) ? raw.body : raw;
const company = $('Get Company Record').item.json;
const name = company.Name || brand.name || 'Brand';

function firstLogo(logos) {
  if (!Array.isArray(logos) || logos.length === 0) return '';
  for (const l of logos) {
    if (l && Array.isArray(l.formats) && l.formats.length) {
      const f = l.formats.find(x => x && x.src) || l.formats[0];
      if (f && f.src) return f.src;
    }
  }
  return '';
}

const logo = firstLogo(brand.logos);
const colors = (brand.colors || []).map(c => c && c.hex).filter(Boolean);
const fonts = (brand.fonts || []).map(f => f && f.name).filter(Boolean);
const links = brand.links || [];
function findLink(n) { const l = links.find(x => x && x.name === n); return l ? l.url : ''; }

const linkedin = findLink('linkedin');
const twitter = findLink('twitter');
const instagram = findLink('instagram');
const tiktok = findLink('tiktok');
const youtube = findLink('youtube');
const facebook = findLink('facebook');

let md = '# Brand \u2014 ' + name + '\n\n';
md += '_Source: Brandfetch \u00b7 Domain: ' + (company.domain || '') + '_\n\n';

md += '## Logo\n\n';
if (logo) {
  md += '![Logo](' + logo + ')\n\n';
  md += 'URL: ' + logo + '\n\n';
} else {
  md += '_None found._\n\n';
}

md += '## Colors\n\n';
if (colors.length) {
  for (const c of colors) md += '- ' + c + '\n';
  md += '\n';
} else {
  md += '_None found._\n\n';
}

md += '## Fonts\n\n';
md += (fonts.length ? fonts.join(', ') : '_None found._') + '\n\n';

md += '## Social\n\n';
const socials = [
  ['LinkedIn', linkedin],
  ['Twitter', twitter],
  ['Instagram', instagram],
  ['TikTok', tiktok],
  ['YouTube', youtube],
  ['Facebook', facebook]
];
let anySocial = false;
for (const [label, url] of socials) {
  if (url) { md += '- ' + label + ': ' + url + '\n'; anySocial = true; }
}
if (!anySocial) md += '_None found._\n';
md += '\n';

return [{ json: { brand: name, markdown: md } }];