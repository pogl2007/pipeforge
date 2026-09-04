const STACK = [
  { name: "scikit-learn", icon: "🧮" },
  { name: "XGBoost", icon: "⚡" },
  { name: "LightGBM", icon: "💡" },
  { name: "CatBoost", icon: "🐱" },
  { name: "Optuna", icon: "🎯" },
  { name: "SHAP", icon: "🔍" },
  { name: "pandas", icon: "🐼" },
  { name: "joblib", icon: "⚙️" },
];

function Row() {
  return (
    <div className="flex items-center gap-10 shrink-0 pr-10">
      {STACK.map((item) => (
        <span
          key={item.name}
          className="flex items-center gap-2 font-mono text-sm text-text-secondary whitespace-nowrap"
        >
          <span className="text-base">{item.icon}</span>
          {item.name}
        </span>
      ))}
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="border-y border-border bg-surface/60 py-4 overflow-hidden">
      <div className="flex w-max animate-marquee">
        <Row />
        <Row />
      </div>
    </div>
  );
}
