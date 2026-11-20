# TP04: LLM & NLP Evaluation Metrics Live Interactive Suite

An interactive web application, live multi-metric evaluation runner, and Python testing pipeline covering all 10 evaluation lessons from `TP04.md`.

---

## 🚀 Live Demo & GitHub Pages Hosting (`.github.io`)

This entire folder is pre-configured and 100% ready to be hosted as a static website on **GitHub Pages** with zero backend required.

### How to Host on GitHub Pages

#### Option 1: Direct Deployment from Repository (Easiest)
1. Push this repository to GitHub:
   ```bash
   git add TP04-test
   git commit -m "Add TP04 Live Evaluation Suite ready for GitHub Pages"
   git push origin main
   ```
2. On GitHub, go to your repository **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment**:
   - **Source:** `Deploy from a branch`
   - **Branch:** `main` | **Folder:** `/ (root)`
4. Once deployed, open:
   ```
   https://<your-username>.github.io/<repository-name>/TP04-test/
   ```

#### Option 2: Dedicated GitHub Pages Branch (`gh-pages`)
To host the suite directly at the root (`https://<your-username>.github.io/<repository-name>/`):
```bash
git subtree push --prefix TP04-test origin gh-pages
```
Then select the `gh-pages` branch with folder `/ (root)` under repository **Settings** > **Pages**.

---

## 💻 Local Testing & Preview

You can run the web app immediately without any web server by double-clicking `index.html`, or by running a local Python web server:

```bash
cd TP04-test
python -m http.server 8000
```
Then open your browser at: [http://localhost:8000](http://localhost:8000)

---

## 💡 Key Interactive Features

- **Retrievable / Collapsible Sidebar:**
  - Toggle button in header (`<i class="fa-solid fa-bars"></i>`) or collapse button inside the sidebar (`<i class="fa-solid fa-angles-left"></i>`).
  - Keyboard shortcut: Press `Ctrl + B` (or `Cmd + B` on Mac) to toggle the sidebar at any time.
  - Automatically remembers your preferred collapsed/expanded state using `localStorage`.
  - Mobile-friendly backdrop overlay that closes the drawer upon clicking outside.

- **User-Selectable N-Gram in BLEU Score (Lesson 4 & Live Pipeline):**
  - **Quick Presets:** Instant switching between **BLEU-1** (Unigrams), **BLEU-2** (Bigrams), **BLEU-3** (Trigrams), **BLEU-4** (Standard 4-gram), or **Custom**.
  - **Custom Grams & Weights:** Individually toggle $1$-gram through $5$-gram checkboxes with custom decimal weights ($w_1, w_2, \dots$).
  - **Auto-Balance Weights:** Automatically balances weights evenly across checked grams with 1 click.
  - **Dynamic Title & Formula:** Real-time formula and title updates (e.g. `BLEU-2 Score (Bigram)` or `Active Weights w = (0.50, 0.50)`).
  - **Live Pipeline BLEU Order:** Select your desired BLEU order (1 to 4) directly inside the Unified Live Streaming Pipeline.

---

## 📂 Folder Structure

```
TP04-test/
├── .nojekyll              # Disables Jekyll processing on GitHub Pages
├── index.html             # Responsive web app containing all 10 lessons & interactive widgets
├── styles.css             # Modern dark/light theme CSS styling & responsive layouts
├── app.js                 # Complete client-side JS implementation of all 10 metric calculators
├── metrics_pipeline.py    # Turnkey pure-Python evaluation pipeline & CLI runner
├── test_metrics.py        # Automated Pytest suite testing all 10 metric implementations
└── README.md              # Deployment guide and documentation
```

---

## 📚 The 10 Lessons Included

| # | Lesson / Metric | Category | Direction | Description |
|---|---|---|---|---|
| **01** | **Exact Match (EM)** | String Matching | Higher is better | Evaluates strict binary correctness and normalized text comparisons (QA & Math). |
| **02** | **Accuracy** | Classification | Higher is better | Measures correct predictions ratio and explores the imbalanced dataset Accuracy Paradox. |
| **03** | **Precision, Recall, F1** | Classification | Higher is better | Evaluates the quality-vs-quantity tradeoff and the harmonic mean. |
| **04** | **BLEU Score** | N-Gram Precision | Higher is better | User-selectable n-gram order (BLEU-1, 2, 3, 4, or custom weights) with clipping & brevity penalty. |
| **05** | **ROUGE Score** | N-Gram Recall | Higher is better | Information retention overlap (ROUGE-1, ROUGE-2, ROUGE-L) for summarization. |
| **06** | **METEOR Score** | Semantic Alignment | Higher is better | Word alignment with stemming, synonyms, and word order fragmentation penalty. |
| **07** | **BERTScore** | Deep Semantics | Higher is better | Contextual embedding similarity using greedy token cosine alignments. |
| **08** | **Word Error Rate (WER)** | Edit Distance | Lower is better (0 = Perfect) | Minimum edit operations (S, D, I) for speech recognition (ASR). |
| **09** | **Character Error Rate (CER)** | Edit Distance | Lower is better (0 = Perfect) | Character-level edit distance for OCR and unsegmented languages. |
| **10** | **Comparative Evaluation** | Synthesis Matrix | - | Decision matrix, task selection wizard, and unified live evaluation pipeline. |

---

## 🧪 Running the Python Pipeline & Tests

### Run the CLI Evaluation Runner:
```bash
python metrics_pipeline.py
```

### Run the Pytest Test Suite:
```bash
pytest test_metrics.py -v
```
All 10 tests verify exact match, classification matrices, BLEU, ROUGE, METEOR, BERTScore, WER, and CER.
