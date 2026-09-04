"""
Генерирует datasets/titanic.csv — синтетический датасет со статистическими
закономерностями классического Titanic (пол, класс и возраст влияют на
выживаемость), без сетевой зависимости на внешний источник.
"""

import numpy as np
import pandas as pd

rng = np.random.default_rng(42)
n = 891

pclass = rng.choice([1, 2, 3], size=n, p=[0.24, 0.21, 0.55])
sex = rng.choice(["male", "female"], size=n, p=[0.65, 0.35])
age = np.clip(rng.normal(loc=29, scale=13, size=n), 0.42, 80).round(1)
sibsp = rng.choice([0, 1, 2, 3, 4], size=n, p=[0.68, 0.23, 0.06, 0.02, 0.01])
parch = rng.choice([0, 1, 2, 3], size=n, p=[0.76, 0.13, 0.08, 0.03])
embarked = rng.choice(["S", "C", "Q"], size=n, p=[0.72, 0.19, 0.09])

fare_base = {1: 84.0, 2: 20.0, 3: 13.0}
fare = np.array([max(4.0, rng.normal(fare_base[p], fare_base[p] * 0.4)) for p in pclass]).round(2)

logit = (
    -0.5
    + np.where(sex == "female", 2.4, -0.3)
    + np.where(pclass == 1, 1.6, np.where(pclass == 2, 0.6, -0.2))
    + np.where(age < 12, 1.2, 0.0)
    - 0.01 * age
    - 0.15 * sibsp
    + 0.002 * fare
)
prob = 1 / (1 + np.exp(-logit))
survived = (rng.random(n) < prob).astype(int)

cabin_letter = np.where(pclass == 1, "C", np.where(pclass == 2, "D", ""))
cabin = np.array(
    [f"{c}{rng.integers(1, 150)}" if c and rng.random() > 0.6 else "" for c in cabin_letter]
)

names = [
    f"{'Mr.' if s == 'male' else 'Mrs.' if rng.random() > 0.4 else 'Miss.'} Passenger {i}"
    for i, s in enumerate(sex)
]

df = pd.DataFrame(
    {
        "PassengerId": np.arange(1, n + 1),
        "Survived": survived,
        "Pclass": pclass,
        "Name": names,
        "Sex": sex,
        "Age": age,
        "SibSp": sibsp,
        "Parch": parch,
        "Ticket": [f"TCK{100000 + i}" for i in range(n)],
        "Fare": fare,
        "Cabin": cabin,
        "Embarked": embarked,
    }
)

# Реалистичные пропуски, как в оригинальном датасете
age_missing_idx = rng.choice(n, size=int(n * 0.2), replace=False)
df.loc[age_missing_idx, "Age"] = np.nan
embarked_missing_idx = rng.choice(n, size=2, replace=False)
df.loc[embarked_missing_idx, "Embarked"] = np.nan

df.to_csv("datasets/titanic.csv", index=False)
print(f"Сохранено datasets/titanic.csv: {df.shape}")
