$(".partnersSlider__inner").slick({
  slidesToShow: 6,
  slidesToScroll: 1,
  arrows: false,
  infinite: true,
  autoplay: true,
  speed: 500,
  responsive: [
    {
      breakpoint: 1240,
      settings: {
        slidesToShow: 5,
      },
    },
    {
      breakpoint: 931,
      settings: {
        slidesToShow: 4,
      },
    },
    {
      breakpoint: 741,
      settings: {
        slidesToShow: 3,
      },
    },
    {
      breakpoint: 621,
      settings: {
        slidesToShow: 2,
      },
    },
    {
      breakpoint: 421,
      settings: {
        slidesToShow: 2,
      },
    },
  ],
});
