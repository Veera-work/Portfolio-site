(function() {
    'use strict';
    let customCursor;
    const cursorBaseState = { scale: 1, opacity: 1, width: 'var(--cursor-size)', height: 'var(--cursor-size)' };
    const cursorHoverState = { scale: 1, opacity: 1, width: 'var(--cursor-hover-size)', height: 'var(--cursor-hover-size)' };
    let isTouchDevice = false;

    // Detect Safari browser for custom cursor fallback
    function isSafari() {
        return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }

    /**
     * Sets up the custom cursor and its interactions with hover targets.
     * Disables custom cursor on touch devices.
     */
    function setupCursorInteractions() {
        isTouchDevice = ("ontouchstart" in document.documentElement);
        customCursor = document.querySelector('.custom-cursor');

        // Disable custom cursor ONLY on touch devices or if element not found
        if (isTouchDevice || !customCursor) {
            if (customCursor) customCursor.style.display = 'none';
            document.body.style.cursor = 'auto'; // Use default system cursor
            // Ensure interactive elements have pointer cursor
            document.querySelectorAll('a, button, .project-hover-target, .nav_button a, .metric-card, .impact-highlight-card, .other-project-card').forEach(el => {
                if (el) el.style.cursor = 'pointer';
            });
            return; // Exit if custom cursor is not needed
        }

        const cursorViewText = customCursor.querySelector('.cursor-view-text');
        const hoverTargets = document.querySelectorAll('a, button, .project-hover-target, .nav_button a, .metric-card, .impact-highlight-card, .other-project-card');
        const baseBG = getComputedStyle(document.documentElement).getPropertyValue('--cursor-bg').trim() || 'rgba(255, 255, 255, 0.5)'; // Fallback color
        const hoverBG = baseBG; // Using the same background for hover state

        // Ensure GSAP is loaded before using it for cursor animations
        if (typeof gsap === 'undefined') {
            console.error("GSAP not loaded. Custom cursor animations disabled.");
            document.documentElement.classList.add('no-gsap'); // Add class for CSS fallback
            // Make cursor visible without animation if GSAP is missing
            if(customCursor) {
                customCursor.style.opacity = '1';
                customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
            }
            return;
        }

        // Initial cursor state (hidden, centered)
        gsap.set(customCursor, { 
            xPercent: -50, 
            yPercent: -50, 
            scale: cursorBaseState.scale, 
            opacity: 0, 
            width: cursorBaseState.width, 
            height: cursorBaseState.height, 
            backgroundColor: baseBG, 
            borderColor: 'transparent' 
        });
        
        if(cursorViewText) {
            gsap.set(cursorViewText, { opacity: 0 }); // Hide text initially
        }

        // Move cursor with mouse - use faster duration for more responsive feel
        window.addEventListener('mousemove', (e) => {
            gsap.to(customCursor, { 
                duration: 0.1, // Faster for better responsiveness
                x: e.clientX, 
                y: e.clientY, 
                ease: "power1.out", 
                overwrite: "auto" // Prevent animation queue buildup
            });
        });

        // Handle hover interactions
        hoverTargets.forEach(target => {
            if (!target) return; // Skip if target is null

            target.addEventListener('mouseenter', () => {
                const isProjectItem = target.closest('.project-item') || target.closest('.other-project-card');
                const isNavLink = target.closest('.nav_button a');

                if (isProjectItem) {
                    // Project Card Hover
                    gsap.to(customCursor, { 
                        duration: 0.2, 
                        width: cursorHoverState.width, 
                        height: cursorHoverState.height, 
                        ease: "power2.out" 
                    });
                    if (cursorViewText) {
                        gsap.to(cursorViewText, { 
                            duration: 0.15, 
                            opacity: 1, 
                            scale: 1,
                            delay: 0.05 
                        });
                    }
                    customCursor.classList.add('cursor-hover-project');
                    customCursor.classList.remove('cursor-hover-blend');
                } else {
                    // Non-Project Card Hover (includes nav links)
                    gsap.to(customCursor, { 
                        duration: 0.2, 
                        width: cursorBaseState.width, 
                        height: cursorBaseState.height, 
                        ease: "power2.out" 
                    });
                    if (cursorViewText) {
                        gsap.to(cursorViewText, { 
                            duration: 0.15, 
                            opacity: 0,
                            scale: 0.9
                        });
                    }
                    customCursor.classList.add('cursor-hover-blend');
                    customCursor.classList.remove('cursor-hover-project');
                }

                // Add .hovering class specifically to nav links
                if (isNavLink) {
                    target.classList.add('hovering');
                }
            });

            target.addEventListener('mouseleave', () => {
                const isNavLink = target.closest('.nav_button a');
                // Animate cursor back to base state size
                gsap.to(customCursor, { 
                    duration: 0.2, 
                    width: cursorBaseState.width, 
                    height: cursorBaseState.height, 
                    ease: "power2.out" 
                });
                
                // Hide "VIEW" text
                if (cursorViewText) {
                    gsap.to(cursorViewText, { 
                        duration: 0.15, 
                        opacity: 0,
                        scale: 0.9
                    });
                }
                
                // Remove hover classes
                customCursor.classList.remove('cursor-hover-project');
                customCursor.classList.remove('cursor-hover-blend');

                // Remove .hovering class specifically from nav links
                if (isNavLink) {
                    target.classList.remove('hovering');
                }
            });
        });

        // Show/hide cursor when mouse enters/leaves the document
        document.addEventListener('mouseenter', () => { 
            gsap.to(customCursor, { 
                duration: 0.3, 
                opacity: cursorBaseState.opacity, 
                scale: cursorBaseState.scale 
            }); 
        });
        
        document.addEventListener('mouseleave', () => { 
            gsap.to(customCursor, { 
                duration: 0.2, 
                opacity: 0, 
                scale: 0 
            }); 
        });
    }

    /**
     * Fades in the page body once loaded.
     * Includes fallback if GSAP is not available.
     */
    function initPageFadeIn() {
        // Check if GSAP is available
        if (typeof gsap === 'undefined') {
            console.error("GSAP not loaded. Using fallback for page fade-in.");
            document.documentElement.classList.add('no-gsap'); // Add class for CSS fallback
            // Fallback: Directly set opacity and visibility
            document.documentElement.style.visibility = 'visible'; // Ensure html is visible
            document.body.style.opacity = 1;
            document.body.style.visibility = 'visible';
            document.body.classList.add('ready');
            return;
        }

        // Use GSAP for smooth fade-in
        gsap.set("html", { duration: 0, autoAlpha: 1 }); // Ensure HTML tag is visible
        gsap.to("body, .hamburger-menu", { // Also target hamburger menu
            duration: 0.5,
            autoAlpha: 1, // Handles both opacity and visibility
            delay: 0.1,
            onComplete: () => {
                document.body.classList.add('ready'); // Add ready class after animation
                console.log("Page fade-in complete.");
            }
        });
    }

    /**
     * Sets up smooth scrolling for internal anchor links.
     */
    function setupSmoothScroll() {
        // Select links starting with '#' but not just '#'
        const scrollLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

        scrollLinks.forEach(link => {
            if (!link) return; // Skip if link is null

            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                // Check if it's a valid ID selector and points to an element on the current page
                if (targetId && targetId.length > 1 && targetId.startsWith('#')) {
                    // Check if the link's pathname matches the current page's pathname
                    const isSamePageLink = (link.pathname === window.location.pathname || '/' + link.pathname === window.location.pathname || link.pathname === '');
                    if (isSamePageLink) {
                        try {
                            const targetElement = document.querySelector(targetId);
                            if (targetElement) {
                                e.preventDefault(); // Prevent default jump
                                // Use native smooth scroll
                                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            } else {
                                console.warn(`Smooth scroll target not found: ${targetId}`);
                            }
                        } catch (error) {
                            // Catch potential errors from invalid selectors
                            console.error(`Error finding element for smooth scroll (${targetId}):`, error);
                        }
                    }
                    // If it's not a same-page link, allow default behavior (navigate)
                }
                // Allow default behavior for external links or links to other pages
            });
        });
    }

    /**
     * Adds a class to the body when the user is navigating with the Tab key,
     * to show focus outlines only during keyboard navigation.
     */
    function setupFocusVisibility() {
        document.addEventListener('keydown', (e) => {
            // Add class only when Tab key is pressed
            if (e.key === 'Tab') {
                document.body.classList.add('user-is-tabbing');
            }
        });

        // Remove class on mouse click or touch
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('user-is-tabbing');
        });
        document.addEventListener('touchstart', () => {
            document.body.classList.remove('user-is-tabbing');
        }, { passive: true }); // Use passive listener for touchstart for better scroll performance
    }

    /**
     * Toggles the mobile navigation menu open/closed.
     */
    function setupMobileNavToggle() {
        const hamburgerButton = document.querySelector('.hamburger-menu');
        const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
        const mobileNavLinks = document.querySelectorAll('.mobile-nav-overlay a.mobile-nav-link');

        if (!hamburgerButton || !mobileNavOverlay) {
            // This is expected on pages other than index.html if they don't have this structure
            // console.warn('Hamburger menu button or mobile nav overlay not found. Mobile nav toggle skipped.');
            return;
        }

        hamburgerButton.addEventListener('click', () => {
            const isOpened = hamburgerButton.getAttribute('aria-expanded') === 'true';
            hamburgerButton.setAttribute('aria-expanded', !isOpened);
            hamburgerButton.setAttribute('aria-label', isOpened ? 'Open menu' : 'Close menu');
            document.body.classList.toggle('nav-open');
            // Optional: Prevent body scroll when menu is open
            document.body.style.overflow = document.body.classList.contains('nav-open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (document.body.classList.contains('nav-open')) {
                    hamburgerButton.setAttribute('aria-expanded', 'false');
                    hamburgerButton.setAttribute('aria-label', 'Open menu');
                    document.body.classList.remove('nav-open');
                    document.body.style.overflow = ''; // Restore scroll
                }
            });
        });
    }

    /**
     * Adds hover effects (lift and color change) to footer social icons using GSAP.
     * Includes fallback if GSAP is not available.
     */
    function setupFooterIconHovers() {
        const socialIcons = document.querySelectorAll('.social-links a.social-icon');
        if (!socialIcons || socialIcons.length === 0) return; // Exit if no icons found

        // Check if GSAP is available
        if (typeof gsap === 'undefined') {
            console.error("GSAP not loaded. Footer icon hover animations disabled.");
            document.documentElement.classList.add('no-gsap'); // Add class for CSS fallback
            // Add simple CSS class for hover fallback (optional)
            socialIcons.forEach(icon => icon.classList.add('no-gsap-hover'));
            return;
        }

        socialIcons.forEach(icon => {
            if (!icon) return; // Skip if icon is null

            // Get original color dynamically, provide fallback
            const originalColor = getComputedStyle(icon).color || 'var(--text-secondary)';
            const hoverColor = 'var(--text-primary)'; // Define hover color

            icon.addEventListener('mouseenter', () => {
                // Animate icon lift, scale, and color change on hover
                gsap.to(icon, { y: -4, scale: 1.1, color: hoverColor, duration: 0.15, ease: 'power1.out' });
            });

            icon.addEventListener('mouseleave', () => {
                // Animate icon back to original position, scale, and color
                gsap.to(icon, { y: 0, scale: 1, color: originalColor, duration: 0.2, ease: 'power1.out' });
            });
        });
     }

    /**
     * Initializes the website functionality.
     * Checks if required components exist, and sets up event handlers.
     */
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Setup GSAP dependencies
            const gsapReady = (typeof gsap !== 'undefined');
            if (!gsapReady) {
                console.warn("GSAP not loaded. Applying fallback styles.");
                document.documentElement.classList.add('no-gsap');
            } else {
                console.log("GSAP loaded successfully.");
            }

            // Page fade-in
            initPageFadeIn();

            // Setup interactive elements
            setupCursorInteractions();
            setupSmoothScroll();
            setupFocusVisibility();
            setupMobileNavToggle();
            setupFooterIconHovers();

            // Handle responsive tables
            setupTableScrollIndicators();

            console.log("All core initialization complete.");
        } catch (error) {
            console.error("Error during initialization:", error);
            // Apply fallback for critical functionality
            document.documentElement.classList.add('no-gsap');
            document.documentElement.style.visibility = 'visible';
            document.body.style.opacity = 1;
            document.body.style.visibility = 'visible';
        }
    });

    /**
     * Sets up scroll indicators for responsive tables
     * Shows shadow indicators when table content is scrollable
     */
    function setupTableScrollIndicators() {
        const tableContainers = document.querySelectorAll('.table-container');
        
        if (!tableContainers || tableContainers.length === 0) return;
        
        // Process each table container
        tableContainers.forEach(container => {
            const table = container.querySelector('table');
            if (!table) return;
            
            // Check if table is wider than container
            const checkOverflow = () => {
                const hasOverflow = table.offsetWidth > container.offsetWidth;
                
                // Add overflow class if needed
                if (hasOverflow) {
                    container.classList.add('has-overflow');
                    
                    // Initial scroll position
                    updateScrollIndicators(container);
                } else {
                    container.classList.remove('has-overflow', 'at-start', 'at-end');
                }
            };
            
            // Update scroll position indicators
            const updateScrollIndicators = (container) => {
                const scrollLeft = container.scrollLeft;
                const maxScroll = container.scrollWidth - container.clientWidth;
                
                // At start
                if (scrollLeft <= 5) {
                    container.classList.add('at-start');
                } else {
                    container.classList.remove('at-start');
                }
                
                // At end
                if (maxScroll - scrollLeft <= 5) {
                    container.classList.add('at-end');
                } else {
                    container.classList.remove('at-end');
                }
            };
            
            // Listen for scroll events
            container.addEventListener('scroll', () => {
                updateScrollIndicators(container);
            });
            
            // Check on load and resize
            checkOverflow();
            window.addEventListener('resize', checkOverflow);
        });
    }

})();
