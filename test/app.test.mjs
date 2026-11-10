// Run with: npm test   (node --test test/)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { buildSync } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mushaf-test-'));

async function load(entry) {
  const out = path.join(tmp, path.basename(entry).replace(/\.ts$/, '.mjs'));
  buildSync({ entryPoints: [path.join(root, entry)], bundle: true, format: 'esm', platform: 'node', outfile: out, logLevel: 'silent' });
  return import(out);
}

const RAW = fs.readFileSync(path.join(root, 'public/quran/quran-uthmani.txt'), 'utf8');
globalThis.fetch = async (url) => {
  if (String(url).endsWith('quran-uthmani.txt')) return new Response(RAW, { status: 200 });
  return new Response('not found', { status: 404 });
};
const tanzil = new Map();
for (const line of RAW.split('\n')) {
  const p = line.split('|');
  if (p.length === 3 && /^\d+$/.test(p[0])) tanzil.set(`${p[0]}:${p[1]}`, p[2]);
}

test('Quran text file is the Tanzil verbatim copy with its copyright block', () => {
  assert.equal(tanzil.size, 6236);
  assert.match(RAW, /Tanzil Quran Text \(Uthmani, Version 1\.1\)/);
  assert.match(RAW, /CHANGING IT IS NOT ALLOWED/);
});

test('loader returns every ayah exactly as in the Tanzil file', async () => {
  const q = await load('src/utils/quranText.ts');
  const quran = await q.loadQuran();
  let n = 0;
  for (let s = 1; s <= 114; s++) {
    const ayahs = await q.getSurahAyahs(s);
    for (const a of ayahs) {
      assert.equal(a.text, tanzil.get(`${s}:${a.numberInSurah}`));
      n++;
    }
  }
  assert.equal(n, 6236);
  assert.equal(quran.length, 114);
});

test('basmala is removed from ayah 1 of surahs 2-114 except 9, and nothing else changes', async () => {
  const q = await load('src/utils/quranText.ts');
  await q.loadQuran();
  const basmala = tanzil.get('1:1');
  for (let s = 1; s <= 114; s++) {
    const orig = tanzil.get(`${s}:1`);
    const shown = q.stripBasmala(s, 1, orig);
    if (s === 1 || s === 9) {
      assert.equal(shown, orig, `surah ${s} must be unchanged`);
    } else {
      assert.ok(orig.endsWith(shown), `surah ${s}: shown text must be the original tail`);
      assert.equal(orig.split(' ').length - 4, shown.split(' ').length, `surah ${s}: exactly 4 words removed`);
      assert.equal(q.arabicSkeleton(orig.split(' ').slice(0, 4).join(' ')), q.arabicSkeleton(basmala));
    }
    assert.equal(q.stripBasmala(s, 2, tanzil.get(`${s}:2`) || ''), tanzil.get(`${s}:2`) || '');
  }
  // 27:30 contains the basmala in the middle of the ayah: never touched
  assert.equal(q.stripBasmala(27, 30, tanzil.get('27:30')), tanzil.get('27:30'));
});

test('search finds Quran ayahs only, diacritic-insensitive', async () => {
  const q = await load('src/utils/quranText.ts');
  const r = await q.searchQuranLocal('الله نور السماوات والارض');
  assert.ok(r.hits.some((h) => h.surah === 24 && h.ayah === 35));
  const r2 = await q.searchQuranLocal('قل هو الله احد');
  assert.ok(r2.hits.some((h) => h.surah === 112 && h.ayah === 1));
});

test('ayah of the day label matches its verse and changes daily', async () => {
  const q = await load('src/utils/quranText.ts');
  const a = q.getAyahOfDayRef(new Date(2026, 10, 10));
  const b = q.getAyahOfDayRef(new Date(2026, 10, 11));
  assert.notDeepEqual(a, b);
  const text = await q.getDisplayAyahText(a.surah, a.ayah);
  assert.ok(text.length > 0 && tanzil.get(`${a.surah}:${a.ayah}`).endsWith(text));
});

