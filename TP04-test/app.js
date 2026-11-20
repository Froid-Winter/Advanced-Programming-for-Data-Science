/**
 * TP04 LLM & NLP Evaluation Metrics Live Interactive Suite
 * Complete client-side implementations of all 10 lessons in TP04.md
 * Ready for GitHub Pages (github.io) hosting
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initTabs();
  initCopyButtons();
  initLessonCalculators();
  initLivePipeline();
  initWizard();
});

/* ==========================================================================
   1. THEME & NAVIGATION
   ========================================================================== */

function initTheme() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('tp04_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('tp04_theme', next);
      updateThemeIcon(next);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  const text = document.getElementById('themeText');
  if (icon && text) {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-moon';
      text.textContent = 'Dark Mode';
    } else {
      icon.className = 'fa-solid fa-sun';
      text.textContent = 'Light Mode';
    }
  }
}

function initNavigation() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarStatusTag = document.getElementById('sidebarStatusTag');
  const navItems = document.querySelectorAll('.nav-item');
  const searchInput = document.getElementById('navSearch');

  // Check persisted state for desktop sidebar
  const isRetracted = localStorage.getItem('tp04_sidebar_retracted') === 'true';
  if (isRetracted && window.innerWidth > 1024) {
    document.body.classList.add('sidebar-collapsed');
    if (sidebarStatusTag) sidebarStatusTag.style.display = 'inline-block';
  }

  function toggleSidebar() {
    if (window.innerWidth > 1024) {
      // Desktop: collapse or retrieve
      const collapsed = document.body.classList.toggle('sidebar-collapsed');
      localStorage.setItem('tp04_sidebar_retracted', collapsed);
      if (sidebarStatusTag) {
        sidebarStatusTag.style.display = collapsed ? 'inline-block' : 'none';
      }
    } else {
      // Mobile: open or close drawer with backdrop
      const open = sidebar.classList.toggle('open');
      if (sidebarBackdrop) {
        sidebarBackdrop.classList.toggle('active', open);
      }
    }
  }

  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }

  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', toggleSidebar);
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      sidebarBackdrop.classList.remove('active');
    });
  }

  // Keyboard shortcut Ctrl + B to toggle sidebar
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      toggleSidebar();
    }
  });

  // Mobile: close sidebar when clicking a nav item
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 1024 && sidebar) {
        sidebar.classList.remove('open');
        if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
      }
    });
  });

  // Active link tracking on scroll
  const sections = document.querySelectorAll('.lesson-card, .pipeline-card, .hero-section');
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      if (sec.offsetTop <= scrollPos) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });

    const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
    if (breadcrumbCurrent && current) {
      const activeItem = document.querySelector(`.nav-item[href="#${current}"]`);
      if (activeItem) {
        breadcrumbCurrent.textContent = activeItem.querySelector('.nav-label')?.textContent || current;
      }
    }
  });

  // Filter sidebar items
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      navItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(q) ? 'flex' : 'none';
      });
    });
  }
}

function initTabs() {
  document.querySelectorAll('.tabs-header').forEach(header => {
    const buttons = header.querySelectorAll('.tab-btn');
    const container = header.parentElement;
    const contents = container.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabTarget = btn.getAttribute('data-tab');

        buttons.forEach(b => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = container.querySelector(`.tab-content[data-content="${tabTarget}"]`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  });
}

function initCopyButtons() {
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const pre = btn.closest('.code-wrapper').querySelector('pre code');
      if (pre) {
        navigator.clipboard.writeText(pre.innerText).then(() => {
          const original = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
          setTimeout(() => {
            btn.innerHTML = original;
          }, 2000);
        });
      }
    });
  });
}

/* ==========================================================================
   2. NLP HELPER UTILITIES
   ========================================================================== */

function normalizeText(text, opts = { lowercase: true, punctuation: true, whitespace: true, articles: false }) {
  if (!text) return '';
  let res = text;
  if (opts.lowercase) res = res.toLowerCase();
  if (opts.punctuation) res = res.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, '');
  if (opts.articles) res = res.replace(/\b(a|an|the)\b/gi, '');
  if (opts.whitespace) res = res.replace(/\s+/g, ' ').trim();
  return res;
}

function tokenize(text) {
  return normalizeText(text, { lowercase: true, punctuation: true, whitespace: true, articles: false })
    .split(' ')
    .filter(Boolean);
}

function getNgrams(tokens, n) {
  const ngrams = [];
  for (let i = 0; i <= tokens.length - n; i++) {
    ngrams.push(tokens.slice(i, i + n).join(' '));
  }
  return ngrams;
}

function getFrequencyMap(items) {
  const map = {};
  for (const item of items) {
    map[item] = (map[item] || 0) + 1;
  }
  return map;
}

/* ==========================================================================
   3. LESSON CALCULATORS IMPLEMENTATIONS
   ========================================================================== */

function initLessonCalculators() {
  // Lesson 1: Exact Match
  const emCalcBtn = document.getElementById('emCalcBtn');
  if (emCalcBtn) {
    emCalcBtn.addEventListener('click', calculateEM);
    calculateEM();
  }

  // Lesson 2: Accuracy
  const accInputs = ['accTP', 'accTN', 'accFP', 'accFN'];
  accInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateAccuracy);
  });
  const btnAccBalanced = document.getElementById('btnAccBalanced');
  const btnAccImbalanced = document.getElementById('btnAccImbalanced');
  if (btnAccBalanced) {
    btnAccBalanced.addEventListener('click', () => {
      document.getElementById('accTP').value = 45;
      document.getElementById('accTN').value = 45;
      document.getElementById('accFP').value = 5;
      document.getElementById('accFN').value = 5;
      calculateAccuracy();
    });
  }
  if (btnAccImbalanced) {
    btnAccImbalanced.addEventListener('click', () => {
      document.getElementById('accTP').value = 2;
      document.getElementById('accTN').value = 980;
      document.getElementById('accFP').value = 0;
      document.getElementById('accFN').value = 18;
      calculateAccuracy();
    });
  }
  calculateAccuracy();

  // Lesson 3: Precision, Recall, F1
  ['prfTP', 'prfFP', 'prfFN'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculatePRF);
  });
  calculatePRF();

  // Lesson 4: BLEU with User-Selectable N-Grams
  initBleuControls();

  // Lesson 5: ROUGE
  const rougeCalcBtn = document.getElementById('rougeCalcBtn');
  if (rougeCalcBtn) {
    rougeCalcBtn.addEventListener('click', calculateROUGE);
    calculateROUGE();
  }

  // Lesson 6: METEOR
  const meteorCalcBtn = document.getElementById('meteorCalcBtn');
  if (meteorCalcBtn) {
    meteorCalcBtn.addEventListener('click', calculateMETEOR);
    calculateMETEOR();
  }

  // Lesson 7: BERTScore Simulation
  const bertCalcBtn = document.getElementById('bertCalcBtn');
  if (bertCalcBtn) {
    bertCalcBtn.addEventListener('click', calculateBERTScore);
    calculateBERTScore();
  }

  // Lesson 8: WER
  const werCalcBtn = document.getElementById('werCalcBtn');
  if (werCalcBtn) {
    werCalcBtn.addEventListener('click', calculateWER);
    calculateWER();
  }

  // Lesson 9: CER
  const cerCalcBtn = document.getElementById('cerCalcBtn');
  if (cerCalcBtn) {
    cerCalcBtn.addEventListener('click', calculateCER);
    calculateCER();
  }
}

