(async function initCalendar() {
  const calendarEl = document.getElementById("calendar");
  const toolbarEl = document.getElementById("calendarToolbar");
  if (!calendarEl || !toolbarEl) return;

  const prevBtn = toolbarEl.querySelector('[data-cal="prev"]');
  const nextBtn = toolbarEl.querySelector('[data-cal="next"]');
  const monthSelect = toolbarEl.querySelector('[data-cal="month"]');

  const hasTippy = typeof window.tippy === "function";
  const events = await loadEventsJson("./ajax-calendar.json");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
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

      if (isMobile) {
        return arg.text.slice(0, 2);
      }

      return arg.text;
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
      syncFromCalendar();
    },
    eventClick(info) {
      if (info.event.url) {
        info.jsEvent.preventDefault();
        window.open(info.event.url, "_blank");
      }
    },
  });

  calendar.render();
  syncFromCalendar();

  prevBtn?.addEventListener("click", () => {
    calendar.prev();
    syncFromCalendar();
  });

  nextBtn?.addEventListener("click", () => {
    calendar.next();
    syncFromCalendar();
  });

  monthSelect?.addEventListener("change", () => {
    const [y, m] = monthSelect.value.split("-").map(Number);
    calendar.gotoDate(new Date(y, m - 1, 1));
    syncFromCalendar();
  });

  function syncFromCalendar() {
    if (!monthSelect) return;
    const d = calendar.getDate();
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    if (monthSelect.value !== val) monthSelect.value = val;
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
