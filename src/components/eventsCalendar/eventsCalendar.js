(async function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  const toolbarEl = document.getElementById("calendarToolbar");
  if (!calendarEl || !toolbarEl) return;

  const prevBtn = toolbarEl.querySelector('[data-cal="prev"]');
  const nextBtn = toolbarEl.querySelector('[data-cal="next"]');

  // ВАЖНО: добавь этот класс НА <select>
  const monthSelect = toolbarEl.querySelector(".js-calendar-month");
  if (!monthSelect) return;

  const hasTippy = typeof window.tippy === "function";

  const eventsUrl =
    calendarEl.getAttribute("data-events-url") || "./ajax-calendar.json";

  const defaultMonth = calendarEl.getAttribute("data-default-month");
  const initialDate = monthToDate(defaultMonth) || new Date();

  const events = await loadEventsJson(eventsUrl);

  let calendar = null;
  let isSyncing = false;

  function parseMonthValue(v) {
    const s = String(v || "").trim();
    const m = s.match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mm = Number(m[2]);
    if (!y || mm < 1 || mm > 12) return null;
    return { y, m: mm };
  }

  function gotoFromSelectValue(value) {
    if (!calendar) return;
    const parsed = parseMonthValue(value);
    if (!parsed) return;
    calendar.gotoDate(new Date(parsed.y, parsed.m - 1, 1));
  }

  function onMonthPick() {
    // isSyncing = только чтобы "наши" обновления селекта не гоняли gotoDate по кругу
    if (isSyncing) return;
    gotoFromSelectValue(monthSelect.value);
  }

  function syncSelectFromCalendar() {
    if (!calendar) return;

    const d = calendar.getDate();
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;

    if (String(monthSelect.value).trim() === val) return;

    isSyncing = true;
    try {
      monthSelect.value = val;

      // обновить UI select2 (если он есть)
      if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2) {
        window.jQuery(monthSelect).trigger("change.select2");
      } else {
        monthSelect.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } finally {
      isSyncing = false;
    }
  }

  // 1) Нативные события
  monthSelect.addEventListener("change", onMonthPick);
  monthSelect.addEventListener("input", onMonthPick);

  // 2) Событие select2 (это ключевое)
  if (window.jQuery && window.jQuery.fn && window.jQuery.fn.select2) {
    window.jQuery(monthSelect).on("select2:select", function () {
      onMonthPick();
    });
  }

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    initialDate,
    locale: "cs",
    firstDay: 1,
    height: "auto",
    fixedWeekCount: false,
    dayMaxEvents: true,
    dayHeaderFormat: { weekday: "long" },
    expandRows: true,
    headerToolbar: false,
    events,

    dayHeaderContent(arg) {
      const isMobile = window.innerWidth < 640;
      return isMobile ? arg.text.slice(0, 2) : arg.text;
    },

    eventDidMount(info) {
      const e = info.event;
      const desc = e.extendedProps?.popis || "";
      const loc = e.extendedProps?.misto || "";
      const html =
        `<div style="font-size:12px;line-height:1.3">` +
        `<div style="font-weight:700;margin-bottom:4px">${escapeHtml(
          e.title
        )}</div>` +
        (desc ? `<div>${escapeHtml(desc)}</div>` : "") +
        (loc
          ? `<div style="opacity:.8;margin-top:4px">${escapeHtml(loc)}</div>`
          : "") +
        `<div style="opacity:.7;margin-top:6px">${formatDateRange(
          e.start,
          e.end,
          calendar
        )}</div>` +
        `</div>`;

      if (hasTippy) {
        window.tippy(info.el, {
          content: html,
          allowHTML: true,
          placement: "top",
          animation: "scale",
        });
      } else {
        info.el.title = stripHtml(html);
      }
    },

    datesSet() {
      syncSelectFromCalendar();
    },

    eventClick(info) {
      if (info.event.url) {
        info.jsEvent.preventDefault();
        window.open(info.event.url, "_blank");
      }
    },
  });

  calendar.render();
  syncSelectFromCalendar();

  prevBtn?.addEventListener("click", () => calendar.prev());
  nextBtn?.addEventListener("click", () => calendar.next());

  function monthToDate(value) {
    const m = String(value || "")
      .trim()
      .match(/^(\d{4})-(\d{2})$/);
    if (!m) return null;
    const y = Number(m[1]);
    const mm = Number(m[2]);
    if (!y || mm < 1 || mm > 12) return null;
    return new Date(y, mm - 1, 1);
  }

  async function loadEventsJson(url) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) return [];
      const data = await r.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.events)) return data.events;
      return [];
    } catch {
      return [];
    }
  }

  function formatDateRange(start, end, calendarInstance) {
    if (!start) return "";
    let endInclusive = null;
    if (end) {
      endInclusive = new Date(end.getTime());
      endInclusive.setDate(endInclusive.getDate() - 1);
    }
    const fmt = (d) =>
      calendarInstance.formatDate(d, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

    if (!end || fmt(start) === fmt(endInclusive)) return fmt(start);
    return `${fmt(start)} – ${fmt(endInclusive)}`;
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function stripHtml(html) {
    return String(html)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
})();

// (async function initCalendar() {
//   const calendarEl = document.getElementById("calendar");
//   const toolbarEl = document.getElementById("calendarToolbar");
//   if (!calendarEl || !toolbarEl) return;

//   const prevBtn = toolbarEl.querySelector('[data-cal="prev"]');
//   const nextBtn = toolbarEl.querySelector('[data-cal="next"]');
//   const monthSelect = toolbarEl.querySelector('[data-cal="month"]');

//   const hasTippy = typeof window.tippy === "function";

//   const eventsUrl =
//     calendarEl.getAttribute("data-events-url") || "./ajax-calendar.json";

//   const defaultMonth = calendarEl.getAttribute("data-default-month");
//   const initialDate = monthToDate(defaultMonth) || new Date();

//   const events = await loadEventsJson(eventsUrl);

//   const calendar = new FullCalendar.Calendar(calendarEl, {
//     initialView: "dayGridMonth",
//     initialDate,
//     locale: "cs",
//     firstDay: 1,
//     height: "auto",
//     fixedWeekCount: false,
//     dayMaxEvents: true,
//     dayHeaderFormat: { weekday: "long" },
//     expandRows: true,
//     headerToolbar: false,
//     events,

//     dayHeaderContent(arg) {
//       const isMobile = window.innerWidth < 640;
//       return isMobile ? arg.text.slice(0, 2) : arg.text;
//     },

//     eventDidMount(info) {
//       const e = info.event;
//       const desc = e.extendedProps?.popis || "";
//       const loc = e.extendedProps?.misto || "";
//       const html =
//         `<div style="font-size:12px;line-height:1.3">` +
//         `<div style="font-weight:700;margin-bottom:4px">${escapeHtml(
//           e.title
//         )}</div>` +
//         (desc ? `<div>${escapeHtml(desc)}</div>` : "") +
//         (loc
//           ? `<div style="opacity:.8;margin-top:4px">${escapeHtml(loc)}</div>`
//           : "") +
//         `<div style="opacity:.7;margin-top:6px">${formatDateRange(
//           e.start,
//           e.end,
//           calendar
//         )}</div>` +
//         `</div>`;

//       if (hasTippy) {
//         window.tippy(info.el, {
//           content: html,
//           allowHTML: true,
//           placement: "top",
//           animation: "scale",
//         });
//       } else {
//         info.el.title = stripHtml(html);
//       }
//     },

//     datesSet() {
//       syncSelectFromCalendar();
//     },

//     eventClick(info) {
//       if (info.event.url) {
//         info.jsEvent.preventDefault();
//         window.open(info.event.url, "_blank");
//       }
//     },
//   });

//   calendar.render();

//   syncSelectFromCalendar();

//   prevBtn?.addEventListener("click", () => {
//     calendar.prev();
//   });

//   nextBtn?.addEventListener("click", () => {
//     calendar.next();
//   });

//   function onMonthPick() {
//     if (!monthSelect) return;

//     const [y, m] = monthSelect.value.split("-").map(Number);
//     if (!y || !m) return;

//     calendar.gotoDate(new Date(y, m - 1, 1));
//   }

//   monthSelect?.addEventListener("change", onMonthPick);
//   monthSelect?.addEventListener("input", onMonthPick);

//   function syncSelectFromCalendar() {
//     if (!monthSelect) return;

//     const d = calendar.getDate();
//     const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
//       2,
//       "0"
//     )}`;

//     if (monthSelect.value !== val) {
//       monthSelect.value = val;

//       monthSelect.dispatchEvent(new Event("change", { bubbles: true }));
//     }
//   }

//   function monthToDate(value) {
//     const m = String(value || "").match(/^(\d{4})-(\d{2})$/);
//     if (!m) return null;
//     const y = Number(m[1]);
//     const mm = Number(m[2]);
//     if (!y || mm < 1 || mm > 12) return null;
//     return new Date(y, mm - 1, 1);
//   }

//   async function loadEventsJson(url) {
//     try {
//       const r = await fetch(url, { cache: "no-store" });
//       if (!r.ok) return [];
//       const data = await r.json();
//       if (Array.isArray(data)) return data;
//       if (Array.isArray(data?.events)) return data.events;
//       return [];
//     } catch {
//       return [];
//     }
//   }

//   function formatDateRange(start, end, calendarInstance) {
//     if (!start) return "";
//     let endInclusive = null;
//     if (end) {
//       endInclusive = new Date(end.getTime());
//       endInclusive.setDate(endInclusive.getDate() - 1);
//     }
//     const fmt = (d) =>
//       calendarInstance.formatDate(d, {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//       });

//     if (!end || fmt(start) === fmt(endInclusive)) return fmt(start);
//     return `${fmt(start)} – ${fmt(endInclusive)}`;
//   }

//   function escapeHtml(str) {
//     return String(str)
//       .replaceAll("&", "&amp;")
//       .replaceAll("<", "&lt;")
//       .replaceAll(">", "&gt;")
//       .replaceAll('"', "&quot;")
//       .replaceAll("'", "&#039;");
//   }

//   function stripHtml(html) {
//     return String(html)
//       .replace(/<[^>]*>/g, " ")
//       .replace(/\s+/g, " ")
//       .trim();
//   }
// })();
