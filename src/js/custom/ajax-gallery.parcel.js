/**
 * Opens gallery
 * @param {Object} data
 */
function openGallery(data, start) {
  if (!data) return;

  const lightbox = new FsLightbox();
  lightbox.props.sources = data;
  lightbox.props.type = "image";
  lightbox.props.showThumbsOnMount = true;
  lightbox.open(start ?? 0);
}

/**
 * Get gallery
 * @param {Number} id
 * @param {String} source
 * @param {Number|undefined} start
 */
async function fetchData(id, source, start) {
  const url = new URL(window.location.origin + source);
  url.searchParams.append("id", id);
  start = start ? parseInt(start) : 0;

  fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => openGallery(data, start))
    .catch((err) => console.log(err));
}

/**
 * Gallery init
 * @param {Event} e
 */
function init(e) {
  e.preventDefault();

  const button = e.target.closest("a[data-gallery-id]");
  const id = button.getAttribute("data-gallery-id");
  const source = button.getAttribute("data-source");
  const start = button.getAttribute("data-start");

  if (id && source) {
    fetchData(parseInt(id), source, start);
  }
}

// Event handler and gallery init
const galleryButtons = document.querySelectorAll("[data-gallery-id]");

for (const galleryButton of galleryButtons) {
  galleryButton.addEventListener("click", init);
}
