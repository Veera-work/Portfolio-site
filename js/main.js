
(function () {
    "use strict";

    function swapStyle() {
        var el = document.querySelector('nav');
        el.classList.toggle('show');
    }

    var menu = document.querySelectorAll('.menu-btn');
    for (let item of menu) {
        item.addEventListener('click', swapStyle);
    }
    
    
})();

/*
document.querySelectorAll(".img-hover-zoom").forEach((item) => {
    const cursorGeometric = item.querySelector(".cursor-geometric");
  
    item.addEventListener("mouseenter", () => {
      gsap.to(cursorGeometric, {
        scale: 10,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  
    item.addEventListener("mouseleave", () => {
      gsap.to(cursorGeometric, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  });
*/  

const headerContainer = document.querySelector('.home-header-container');
  const headerH1 = document.querySelector('.homeheader');
  const headerH3 = document.querySelector('.home-header-container h3');

  let scrollTop = 0;
  let scrollDirection;

  function handleScroll() {
    const currentScrollTop = window.pageYOffset;
    scrollDirection = currentScrollTop > scrollTop ? 'down' : 'up';
    scrollTop = currentScrollTop;
    updateHeaderPosition();
  }

  function updateHeaderPosition() {
    const headerPosition = headerContainer.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight / 3;
    const slideExtent = Math.max(0, Math.min(1, (-1.5 * triggerPoint + Math.abs(headerPosition - triggerPoint)) / triggerPoint));
    if (scrollDirection === 'down' && headerPosition < triggerPoint) {
      gsap.to(headerH1, {duration: 0.5, x: `${slideExtent * 5}%`, opacity: 0, ease: 'power2.inOut'});
      gsap.to(headerH3, {duration: 0.5, x: `${slideExtent * 5}%`, opacity: 0, ease: 'power2.inOut'});
    } else if (scrollDirection === 'up' && headerPosition < triggerPoint) {
      gsap.to(headerH1, {duration: 0.5, x: `-${slideExtent * 1}%`, opacity: 1, ease: 'power2.inOut'});
      gsap.to(headerH3, {duration: 0.5, x: `-${slideExtent * 1}%`, opacity: 1, ease: 'power2.inOut'});
    }
  }

  window.addEventListener('scroll', handleScroll);

  $(document).ready(function(){
      // Add smooth scrolling to all links
      $('a[href^="#"]').on('click', function(event) {
          var target = $(this.getAttribute('href'));
          if( target.length ) {
              event.preventDefault();
              $('html, body').stop().animate({
                  scrollTop: target.offset().top
              }, 800);
          }
      });
  });

/*
  const headerContainer = document.querySelector('.home-header-container');
  const headerH1 = document.querySelector('.homeheader');
  const headerH3 = document.querySelector('.home-header-container h3');

  let scrollTop = 0;
  let scrollDirection;

  function handleScroll() {
    const currentScrollTop = window.pageYOffset;
    scrollDirection = currentScrollTop > scrollTop ? 'down' : 'up';
    scrollTop = currentScrollTop;
    updateHeaderPosition();
  }

  function updateHeaderPosition() {
    const headerPosition = headerContainer.getBoundingClientRect().top;
    const triggerPoint = window.innerHeight / 3;
    const offset = headerPosition - triggerPoint;
    if (scrollDirection === 'down' && headerPosition < triggerPoint) {
      gsap.to(headerH1, {duration: 0.5, y: -offset, opacity: 0, ease: 'power2.inOut'});
      gsap.to(headerH3, {duration: 0.5, y: -offset, opacity: 0, ease: 'power2.inOut'});
    } else if (scrollDirection === 'up' && headerPosition > triggerPoint) {
      gsap.to(headerH1, {duration: 0.5, y: 0, opacity: 1, ease: 'power2.inOut'});
      gsap.to(headerH3, {duration: 0.5, y: 0, opacity: 1, ease: 'power2.inOut'});
    }
  }

  window.addEventListener('scroll', handleScroll); 

*/