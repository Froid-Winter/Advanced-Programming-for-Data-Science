"""
TP04: NLP and LLM Evaluation Metrics Pipeline
==============================================
Pure-Python + standard library implementation of all 10 evaluation lessons in TP04:
1. Exact Match (EM)
2. Accuracy
3. Precision, Recall, and F1-Score
4. BLEU Score
5. ROUGE Score (ROUGE-1, ROUGE-2, ROUGE-L)
6. METEOR Score
7. BERTScore (Semantic Similarity)
8. Word Error Rate (WER)
9. Character Error Rate (CER)
10. Comparative Evaluation Pipeline
"""

import math
import re
import string
from collections import Counter
from typing import Dict, List, Tuple, Any, Optional


# =====================================================================
# 1. Exact Match (EM)
# =====================================================================

def normalize_text(text: str, lowercase: bool = True, remove_punct: bool = True,
                   remove_articles: bool = True, strip_whitespace: bool = True) -> str:
    """Standard NLP normalization for fair text comparisons."""
    if not text:
        return ""
    res = text
    if lowercase:
        res = res.lower()
    if remove_punct:
        res = res.translate(str.maketrans("", "", string.punctuation))
    if remove_articles:
        res = re.sub(r"\b(a|an|the)\b", " ", res, flags=re.IGNORECASE)
    if strip_whitespace:
        res = " ".join(res.split())
    return res


def exact_match(prediction: str, reference: str, normalize: bool = True) -> float:
    """
    Computes Exact Match (EM) score.
    Returns 1.0 if match, else 0.0.
    """
    if normalize:
        return 1.0 if normalize_text(prediction) == normalize_text(reference) else 0.0
    return 1.0 if prediction.strip() == reference.strip() else 0.0


def batch_exact_match(predictions: List[str], references: List[str], normalize: bool = True) -> float:
    """Computes average Exact Match across a batch of question-answer pairs."""
    if not predictions or len(predictions) != len(references):
        return 0.0
    scores = [exact_match(p, r, normalize=normalize) for p, r in zip(predictions, references)]
    return sum(scores) / len(scores)


# =====================================================================
# 2. Accuracy Evaluation
# =====================================================================

def accuracy_score_counts(tp: int, tn: int, fp: int, fn: int) -> float:
    """Calculates accuracy from confusion matrix counts: (TP + TN) / (TP + TN + FP + FN)."""
    total = tp + tn + fp + fn
    return (tp + tn) / total if total > 0 else 0.0


def accuracy_from_lists(y_true: List[Any], y_pred: List[Any]) -> float:
    """Calculates accuracy from true and predicted label lists."""
    if not y_true or len(y_true) != len(y_pred):
        return 0.0
    correct = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp)
    return correct / len(y_true)


# =====================================================================
# 3. Precision, Recall, and F1-Score
# =====================================================================

def precision_recall_f1_counts(tp: int, fp: int, fn: int) -> Dict[str, float]:
    """Computes Precision, Recall, and F1-score from confusion matrix counts."""
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 0.0
    return {
        "precision": precision,
        "recall": recall,
        "f1": f1
    }


# =====================================================================
# 4. BLEU Score
# =====================================================================

def get_ngrams(tokens: List[str], n: int) -> List[Tuple[str, ...]]:
    return [tuple(tokens[i:i + n]) for i in range(len(tokens) - n + 1)]


