/*
 * EasyEnglish word-glossary enhancement.
 * On each lesson page, read THIS page's "单词" section, make the
 * headwords/短语 clickable in the 课文 text, and on tap reveal a small
 * card showing ONLY that one entry (word + 音标 + 词性 + 中文 + 例句).
 * No-op on pages that have no 单词 section (e.g. normal blog posts).
 */
(function () {
  'use strict';
  if (typeof document === 'undefined') return;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(init);

  function cleanText(el) {
    // Strip any trailing headerlink glyph the theme may inject, plus trailing ws.
    return el.textContent.replace(/\s+[#¶]\s*$/, '').trim();
  }

  function init() {
    var wordH3 = findWordHeading();
    if (!wordH3) return;

    var entries = parseEntries(wordH3);
    if (!entries.length) return;

    var map = {};
    entries.forEach(function (e) { map[e.key] = e; });

    // 课文 region = every <p> that appears BEFORE the first <h2> ("笔记").
    var paras = paragraphsBeforeFirstH2();
    if (!paras.length) return;

    // Longest-first so phrases win over single words at the same position.
    var heads = entries.map(function (e) { return e.head; })
                      .sort(function (a, b) { return b.length - a.length; });
    var escaped = heads.map(function (h) {
      return h.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    });
    var re = new RegExp('\\b(' + escaped.join('|') + ')\\b', 'gi');

    paras.forEach(function (p) {
      p.innerHTML = p.innerHTML.replace(re, function (m) {
        return '<span class="gword" data-g="' + m.toLowerCase() + '">' + m + '</span>';
      });
    });

    // Popover.
    var card = document.createElement('div');
    card.className = 'gcard';
    card.setAttribute('hidden', '');
    document.body.appendChild(card);

    document.addEventListener('click', function (ev) {
      var span = (ev.target && ev.target.closest) ? ev.target.closest('.gword') : null;
      if (span) {
        ev.stopPropagation();
        show(card, span, map[span.getAttribute('data-g')]);
      } else if (!card.contains(ev.target)) {
        card.setAttribute('hidden', '');
      }
    }, true);
    window.addEventListener('scroll', function () {
      card.setAttribute('hidden', '');
    }, { passive: true });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') card.setAttribute('hidden', '');
    });
  }

  function findWordHeading() {
    var hs = document.querySelectorAll('h3');
    for (var i = 0; i < hs.length; i++) {
      var t = cleanText(hs[i]);
      if (t === '单词' || t.indexOf('单词') === 0) return hs[i];
    }
    return null;
  }

  function parseEntries(wordH3) {
    var out = [];
    var el = wordH3.nextElementSibling;
    while (el && !/^H[123]$/.test(el.tagName)) {
      if (el.tagName === 'H4') {
        var text = cleanText(el);
        var slash = text.indexOf('/');
        var head = (slash > 0 ? text.slice(0, slash) : text).trim();
        // first 例句 blockquote that follows (EN + ZH lines)
        var ex = '';
        var sib = el.nextElementSibling;
        while (sib && !/^H[1234]$/.test(sib.tagName)) {
          if (sib.tagName === 'BLOCKQUOTE') { ex = sib.textContent.trim(); break; }
          sib = sib.nextElementSibling;
        }
        if (head) out.push({ head: head, key: head.toLowerCase(), line: text, ex: ex });
      }
      el = el.nextElementSibling;
    }
    return out;
  }

  function paragraphsBeforeFirstH2() {
    var h2 = document.querySelector('h2');
    if (!h2) return [];
    var out = [];
    var all = document.querySelectorAll('p');
    for (var i = 0; i < all.length; i++) {
      // all[i] is before h2  <=>  h2 follows all[i]  =>  FOLLOWING bit set
      if (all[i].compareDocumentPosition(h2) & Node.DOCUMENT_POSITION_FOLLOWING) out.push(all[i]);
    }
    return out;
  }

  function show(card, span, entry) {
    if (!entry) { card.setAttribute('hidden', ''); return; }
    card.innerHTML = '';
    var line = document.createElement('div');
    line.className = 'gc-line';
    line.textContent = entry.line;
    card.appendChild(line);
    if (entry.ex) {
      var ex = document.createElement('div');
      ex.className = 'gc-ex';
      ex.textContent = entry.ex;
      card.appendChild(ex);
    }
    card.removeAttribute('hidden');

    var r = span.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    var cw = card.offsetWidth || Math.round(vw * 0.8);
    var ch = card.offsetHeight || 140;
    var left = Math.round(r.left);
    if (left + cw > vw - 8) left = Math.max(8, vw - cw - 8);
    if (left < 8) left = 8;
    var top = r.top - ch - 12;                 // prefer above the word
    if (top < 8) top = Math.min(r.bottom + 12, vh - ch - 8);
    if (top < 8) top = 8;
    card.style.left = left + 'px';
    card.style.top = top + 'px';

    span.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
})();