/* --- Lesson 1: Exact Match (EM) --- */
function calculateEM() {
  const ref = document.getElementById('emRef')?.value || '';
  const cand = document.getElementById('emCand')?.value || '';
  const lowercase = document.getElementById('emOptLower')?.checked ?? true;
  const punctuation = document.getElementById('emOptPunct')?.checked ?? true;
  const whitespace = document.getElementById('emOptSpace')?.checked ?? true;
  const articles = document.getElementById('emOptArticles')?.checked ?? false;

  const rawMatch = ref === cand ? 1 : 0;
  const normRef = normalizeText(ref, { lowercase, punctuation, whitespace, articles });
  const normCand = normalizeText(cand, { lowercase, punctuation, whitespace, articles });
  const normMatch = normRef === normCand ? 1 : 0;

  const scoreEl = document.getElementById('emScore');
  const rawScoreEl = document.getElementById('emRawScore');
  const normRefEl = document.getElementById('emNormRef');
  const normCandEl = document.getElementById('emNormCand');

  if (scoreEl) scoreEl.textContent = normMatch === 1 ? '1.0 (Match)' : '0.0 (No Match)';
  if (scoreEl) scoreEl.style.color = normMatch === 1 ? 'var(--success)' : 'var(--danger)';
  if (rawScoreEl) rawScoreEl.textContent = rawMatch;
  if (normRefEl) normRefEl.textContent = `"${normRef}"`;
  if (normCandEl) normCandEl.textContent = `"${normCand}"`;
}

/* --- Lesson 2: Accuracy --- */
function calculateAccuracy() {
  const tp = parseFloat(document.getElementById('accTP')?.value) || 0;
  const tn = parseFloat(document.getElementById('accTN')?.value) || 0;
  const fp = parseFloat(document.getElementById('accFP')?.value) || 0;
  const fn = parseFloat(document.getElementById('accFN')?.value) || 0;

  const total = tp + tn + fp + fn;
  const acc = total > 0 ? (tp + tn) / total : 0;
  const err = 1 - acc;

  const accScoreEl = document.getElementById('accScore');
  const accTotalEl = document.getElementById('accTotal');
  const accErrEl = document.getElementById('accErr');
  const cmTP = document.getElementById('cmTP');
  const cmTN = document.getElementById('cmTN');
  const cmFP = document.getElementById('cmFP');
  const cmFN = document.getElementById('cmFN');

  if (accScoreEl) accScoreEl.textContent = `${(acc * 100).toFixed(2)}%`;
  if (accTotalEl) accTotalEl.textContent = total;
  if (accErrEl) accErrEl.textContent = `${(err * 100).toFixed(2)}%`;
  if (cmTP) cmTP.textContent = tp;
  if (cmTN) cmTN.textContent = tn;
  if (cmFP) cmFP.textContent = fp;
  if (cmFN) cmFN.textContent = fn;

  // Imbalanced alert
  const alertEl = document.getElementById('accAlert');
  if (alertEl) {
    const positiveCount = tp + fn;
    const negativeCount = tn + fp;
    if (total > 0 && (positiveCount / total < 0.05 || negativeCount / total < 0.05)) {
      alertEl.style.display = 'block';
    } else {
      alertEl.style.display = 'none';
    }
  }
}

/* --- Lesson 3: Precision, Recall, F1 --- */
function calculatePRF() {
  const tp = parseFloat(document.getElementById('prfTP')?.value) || 0;
  const fp = parseFloat(document.getElementById('prfFP')?.value) || 0;
  const fn = parseFloat(document.getElementById('prfFN')?.value) || 0;

  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const pEl = document.getElementById('prfPrecision');
  const rEl = document.getElementById('prfRecall');
  const f1El = document.getElementById('prfF1');

  if (pEl) pEl.textContent = `${(precision * 100).toFixed(2)}%`;
  if (rEl) rEl.textContent = `${(recall * 100).toFixed(2)}%`;
  if (f1El) f1El.textContent = `${(f1 * 100).toFixed(2)}%`;

  // Bars
  const pBar = document.getElementById('prfPBar');
  const rBar = document.getElementById('prfRBar');
  const f1Bar = document.getElementById('prfF1Bar');

  if (pBar) pBar.style.width = `${precision * 100}%`;
  if (rBar) rBar.style.width = `${recall * 100}%`;
  if (f1Bar) f1Bar.style.width = `${f1 * 100}%`;
}

/* --- Lesson 4: BLEU Score with User-Selectable N-Grams --- */
function computeBleuScore(ref, cand, maxN = 4) {
  const grams = [];
  const weights = [];
  for (let i = 1; i <= maxN; i++) {
    grams.push(i);
    weights.push(1.0 / maxN);
  }
  return computeBleuScoreCustom(ref, cand, grams, weights);
}

