import { Card } from "@/components/ui/Card";

export function TopModels({ topModels }: { topModels: { model: string; wins: number }[] }) {
  const max = Math.max(...topModels.map((m) => m.wins), 1);

  return (
    <Card>
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Топ моделей
      </h3>
      {topModels.length === 0 ? (
        <p className="text-sm text-text-muted">Пока нет завершённых пайплайнов</p>
      ) : (
        <div className="flex flex-col gap-3">
          {topModels.map((m) => (
            <div key={m.model} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-xs font-mono text-text-primary truncate">
                {m.model}
              </span>
              <div className="flex-1 h-3 bg-surface rounded-sm overflow-hidden">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${(m.wins / max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-mono text-text-secondary">
                {m.wins}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
