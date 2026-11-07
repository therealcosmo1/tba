import { GRAMMAR, DIRS, PARSER_WORDS, compileGrammar } from './grammar.js';
import { messageTable } from './messages.js';

// Builds the parser's lookup tables from raw content. Safe to call more than once.
export function prepare(raw) {
  if (raw.prepared) return raw;
  // The game's own verbs come first, so they win when a pattern matches the same words.
  const lines = compileGrammar([...(raw.grammar ?? []), ...GRAMMAR]);
  const vocab = new Set([...PARSER_WORDS, ...Object.keys(DIRS)]);
  const verbWords = new Set();
  for (const line of lines) {
    for (const t of line.tokens) if (t[0] !== '[') vocab.add(t);
    if (line.tokens[0][0] !== '[') verbWords.add(line.tokens[0]);
  }
  for (const [id, o] of Object.entries(raw.objects)) {
    o.id = id;
    // Players can refer to a thing by its nouns, its adjectives, or any word of its name
    // ("glass of wine", "guests by the wine table").
    const nameWords = (o.name ?? '').toLowerCase().replace(/[’']/g, '').split(/[^a-z0-9-]+/).filter(Boolean);
    o.words = new Set([...(o.names ?? []), ...(o.adj ?? []), ...nameWords]);
    for (const word of o.words) vocab.add(word);
  }
  return { ...raw, prepared: true, lines, vocab, verbWords, messages: messageTable(raw.messages) };
}
