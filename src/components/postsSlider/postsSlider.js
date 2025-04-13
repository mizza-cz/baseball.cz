$(".postsSlider__inner").slick({
  slidesToShow: 4,
  slidesToScroll: 1,
  infinite: false,
  prevArrow: $(".postsSlider__btnprev"),
  nextArrow: $(".postsSlider__btnnext"),

  responsive: [
    {
      breakpoint: 1120,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 640,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 580,
      settings: {
        slidesToShow: 1,
      },
    },
  ],
});
