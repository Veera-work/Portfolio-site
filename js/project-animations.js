(function() {
    'use strict';

    /**
     * Checks if essential elements for project page animations exist.
     * @returns {boolean} True if required elements are present, false otherwise.
     */
    function checkRequiredElements() {
        // Check for presence of header OR narrative header, and project content area
        const hasHeader = document.querySelector('.project-header') !== null || document.querySelector('.narrative-header') !== null;
        const hasContent = document.querySelector('.project-content') !== null;
        // Require at least one header type and the content area
        return hasHeader && hasContent;
    }

    /**
     * Sets up scroll-triggered animations for various elements on project pages.
     * Requires GSAP and ScrollTrigger plugin. Includes fallbacks.
     */
    function setupScrollAnimations() {
        // Check if GSAP and ScrollTrigger are loaded
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.error('GSAP or ScrollTrigger not loaded. Skipping project animations.');
            // Fallback: Make all potentially animated elements visible immediately
            const elementsToReveal = document.querySelectorAll(
                ".content-block, .image-grid img, figure > img, .metric-card, .decision-card, .other-project-card, .back-link-container, .validation-plan-table-container, .impact-highlight-card, .project-hero-image img"
            );
            elementsToReveal.forEach(el => {
                if (el) {
                    el.style.visibility = 'visible';
                    el.style.opacity = '1';
                }
            });
             // Ensure parallax image is not offset if animation fails
             const parallaxImage = document.querySelector('.hero-image-parallax');
             if (parallaxImage) {
                 parallaxImage.style.transform = 'translateY(0)';
             }
            return; // Exit the function if libraries are missing
        }

        console.log("Setting up project page scroll animations...");
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger);

        // --- Animate Content Blocks ---
        // Select all elements with the class 'content-block'
        const animatedBlocks = gsap.utils.toArray('.content-block');
        if (animatedBlocks.length > 0) {
            animatedBlocks.forEach((block, index) => {
                 if (!block) return; // Skip if block is null
                 gsap.from(block, {
                     duration: 0.9,
                     autoAlpha: 0, // Fade in and set visibility
                     y: 50,        // Start from below
                     ease: "expo.out",
                     scrollTrigger: {
                         trigger: block,
                         start: "top 88%", // Start animation when top of block is 88% from viewport top
                         toggleActions: "play none none none", // Play once on enter
                         once: true, // Ensure animation runs only once
                         id: `content-block-${index}` // Debugging ID
                     }
                 });
             });
             console.log(`${animatedBlocks.length} content blocks animated.`);
        } else { console.warn("No content blocks found for animation."); }


         // --- Animate Images in Grids and Figures ---
         const imagesAndFigures = gsap.utils.toArray('.image-grid img, figure > img');
         if (imagesAndFigures.length > 0) {
             imagesAndFigures.forEach((img, index) => {
                 if (!img) return; // Skip if image is null
                 // Find the closest parent container (figure or image-grid) to use as trigger
                 const triggerElement = img.closest('figure, .image-grid') || img;
                 gsap.from(img, {
                     duration: 0.7,
                     autoAlpha: 0,
                     scale: 0.9, // Start slightly smaller
                     y: 30,      // Start slightly down
                     ease: "power2.out",
                     scrollTrigger: {
                         trigger: triggerElement, // Trigger based on the container
                         start: "top 90%",
                         toggleActions: "play none none none",
                         once: true,
                         id: `image-${index}`
                     },
                     stagger: 0.1 // Slight delay between images if multiple in same trigger
                 });
             });
             console.log(`${imagesAndFigures.length} images/figures animated.`);
         } else { console.warn("No images in grids or figures found for animation."); }


         // --- Animate Metric Cards (Results Grid) + Number Counter ---
         const resultsGrid = document.querySelector('.results-grid');
         if (resultsGrid) {
             const metricCards = resultsGrid.querySelectorAll('.metric-card');
             if (metricCards.length > 0) {
                 gsap.from(metricCards, {
                     duration: 0.6,
                     autoAlpha: 0,
                     scale: 0.8,
                     y: 20,
                     ease: "power1.out",
                     scrollTrigger: {
                         trigger: resultsGrid,
                         start: "top 85%",
                         toggleActions: "play none none none",
                         once: true,
                         // Call the counter animation function when the trigger activates
                         onEnter: () => animateMetricCounters(metricCards),
                         id: "results-grid"
                     },
                     stagger: 0.15 // Stagger the animation of cards within the grid
                 });
                 console.log(`${metricCards.length} metric cards animation set up.`);
             } else { console.warn("No metric cards found within .results-grid."); }
         } // No warning if .results-grid itself is absent

         // --- Animate Single Impact Highlight Card + Counter ---
         const impactCard = document.querySelector('.impact-highlight-card');
         if (impactCard) {
            gsap.from(impactCard, {
                duration: 0.6,
                autoAlpha: 0,
                scale: 0.8,
                y: 20,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: impactCard,
                    start: "top 85%",
                    toggleActions: "play none none none",
                    once: true,
                    // Call counter animation on enter
                    onEnter: () => animateMetricCounters([impactCard]), // Pass as array
                    id: "impact-card"
                }
            });
            console.log("Impact highlight card animation set up.");
         } // No warning if card is absent

         /**
          * Animates the number counters within metric cards.
          * @param {NodeListOf<Element>|Array<Element>} cards - The metric card elements containing numbers to animate.
          */
         function animateMetricCounters(cards) {
            if (typeof gsap === 'undefined') {
                console.warn("GSAP not available for metric counter animation.");
                return;
            }
            cards.forEach(card => {
                if (!card) return;
                const valueElement = card.querySelector('.metric-value');
                if (valueElement) {
                    const originalText = valueElement.textContent || "";
                    // Extract numeric part, handling potential non-numeric characters like '%' or '.'
                    const endValueText = originalText.replace(/[^0-9.-]+/g,"").trim();
                    const endValue = parseFloat(endValueText);

                    // Check if it's a valid number
                    if (!isNaN(endValue)) {
                        const startValue = 0;
                        // Function to format the number during animation (preserve prefix/suffix, handle decimals)
                        const formatValue = (val) => {
                            // Determine number of decimal places based on original text
                            let decimals = (originalText.split('.')[1] || '').length;
                            // Ensure floating point inaccuracies don't add extra decimals
                            let formatted = parseFloat(val.toFixed(decimals));

                            // Extract prefix (e.g., '$') and suffix (e.g., '%')
                            let prefix = originalText.match(/^[^0-9.-]*/)?.[0] || "";
                            let suffix = originalText.match(/[^0-9.-]*$/)?.[0] || "";

                            // Handle special case for checkmark - don't format
                            if (originalText.trim() === '✓') return '✓';

                            return prefix + formatted + suffix;
                        };

                        // Don't animate if the text is just a checkmark
                        if (originalText.trim() === '✓') {
                            valueElement.textContent = '✓'; // Ensure checkmark stays
                            return; // Skip animation
                        }

                        // Start animation from 0
                        valueElement.textContent = formatValue(startValue);
                        let counter = { value: startValue }; // Use an object for GSAP tweening

                        gsap.to(counter, {
                            duration: 1.5,
                            value: endValue,
                            ease: "power1.inOut",
                            // Update text content on each frame of the animation
                            onUpdate: function() {
                                valueElement.textContent = formatValue(counter.value);
                            },
                        });
                    } else if (originalText.trim() !== '✓') {
                         // If not a number and not a checkmark, keep original text (e.g., "High", "Positive")
                         valueElement.textContent = originalText;
                         console.log(`Metric value "${originalText}" is not a number, skipping counter animation.`);
                    }
                } else {
                    console.warn("Metric card found without a .metric-value element.");
                }
            });
         }

         // --- Animate Key Decision Cards ---
         const decisionCards = document.querySelectorAll('.decision-card');
         if(decisionCards.length > 0) {
             // Find the parent grid container to use as a trigger
             const decisionGrid = decisionCards[0].closest('.key-decisions-grid, .key-decisions');
             if(decisionGrid) {
                gsap.from(decisionCards, {
                     duration: 0.6,
                     autoAlpha: 0,
                     scale: 0.9,
                     y: 30,
                     ease: "power2.out",
                     scrollTrigger: {
                         trigger: decisionGrid, // Trigger when the grid comes into view
                         start: "top 85%",
                         toggleActions: "play none none none",
                         once: true,
                         id: "decision-cards"
                     },
                     stagger: 0.1 // Stagger animation for each card
                 });
                 console.log(`${decisionCards.length} decision cards animation set up.`);
             } else { console.warn("Decision cards found, but no parent .key-decisions-grid or .key-decisions found for trigger."); }
         } // No warning if no decision cards exist

         // --- Animate Validation Plan Table Container ---
         const validationTableContainer = document.querySelector('.validation-plan-table-container');
         if (validationTableContainer) {
            gsap.from(validationTableContainer, {
                 duration: 0.8,
                 autoAlpha: 0,
                 y: 40,
                 ease: "power2.out",
                 scrollTrigger: {
                     trigger: validationTableContainer,
                     start: "top 88%",
                     toggleActions: "play none none none",
                     once: true,
                     id: "validation-table"
                 }
             });
             console.log("Validation plan table animation set up.");
         } // No warning if table container is absent

         // --- Animate Back Link Container on Load (Not Scroll-Triggered) ---
         const backLinkContainer = document.querySelector('.back-link-container');
         if (backLinkContainer) {
             // Simple fade-in from top after a short delay
             gsap.from(backLinkContainer, {
                 duration: 0.6,
                 autoAlpha: 0,
                 y: -20, // Start from above
                 ease: "power1.out",
                 delay: 0.5 // Delay to allow page content to start appearing
            });
            console.log("Back link animation set up.");
         } // No warning if back link is absent

         // --- Add Parallax Effect to Hero Image ---
         const heroImage = document.querySelector('.hero-image-parallax');
         if (heroImage) {
             gsap.to(heroImage, {
                 yPercent: 20, // Move image down as user scrolls down
                 ease: "none", // Linear movement
                 scrollTrigger: {
                     trigger: ".project-hero-image", // Trigger container for the image
                     start: "top bottom", // Start when top of container hits bottom of viewport
                     end: "bottom top",   // End when bottom of container hits top of viewport
                     scrub: true,         // Link animation progress to scroll position
                     id: "hero-parallax"
                 }
             });
             console.log("Hero image parallax effect set up.");
         } // No warning if parallax image is absent

         // --- Animate "Other Projects" Section Cards ---
         const otherProjectsSection = document.querySelector('.other-projects-section');
         if(otherProjectsSection) {
             const otherCards = otherProjectsSection.querySelectorAll('.other-project-card');
             if (otherCards.length > 0) {
                 gsap.from(otherCards, {
                     duration: 0.7,
                     autoAlpha: 0,
                     y: 40,
                     ease: "power2.out",
                     scrollTrigger: {
                         trigger: otherProjectsSection, // Trigger when the section comes into view
                         start: "top 85%",
                         toggleActions: "play none none none",
                         once: true,
                         id: "other-projects"
                     },
                     stagger: 0.15 // Stagger animation for each card
                 });
                 console.log(`${otherCards.length} 'Other Projects' cards animation set up.`);
             } else { console.warn("No cards found within .other-projects-section."); }
         } // No warning if section is absent

    } // End of setupScrollAnimations

    /**
     * Initializes project page animations if required elements are present.
     */
    function initializeProjectAnimations() {
        // Only proceed if essential elements for animations exist
        if (!checkRequiredElements()) {
            console.log("Required elements for project animations not found. Skipping initialization.");
            return; // Stop initialization if elements are missing
        }

        console.log("Initializing project page animations...");
        // Delay slightly to increase likelihood of GSAP being ready
        // Note: `defer` should handle this, but this adds robustness
        setTimeout(() => {
            try {
                setupScrollAnimations();
            } catch (error) {
                console.error("Error during setupScrollAnimations:", error);
                 // Attempt to reveal content as a fallback if setup fails
                 const elementsToReveal = document.querySelectorAll(".content-block");
                 elementsToReveal.forEach(el => { if(el) { el.style.visibility = 'visible'; el.style.opacity = '1'; }});
            }
        }, 50); // 50ms delay
    }

    // --- Execution ---
    // Wait for the DOM to be fully loaded before initializing
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeProjectAnimations);
    } else {
        // DOM is already loaded
        initializeProjectAnimations();
    }
})();
