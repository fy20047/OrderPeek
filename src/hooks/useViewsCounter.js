/**
   * 首頁載入時做瀏覽次數統計：
   * - 用 localStorage 儲存「今日日期」、「今日計數」、「總計數」
   * - 用 sessionStorage 確保「同一個分頁只加一次」，避免 F5 狂加
   *
   * key 命名：
   * - op_visit_date：YYYY-MM-DD
   * - op_visit_today：今日計數
   * - op_visit_total：總計數
   * - op_session_counted：此分頁是否已經計過
   */
  
// src/hooks/useViewsCounter.js
import { useEffect, useState } from 'react';

const KEYS = {
  day: 'op_visit_date',        // YYYY-MM-DD
  today: 'op_visit_today',     // 今日計數
  total: 'op_visit_total',     // 總計數
  session: 'op_session_counted'// 此分頁是否已計過
};

export default function useViewsCounter() {
  const [todayViews, setTodayViews] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const storedDay = localStorage.getItem(KEYS.day);

    // 跨日就重置今日計數
    if (storedDay !== todayStr) {
      localStorage.setItem(KEYS.day, todayStr);
      localStorage.setItem(KEYS.today, '0');
    }
    // 初始化總計
    if (!localStorage.getItem(KEYS.total)) {
      localStorage.setItem(KEYS.total, '0');
    }

    // 一個分頁只加一次（避免 F5 連加；也避免 StrictMode 二次掛載）
    if (!sessionStorage.getItem(KEYS.session)) {
      const t = parseInt(localStorage.getItem(KEYS.total) || '0', 10) + 1;
      localStorage.setItem(KEYS.total, String(t));

      const d = parseInt(localStorage.getItem(KEYS.today) || '0', 10) + 1;
      localStorage.setItem(KEYS.today, String(d));

      sessionStorage.setItem(KEYS.session, '1');
    }

    // 映射到畫面
    setTodayViews(parseInt(localStorage.getItem(KEYS.today) || '0', 10));
    setTotalViews(parseInt(localStorage.getItem(KEYS.total) || '0', 10));
  }, []);

  return { todayViews, totalViews };
}
