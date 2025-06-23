(function ($) {
  "use strict";

  const DESKTOP_WIDTH = 1200;

  function bindHamburger() {
    const $body = $("body");
    const $opener = $(".js-header__opener");

    $opener.on("click", function (e) {
      e.stopPropagation();
      $opener.toggleClass("is-open");
      $body.toggleClass("is-nav-open");
    });

    $(document).on("click", function (e) {
      if (
        $body.hasClass("is-nav-open") &&
        !$(e.target).closest(".menu, .js-header__opener").length
      ) {
        $opener.removeClass("is-open");
        $body.removeClass("is-nav-open");
      }
    });
  }

  function bindSearchPopup() {
    const SELECTORS = {
      btn: ".header__search",
      popup: "#mobile-search",

      close:
        ".js-search-close, .mobile-search__close,      \
              .search-close, .btn-close, .close, .searchBox__close, \
              [data-search-close]",
    };

    const $btn = $(SELECTORS.btn);
    const $popup = $(SELECTORS.popup);

    // открыть / закрыть по лупе
    $btn.on("click", function (e) {
      e.stopPropagation();
      toggleSearch();
    });

    // закрыть по клику на любой крестик
    $(document).on("click", SELECTORS.close, function (e) {
      if ($popup.hasClass("active")) {
        e.stopPropagation();
        closeSearch();
      }
    });

    $(document).on("click", function (e) {
      if (
        $popup.hasClass("active") &&
        !$(e.target).closest(SELECTORS.popup + "," + SELECTORS.btn).length
      ) {
        closeSearch();
      }
    });

    function toggleSearch() {
      $btn.toggleClass("active");
      $popup.toggleClass("active");
      if ($popup.hasClass("active")) {
        $popup
          .find("input[type='search'], input[type='text']")
          .first()
          .trigger("focus");
      }
    }
    function closeSearch() {
      $btn.removeClass("active");
      $popup.removeClass("active");
    }
  }

  function bindMainMenu() {
    const $menuItems = $(".navbar__menu-item");
    const $menuLists = $(".navbar__menu-list");
    let t;

    function unbindAll() {
      $menuItems.off("click");
      $menuLists.off("mouseenter mouseleave");
    }

    function bindDesktop() {
      $menuLists
        .on("mouseenter", function () {
          $(this).addClass("active");
        })
        .on("mouseleave", function () {
          $(this).removeClass("active");
        });
    }

    function bindMobile() {
      $menuItems.on("click", function (e) {
        const $cur = $(this).closest(".navbar__menu-list");
        $menuLists.not($cur).removeClass("active");
        $cur.toggleClass("active");
        e.stopPropagation();
      });
    }

    function refresh() {
      unbindAll();
      $(window).width() >= DESKTOP_WIDTH ? bindDesktop() : bindMobile();
    }

    refresh();
    $(window).on("resize", function () {
      clearTimeout(t);
      t = setTimeout(refresh, 200);
    });
  }

  function bindStickyHeader() {
    const $header = $(".header");
    let ticking = false;

    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          $("html,body").scrollTop() > 0
            ? $header.addClass("header--scroll")
            : $header.removeClass("header--scroll");
          ticking = false;
        });
        ticking = true;
      }
    }

    $(window).on("scroll", onScroll);
    onScroll();
  }

  $(function () {
    bindHamburger();
    bindSearchPopup();
    bindMainMenu();
    bindStickyHeader();
  });
})(jQuery);
