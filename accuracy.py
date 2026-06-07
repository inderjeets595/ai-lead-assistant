"""
accuracy.py — Standalone AI Accuracy Analytics Module
======================================================
Computes internal-consistency accuracy metrics from the Lead database.

This module is FULLY DECOUPLED from app.py:
  - It does NOT import from app.py
  - It receives `db` and the `Lead` model as arguments
  - It contains its own self-contained copy of the classification rule

Accuracy Definition
-------------------
A prediction is CORRECT when the `status` stored in the database
matches what the scoring rules would derive for the stored `score`.

This measures the internal consistency of the rule-based AI system.
It requires zero external ground-truth labels and uses only
existing database columns (score, status, created_at).
"""

# =========================================================
# INTERNAL CLASSIFICATION RULE (self-contained copy)
# Intentionally does NOT import get_lead_status() from app.py
# to keep this module fully independent.
# =========================================================

def _predict_status(score):
    """
    Derive lead status from a numeric score.
    This is a self-contained copy of the classification rule —
    identical thresholds to app.py's get_lead_status(),
    kept separate to avoid coupling.

    Args:
        score: numeric lead score (int/float) or None

    Returns:
        str: "Hot Lead", "Warm Lead", or "Cold Lead"
    """
    try:
        if score is None:
            return "Cold Lead"
        score = int(score)
    except (TypeError, ValueError):
        return "Cold Lead"

    if score >= 70:
        return "Hot Lead"
    elif score >= 30:
        return "Warm Lead"
    else:
        return "Cold Lead"


# =========================================================
# EMPTY METRICS HELPER
# =========================================================

def _empty_metrics():
    """Return zero-value metrics structure when no leads exist."""
    return {
        "overall_accuracy": 0.0,
        "total_evaluated": 0,
        "correct_predictions": 0,
        "incorrect_predictions": 0,
        "accuracy_trend_labels": [],
        "accuracy_trend_values": [],
        "breakdown": {
            "Hot":  {"correct": 0, "incorrect": 0},
            "Warm": {"correct": 0, "incorrect": 0},
            "Cold": {"correct": 0, "incorrect": 0},
        },
    }


# =========================================================
# MAIN PUBLIC FUNCTION
# =========================================================

def compute_accuracy_metrics(db, Lead):
    """
    Compute all AI accuracy metrics from the Lead table.

    Iterates all leads and checks whether the stored `status`
    matches the `_predict_status(score)` result for each row.

    Args:
        db   : SQLAlchemy db instance (passed from app.py)
        Lead : Lead model class        (passed from app.py)

    Returns:
        dict with keys:
            overall_accuracy        (float)  — overall % correct
            total_evaluated         (int)    — total leads assessed
            correct_predictions     (int)    — count of correct
            incorrect_predictions   (int)    — count of incorrect
            accuracy_trend_labels   (list)   — date strings (sorted)
            accuracy_trend_values   (list)   — daily accuracy % (float)
            breakdown               (dict)   — per-class correct/incorrect
    """

    all_leads = Lead.query.all()
    total_evaluated = len(all_leads)

    if total_evaluated == 0:
        return _empty_metrics()

    correct = 0
    incorrect = 0

    # Per-class accuracy counters  (key = "Hot" | "Warm" | "Cold")
    breakdown = {
        "Hot":  {"correct": 0, "incorrect": 0},
        "Warm": {"correct": 0, "incorrect": 0},
        "Cold": {"correct": 0, "incorrect": 0},
    }

    # Daily accuracy bucket  { "YYYY-MM-DD": {"correct": int, "total": int} }
    daily = {}

    for lead in all_leads:

        # Derive what status the score should produce right now
        predicted = _predict_status(lead.score)

        # Compare against what is stored in the DB
        stored = lead.status if lead.status else "Cold Lead"
        is_correct = (predicted == stored)

        # Overall counters
        if is_correct:
            correct += 1
        else:
            incorrect += 1

        # Breakdown by predicted class
        cls_key = predicted.replace(" Lead", "")   # "Hot", "Warm", "Cold"
        if cls_key in breakdown:
            if is_correct:
                breakdown[cls_key]["correct"] += 1
            else:
                breakdown[cls_key]["incorrect"] += 1

        # Daily accuracy bucket
        if lead.created_at:
            day_str = lead.created_at.strftime("%Y-%m-%d")
        else:
            day_str = "Unknown"

        if day_str not in daily:
            daily[day_str] = {"correct": 0, "total": 0}
        daily[day_str]["total"] += 1
        if is_correct:
            daily[day_str]["correct"] += 1

    # Overall accuracy percentage
    overall_accuracy = round((correct / total_evaluated) * 100, 1)

    # Daily accuracy trend — sorted chronologically
    sorted_days = sorted(daily.keys())
    accuracy_trend_labels = sorted_days
    accuracy_trend_values = []

    for day in sorted_days:
        d = daily[day]
        pct = round((d["correct"] / d["total"]) * 100, 1) if d["total"] > 0 else 0.0
        accuracy_trend_values.append(pct)

    return {
        "overall_accuracy":       overall_accuracy,
        "total_evaluated":        total_evaluated,
        "correct_predictions":    correct,
        "incorrect_predictions":  incorrect,
        "accuracy_trend_labels":  accuracy_trend_labels,
        "accuracy_trend_values":  accuracy_trend_values,
        "breakdown":              breakdown,
    }