def bleu_score(reference: str, candidate: str, max_n: int = 4, weights: Optional[List[float]] = None) -> Dict[str, Any]:
    """
    Computes BLEU score (BLEU-1 to BLEU-N) with clipping, custom n-gram weights, and brevity penalty.
    """
    ref_tokens = normalize_text(reference, remove_articles=False).split()
    cand_tokens = normalize_text(candidate, remove_articles=False).split()

    c = len(cand_tokens)
    r = len(ref_tokens)

    if weights is None:
        weights = [1.0 / max_n] * max_n
    else:
        max_n = len(weights)
        total_w = sum(weights) or 1.0
        weights = [w / total_w for w in weights]

    if c == 0:
        return {"bleu": 0.0, "bp": 0.0, "precisions": [0.0] * max_n, "weights": weights}

    # Brevity penalty
    bp = 1.0 if c >= r else math.exp(1.0 - r / c)

    precisions = []
    for n in range(1, max_n + 1):
        cand_ngrams = get_ngrams(cand_tokens, n)
        ref_ngrams = get_ngrams(ref_tokens, n)

        if not cand_ngrams:
            precisions.append(0.0)
            continue

        cand_counts = Counter(cand_ngrams)
        ref_counts = Counter(ref_ngrams)

        clipped_matches = sum(min(count, ref_counts[ng]) for ng, count in cand_counts.items())
        p_n = clipped_matches / len(cand_ngrams)
        precisions.append(p_n)

    # Weighted geometric mean with smoothing
    log_sum = 0.0
    for w, p in zip(weights, precisions):
        log_sum += w * (math.log(p) if p > 0 else math.log(1e-4))

    score = bp * math.exp(log_sum)
    return {
        "bleu": score,
        "bp": bp,
        "precisions": precisions,
        "weights": weights,
        "cand_len": c,
        "ref_len": r
    }


# =====================================================================
# 5. ROUGE Score (ROUGE-1, ROUGE-2, ROUGE-L)
# =====================================================================

def lcs_length(seq1: List[str], seq2: List[str]) -> int:
    """Calculates Longest Common Subsequence length."""
    m, n = len(seq1), len(seq2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if seq1[i - 1] == seq2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    return dp[m][n]


def rouge_score(reference: str, candidate: str) -> Dict[str, Dict[str, float]]:
    """
    Computes ROUGE-1, ROUGE-2, and ROUGE-L (Precision, Recall, F1).
    """
    ref_tokens = normalize_text(reference, remove_articles=False).split()
    cand_tokens = normalize_text(candidate, remove_articles=False).split()

    def calc_overlap(ref_ngrams, cand_ngrams):
        cand_counts = Counter(cand_ngrams)
        ref_counts = Counter(ref_ngrams)
        overlap = sum(min(c, ref_counts[ng]) for ng, c in cand_counts.items())
        p = overlap / len(cand_ngrams) if cand_ngrams else 0.0
        r = overlap / len(ref_ngrams) if ref_ngrams else 0.0
        f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0
        return {"precision": p, "recall": r, "f1": f1}

    # ROUGE-1
    r1 = calc_overlap(get_ngrams(ref_tokens, 1), get_ngrams(cand_tokens, 1))

    # ROUGE-2
    r2 = calc_overlap(get_ngrams(ref_tokens, 2), get_ngrams(cand_tokens, 2))

    # ROUGE-L
    lcs_val = lcs_length(cand_tokens, ref_tokens)
    rl_p = lcs_val / len(cand_tokens) if cand_tokens else 0.0
    rl_r = lcs_val / len(ref_tokens) if ref_tokens else 0.0
    rl_f1 = (2 * rl_p * rl_r) / (rl_p + rl_r) if (rl_p + rl_r) > 0 else 0.0

    return {
        "rouge1": r1,
        "rouge2": r2,
        "rougeL": {"precision": rl_p, "recall": rl_r, "f1": rl_f1, "lcs": lcs_val}
    }


# =====================================================================
# 6. METEOR Score
# =====================================================================

def meteor_score_simple(reference: str, candidate: str) -> Dict[str, float]:
    """
    Computes METEOR-inspired alignment with weighted F-mean and fragmentation penalty.
    """
    ref_tokens = normalize_text(reference, remove_articles=False).split()
    cand_tokens = normalize_text(candidate, remove_articles=False).split()

    if not ref_tokens or not cand_tokens:
        return {"meteor": 0.0, "precision": 0.0, "recall": 0.0, "penalty": 0.0}

    # Find unigram matches
    matched_cand = set()
    matched_ref = set()
    alignments = []

    for c_idx, c_tok in enumerate(cand_tokens):
        for r_idx, r_tok in enumerate(ref_tokens):
            if c_idx not in matched_cand and r_idx not in matched_ref and c_tok == r_tok:
                matched_cand.add(c_idx)
                matched_ref.add(r_idx)
                alignments.append((c_idx, r_idx))
                break

    m = len(alignments)
    if m == 0:
        return {"meteor": 0.0, "precision": 0.0, "recall": 0.0, "penalty": 0.0}

    p = m / len(cand_tokens)
    r = m / len(ref_tokens)
    f_mean = (10 * p * r) / (r + 9 * p)

    # Chunks
    alignments.sort(key=lambda x: x[0])
    chunks = 1
    for i in range(1, len(alignments)):
        if alignments[i][0] != alignments[i - 1][0] + 1 or alignments[i][1] != alignments[i - 1][1] + 1:
            chunks += 1

    penalty = 0.5 * ((chunks / m) ** 3)
    score = f_mean * (1.0 - penalty)

    return {
        "meteor": max(0.0, score),
        "precision": p,
        "recall": r,
        "f_mean": f_mean,
        "penalty": penalty,
        "chunks": chunks,
        "matches": m
    }


# =====================================================================
# 7. BERTScore (Semantic Similarity)
# =====================================================================

def token_embedding_sim(token: str) -> List[float]:
    """Deterministic hash embedding generator for fast CPU testing."""
    v = [0.0] * 8
    for i, ch in enumerate(token):
        v[i % 8] += ord(ch)
    norm = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / norm for x in v]