test('juz / page metadata', async () => {
  const q = await load('src/utils/quranText.ts');
  assert.equal(q.getJuz(2, 142), 2);
  assert.equal(q.getPage(1, 1), 1);
  assert.equal(q.getPage(114, 6), 604);
  assert.deepEqual(q.juzFirstAyah(30), { surah: 78, ayah: 1 });
});

test('single-ayah audio follows the chosen reciter', async () => {
  const a = await load('src/utils/quranAudio.ts');
  for (const r of a.RECITERS) {
    const urls = a.getAyahAudioCandidates(2, 255, r);
    assert.ok(urls[0].includes(`/${r.everyayah}/002255.mp3`), r.name);
  }
});

test('service worker never caches the server API; no AI chat section', () => {
  const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8');
  assert.match(sw, /pathname\.startsWith\('\/api\/'\)\) return;/);
  const types = fs.readFileSync(path.join(root, 'src/types.ts'), 'utf8');
  assert.ok(!/'ask'/.test(types));
  assert.ok(!fs.existsSync(path.join(root, 'api/chat.ts')));
});

test('index.html: zoom allowed, manifest and icons linked', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(!/user-scalable=no|maximum-scale=1/.test(html));
  assert.match(html, /rel="manifest"/);
  const m = JSON.parse(fs.readFileSync(path.join(root, 'public/manifest.json'), 'utf8'));
  for (const i of m.icons) assert.ok(fs.existsSync(path.join(root, 'public', i.src)), i.src);
  assert.ok(m.icons.some((i) => i.purpose === 'maskable'));
});

test('ruqyah: verse list matches the requested ranges and comes from Tanzil text', async () => {
  const r = await load('src/data/ruqyah.ts');
  const list = r.ruqyahAyahList();
  assert.equal(list.length, 79);
  const want = [[1,1,7],[2,1,5],[2,102,102],[2,163,164],[2,255,255],[2,285,286],[3,18,19],[7,117,122],[10,81,82],[20,69,69],[23,115,118],[37,1,10],[46,29,32],[55,33,36],[59,21,24],[72,1,9],[112,1,4],[113,1,5],[114,1,6]];
  assert.deepEqual(r.RUQYAH_RANGES.map((x) => [x.surah, x.from, x.to]), want);
  const q = await load('src/utils/quranText.ts');
  for (const it of list) {
    const t = await q.getAyahText(it.surah, it.ayah);
    assert.equal(t, tanzil.get(`${it.surah}:${it.ayah}`), `${it.surah}:${it.ayah}`);
  }
  // the source file holds no Quran text of its own
  const src = fs.readFileSync(path.join(root, 'src/data/ruqyah.ts'), 'utf8');
  assert.ok(!src.includes(tanzil.get('2:255').slice(0, 20)));
});

test('ruqyah duas: each has a sunnah.com source and text', async () => {
  const r = await load('src/data/ruqyah.ts');
  assert.ok(r.RUQYAH_DUAS.length >= 2);
  for (const d of r.RUQYAH_DUAS) {
    assert.match(d.url, /^https:\/\/sunnah\.com\/(muslim|bukhari):\d+[a-z]?$/);
    assert.ok(d.text.length > 20 && /[صحيح]/.test(d.source));
  }
});

test('designs: six distinct layouts with Arabic names', async () => {
  const d = await load('src/data/designStyles.ts');
  assert.deepEqual(d.DESIGN_IDS, ['modern', 'mushaf_page', 'cards', 'minimal', 'grid', 'drawer']);
  for (const s of d.DESIGN_STYLES) assert.ok(s.nameAr && s.descAr);
  const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');
  for (const cls of ['.mushaf-page', '.ayah-card', '.minimal-reader', '.gh-tiles', '.list-reader']) assert.ok(css.includes(cls), cls);
});
