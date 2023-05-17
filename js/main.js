
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
// Smooth scroll using ID tags

// Select all anchor elements that have a href attribute starting with '#'
document.querySelectorAll('a[href^="#"]').forEach((link) => {

  // Add a click event listener to each link
  link.addEventListener('click', (event) => {

    // Prevent the default action (jump scroll) from occurring
    event.preventDefault();

    // Get the target element using the href attribute value
    const targetElement = document.querySelector(event.currentTarget.getAttribute('href'));

    // If the target element doesn't exist, return early to prevent errors
    if (!targetElement) {
      console.warn(`Target element not found for href: ${event.currentTarget.getAttribute('href')}`);
      return;
    }

    // Scroll smoothly to the target element
    targetElement.scrollIntoView({
      behavior: 'smooth',
    });
  });
});


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