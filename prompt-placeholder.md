# Setup: LLM Wiki

I want to set up an LLM-maintained personal wiki in this empty repository, following the "LLM Wiki" pattern. Here's what I need you to do:

## 1. Create the directory structure

```
raw/           # Immutable source documents (articles, papers, notes, etc.)
raw/assets/    # Images and attachments from sources
wiki/          # LLM-generated and LLM-maintained markdown pages
wiki/sources/  # One summary page per ingested source
wiki/entities/ # Pages for people, orgs, places, products, etc.
wiki/concepts/ # Pages for ideas, frameworks, themes, methods, etc.
wiki/analyses/ # Filed query results, comparisons, syntheses
```

## 2. Create the schema file (CLAUDE.md)

This is the key file that governs how the wiki operates. It should define:

### Conventions
- Pages are named in `kebab-case.md`
- Every page gets YAML frontmatter with: `title`, `created`, `updated`, `tags`, `sources` (list of source filenames that informed this page)
- Cross-references use standard `[[wikilinks]]` (Obsidian-compatible)
- When a page references an entity or concept, always wikilink it — even if the target page doesn't exist yet (it signals a page worth creating)

### Page types (with templates)
- **Source summary** (`wiki/sources/`): title, author, date, type, one-paragraph summary, key claims (bulleted), entities and concepts mentioned (wikilinked), direct quotes worth preserving
- **Entity page** (`wiki/entities/`): who/what it is, key facts, role in the domain, related entities, source appearances
- **Concept page** (`wiki/concepts/`): definition, why it matters, related concepts, how different sources treat it, open questions
- **Analysis page** (`wiki/analyses/`): question posed, methodology, findings, implications, wikilinks to supporting pages

### Workflows

**Ingest** — when I say "ingest [filename]" or "ingest all new files in raw/":
1. Read the source file from `raw/`
2. Discuss key takeaways with me before writing anything
3. Create a source summary page in `wiki/sources/`
4. Create or update relevant entity pages in `wiki/entities/`
5. Create or update relevant concept pages in `wiki/concepts/`
6. Update `wiki/index.md` with new/changed pages
7. Append an entry to `wiki/log.md`
8. List all pages touched so I can review them

**Query** — when I ask a question:
1. Read `wiki/index.md` to identify relevant pages
2. Read those pages
3. Synthesize an answer with `[[wikilink]]` citations to wiki pages
4. Ask me if the answer should be filed as a new analysis page in `wiki/analyses/`

**Lint** — when I say "lint":
1. Scan for orphan pages (no inbound links)
2. Find broken or dangling wikilinks (linked but page doesn't exist)
3. Detect contradictions between pages
4. Flag stale claims superseded by newer sources
5. Identify concepts mentioned frequently but lacking their own page
6. Check for pages with no source attribution
7. Report findings and suggest fixes — wait for my approval before changing anything

### Rules
- **Never** modify anything in `raw/`. It is immutable.
- **Always** update `wiki/index.md` and `wiki/log.md` after any wiki change.
- Prefer updating existing pages over creating duplicates.
- When new information contradicts existing wiki content, flag the contradiction explicitly with a `> [!warning]` callout rather than silently overwriting.
- When unsure about categorization or emphasis, ask me.
- Always run a lint after an ingest.

## 3. Create the seed files

### `wiki/index.md`
A structured index with these sections, each ready to receive entries in the format `- [[page-name]] — one-line description`:

- **Sources** — ingested source summaries
- **Entities** — people, organizations, places, products
- **Concepts** — ideas, frameworks, themes, methods
- **Analyses** — filed query results and syntheses

Include a note at the top: *"This index is auto-maintained by the LLM. Do not edit manually."*

### `wiki/log.md`
An empty log with a header explaining the format:
```
## [YYYY-MM-DD] action | Subject
action is one of: ingest, query, lint, update
```

### `wiki/overview.md`
A placeholder synthesis page with a note: *"This page will be auto-generated once enough sources have been ingested to support a meaningful overview."*

### `.gitignore`
Standard ignores: `.DS_Store`, `Thumbs.db`, `.obsidian/workspace.json` (keep other Obsidian config), `node_modules/`, `.env`

## 4. My domain

**Topic/domain**: Ένας κατάλογος από νόμους του Ελληνικού Κράτους. Με ενδιαφέρει τα κείμενα να είναι χωρισμένα ανά έτος. Οι κατάλογοι νομοθεσίας είναι οι εξής: "Νόμος", "Προεδρικό Διάταγμα", "Πράξη Νομοθετικού Περιεχομένου", "Βασιλικό Διάταγμα", "Νομοθετικό Προεδρικό Διάταγμα", "Νομοθετικό Διάταγμα", "Αναγκαστικός Νόμος". Επίσης με ενδιαφέρει και αναζήτηςη με Αριθμό Νόμου ή Διατάγματος.

**Adjust accordingly**: add domain-specific page types, extra frontmatter fields, or custom categories that make sense for this domain. For example:
- A research wiki might want `wiki/papers/` with fields for `methodology`, `sample_size`, `findings`
- A book wiki might want `wiki/characters/`, `wiki/places/`, `wiki/themes/`
- A business wiki might want `wiki/competitors/`, `wiki/customers/`, `wiki/decisions/`

Propose any domain-specific additions and check with me before creating them.

## 5. When you're done

- Summarize everything you created
- Show me the file tree
- Then ask me to drop my first source into `raw/` so we can do the first ingest together
