// /**
//  * Opens gallery
//  * @param {Object} data
//  */
// function openGallery(data, start) {
//   if (!data) return;

//   const lightbox = new FsLightbox();
//   lightbox.props.sources = data;
//   lightbox.props.type = "image";
//   lightbox.props.showThumbsOnMount = true;
//   lightbox.open(start ?? 0);
// }

// /**
//  * Get gallery
//  * @param {Number} id
//  * @param {String} source
//  * @param {Number|undefined} start
//  */
// async function fetchData(id, source, start) {
//   const url = new URL(window.location.origin + source);
//   url.searchParams.append("id", id);
//   start = start ? parseInt(start) : 0;

//   fetch(url, {
//     method: "GET",
//     headers: { "Content-Type": "application/json" },
//   })
//     .then((response) => response.json())
//     .then((data) => openGallery(data, start))
//     .catch((err) => console.log(err));
// }

// /**
//  * Gallery init
//  * @param {Event} e
//  */
// function init(e) {
//   e.preventDefault();

//   const button = e.target.closest("a[data-gallery-id]");
//   const id = button.getAttribute("data-gallery-id");
//   const source = button.getAttribute("data-source");
//   const start = button.getAttribute("data-start");

//   if (id && source) {
//     fetchData(parseInt(id), source, start);
//   }
// }

// // Event handler and gallery init
// const galleryButtons = document.querySelectorAll("[data-gallery-id]");

// for (const galleryButton of galleryButtons) {
//   galleryButton.addEventListener("click", init);
// }

// ===== Gallery (FsLightbox) — фикс: закрытие по клику на подложке с первого раза =====

let activeLightbox = null;

function openGallery(data, startIndex = 0) {
  if (!data) return;

  if (activeLightbox?.props?.isOpen) {
    try {
      activeLightbox.close();
    } catch (_) {}
  }

  const lightbox = new FsLightbox();
  activeLightbox = lightbox;

  lightbox.props.sources = data;
  lightbox.props.type = "image";
  lightbox.props.showThumbsOnMount = true;

  const THRESHOLD = 7;

  const tryAttachOverlayHandlers = () => {
    const overlay = document.querySelector(".fslightbox-container");
    if (!overlay) return false;

    let downX = 0,
      downY = 0,
      startedOnOverlay = false;

    const onPointerDown = (e) => {
      if (e.target === overlay) {
        startedOnOverlay = true;
        downX = e.clientX ?? 0;
        downY = e.clientY ?? 0;
      } else {
        startedOnOverlay = false;
      }
    };

    const onPointerUp = (e) => {
      if (!startedOnOverlay) return;

      const dx = Math.abs((e.clientX ?? 0) - downX);
      const dy = Math.abs((e.clientY ?? 0) - downY);

      if (dx < THRESHOLD && dy < THRESHOLD) {
        try {
          lightbox.close();
        } catch (_) {}
      }

      startedOnOverlay = false;
    };

    overlay.addEventListener("pointerdown", onPointerDown, { capture: true });
    overlay.addEventListener("pointerup", onPointerUp, { capture: true });

    const cleanup = () => {
      overlay.removeEventListener("pointerdown", onPointerDown, {
        capture: true,
      });
      overlay.removeEventListener("pointerup", onPointerUp, { capture: true });
      mo.disconnect();
    };
    lightbox.props.onClose = cleanup;

    return true;
  };

  const mo = new MutationObserver(() => {
    if (tryAttachOverlayHandlers()) mo.disconnect();
  });
  mo.observe(document.body, { childList: true, subtree: true });

  tryAttachOverlayHandlers();

  lightbox.open(Number.isInteger(startIndex) ? startIndex : 0);
}

/**
 * Запрос данных галереи
 * @param {Number} id
 * @param {String} source
 * @param {Number|undefined} start
 */
async function fetchData(id, source, start) {
  const url = new URL(window.location.origin + source);
  url.searchParams.append("id", id);
  const startIndex = start ? parseInt(start, 10) : 0;

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    openGallery(data, startIndex);
  } catch (err) {
    console.error(err);
  }
}

function onGalleryClick(e) {
  e.preventDefault();

  const button = e.target.closest("a[data-gallery-id]");
  if (!button) return;

  const id = parseInt(button.getAttribute("data-gallery-id"), 10);
  const source = button.getAttribute("data-source");
  const start = button.getAttribute("data-start");

  if (id && source) {
    fetchData(id, source, start);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a[data-gallery-id]").forEach((el) => {
    el.addEventListener("click", onGalleryClick);
  });
});
