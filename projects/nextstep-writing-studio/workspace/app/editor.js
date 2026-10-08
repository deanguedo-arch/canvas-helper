import { Schema, DOMSerializer } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { history, undo, redo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap, toggleMark, setBlockType } from 'prosemirror-commands';
import { wrapInList, liftListItem, sinkListItem } from 'prosemirror-schema-list';
import { uid } from './model.js';

const blockAttr = { id: { default: null } };
const withId = tag => node => [tag, { 'data-block-id': node.attrs.id }, 0];
export const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { attrs: blockAttr, content: 'inline*', group: 'block', parseDOM: [{ tag: 'p', getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid() }) }], toDOM: withId('p') },
    heading: { attrs: { id: { default: null }, level: { default: 2 } }, content: 'inline*', group: 'block', defining: true,
      parseDOM: [2, 3].map(level => ({ tag: `h${level}`, getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid(), level }) })),
      toDOM: node => [`h${node.attrs.level}`, { 'data-block-id': node.attrs.id }, 0] },
    blockquote: { attrs: blockAttr, content: 'block+', group: 'block', defining: true,
      parseDOM: [{ tag: 'blockquote', getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid() }) }], toDOM: withId('blockquote') },
    bullet_list: { attrs: blockAttr, content: 'list_item+', group: 'block',
      parseDOM: [{ tag: 'ul', getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid() }) }], toDOM: withId('ul') },
    ordered_list: { attrs: { id: { default: null }, order: { default: 1 } }, content: 'list_item+', group: 'block',
      parseDOM: [{ tag: 'ol', getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid(), order: Number(element.getAttribute('start') || 1) }) }],
      toDOM: node => ['ol', { 'data-block-id': node.attrs.id, start: node.attrs.order }, 0] },
    list_item: { attrs: blockAttr, content: 'paragraph block*',
      parseDOM: [{ tag: 'li', getAttrs: element => ({ id: element.getAttribute('data-block-id') || uid() }) }], toDOM: withId('li') },
    text: { group: 'inline' },
    hard_break: { inline: true, group: 'inline', selectable: false, parseDOM: [{ tag: 'br' }], toDOM: () => ['br'] }
  },
  marks: {
    strong: { parseDOM: [{ tag: 'strong' }, { tag: 'b' }], toDOM: () => ['strong', 0] },
    em: { parseDOM: [{ tag: 'em' }, { tag: 'i' }], toDOM: () => ['em', 0] },
    underline: { parseDOM: [{ tag: 'u' }], toDOM: () => ['u', 0] },
    link: { attrs: { href: {} }, inclusive: false,
      parseDOM: [{ tag: 'a[href]', getAttrs: element => {
        const href = element.getAttribute('href');
        try { return ['http:', 'https:'].includes(new URL(href).protocol) ? { href } : false; } catch { return false; }
      } }], toDOM: mark => ['a', { href: mark.attrs.href, rel: 'noopener noreferrer', target: '_blank' }, 0] }
  }
});

function normalizedJson(doc) {
  const seen = new Set();
  const walk = node => {
    if (node.type !== 'text' && node.type !== 'hard_break' && node.type !== 'doc') {
      node.attrs ||= {};
      if (!node.attrs.id || seen.has(node.attrs.id)) node.attrs.id = uid();
      seen.add(node.attrs.id);
    }
    if (node.type !== 'text' && node.type !== 'hard_break') {
      node.content ||= [];
      node.content.forEach(walk);
    }
  };
  walk(doc);
  return doc;
}

function scrubHtml(html) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script,style,iframe,object,embed,svg,math,img,video,audio,link,meta,form,input,button').forEach(node => node.remove());
  parsed.querySelectorAll('*').forEach(node => {
    for (const attr of [...node.attributes]) {
      if (attr.name === 'href' && node.tagName === 'A') {
        try { if (['http:', 'https:'].includes(new URL(attr.value).protocol)) continue; } catch { /* remove below */ }
      }
      if (attr.name === 'start' && node.tagName === 'OL' && /^\d+$/.test(attr.value)) continue;
      node.removeAttribute(attr.name);
    }
  });
  return parsed.body.innerHTML;
}

export class DraftEditor {
  constructor(host, docJson, onChange, onError) {
    this.host = host; this.onChange = onChange; this.onError = onError;
    const doc = schema.nodeFromJSON(docJson);
    doc.check();
    this.state = EditorState.create({ doc, plugins: [history(),
      keymap({ 'Mod-b': toggleMark(schema.marks.strong), 'Mod-i': toggleMark(schema.marks.em),
        'Mod-u': toggleMark(schema.marks.underline), 'Mod-z': undo, 'Mod-Shift-z': redo, 'Mod-y': redo,
        'Mod-[': liftListItem(schema.nodes.list_item), 'Mod-]': sinkListItem(schema.nodes.list_item) }),
      keymap(baseKeymap)] });
    this.view = new EditorView(host, { state: this.state,
      dispatchTransaction: transaction => {
        const next = this.view.state.apply(transaction);
        if (transaction.docChanged) {
          const json = normalizedJson(next.doc.toJSON());
          if ([...next.doc.textContent].length > 200000) { this.onError('Draft is at its 200,000-character limit.'); return; }
          try { this.onChange(json); } catch (error) { this.onError(String(error)); return; }
        }
        this.view.updateState(next);
      },
      transformPastedHTML: scrubHtml,
      attributes: { 'aria-label': 'Draft editor', 'data-testid': 'draft-editor', spellcheck: 'true' }
    });
  }
  move(host) { host.appendChild(this.view.dom); this.host = host; }
  command(name) {
    const commands = { bold: toggleMark(schema.marks.strong), italic: toggleMark(schema.marks.em),
      underline: toggleMark(schema.marks.underline), paragraph: setBlockType(schema.nodes.paragraph, { id: uid() }),
      heading: setBlockType(schema.nodes.heading, { id: uid(), level: 2 }),
      bullet: wrapInList(schema.nodes.bullet_list, { id: uid() }),
      numbered: wrapInList(schema.nodes.ordered_list, { id: uid(), order: 1 }), undo, redo };
    const command = commands[name];
    if (command) command(this.view.state, this.view.dispatch, this.view);
    this.view.focus();
  }
  insertEvidence(text, asQuote = false) {
    const type = asQuote ? schema.nodes.blockquote : schema.nodes.paragraph;
    const paragraph = schema.nodes.paragraph.create({ id: uid() }, text ? schema.text(text) : null);
    const node = asQuote ? type.create({ id: uid() }, paragraph) : paragraph;
    this.view.dispatch(this.view.state.tr.replaceSelectionWith(node).scrollIntoView());
    return asQuote ? paragraph.attrs.id : node.attrs.id;
  }
  link(href) {
    let url;
    try { url = new URL(href); } catch { throw Error('Enter a complete http or https link.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw Error('Only http and https links are supported.');
    toggleMark(schema.marks.link, { href: url.href })(this.view.state, this.view.dispatch, this.view);
  }
  document() { return normalizedJson(this.view.state.doc.toJSON()); }
  html() {
    const wrap = document.createElement('div');
    wrap.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(this.view.state.doc.content));
    wrap.querySelectorAll('[data-block-id]').forEach(node => node.removeAttribute('data-block-id'));
    return wrap.innerHTML;
  }
  text() { return this.view.state.doc.textBetween(0, this.view.state.doc.content.size, '\n\n'); }
  destroy() { this.view.destroy(); }
}
