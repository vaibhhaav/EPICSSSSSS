"""
profile_matching.py

Implements ML-based matching between a single elder profile and multiple orphan
profiles using a Random Forest classifier. This module exposes a
`ProfileMatcher` class used by the FastAPI app in `main.py`.

Features used:
- age_diff: absolute age difference between elder and orphan
- language_match: Jaccard similarity between language sets
- hobby_similarity: Jaccard similarity between hobby sets
- emotional_needs_match: Jaccard similarity between emotional needs

The model is trained on synthetic (mock) data for demonstration purposes.
In production, you should:
- Replace `generate_mock_training_data` with your own historical dataset.
- Persist the trained model to disk (e.g., with joblib) and load it on startup.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Dict, Any

import numpy as np
from sklearn.ensemble import RandomForestClassifier


def jaccard_similarity(a: List[str], b: List[str]) -> float:
    set_a, set_b = set(a), set(b)
    if not set_a and not set_b:
        return 0.0
    intersection = len(set_a & set_b)
    union = len(set_a | set_b)
    return intersection / union if union > 0 else 0.0


def extract_features(elder: Dict[str, Any], orphan: Dict[str, Any]) -> np.ndarray:
    """Compute the feature vector for a single elder-orphan pair."""
    age_diff = abs(float(elder.get("age", 0)) - float(orphan.get("age", 0)))
    language_match = jaccard_similarity(
        elder.get("languages", []), orphan.get("languages", [])
    )
    hobby_similarity = jaccard_similarity(
        elder.get("hobbies", []), orphan.get("hobbies", [])
    )
    emotional_needs_match = jaccard_similarity(
        elder.get("emotional_needs", []), orphan.get("emotional_needs", [])
    )
    return np.array(
        [age_diff, language_match, hobby_similarity, emotional_needs_match],
        dtype=float,
    )


def generate_mock_training_data(num_samples: int = 200):
    """
    Generate a small synthetic dataset for training the RandomForest model.

    This is a heuristic:
    - Smaller age diff is better.
    - Higher similarity scores are better.
    """
    rng = np.random.default_rng(42)
    X = []
    y = []
    for _ in range(num_samples):
        age_diff = rng.integers(0, 50)
        language_match = rng.random()
        hobby_similarity = rng.random()
        emotional_needs_match = rng.random()

        # Heuristic label: good match if low age diff and high overlaps
        score = (
            -0.03 * age_diff
            + 0.5 * language_match
            + 0.4 * hobby_similarity
            + 0.6 * emotional_needs_match
        )
        label = 1 if score > 0.3 else 0

        X.append(
            [age_diff, language_match, hobby_similarity, emotional_needs_match]
        )
        y.append(label)

    return np.array(X, dtype=float), np.array(y, dtype=int)


@dataclass
class ProfileMatcher:
    """
    Encapsulates the Random Forest model and feature engineering.
    """

    model: RandomForestClassifier

    @classmethod
    def train_default(cls) -> "ProfileMatcher":
        X, y = generate_mock_training_data()
        model = RandomForestClassifier(
            n_estimators=80,
            max_depth=6,
            random_state=42,
        )
        model.fit(X, y)
        return cls(model=model)

    def score_pairs(
        self,
        elder_profile: Dict[str, Any],
        orphan_profiles: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Score each orphan profile for compatibility with the elder.

        Returns a list of:
        { "orphan_id": str, "score": float }
        sorted descending by score (0-1).
        """
        if not orphan_profiles:
            return []

        feature_matrix = np.vstack(
            [extract_features(elder_profile, orphan) for orphan in orphan_profiles]
        )

        # Use predict_proba to get a probability-like score for the positive class.
        probs = self.model.predict_proba(feature_matrix)[:, 1]

        results = []
        for orphan, p in zip(orphan_profiles, probs):
            orphan_id = orphan.get("id") or orphan.get("orphan_id")
            results.append({"orphan_id": orphan_id, "score": float(round(p, 4))})

        results.sort(key=lambda r: r["score"], reverse=True)
        return results


# Singleton-like instance used by FastAPI.
matcher = ProfileMatcher.train_default()