function computeBleuScoreCustom(ref, cand, selectedGrams = [1, 2, 3, 4], weights = [0.25, 0.25, 0.25, 0.25]) {
  const refTokens = tokenize(ref);
  const candTokens = tokenize(cand);

  const c = candTokens.length;
  const r = refTokens.length;

  if (c === 0 || selectedGrams.length === 0) {
    return { score: 0, bp: 0, precisions: {}, c: 0, r, matches: {}, activeWeights: weights, selectedGrams };
  }

  const bp = c >= r ? 1.0 : Math.exp(1.0 - r / c);

  // Normalize weights so their sum is 1.0
  const sumWeights = weights.reduce((a, b) => a + b, 0) || 1.0;
  const normalizedWeights = weights.map(w => w / sumWeights);

  const precisions = {};
  const matches = {};

  selectedGrams.forEach((n) => {
    const candNgrams = getNgrams(candTokens, n);
    const refNgrams = getNgrams(refTokens, n);

    if (candNgrams.length === 0) {
      precisions[n] = 0;
      matches[`${n}-gram`] = [];
      return;
    }

    const candMap = getFrequencyMap(candNgrams);
    const refMap = getFrequencyMap(refNgrams);

    let clippedMatches = 0;
    const nMatches = [];

    for (const [ngram, count] of Object.entries(candMap)) {
      const refCount = refMap[ngram] || 0;
      const matched = Math.min(count, refCount);
      clippedMatches += matched;
      if (matched > 0) nMatches.push(`${ngram} (${matched}x)`);
    }

    matches[`${n}-gram`] = nMatches;
    precisions[n] = clippedMatches / candNgrams.length;
  });

  // Calculate weighted geometric mean
  let logSum = 0;
  selectedGrams.forEach((n, idx) => {
    const p = precisions[n] || 0;
    const w = normalizedWeights[idx];
    if (p > 0) {
      logSum += w * Math.log(p);
    } else {
      // Smoothing epsilon
      logSum += w * Math.log(1e-4);
    }
  });

  const score = bp * Math.exp(logSum);
  return { score, bp, precisions, c, r, matches, normalizedWeights, selectedGrams };
}

