(function () {
  const tables = document.querySelectorAll(".sort-table");
  if (!tables.length) return;

  tables.forEach((table) => {
    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    if (!thead || !tbody) return;

    const headers = thead.querySelectorAll("th");
    if (!headers.length) return;

    let currentSort = {
      index: null,
      direction: null,
    };

    headers.forEach((th, index) => {
      th.addEventListener("click", function () {
        const type = th.dataset.type || "text";

        let direction;

        if (currentSort.index === index) {
          direction = currentSort.direction === "asc" ? "desc" : "asc";
        } else {
          direction = type === "number" ? "desc" : "asc";
        }

        sortTable(tbody, index, type, direction);
        currentSort = { index, direction };
      });
    });
  });

  function sortTable(tbody, columnIndex, type, direction) {
    const rows = Array.from(tbody.querySelectorAll("tr"));

    rows.sort((rowA, rowB) => {
      const cellA = rowA.children[columnIndex];
      const cellB = rowB.children[columnIndex];

      const valueA = getCellValue(cellA, type);
      const valueB = getCellValue(cellB, type);

      let result = 0;

      if (type === "number") {
        result = valueA - valueB;
      } else {
        result = valueA.localeCompare(valueB, "cs", { sensitivity: "base" });
      }

      return direction === "asc" ? result : -result;
    });

    rows.forEach((row) => tbody.appendChild(row));
  }

  function getCellValue(cell, type) {
    if (!cell) return type === "number" ? 0 : "";

    const customSortValue = cell.dataset.sort;

    if (customSortValue !== undefined) {
      return type === "number"
        ? parseSortableNumber(customSortValue)
        : customSortValue.trim();
    }

    const text = cell.textContent.trim();

    if (type === "number") {
      return parseSortableNumber(text);
    }

    return text;
  }

  function parseSortableNumber(value) {
    if (!value) return 0;

    const normalized = value
      .toString()
      .trim()
      .replace(",", ".")
      .replace(/[^\d.-]/g, "");

    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
})();
