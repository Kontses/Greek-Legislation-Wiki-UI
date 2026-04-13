# Greek Legislation Wiki

An LLM-maintained personal wiki for Greek legislation. The LLM reads, summarizes, cross-references, and maintains structured markdown pages — you curate sources and ask questions.

Built on the [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) pattern.

## Setup

```bash
# Install the PDF parsing dependency
pip install -r scripts/requirements.txt
```

Optionally, open the project in [Obsidian](https://obsidian.md/) for graph view, wikilink navigation, and Dataview queries.

## Usage

### 1. Add a source PDF

Drop a PDF into `raw/` and convert it to markdown:

```bash
python scripts/parse_pdfs.py                      # convert all new PDFs
python scripts/parse_pdfs.py raw/some-file.pdf     # convert a specific file
python scripts/parse_pdfs.py --force               # re-convert all
python scripts/parse_pdfs.py --ocr                 # enable OCR for scanned documents
```

Converted markdown appears in `raw/parsed/`.

### 2. Ingest into the wiki

Tell the LLM:

```
ingest <filename>
```

The LLM reads the parsed markdown, discusses key points with you, then creates/updates legislation pages, entity pages, concept pages, source summaries, index, and log.

### 3. Query the wiki

Ask any question. The LLM searches the index, reads relevant pages, and synthesizes an answer with wikilink citations. Results can be filed as analysis pages.

### 4. Lint the wiki

```
lint
```

The LLM checks for orphan pages, broken wikilinks, contradictions, missing data, and broken amendment chains.

## Project structure

```
raw/                     Source PDFs (immutable)
raw/parsed/              Docling-converted markdown
wiki/                    LLM-maintained pages
  legislation/2024/      Laws organized by year
  sources/               One summary per ingested source
  entities/              Ministries, courts, persons, institutions
  concepts/              Legal frameworks, principles
  analyses/              Filed query results
  index.md               Auto-maintained catalog
  log.md                 Chronological activity log
scripts/                 PDF parsing tooling
CLAUDE.md                Schema governing LLM behavior
```

## LLM actions reference

| Command | What it does |
|---|---|
| `ingest <file>` | Process a parsed source into wiki pages |
| `ingest all` | Process all unprocessed files in `raw/parsed/` |
| `lint` | Health-check the wiki for issues |
| Any question | Query the wiki and get a cited answer |

See `CLAUDE.md` for full workflow details and conventions.
