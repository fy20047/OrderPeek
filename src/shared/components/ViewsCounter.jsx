import { useViewsCounter } from "@/shared/hooks/useViewsCounter";

export default function ViewsCounter({ className }) {
  const { today, total } = useViewsCounter();
  return (
    <div className={className} aria-live="polite">
      今日：{today} 次｜累計：{total}
    </div>
  );
}
