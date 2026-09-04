import { CodeBlock } from "@/components/ui/CodeBlock";

export function GeneratedCode({ code }: { code: string }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-text-secondary mb-4">Эквивалентный Python код</h3>
      <CodeBlock code={code} />
    </div>
  );
}
