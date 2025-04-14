headerNavOpenerClick();
function headerNavOpenerClick() {
  const bodyEl = document.querySelector("body");
  const headerNavOpener = document.querySelector(".js-header__opener");
  if (!bodyEl || !headerNavOpener) {
    return;
  }
  headerNavOpener.addEventListener("click", function () {
    if (!this.classList.contains("is-open")) {
      bodyEl.classList.add("is-nav-open");
      this.classList.add("is-open");
    } else {
      bodyEl.classList.remove("is-nav-open");
      this.classList.remove("is-open");
    }
  });
}
$(function () {
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".navbar__menu-list").length) {
      $(".navbar__menu-list").removeClass("active");
    }
  });

  $(".navbar__menu-item").on("click", function (event) {
    const $currentMenuList = $(this).closest(".navbar__menu-list");

    $(".navbar__menu-list").not($currentMenuList).removeClass("active");

    $currentMenuList.toggleClass("active");

    event.stopPropagation();
  });
});

// search
const searchToggleBtn = document.querySelector(".header__search");
const searchBox = document.getElementById("mobile-search");
const closeBtn = searchBox?.querySelector(".searchBox__close");

if (searchToggleBtn && searchBox) {
  searchToggleBtn.addEventListener("click", function () {
    searchBox.classList.toggle("active");
    searchToggleBtn.classList.toggle("active");
  });
}

if (closeBtn && searchToggleBtn && searchBox) {
  closeBtn.addEventListener("click", function () {
    searchBox.classList.remove("active");
    searchToggleBtn.classList.remove("active");
  });
}