def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    return max(0.0, min(1.0, sum(a * b for a, b in zip(vec_a, vec_b))))


def bertscore_sim(reference: str, candidate: str) -> Dict[str, float]:
    """
    Computes token-level semantic greedy alignment matching (BERTScore formulation).
    """
    ref_tokens = normalize_text(reference, remove_articles=False).split()
    cand_tokens = normalize_text(candidate, remove_articles=False).split()

    if not ref_tokens or not cand_tokens:
        return {"precision": 0.0, "recall": 0.0, "f1": 0.0}

    # Similarity matrix
    matrix = []
    for c in cand_tokens:
        row = []
        for r in ref_tokens:
            if c == r:
                sim = 1.0
            else:
                sim = 0.5 + 0.45 * cosine_similarity(token_embedding_sim(c), token_embedding_sim(r))
            row.append(sim)
        matrix.append(row)

    # Precision: each candidate token matched to best reference token
    p = sum(max(row) for row in matrix) / len(cand_tokens)

    # Recall: each reference token matched to best candidate token
    r = sum(max(matrix[i][j] for i in range(len(cand_tokens))) for j in range(len(ref_tokens))) / len(ref_tokens)

    f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0
    return {"precision": p, "recall": r, "f1": f1}


# =====================================================================
# 8 & 9. Word Error Rate (WER) & Character Error Rate (CER)
# =====================================================================

