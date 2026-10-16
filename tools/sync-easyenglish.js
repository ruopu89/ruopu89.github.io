/*
 * Rebuild the EasyEnglish lesson pages under
 *   source/easyenglish/newconceptenglish/
 * from the .md lessons in the talk-with-hermes repo (single source of truth).
 *
 * Run with:  node tools/sync-easyenglish.js
 * (Lives OUTSIDE scripts/ on purpose: Hexo auto-loads scripts/*.js as plugins,
 *  which would choke on this standalone CLI script.)
 *
 * Each lesson .md is copied with a minimal front-matter (title) so Hexo renders
 * it as a page at /easyenglish/newconceptenglish/<slug>/. A list page
 * (index.md) is (re)generated too. Generated files are gitignored; run this
 * on every build.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.join(__dirname, '..');
const OUT = path.join(REPO, 'source', 'easyenglish', 'newconceptenglish');
const TWH = process.env.TALK_WITH_HERMES || path.join(REPO, '..', 'talk-with-hermes');
const SRC = path.join(TWH, 'EasyEnglish', 'newconceptenglish');
const SERIES = 'newconceptenglish';

function slug(name) {
  return name.replace(/\.md$/, '').toLowerCase().replace(/_/g, '-');
}
function titleFrom(name) {
  const m = name.replace(/\.md$/, '').match(/^Lesson(\d+)-(.*)$/i);
  return m ? ('Lesson ' + m[1] + ' · ' + m[2].replace(/_/g, ' '))
           : name.replace(/\.md$/, '').replace(/_/g, ' ');
}
function lessonNum(name) {
  const m = name.match(/Lesson(\d+)/i);
  return m ? parseInt(m[1], 10) : 9999;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.error('LESSON SOURCE NOT FOUND: ' + SRC);
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  const files = fs.readdirSync(SRC)
    .filter((f) => /^Lesson\d+-.+\.md$/i.test(f))
    .sort((a, b) => lessonNum(a) - lessonNum(b) || a.localeCompare(b));

  // drop stale generated pages that no longer exist in the source
  const keep = new Set(files.map(slug));
  for (const existing of fs.readdirSync(OUT)) {
    if (existing === 'index.md') continue;
    if (!keep.has(existing.replace(/\.md$/, ''))) fs.unlinkSync(path.join(OUT, existing));
  }

  const rows = [];
  for (const f of files) {
    const content = fs.readFileSync(path.join(SRC, f), 'utf8');
    const s = slug(f);
    const title = titleFrom(f);
    const fm = '---\ntitle: "' + title.replace(/"/g, '\\"') + '"\n---\n\n';
    fs.writeFileSync(path.join(OUT, s + '.md'), fm + content);
    // hexo emits pages as flat "<slug>.html"; link to that physical file so the
    // URLs resolve on GitHub Pages regardless of permalink_defaults.
    rows.push({ n: lessonNum(f), title: title, url: '/easyenglish/' + SERIES + '/' + s + '.html' });
  }

  const idx = [
    '---',
    'title: "新概念英语 New Concept English"',
    '---',
    '',
    '# 新概念英语 New Concept English',
    '',
    '正文里**带虚线下划线的词**可点按，弹出该词在这一课里的释义（音标 + 词性 + 中文 + 例句），只显示这一条。',
    '',
    '[← 返回 EasyEnglish](/easyenglish/)',
    '',
  ];
  for (const r of rows) {
    idx.push('- [Lesson ' + r.n + ' · ' + r.title.replace(/^Lesson \d+ · /, '') + '](' + r.url + ')');
  }
  idx.push('');
  fs.writeFileSync(path.join(OUT, 'index.md'), idx.join('\n'));

  console.log('synced ' + rows.length + ' lessons -> ' + OUT);
}

if (require.main === module) main();
