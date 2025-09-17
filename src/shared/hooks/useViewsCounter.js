import { useEffect, useState } from "react";

const KEYS = {
  day: "op_visit_date",         // YYYY-MM-DD；紀錄今天是哪一天
  today: "op_visit_today",      // 今日累計瀏覽數
  total: "op_visit_total",      // 歷史累計瀏覽數
  session: "op_session_counted", // 此瀏覽器頁籤是否已計數，避免重複累加
};

// 以本地時區產生 yyyy-mm-dd，避免 UTC 跨日帶來誤判
function getLocalDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 提供 ViewsCounter 使用的自訂 hook
export function useViewsCounter() {
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    try {
      const todayStr = getLocalDateStr();
      const storedDay = localStorage.getItem(KEYS.day);

      // 若跨日，重置今日計數並允許重新累加
      if (storedDay !== todayStr) {
        localStorage.setItem(KEYS.day, todayStr);
        localStorage.setItem(KEYS.today, "0");
        sessionStorage.removeItem(KEYS.session);
      }

      // 初始化總計欄位
      if (localStorage.getItem(KEYS.total) == null) {
        localStorage.setItem(KEYS.total, "0");
      }

      // 尚未在本頁籤計數過，則今日與總數各加一
      if (!sessionStorage.getItem(KEYS.session)) {
        const nextTotal = (parseInt(localStorage.getItem(KEYS.total) || "0", 10) || 0) + 1;
        const nextToday = (parseInt(localStorage.getItem(KEYS.today) || "0", 10) || 0) + 1;

        localStorage.setItem(KEYS.total, String(nextTotal));
        localStorage.setItem(KEYS.today, String(nextToday));
        sessionStorage.setItem(KEYS.session, "1");
      }

      // 將最新數字寫回畫面
      setToday(parseInt(localStorage.getItem(KEYS.today) || "0", 10) || 0);
      setTotal(parseInt(localStorage.getItem(KEYS.total) || "0", 10) || 0);
    } catch {
      // 私密模式或停用儲存時可能拋錯，忽略即可
    }
  }, []);

  return { today, total };
}
