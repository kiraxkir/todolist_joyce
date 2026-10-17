const KEY = "todo-v2";
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, "0");
const ymd = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const todayStr = () => ymd(new Date());
const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return ymd(d); };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function loadTasks() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function saveTasks(t) { try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) { toast("Enregistrement impossible sur ce navigateur."); } }

function whenLabel(t) {
  if (!t.date) return "";
  let s = t.date === todayStr() ? "Aujourd’hui" : t.date === addDays(1) ? "Demain"
    : new Date(t.date + "T00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return s + (t.time ? " à " + t.time : "") + (t.remind ? " 🔔" : "");
}
function isLate(t) { return !t.done && t.date && new Date(t.date + "T" + (t.time || "23:59")) < new Date(); }

let toastTimer;
function toast(msg) {
  const el = $("toast"); if (!el) return;
  el.textContent = msg; el.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("show"), 4000);
}

/* Rappels : vérifiés toutes les 30 s tant que la page est ouverte */
function checkReminders() {
  const tasks = loadTasks(), now = new Date(); let changed = false;
  tasks.forEach(t => {
    if (t.done || !t.remind || t.notified || !t.date) return;
    if (now >= new Date(t.date + "T" + (t.time || "09:00"))) {
      t.notified = true; changed = true;
      toast("🔔 " + t.title);
      if ("Notification" in window && Notification.permission === "granted") {
        try { new Notification("Mes tâches", { body: t.title }); } catch (e) {}
      }
    }
  });
  if (changed) { saveTasks(tasks); if (typeof render === "function") render(); }
}
