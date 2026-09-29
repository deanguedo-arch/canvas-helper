/**
 * AB30 source-locator links (progressive enhancement, R09-freeze-safe).
 *
 * The textbook is woven into the course (assets/library/chapter-N.pdf),
 * so source cards should not read like citations of a supplied PDF. This
 * script upgrades every rendered `.source-card` whose locator names a
 * woven chapter page:
 *
 *   "Chapter 6, printed p. 204 (supplied PDF p. 212)"
 *     -> "Chapter 6, printed p. 204" + [Read here at page 204]
 *
 * The button reuses the frozen main.js reader flow verbatim: it carries
 * `data-open-chapter` / `data-chapter-page` (PRINTED page) and the
 * existing content-body delegation opens the chapter viewer dialog at
 * the right page. Locators without a woven target (the five
 * Walking Together readings, external University of Alberta material)
 * are left untouched.
 *
 * No frozen file is modified: this script observes `#content-body` and
 * enhances cards after render. Safe to load in non-DOM environments
 * (API only, no boot).
 */
(function (global) {
  'use strict';

  var CHAPTER_FILES = {
    1: './assets/library/chapter-1.pdf',
    2: './assets/library/chapter-2.pdf',
    3: './assets/library/chapter-3.pdf',
    4: './assets/library/chapter-4.pdf',
    5: './assets/library/chapter-5.pdf',
    6: './assets/library/chapter-6.pdf',
    7: './assets/library/chapter-7.pdf'
  };

  var LOCATOR_RE = /Chapter (\d+)[^,]*, printed p\. (\d+)/;
  var SUPPLIED_TAIL_RE = /\s*\(supplied PDF p\. \d+\)/g;

  /**
   * Parse a woven-chapter locator. Returns
   * { file, printedPage, chapter } or null when the locator names no
   * woven target (e.g. Walking Together readings).
   */
  function parseChapterLocator(text) {
    var match = LOCATOR_RE.exec(String(text || ''));
    if (!match) return null;
    var chapter = Number(match[1]);
    var printedPage = Number(match[2]);
    if (!CHAPTER_FILES[chapter] || !Number.isInteger(printedPage) || printedPage < 1) return null;
    return { file: CHAPTER_FILES[chapter], printedPage: printedPage, chapter: chapter };
  }

  /** Drop the "(supplied PDF p. N)" tail; the viewer button does that job. */
  function stripSuppliedTail(text) {
    return String(text || '').replace(SUPPLIED_TAIL_RE, '');
  }

  function escapeAttr(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Button HTML using the exact data contract main.js delegates on. */
  function locatorButtonHtml(target) {
    return '<button type="button" class="social-reading-link"' +
      ' data-open-chapter="' + escapeAttr(target.file) + '"' +
      ' data-chapter-page="' + escapeAttr(String(target.printedPage)) + '"' +
      ' data-chapter-title="Chapter ' + escapeAttr(String(target.chapter)) + '"' +
      '>Read here at page ' + escapeAttr(String(target.printedPage)) + '</button>';
  }

  function locatorTextOf(card) {
    var divs = card.querySelectorAll('dl > div');
    for (var i = 0; i < divs.length; i += 1) {
      var dt = divs[i].querySelector('dt');
      var dd = divs[i].querySelector('dd');
      if (dt && dd && dt.textContent.trim() === 'Locator') return dd.textContent;
    }
    var head = card.querySelector('.source-head');
    return head ? head.textContent : '';
  }

  function stripTailsIn(card) {
    var head = card.querySelector('.source-head');
    if (head) {
      var nodes = head.childNodes;
      for (var i = 0; i < nodes.length; i += 1) {
        if (nodes[i].nodeType === 3) {
          nodes[i].nodeValue = stripSuppliedTail(nodes[i].nodeValue);
        }
      }
    }
    var divs = card.querySelectorAll('dl > div');
    for (var j = 0; j < divs.length; j += 1) {
      var dt = divs[j].querySelector('dt');
      var dd = divs[j].querySelector('dd');
      if (dt && dd && dt.textContent.trim() === 'Locator') {
        dd.textContent = stripSuppliedTail(dd.textContent);
      }
    }
  }

  function enhanceCard(card) {
    if (!card || card.getAttribute('data-locator-links')) return false;
    var target = parseChapterLocator(locatorTextOf(card));
    if (!target) {
      card.setAttribute('data-locator-links', 'skip');
      return false;
    }
    stripTailsIn(card);
    var quote = card.querySelector('blockquote');
    if (quote && quote.parentNode) {
      var doc = card.ownerDocument;
      var line = doc.createElement('p');
      line.className = 'check-source';
      line.textContent = 'Find this in the textbook: ';
      var button = doc.createElement('button');
      button.setAttribute('type', 'button');
      button.className = 'social-reading-link';
      button.setAttribute('data-open-chapter', target.file);
      button.setAttribute('data-chapter-page', String(target.printedPage));
      button.setAttribute('data-chapter-title', 'Chapter ' + target.chapter);
      button.textContent = 'Read here at page ' + target.printedPage;
      line.appendChild(button);
      quote.parentNode.insertBefore(line, quote.nextSibling);
    }
    card.setAttribute('data-locator-links', 'done');
    return true;
  }

  /** Enhance every unprocessed source card under root. Returns count. */
  function enhanceAll(root) {
    var scope = root || (typeof document !== 'undefined' ? document : null);
    if (!scope || typeof scope.querySelectorAll !== 'function') return 0;
    var cards = scope.querySelectorAll('.source-card:not([data-locator-links])');
    var enhanced = 0;
    for (var i = 0; i < cards.length; i += 1) {
      if (enhanceCard(cards[i])) enhanced += 1;
    }
    return enhanced;
  }

  var api = {
    parseChapterLocator: parseChapterLocator,
    stripSuppliedTail: stripSuppliedTail,
    locatorButtonHtml: locatorButtonHtml,
    enhanceAll: enhanceAll
  };

  if (global) {
    global.AB30LocatorLinks = api;
  }

  // Boot only where a live DOM exists; vm/test harnesses get the API.
  if (typeof document !== 'undefined' && typeof MutationObserver !== 'undefined') {
    var boot = function () {
      var body = document.getElementById('content-body') || document.body;
      enhanceAll(body);
      var observer = new MutationObserver(function () {
        enhanceAll(body);
      });
      observer.observe(body, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
  }
})(typeof window !== 'undefined' ? window : globalThis);
