# Greek Legislation Wiki 🏛️

Ένα προηγμένο, αυτοματοποιημένο σύστημα Νομικής Πληροφορικής (Legal Information System) για την ελληνική νομοθεσία, που αξιοποιεί Τεχνητή Νοημοσύνη (LLMs) για την ανάλυση εγγράφων και ένα **Premium B2B web interface** για την εξερεύνηση, οπτικοποίηση και πλοήγηση στον νομικό χάρτη της Ελλάδας.

---

## 📅 Από το Obsidian στο Next.js (Project Evolution)

Το έργο ξεκίνησε βασισμένο στο αρχικό αποθετήριο [TeoMastro/Greek-Legislation-Wiki](https://github.com/TeoMastro/Greek-Legislation-Wiki), το οποίο ακολουθούσε το μοτίβο του [LLM Wiki](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f). Αρχικά λειτουργούσε ως ένα απλό, στατικό αποθετήριο με αρχεία Markdown που διαχειριζόταν αποκλειστικά από τον χρήστη μέσω του **Obsidian**.

Με τη νεότερη αρχιτεκτονική (v2.0), το project **αναβαθμίστηκε ριζικά**:
Κατασκευάστηκε ένα πολυτελές Web Application πάνω στο υπάρχον αρχείο Markdown, προσθέτοντας εντυπωσιακές διαδραστικές λειτουργίες που ταιριάζουν σε μεγάλες νομικές εταιρείες ή κρατικούς οργανισμούς.

## ✨ Νέα Επαγγελματικά Χαρακτηριστικά (Frontend)

- **Premium UI/UX (Glassmorphism):** Ηχομονωμένη αισθητική "γυαλιού", ρευστά micro-animations και υποστήριξη 2 μοντέρνων χρωματικών παλετών: *Dark Glass* (Κυρίως θέμα) και *Snow Glass* (Light mode).
- **AI-Powered Legal Assistant (RAG):** Προηγμένη αναζήτηση φυσικής γλώσσας που "διαβάζει" το Wiki και απαντά σε ερωτήσεις με χρήση του **Gemini 1.5 Flash**. Διαθέτει real-time streaming (γράμμα-γράμμα) για κορυφαία εμπειρία χρήστη.
- **Διαδραστικός Χάρτης Διασυνδέσεων (Knowledge Graph):** Αυτόματη απόδοση των συσχετίσεων με Force Directed Graph. Περιλαμβάνει πλέον δυνατότητα **Focus & Filtering** για γρήγορο εντοπισμό κόμβων.
- **Οπτικό Timeline (Χρονογραμμή):** Κάθετη, δυναμική χρονογραμμή παρακολούθησης της εξέλιξης των Προεδρικών Διαταγμάτων και Νόμων ιστορικά.
- **Smart Document Viewer:** Ενσωματωμένος αναγνώστης με αυτόματο *Sticky Table of Contents*.
- **Ευρετήρια:** Δυναμική αναζήτηση για *Δημόσιους Φορείς* (Entities) και *Νομικές Έννοιες* (Concepts).

## 🛠 Τεχνολογική Στοίβα (Tech Stack)

### Backend (LLM Pipeline)

- **Python:** Scripts εξαγωγής δεδομένων.
- **Docling / OCR:** Μετατροπή PDF εγγράφων ΦΕΚ σε δομημένο Markdown.
- **LLM/Claude:** Ανάγνωση, σύνθεση και διασύνδεση νέων νομοσχεδίων.

### Frontend (User App)

- **Next.js 16 (App Router):** Το ταχύτερο React πλαίσιο, ρυθμισμένο με Turbopack.
- **React Force Graph:** 2D Canvas rendering για το Δίκτυο Εννοιών.
- **React Markdown / Remark GFM:** Υποστήριξη rendering για την ελληνική γλώσσα και τα Obsidian-style Wikilinks (`[[Nomos]]`).
- **CSS3 / Glassmorphism:** Χρήση απλής CSS (Vanilla) για μαθηματική ακρίβεια και performance στο styling.

---

## 🚀 Εγκατάσταση και Χρήση

Το σύστημα πλέον διαθέτει δύο αυτόνομα τμήματα: την *εισαγωγή δεδομένων (Backend)* και την *προβολή δεδομένων (Frontend)*.

### 1. Backend Ingestion & LLM (Προσθήκη νέων Νόμων)

```bash
# Εγκατάσταση απαιτήσεων PDF parsing
pip install -r scripts/requirements.txt

# Μετατροπή των ΦΕΚ (από raw/ σε raw/parsed/ σε μορφή markdown)
python scripts/parse_pdfs.py
```

Για ενημέρωση του Wiki, μπορείτε να τρέξετε την εντολή `ingest <filename>` στον LLM AI Assistant σας για να δημιουργήσει τα αρχεία.

### 2. Frontend Application (Εκτέλεση του B2B Web App)

Βεβαιωθείτε ότι έχετε εγκατεστημένο το Node.js (v18+).

```bash
# Μετάβαση στον φάκελο της εφαρμογής
cd frontend

# Εγκατάσταση εξαρτήσεων
npm install

# Εκκίνηση τοπικού server (Development mode)
npm run dev
```

> [!TIP]
> **AI Search Setup:** Για να λειτουργήσει ο AI Assistant, δημιουργήστε ένα αρχείο `.env.local` μέσα στον φάκελο `frontend/` και προσθέστε το κλειδί σας:
> `GEMINI_API_KEY=your_api_key_here`

Ανοίξτε το `http://localhost:3000` στον browser της επιλογής σας για να απολαύσετε το σύστημα.

## 📂 Αρχιτεκτονική Έργου (Project Structure)

```text
├── frontend/                # Η Next.js εφαρμογή (B2B Web Dashboard)
│   ├── src/app/             # Σελίδες (Home, Graph, Timeline, Doc, Entities...)
│   ├── src/components/      # Reusable React UI Components & Graph engines
│   └── src/lib/             # Markdown Parsers & Data APIs
├── raw/                     # Πηγαία PDF ΦΕΚ
│   └── parsed/              # To Markdown μετά το OCR
├── wiki/                    # Τα δομημένα, διασυνδεδεμένα δεδομένα (LLM-curated)
│   ├── legislation/         # Νόμοι ταξινομημένοι ανά έτος
│   ├── entities/            # Υπουργεία, Οργανισμοί, Πρόσωπα
│   └── concepts/            # Νομικές Έννοιες και αρχές
├── scripts/                 # Python εργαλεία
└── CLAUDE.md                # Οδηγίες για τον LLM agent
```

## Συγγραφή / Credits

- **Αρχική Ιδέα & Markdown Pipeline:** [TeoMastro/Greek-Legislation-Wiki](https://github.com/TeoMastro/Greek-Legislation-Wiki)
- **Frontend App Implementation:** Ενισχύθηκε και επεκτάθηκε ως ένα High-end Web UI Project για νομική χρήση.
