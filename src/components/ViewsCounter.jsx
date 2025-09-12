// src/components/ViewsCounter.jsx
import useViewsCounter from '../hooks/useViewsCounter';

export default function ViewsCounter({ className }) {
  const { todayViews, totalViews } = useViewsCounter();
  return (
    <div className={className} aria-live="polite">
      今日：{todayViews}　|　累計：{totalViews}
    </div>
  );
}
