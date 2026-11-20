"""
Unit Tests for TP04 Metrics Pipeline
====================================
Tests all 10 lessons in TP04.
"""

import pytest
from metrics_pipeline import (
    exact_match,
    normalize_text,
    batch_exact_match,
    accuracy_score_counts,
    accuracy_from_lists,
    precision_recall_f1_counts,
    bleu_score,
    rouge_score,
    meteor_score_simple,
    bertscore_sim,
    word_error_rate,
    character_error_rate,
    MetricEvaluationPipeline
)


def test_lesson_1_exact_match():
    # Exact raw
    assert exact_match("Paris", "Paris", normalize=False) == 1.0
    assert exact_match("Paris ", "Paris", normalize=False) == 1.0  # stripped
    assert exact_match("paris", "Paris", normalize=False) == 0.0

    # Normalized
    assert exact_match("The Pacific Ocean.", "pacific ocean", normalize=True) == 1.0
    assert exact_match("pacific ocean", "atlantic ocean", normalize=True) == 0.0

    # Batch EM
    preds = ["A", "B", "C", "D"]
    refs = ["A", "B", "X", "D"]
    assert batch_exact_match(preds, refs, normalize=False) == 0.75


def test_lesson_2_accuracy():
    # Counts
    acc = accuracy_score_counts(tp=45, tn=45, fp=5, fn=5)
    assert acc == 0.90

    # Lists
    y_true = [1, 0, 1, 1, 0]
    y_pred = [1, 0, 1, 0, 0]
    assert accuracy_from_lists(y_true, y_pred) == 0.80


def test_lesson_3_precision_recall_f1():
    # TP=80, FP=20, FN=10
    # P = 80 / 100 = 0.8
    # R = 80 / 90 = 0.8888...
    # F1 = 2 * 0.8 * (8/9) / (0.8 + 8/9) = 1.6 * (8/9) / (7.2/9 + 8/9) = 1.28 / 1.6888... = 0.8421
    res = precision_recall_f1_counts(tp=80, fp=20, fn=10)
    assert abs(res["precision"] - 0.80) < 1e-4
    assert abs(res["recall"] - (80 / 90)) < 1e-4
    assert abs(res["f1"] - (2 * 0.8 * (80 / 90) / (0.8 + 80 / 90))) < 1e-4


def test_lesson_4_bleu_score():
    ref = "the quick brown fox jumps over the lazy dog"
    cand_exact = "the quick brown fox jumps over the lazy dog"
    cand_diff = "a fast brown dog runs"

    res_exact = bleu_score(ref, cand_exact)
    assert abs(res_exact["bleu"] - 1.0) < 1e-3
    assert res_exact["bp"] == 1.0

    res_diff = bleu_score(ref, cand_diff)
    assert 0.0 <= res_diff["bleu"] < 1.0

    # User-selectable N-gram tests (BLEU-1, BLEU-2, custom weights)
    res_b1 = bleu_score(ref, cand_exact, max_n=1)
    assert abs(res_b1["bleu"] - 1.0) < 1e-3
    assert len(res_b1["precisions"]) == 1

    res_b2 = bleu_score(ref, "the quick brown fox", max_n=2)
    assert res_b2["bp"] < 1.0  # brevity penalty applies
    assert len(res_b2["precisions"]) == 2

    # Custom weights e.g. 70% unigram, 30% bigram
    res_custom = bleu_score(ref, cand_exact, weights=[0.7, 0.3])
    assert abs(res_custom["bleu"] - 1.0) < 1e-3
    assert len(res_custom["precisions"]) == 2


def test_lesson_5_rouge_score():
    ref = "machine learning algorithms learn from training data"
    cand = "machine learning algorithms learn from data"

    res = rouge_score(ref, cand)
    assert res["rouge1"]["f1"] > 0.8
    assert res["rouge2"]["f1"] > 0.6
    assert res["rougeL"]["f1"] > 0.8
    assert res["rougeL"]["lcs"] == 6


def test_lesson_6_meteor_score():
    ref = "the president gave a speech yesterday"
    cand = "yesterday the president gave a speech"

    res = meteor_score_simple(ref, cand)
    assert res["matches"] == 6
    assert res["meteor"] > 0.5


def test_lesson_7_bertscore():
    ref = "A lovely puppy playing in park"
    cand = "An adorable dog running in garden"

    res = bertscore_sim(ref, cand)
    assert 0.0 <= res["f1"] <= 1.0
    assert res["f1"] > 0.7  # should detect strong semantic similarity


def test_lesson_8_wer():
    ref = "I like AI"
    cand = "I love AI"
    res = word_error_rate(ref, cand)
    # 1 substitution out of 3 words = 1/3 ~ 0.3333
    assert abs(res["wer"] - (1 / 3)) < 1e-3
    assert res["substitutions"] == 1
    assert res["deletions"] == 0
    assert res["insertions"] == 0

    # Insertion
    cand_ins = "I really like AI"
    res_ins = word_error_rate(ref, cand_ins)
    assert abs(res_ins["wer"] - (1 / 3)) < 1e-3
    assert res_ins["insertions"] == 1


def test_lesson_9_cer():
    ref = "CAT"
    cand = "CUT"
    res = character_error_rate(ref, cand)
    # 1 sub out of 3 chars = 1/3 ~ 33.33%
    assert abs(res["cer"] - (1 / 3)) < 1e-3
    assert res["substitutions"] == 1


def test_lesson_10_comparative_pipeline():
    ref = "Paris is the capital of France."
    cand = "Paris is France capital."
    res = MetricEvaluationPipeline.evaluate(ref, cand)

    assert "metrics" in res
    assert "bleu_4" in res["metrics"]
    assert "rouge_1_f1" in res["metrics"]
    assert "wer" in res["metrics"]
    assert "cer" in res["metrics"]
    assert res["metrics"]["exact_match_raw"] == 0.0
