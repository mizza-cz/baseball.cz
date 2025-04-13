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

(function () {
  $(".header__search").click(function () {
    $("#mobile-search, .header__search").toggleClass("active");
  });
})();

const subMenuBtn = document.getElementById("subMenuBtn");

if (subMenuBtn) {
  subMenuBtn.addEventListener("click", () => {
    document.body.classList.toggle("openSubMenu");
    subMenuBtn.classList.toggle("active");
  });
}