function initBleuControls() {
  const presetBtns = document.querySelectorAll('.ngram-preset-btn[data-ngram]');
  const checkboxes = [1, 2, 3, 4, 5].map(n => document.getElementById(`bleuCheck${n}`));
  const weightInputs = [1, 2, 3, 4, 5].map(n => document.getElementById(`bleuWeight${n}`));
  const autoBalanceBtn = document.getElementById('btnAutoBalanceWeights');
  const bleuCalcBtn = document.getElementById('bleuCalcBtn');
  const refInput = document.getElementById('bleuRef');
  const candInput = document.getElementById('bleuCand');

  function setPreset(nOrder) {
    presetBtns.forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.ngram-preset-btn[data-ngram="${nOrder}"]`);
    if (btn) btn.classList.add('active');

    if (nOrder === 'custom') return;

    const maxN = parseInt(nOrder, 10);
    for (let i = 1; i <= 5; i++) {
      const chk = document.getElementById(`bleuCheck${i}`);
      const wInp = document.getElementById(`bleuWeight${i}`);
      if (i <= maxN) {
        if (chk) chk.checked = true;
        if (wInp) wInp.value = (1 / maxN).toFixed(2);
      } else {
        if (chk) chk.checked = false;
        if (wInp) wInp.value = '0.00';
      }
    }
    calculateBLEU();
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const order = btn.getAttribute('data-ngram');
      setPreset(order);
    });
  });

  checkboxes.forEach((chk) => {
    if (chk) {
      chk.addEventListener('change', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        const customBtn = document.querySelector('.ngram-preset-btn[data-ngram="custom"]');
        if (customBtn) customBtn.classList.add('active');
        autoBalanceWeights();
      });
    }
  });

  weightInputs.forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        const customBtn = document.querySelector('.ngram-preset-btn[data-ngram="custom"]');
        if (customBtn) customBtn.classList.add('active');
        calculateBLEU();
      });
    }
  });

  if (autoBalanceBtn) {
    autoBalanceBtn.addEventListener('click', autoBalanceWeights);
  }

  function autoBalanceWeights() {
    const checked = [];
    for (let i = 1; i <= 5; i++) {
      const chk = document.getElementById(`bleuCheck${i}`);
      if (chk && chk.checked) checked.push(i);
    }
    const weightEach = checked.length > 0 ? (1.0 / checked.length).toFixed(2) : '0.00';
    for (let i = 1; i <= 5; i++) {
      const wInp = document.getElementById(`bleuWeight${i}`);
      const chk = document.getElementById(`bleuCheck${i}`);
      if (wInp) {
        wInp.value = (chk && chk.checked) ? weightEach : '0.00';
      }
    }
    calculateBLEU();
  }

  if (bleuCalcBtn) bleuCalcBtn.addEventListener('click', calculateBLEU);
  if (refInput) refInput.addEventListener('input', calculateBLEU);
  if (candInput) candInput.addEventListener('input', calculateBLEU);

  calculateBLEU();
}

function calculateBLEU() {
  const ref = document.getElementById('bleuRef')?.value || '';
  const cand = document.getElementById('bleuCand')?.value || '';

  const selectedGrams = [];
  const weights = [];

  for (let i = 1; i <= 5; i++) {
    const chk = document.getElementById(`bleuCheck${i}`);
    const wInp = document.getElementById(`bleuWeight${i}`);
    if (chk && chk.checked) {
      selectedGrams.push(i);
      weights.push(parseFloat(wInp?.value) || 0.0);
    }
  }

  // Fallback if none checked
  if (selectedGrams.length === 0) {
    selectedGrams.push(1);
    weights.push(1.0);
    const chk1 = document.getElementById('bleuCheck1');
    if (chk1) chk1.checked = true;
  }

  const res = computeBleuScoreCustom(ref, cand, selectedGrams, weights);

  const scoreEl = document.getElementById('bleuScore');
  const scoreLabelEl = document.getElementById('bleuScoreLabel');
  const bpEl = document.getElementById('bleuBP');
  const formulaBadgeEl = document.getElementById('bleuFormulaBadge');
  const stepsEl = document.getElementById('bleuMatches');

  if (scoreEl) scoreEl.textContent = (res.score * 100).toFixed(2);
  if (bpEl) bpEl.textContent = res.bp.toFixed(4);

  // Dynamic label
  if (scoreLabelEl) {
    if (selectedGrams.length === 1 && selectedGrams[0] === 1) {
      scoreLabelEl.textContent = 'BLEU-1 Score (Unigram)';
    } else if (selectedGrams.length === 2 && selectedGrams[0] === 1 && selectedGrams[1] === 2) {
      scoreLabelEl.textContent = 'BLEU-2 Score (Bigram)';
    } else if (selectedGrams.length === 3 && selectedGrams.join(',') === '1,2,3') {
      scoreLabelEl.textContent = 'BLEU-3 Score (Trigram)';
    } else if (selectedGrams.length === 4 && selectedGrams.join(',') === '1,2,3,4') {
      scoreLabelEl.textContent = 'BLEU-4 Score (Standard)';
    } else {
      scoreLabelEl.textContent = `Custom BLEU Score (${selectedGrams.map(g => `${g}-gram`).join(' + ')})`;
    }
  }

  // Active weights formula badge
  if (formulaBadgeEl && res.normalizedWeights) {
    const wStr = res.normalizedWeights.map(w => w.toFixed(2)).join(', ');
    formulaBadgeEl.textContent = `Active Weights w = (${wStr})`;
  }

  // Precisions p1..p5
  for (let i = 1; i <= 5; i++) {
    const pEl = document.getElementById(`bleuP${i}`);
    const pBox = document.getElementById(`bleuP${i}Box`);
    const isSelected = selectedGrams.includes(i);

    if (pEl) {
      const prec = res.precisions[i];
      pEl.textContent = prec !== undefined ? `${(prec * 100).toFixed(1)}%` : 'N/A';
    }

    if (pBox) {
      if (isSelected) {
        pBox.style.display = 'block';
        pBox.style.borderColor = 'var(--accent-primary)';
      } else if (i === 5) {
        pBox.style.display = 'none';
      } else {
        pBox.style.display = 'block';
        pBox.style.borderColor = 'var(--card-border)';
      }
    }
  }

  if (stepsEl) {
    let html = '<strong>Matched n-grams for selected orders:</strong><br>';
    for (const [order, list] of Object.entries(res.matches)) {
      html += `<div><strong>${order}:</strong> ${list.length ? list.join(', ') : 'None'}</div>`;
    }
    stepsEl.innerHTML = html;
  }
}

/* --- Lesson 5: ROUGE Score --- */
function lcs(seq1, seq2) {
  const m = seq1.length;
  const n = seq2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seq1[i - 1] === seq2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function computeRougeScore(ref, cand) {
  const refTokens = tokenize(ref);
  const candTokens = tokenize(cand);

  // ROUGE-1
  const ref1 = getFrequencyMap(getNgrams(refTokens, 1));
  const cand1 = getFrequencyMap(getNgrams(candTokens, 1));
  let overlap1 = 0;
  for (const [w, c] of Object.entries(cand1)) {
    overlap1 += Math.min(c, ref1[w] || 0);
  }
  const r1_rec = refTokens.length > 0 ? overlap1 / refTokens.length : 0;
  const r1_prec = candTokens.length > 0 ? overlap1 / candTokens.length : 0;
  const r1_f1 = (r1_prec + r1_rec) > 0 ? (2 * r1_prec * r1_rec) / (r1_prec + r1_rec) : 0;

  // ROUGE-2
  const ref2N = getNgrams(refTokens, 2);
  const cand2N = getNgrams(candTokens, 2);
  const ref2 = getFrequencyMap(ref2N);
  const cand2 = getFrequencyMap(cand2N);
  let overlap2 = 0;
  for (const [bg, c] of Object.entries(cand2)) {
    overlap2 += Math.min(c, ref2[bg] || 0);
  }
  const r2_rec = ref2N.length > 0 ? overlap2 / ref2N.length : 0;
  const r2_prec = cand2N.length > 0 ? overlap2 / cand2N.length : 0;
  const r2_f1 = (r2_prec + r2_rec) > 0 ? (2 * r2_prec * r2_rec) / (r2_prec + r2_rec) : 0;

  // ROUGE-L
  const lcsLen = lcs(candTokens, refTokens);
  const rl_rec = refTokens.length > 0 ? lcsLen / refTokens.length : 0;
  const rl_prec = candTokens.length > 0 ? lcsLen / candTokens.length : 0;
  const rl_f1 = (rl_prec + rl_rec) > 0 ? (2 * rl_prec * rl_rec) / (rl_prec + rl_rec) : 0;

  return {
    r1: { f1: r1_f1, prec: r1_prec, rec: r1_rec },
    r2: { f1: r2_f1, prec: r2_prec, rec: r2_rec },
    rl: { f1: rl_f1, prec: rl_prec, rec: rl_rec, lcs: lcsLen }
  };
}

function calculateROUGE() {
  const ref = document.getElementById('rougeRef')?.value || '';
  const cand = document.getElementById('rougeCand')?.value || '';

  const res = computeRougeScore(ref, cand);

  const r1El = document.getElementById('rouge1Score');
  const r2El = document.getElementById('rouge2Score');
  const rlEl = document.getElementById('rougeLScore');
  const detailsEl = document.getElementById('rougeDetails');

  if (r1El) r1El.textContent = (res.r1.f1 * 100).toFixed(2);
  if (r2El) r2El.textContent = (res.r2.f1 * 100).toFixed(2);
  if (rlEl) rlEl.textContent = (res.rl.f1 * 100).toFixed(2);

  if (detailsEl) {
    detailsEl.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 10px;">
        <div style="background:var(--bg-tertiary); padding: 8px; border-radius: 6px;">
          <strong>ROUGE-1:</strong> P: ${(res.r1.prec * 100).toFixed(1)}% | R: ${(res.r1.rec * 100).toFixed(1)}%
        </div>
        <div style="background:var(--bg-tertiary); padding: 8px; border-radius: 6px;">
          <strong>ROUGE-2:</strong> P: ${(res.r2.prec * 100).toFixed(1)}% | R: ${(res.r2.rec * 100).toFixed(1)}%
        </div>
        <div style="background:var(--bg-tertiary); padding: 8px; border-radius: 6px;">
          <strong>ROUGE-L:</strong> LCS: ${res.rl.lcs} tokens | P: ${(res.rl.prec * 100).toFixed(1)}% | R: ${(res.rl.rec * 100).toFixed(1)}%
        </div>
      </div>
    `;
  }
}