def levenshtein_distance_align(ref_items: List[Any], hyp_items: List[Any]) -> Dict[str, Any]:
    """
    Levenshtein distance with detailed operation backtrack (S, D, I).
    """
    n, m = len(ref_items), len(hyp_items)
    dp = [[0] * (m + 1) for _ in range(n + 1)]

    for i in range(n + 1):
        dp[i][0] = i
    for j in range(m + 1):
        dp[0][j] = j

    for i in range(1, n + 1):
        for j in range(1, m + 1):
            if ref_items[i - 1] == hyp_items[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = min(
                    dp[i - 1][j - 1] + 1,  # Sub
                    dp[i - 1][j] + 1,      # Del
                    dp[i][j - 1] + 1       # Ins
                )

    # Backtracking
    i, j = n, m
    s, d, ins, c = 0, 0, 0, 0
    alignment = []

    while i > 0 or j > 0:
        if i > 0 and j > 0 and ref_items[i - 1] == hyp_items[j - 1]:
            alignment.append(("C", ref_items[i - 1], hyp_items[j - 1]))
            c += 1
            i -= 1
            j -= 1
        elif i > 0 and j > 0 and dp[i][j] == dp[i - 1][j - 1] + 1:
            alignment.append(("S", ref_items[i - 1], hyp_items[j - 1]))
            s += 1
            i -= 1
            j -= 1
        elif i > 0 and dp[i][j] == dp[i - 1][j] + 1:
            alignment.append(("D", ref_items[i - 1], "***"))
            d += 1
            i -= 1
        else:
            alignment.append(("I", "***", hyp_items[j - 1]))
            ins += 1
            j -= 1

    alignment.reverse()
    rate = (s + d + ins) / n if n > 0 else 0.0

    return {
        "rate": rate,
        "substitutions": s,
        "deletions": d,
        "insertions": ins,
        "correct": c,
        "total_ref": n,
        "alignment": alignment
    }


def word_error_rate(reference: str, hypothesis: str) -> Dict[str, Any]:
    """Computes Word Error Rate (WER) using word-level Levenshtein alignment."""
    ref_words = normalize_text(reference, remove_articles=False).split()
    hyp_words = normalize_text(hypothesis, remove_articles=False).split()
    res = levenshtein_distance_align(ref_words, hyp_words)
    res["wer"] = res.pop("rate")
    return res


def character_error_rate(reference: str, hypothesis: str) -> Dict[str, Any]:
    """Computes Character Error Rate (CER) using character-level Levenshtein alignment."""
    res = levenshtein_distance_align(list(reference), list(hypothesis))
    res["cer"] = res.pop("rate")
    return res


# =====================================================================
# 10. Comparative Evaluation Pipeline Runner
# =====================================================================

class MetricEvaluationPipeline:
    """
    Unified Live Pipeline that runs all text metrics simultaneously.
    """

    @classmethod
    def evaluate(cls, reference: str, candidate: str) -> Dict[str, Any]:
        em = exact_match(candidate, reference, normalize=False)
        norm_em = exact_match(candidate, reference, normalize=True)
        bleu = bleu_score(reference, candidate)
        rouge = rouge_score(reference, candidate)
        meteor = meteor_score_simple(reference, candidate)
        bert = bertscore_sim(reference, candidate)
        wer = word_error_rate(reference, candidate)
        cer = character_error_rate(reference, candidate)

        return {
            "inputs": {
                "reference": reference,
                "candidate": candidate
            },
            "metrics": {
                "exact_match_raw": em,
                "exact_match_normalized": norm_em,
                "bleu_4": bleu["bleu"],
                "bleu_bp": bleu["bp"],
                "rouge_1_f1": rouge["rouge1"]["f1"],
                "rouge_2_f1": rouge["rouge2"]["f1"],
                "rouge_L_f1": rouge["rougeL"]["f1"],
                "meteor": meteor["meteor"],
                "bertscore_f1": bert["f1"],
                "wer": wer["wer"],
                "cer": cer["cer"]
            }
        }

    @classmethod
    def print_report(cls, reference: str, candidate: str):
        report = cls.evaluate(reference, candidate)
        print("=" * 60)
        print("TP04: MULTI-METRIC EVALUATION REPORT")
        print("=" * 60)
        print(f"Reference: '{reference}'")
        print(f"Candidate: '{candidate}'")
        print("-" * 60)
        m = report["metrics"]
        print(f"1. Exact Match (Raw):         {m['exact_match_raw']:.2f}")
        print(f"   Exact Match (Normalized):  {m['exact_match_normalized']:.2f}")
        print(f"2. BLEU-4 Score:              {m['bleu_4'] * 100:.2f}")
        print(f"3. ROUGE-1 F1:                {m['rouge_1_f1'] * 100:.2f}%")
        print(f"   ROUGE-2 F1:                {m['rouge_2_f1'] * 100:.2f}%")
        print(f"   ROUGE-L F1:                {m['rouge_L_f1'] * 100:.2f}%")
        print(f"4. METEOR Score:              {m['meteor'] * 100:.2f}")
        print(f"5. BERTScore F1:              {m['bertscore_f1'] * 100:.2f}%")
        print(f"6. Word Error Rate (WER):     {m['wer'] * 100:.2f}% (Lower is better)")
        print(f"7. Character Error Rate (CER):{m['cer'] * 100:.2f}% (Lower is better)")
        print("=" * 60)


if __name__ == "__main__":
    ref_sample = "The quick brown fox jumps over the lazy dog."
    cand_sample = "A fast brown fox leaps over a lazy dog."
    MetricEvaluationPipeline.print_report(ref_sample, cand_sample)