/* --- Lesson 6: METEOR Score --- */
function computeMeteorScore(ref, cand) {
  const refTokens = tokenize(ref);
  const candTokens = tokenize(cand);

  if (refTokens.length === 0 || candTokens.length === 0) {
    return { score: 0, p: 0, r: 0, fmean: 0, penalty: 0, chunks: 0, matches: 0 };
  }

  // Exact match unigrams
  let m = 0;
  const matchedCandIndices = new Set();
  const matchedRefIndices = new Set();
  const alignments = [];

  candTokens.forEach((cToken, cIdx) => {
    refTokens.forEach((rToken, rIdx) => {
      if (!matchedCandIndices.has(cIdx) && !matchedRefIndices.has(rIdx) && cToken === rToken) {
        matchedCandIndices.add(cIdx);
        matchedRefIndices.add(rIdx);
        alignments.push({ cIdx, rIdx, token: cToken });
        m++;
      }
    });
  });

  if (m === 0) return { score: 0, p: 0, r: 0, fmean: 0, penalty: 0, chunks: 0, matches: 0 };

  const p = m / candTokens.length;
  const r = m / refTokens.length;
  // Weighted harmonic mean F_mean = 10 * P * R / (R + 9 * P)
  const fmean = (10 * p * r) / (r + 9 * p);

  // Chunks calculation: count contiguous aligned sequences
  alignments.sort((a, b) => a.cIdx - b.cIdx);
  let chunks = 1;
  for (let i = 1; i < alignments.length; i++) {
    if (alignments[i].cIdx !== alignments[i - 1].cIdx + 1 || alignments[i].rIdx !== alignments[i - 1].rIdx + 1) {
      chunks++;
    }
  }

  const penalty = 0.5 * Math.pow(chunks / m, 3);
  const score = fmean * (1 - penalty);

  return { score: Math.max(0, score), p, r, fmean, penalty, chunks, matches: m };
}

function calculateMETEOR() {
  const ref = document.getElementById('meteorRef')?.value || '';
  const cand = document.getElementById('meteorCand')?.value || '';

  const res = computeMeteorScore(ref, cand);

  const scoreEl = document.getElementById('meteorScore');
  const pEl = document.getElementById('meteorP');
  const rEl = document.getElementById('meteorR');
  const fmeanEl = document.getElementById('meteorFmean');
  const penEl = document.getElementById('meteorPenalty');
  const chunksEl = document.getElementById('meteorChunks');

  if (scoreEl) scoreEl.textContent = (res.score * 100).toFixed(2);
  if (pEl) pEl.textContent = `${(res.p * 100).toFixed(1)}%`;
  if (rEl) rEl.textContent = `${(res.r * 100).toFixed(1)}%`;
  if (fmeanEl) fmeanEl.textContent = (res.fmean * 100).toFixed(2);
  if (penEl) penEl.textContent = (res.penalty * 100).toFixed(2) + '%';
  if (chunksEl) chunksEl.textContent = `${res.chunks} (matches: ${res.matches})`;
}

/* --- Lesson 7: BERTScore Simulation --- */
function simulateTokenEmbedding(token) {
  // Simple deterministic pseudo-semantic hash embedding
  const v = [0, 0, 0, 0, 0];
  for (let i = 0; i < token.length; i++) {
    const code = token.charCodeAt(i);
    v[i % 5] += code;
  }
  // Normalize
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map(x => x / norm);
}

function cosineSim(vecA, vecB) {
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) dot += vecA[i] * vecB[i];
  return Math.min(1.0, Math.max(0.0, dot));
}

function computeBertScoreSim(ref, cand) {
  const refTokens = tokenize(ref);
  const candTokens = tokenize(cand);

  if (refTokens.length === 0 || candTokens.length === 0) {
    return { p: 0, r: 0, f1: 0, matrix: [] };
  }

  // Pre-calculate token similarities with synonym boost
  const matrix = [];
  candTokens.forEach((cTok, i) => {
    matrix[i] = [];
    refTokens.forEach((rTok, j) => {
      let sim = 0;
      if (cTok === rTok) {
        sim = 1.0;
      } else {
        const vA = simulateTokenEmbedding(cTok);
        const vB = simulateTokenEmbedding(rTok);
        sim = 0.5 + 0.45 * cosineSim(vA, vB);
      }
      matrix[i][j] = sim;
    });
  });

  // Greedy match: Precision (each candidate token matches best ref token)
  let pSum = 0;
  candTokens.forEach((_, i) => {
    let maxS = 0;
    refTokens.forEach((_, j) => {
      if (matrix[i][j] > maxS) maxS = matrix[i][j];
    });
    pSum += maxS;
  });
  const p = pSum / candTokens.length;

  // Greedy match: Recall (each ref token matches best candidate token)
  let rSum = 0;
  refTokens.forEach((_, j) => {
    let maxS = 0;
    candTokens.forEach((_, i) => {
      if (matrix[i][j] > maxS) maxS = matrix[i][j];
    });
    rSum += maxS;
  });
  const r = rSum / refTokens.length;

  const f1 = (p + r) > 0 ? (2 * p * r) / (p + r) : 0;

  return { p, r, f1, matrix, candTokens, refTokens };
}

function calculateBERTScore() {
  const ref = document.getElementById('bertRef')?.value || '';
  const cand = document.getElementById('bertCand')?.value || '';

  const res = computeBertScoreSim(ref, cand);

  const f1El = document.getElementById('bertF1');
  const pEl = document.getElementById('bertP');
  const rEl = document.getElementById('bertR');
  const matrixEl = document.getElementById('bertMatrix');

  if (f1El) f1El.textContent = (res.f1 * 100).toFixed(2);
  if (pEl) pEl.textContent = `${(res.p * 100).toFixed(1)}%`;
  if (rEl) rEl.textContent = `${(res.r * 100).toFixed(1)}%`;

  if (matrixEl && res.matrix.length) {
    let html = '<table style="width:100%; font-size:0.8rem; border-collapse:collapse; margin-top:12px;">';
    html += '<thead><tr><th>Cand \\ Ref</th>';
    res.refTokens.forEach(t => html += `<th style="padding:4px 8px; border:1px solid var(--card-border);">${t}</th>`);
    html += '</tr></thead><tbody>';

    res.candTokens.forEach((cTok, i) => {
      html += `<tr><td style="font-weight:700; padding:4px 8px; border:1px solid var(--card-border);">${cTok}</td>`;
      res.refTokens.forEach((rTok, j) => {
        const sim = res.matrix[i][j];
        const alpha = sim.toFixed(2);
        const bg = `rgba(56, 189, 248, ${Math.max(0.1, sim * 0.85)})`;
        html += `<td style="padding:4px 8px; text-align:center; background:${bg}; border:1px solid var(--card-border); color:#fff; font-family:var(--font-mono);">${alpha}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    matrixEl.innerHTML = html;
  }
}

/* --- Lesson 8: Word Error Rate (WER) --- */
function computeLevenshteinMatrix(refWords, hypWords) {
  const n = refWords.length;
  const m = hypWords.length;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (refWords[i - 1] === hypWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j - 1] + 1, // Substitution
          dp[i - 1][j] + 1,     // Deletion
          dp[i][j - 1] + 1      // Insertion
        );
      }
    }
  }

  // Backtrack alignment
  let i = n, j = m;
  let s = 0, d = 0, ins = 0, c = 0;
  const alignment = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && refWords[i - 1] === hypWords[j - 1]) {
      alignment.unshift({ type: 'C', ref: refWords[i - 1], hyp: hypWords[j - 1] });
      c++;
      i--; j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      alignment.unshift({ type: 'S', ref: refWords[i - 1], hyp: hypWords[j - 1] });
      s++;
      i--; j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      alignment.unshift({ type: 'D', ref: refWords[i - 1], hyp: '***' });
      d++;
      i--;
    } else {
      alignment.unshift({ type: 'I', ref: '***', hyp: hypWords[j - 1] });
      ins++;
      j--;
    }
  }

  const wer = n > 0 ? (s + d + ins) / n : 0;
  return { wer, s, d, ins, c, n, alignment };
}

function calculateWER() {
  const ref = document.getElementById('werRef')?.value || '';
  const cand = document.getElementById('werCand')?.value || '';

  const refWords = tokenize(ref);
  const candWords = tokenize(cand);

  const res = computeLevenshteinMatrix(refWords, candWords);

  const scoreEl = document.getElementById('werScore');
  const sEl = document.getElementById('werS');
  const dEl = document.getElementById('werD');
  const iEl = document.getElementById('werI');
  const nEl = document.getElementById('werN');
  const alignEl = document.getElementById('werAlignment');

  if (scoreEl) scoreEl.textContent = `${(res.wer * 100).toFixed(2)}%`;
  if (sEl) sEl.textContent = res.s;
  if (dEl) dEl.textContent = res.d;
  if (iEl) iEl.textContent = res.ins;
  if (nEl) nEl.textContent = res.n;

  if (alignEl) {
    let html = '<div class="diff-container">';
    html += '<div class="diff-row"><span class="diff-tag" style="background:#3b82f6; color:#fff;">REF</span><div class="diff-tokens">';
    res.alignment.forEach(a => {
      const cls = a.type === 'C' ? 'token-match' : (a.type === 'S' ? 'token-sub' : (a.type === 'D' ? 'token-del' : 'token-ins'));
      html += `<span class="token-pill ${cls}">${a.ref}</span>`;
    });
    html += '</div></div>';

    html += '<div class="diff-row"><span class="diff-tag" style="background:#10b981; color:#fff;">HYP</span><div class="diff-tokens">';
    res.alignment.forEach(a => {
      const cls = a.type === 'C' ? 'token-match' : (a.type === 'S' ? 'token-sub' : (a.type === 'D' ? 'token-del' : 'token-ins'));
      html += `<span class="token-pill ${cls}">${a.hyp}</span>`;
    });
    html += '</div></div>';

    html += '<div class="diff-row"><span class="diff-tag" style="background:#8b5cf6; color:#fff;">OP</span><div class="diff-tokens">';
    res.alignment.forEach(a => {
      const cls = a.type === 'C' ? 'token-match' : (a.type === 'S' ? 'token-sub' : (a.type === 'D' ? 'token-del' : 'token-ins'));
      html += `<span class="token-pill ${cls}">${a.type}</span>`;
    });
    html += '</div></div>';
    html += '</div>';

    alignEl.innerHTML = html;
  }
}

/* --- Lesson 9: Character Error Rate (CER) --- */
function calculateCER() {
  const ref = document.getElementById('cerRef')?.value || '';
  const cand = document.getElementById('cerCand')?.value || '';

  const refChars = ref.split('');
  const candChars = cand.split('');

  const res = computeLevenshteinMatrix(refChars, candChars);

  const scoreEl = document.getElementById('cerScore');
  const sEl = document.getElementById('cerS');
  const dEl = document.getElementById('cerD');
  const iEl = document.getElementById('cerI');
  const nEl = document.getElementById('cerN');
  const alignEl = document.getElementById('cerAlignment');

  if (scoreEl) scoreEl.textContent = `${(res.wer * 100).toFixed(2)}%`;
  if (sEl) sEl.textContent = res.s;
  if (dEl) dEl.textContent = res.d;
  if (iEl) iEl.textContent = res.ins;
  if (nEl) nEl.textContent = res.n;

  if (alignEl) {
    let html = '<div class="diff-container">';
    html += '<div class="diff-row"><span class="diff-tag" style="background:#3b82f6; color:#fff;">REF</span><div class="diff-tokens">';
    res.alignment.forEach(a => {
      const cls = a.type === 'C' ? 'token-match' : (a.type === 'S' ? 'token-sub' : (a.type === 'D' ? 'token-del' : 'token-ins'));
      html += `<span class="token-pill ${cls}">${a.ref === ' ' ? '␣' : a.ref}</span>`;
    });
    html += '</div></div>';

    html += '<div class="diff-row"><span class="diff-tag" style="background:#10b981; color:#fff;">HYP</span><div class="diff-tokens">';
    res.alignment.forEach(a => {
      const cls = a.type === 'C' ? 'token-match' : (a.type === 'S' ? 'token-sub' : (a.type === 'D' ? 'token-del' : 'token-ins'));
      html += `<span class="token-pill ${cls}">${a.hyp === ' ' ? '␣' : a.hyp}</span>`;
    });
    html += '</div></div>';
    html += '</div>';

    alignEl.innerHTML = html;
  }
}

/* ==========================================================================
   4. LIVE STREAMING EVALUATION PIPELINE
   ========================================================================== */

let pipelineChart = null;

function initLivePipeline() {
  const runBtn = document.getElementById('runPipelineBtn');
  const presetSelector = document.getElementById('pipelinePreset');

  const presets = {
    translation: {
      ref: 'The quick brown fox jumps over the lazy dog.',
      cand: 'A fast brown fox leaps over a lazy dog.'
    },
    summarization: {
      ref: 'Artificial intelligence is revolutionizing modern healthcare by improving diagnostic accuracy and drug discovery.',
      cand: 'AI is transforming healthcare through better diagnostics and faster drug discovery.'
    },
    exact: {
      ref: 'The Pacific Ocean.',
      cand: 'pacific ocean'
    },
    speech: {
      ref: 'recognize speech with neural networks',
      cand: 'wreck a nice beach with neural networks'
    },
    ocr: {
      ref: 'RECEIPT: #94028 TOTAL: $49.99',
      cand: 'RECEIPT: #9402B TOTAL: $49.90'
    }
  };

  if (presetSelector) {
    presetSelector.addEventListener('change', (e) => {
      const chosen = presets[e.target.value];
      if (chosen) {
        document.getElementById('pipeRef').value = chosen.ref;
        document.getElementById('pipeCand').value = chosen.cand;
        runLivePipeline();
      }
    });
  }

  const bleuOrderSelect = document.getElementById('pipelineBleuOrder');
  if (bleuOrderSelect) {
    bleuOrderSelect.addEventListener('change', runLivePipeline);
  }

  // Normalization checkpoint listeners
  const normCheckbox = document.getElementById('pipeOptNormalize');
  const subCheckboxes = ['pipeOptArticles', 'pipeOptPunct', 'pipeOptLower'];

  const syncSubCheckboxes = (enabled) => {
    subCheckboxes.forEach(id => {
      const el = document.getElementById(id);
      const parentLabel = el?.closest('label');
      if (el) el.disabled = !enabled;
      if (parentLabel) {
        parentLabel.style.opacity = enabled ? '1' : '0.4';
        parentLabel.style.cursor = enabled ? 'pointer' : 'not-allowed';
      }
    });
  };

  if (normCheckbox) {
    normCheckbox.addEventListener('change', (e) => {
      syncSubCheckboxes(e.target.checked);
      runLivePipeline();
    });
  }

  subCheckboxes.forEach(id => {
    document.getElementById(id)?.addEventListener('change', runLivePipeline);
  });

  // Real-time live stream as user types
  document.getElementById('pipeRef')?.addEventListener('input', runLivePipeline);
  document.getElementById('pipeCand')?.addEventListener('input', runLivePipeline);

  if (runBtn) {
    runBtn.addEventListener('click', runLivePipeline);
    runLivePipeline();
  }
}

function runLivePipeline() {
  const ref = document.getElementById('pipeRef')?.value || '';
  const cand = document.getElementById('pipeCand')?.value || '';
  const bleuOrder = parseInt(document.getElementById('pipelineBleuOrder')?.value, 10) || 4;

  // 1. Exact Match (with Normalization Checkpoint)
  const useNorm = document.getElementById('pipeOptNormalize')?.checked ?? true;
  const optArticles = document.getElementById('pipeOptArticles')?.checked ?? true;
  const optPunct = document.getElementById('pipeOptPunct')?.checked ?? true;
  const optLower = document.getElementById('pipeOptLower')?.checked ?? true;

  let emScore = 0.0;
  let emTitle = 'Norm Exact Match';
  let emSub = 'Normalized (Filter ON)';

  if (useNorm) {
    const normRef = normalizeText(ref, { lowercase: optLower, punctuation: optPunct, whitespace: true, articles: optArticles });
    const normCand = normalizeText(cand, { lowercase: optLower, punctuation: optPunct, whitespace: true, articles: optArticles });
    emScore = (normRef === normCand && normRef.length > 0) ? 1.0 : (normRef === '' && normCand === '' && ref.trim() === cand.trim() ? 1.0 : 0.0);
    emTitle = 'Norm Exact Match';
    emSub = 'Normalized (Filter ON)';
  } else {
    emScore = (ref.trim() === cand.trim() && ref.trim().length > 0) ? 1.0 : (ref.trim() === '' && cand.trim() === '' ? 1.0 : 0.0);
    emTitle = 'Raw Exact Match';
    emSub = 'Raw Strict (Filter OFF)';
  }

  // 2. BLEU with user selected order
  const bleuRes = computeBleuScore(ref, cand, bleuOrder);

  // 3. ROUGE
  const rougeRes = computeRougeScore(ref, cand);

  // 4. METEOR
  const meteorRes = computeMeteorScore(ref, cand);

  // 5. BERTScore (Simulated semantic)
  const bertRes = computeBertScoreSim(ref, cand);

  // 6. WER
  const werRes = computeLevenshteinMatrix(tokenize(ref), tokenize(cand));

  // 7. CER
  const cerRes = computeLevenshteinMatrix(ref.split(''), cand.split(''));

  // Update UI Cards
  const cardEMTitle = document.querySelector('#cardEM .m-title');
  if (cardEMTitle) cardEMTitle.textContent = emTitle;
  const cardEMSub = document.getElementById('cardEMSub');
  if (cardEMSub) cardEMSub.textContent = emSub;
  updatePipeCard('cardEM', (emScore * 100).toFixed(1) + '%', emScore * 100);

  const cardBleuTitle = document.querySelector('#cardBleu .m-title');
  if (cardBleuTitle) cardBleuTitle.textContent = `BLEU-${bleuOrder} Score`;
  updatePipeCard('cardBleu', (bleuRes.score * 100).toFixed(1), bleuRes.score * 100);
  updatePipeCard('cardRouge1', (rougeRes.r1.f1 * 100).toFixed(1) + '%', rougeRes.r1.f1 * 100);
  updatePipeCard('cardRougeL', (rougeRes.rl.f1 * 100).toFixed(1) + '%', rougeRes.rl.f1 * 100);
  updatePipeCard('cardMeteor', (meteorRes.score * 100).toFixed(1), meteorRes.score * 100);
  updatePipeCard('cardBert', (bertRes.f1 * 100).toFixed(1) + '%', bertRes.f1 * 100);
  updatePipeCard('cardWER', (werRes.wer * 100).toFixed(1) + '%', Math.min(100, werRes.wer * 100), true);
  updatePipeCard('cardCER', (cerRes.wer * 100).toFixed(1) + '%', Math.min(100, cerRes.wer * 100), true);

  // Render or Update Chart.js
  renderPipelineChart({
    emScore: emScore * 100,
    isNormalized: useNorm,
    bleu: bleuRes.score * 100,
    bleuOrder: bleuOrder,
    r1: rougeRes.r1.f1 * 100,
    rl: rougeRes.rl.f1 * 100,
    meteor: meteorRes.score * 100,
    bert: bertRes.f1 * 100,
    wer: Math.min(100, werRes.wer * 100),
    cer: Math.min(100, cerRes.wer * 100)
  });
}

function updatePipeCard(id, scoreText, pct, isErrorMetric = false) {
  const card = document.getElementById(id);
  if (!card) return;
  const scoreEl = card.querySelector('.m-score');
  const barEl = card.querySelector('.m-bar-fill');
  if (scoreEl) scoreEl.textContent = scoreText;
  if (barEl) {
    barEl.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    if (isErrorMetric) {
      barEl.style.background = pct > 30 ? 'var(--danger)' : 'var(--success)';
    } else {
      barEl.style.background = 'var(--accent-gradient)';
    }
  }
}

function renderPipelineChart(metrics) {
  const ctx = document.getElementById('pipelineChartCanvas');
  if (!ctx || typeof Chart === 'undefined') return;

  const data = [
    metrics.emScore ?? metrics.normEM,
    metrics.bleu,
    metrics.r1,
    metrics.rl,
    metrics.meteor,
    metrics.bert,
    metrics.wer,
    metrics.cer
  ];

  const labels = [
    metrics.isNormalized ? 'Norm EM' : 'Raw EM',
    `BLEU-${metrics.bleuOrder || 4}`,
    'ROUGE-1',
    'ROUGE-L',
    'METEOR',
    'BERTScore',
    'WER (Error)',
    'CER (Error)'
  ];

  const colors = [
    'rgba(56, 189, 248, 0.8)',
    'rgba(99, 102, 241, 0.8)',
    'rgba(168, 85, 247, 0.8)',
    'rgba(236, 72, 153, 0.8)',
    'rgba(34, 197, 94, 0.8)',
    'rgba(245, 158, 11, 0.8)',
    'rgba(239, 68, 68, 0.8)',
    'rgba(244, 63, 94, 0.8)'
  ];

  if (pipelineChart) {
    pipelineChart.data.labels = labels;
    pipelineChart.data.datasets[0].data = data;
    pipelineChart.update();
  } else {
    pipelineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Score (%) / Error Rate (%)',
          data: data,
          backgroundColor: colors,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            ticks: { color: '#94a3b8' }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8' }
          }
        },
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
}

/* ==========================================================================
   5. TASK RECOMMENDATION WIZARD (LESSON 10)
   ========================================================================== */

function initWizard() {
  const wizardButtons = document.querySelectorAll('.wizard-btn');
  const resultBox = document.getElementById('wizardResultContent');

  const recommendations = {
    mcq: {
      title: 'Multiple-Choice Questions (MCQ)',
      recommended: ['Exact Match (EM)', 'Accuracy'],
      why: 'Answers are predetermined discrete categories or letters (A, B, C, D). EM and Accuracy directly evaluate whether the chosen label is correct without ambiguity.',
      caution: 'Ensure prompt extracts only the key letter to avoid false negative non-matches.'
    },
    math: {
      title: 'Mathematical Question-Answering',
      recommended: ['Exact Match (with normalization)'],
      why: 'Math answers are strictly right or wrong. Exact Match confirms numerical equality once units, whitespace, and decimals are standardized.',
      caution: 'Standardize notation (e.g. "0.5" vs ".5" or fractions) before evaluation.'
    },
    classification: {
      title: 'Text / Sentiment Classification',
      recommended: ['Accuracy', 'Precision', 'Recall', 'F1-Score'],
      why: 'Measures class-specific performance. F1 balances Precision and Recall, which is crucial when datasets have class imbalance (e.g. spam vs normal).',
      caution: 'Do not rely on Accuracy alone on skewed datasets (Accuracy Paradox).'
    },
    translation: {
      title: 'Machine Translation',
      recommended: ['BLEU', 'METEOR', 'BERTScore'],
      why: 'BLEU measures strict n-gram precision; METEOR adds stemming, synonyms, and word order penalty; BERTScore checks deep contextual meaning.',
      caution: 'BLEU can penalize valid creative synonyms; combining BLEU with BERTScore provides the most balanced evaluation.'
    },
    summarization: {
      title: 'Text Summarization',
      recommended: ['ROUGE (ROUGE-1, ROUGE-2, ROUGE-L)', 'BERTScore'],
      why: 'ROUGE is recall-oriented to ensure critical source facts are retained. ROUGE-L handles word order via longest common subsequence.',
      caution: 'High ROUGE overlap does not guarantee factuality or hallucinations.'
    },
    open_qa: {
      title: 'Open-Ended Question Answering & Chat',
      recommended: ['BERTScore', 'Normalized Exact Match', 'LLM-as-a-Judge / Human Eval'],
      why: 'Natural language allows infinite valid paraphrases. BERTScore captures semantic equivalence even when wording diverges completely.',
      caution: 'Automatic metrics cannot verify deep mathematical proofs or recent real-world ground truth facts.'
    },
    asr: {
      title: 'Speech Recognition (ASR)',
      recommended: ['Word Error Rate (WER)', 'Character Error Rate (CER)'],
      why: 'Measures the minimum edit operations (Substitutions, Deletions, Insertions) needed to turn transcription into reference audio text.',
      caution: 'Pre-normalize numbers ("5" vs "five") and punctuation before computing WER.'
    },
    ocr: {
      title: 'OCR & Handwriting Recognition',
      recommended: ['Character Error Rate (CER)', 'Word Error Rate (WER)'],
      why: 'OCR errors often occur at single character glyphs (e.g., 0 vs O, 1 vs l). CER measures fine-grained recognition precision.',
      caution: 'Handle spaces and multi-line formatting consistently.'
    }
  };

  wizardButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      wizardButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const task = btn.getAttribute('data-task');
      const info = recommendations[task];

      if (info && resultBox) {
        resultBox.innerHTML = `
          <h4 style="font-size: 1.15rem; color: var(--accent-primary); margin-bottom: 8px;">
            <i class="fa-solid fa-bullseye"></i> ${info.title}
          </h4>
          <p style="margin-bottom: 8px;">
            <strong>Recommended Primary Metrics:</strong> 
            ${info.recommended.map(m => `<span class="badge badge-blue" style="margin-right: 4px;">${m}</span>`).join('')}
          </p>
          <p style="margin-bottom: 8px; color: var(--text-secondary); font-size: 0.9rem;">
            <strong>Why:</strong> ${info.why}
          </p>
          <p style="color: var(--warning); font-size: 0.85rem;">
            <strong><i class="fa-solid fa-triangle-exclamation"></i> Watch out:</strong> ${info.caution}
          </p>
        `;
      }
    });
  });
}
