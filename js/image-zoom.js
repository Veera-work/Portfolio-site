/**
 * Image Zoom Functionality
 * Makes solo centered images zoomable on click with lightbox effect
 */
(function() {
    'use strict';

    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.id = 'image-lightbox';
    lightbox.className = 'image-lightbox';
    
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    
    const lightboxImg = document.createElement('img');
    lightboxImg.className = 'lightbox-img';
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.className = 'lightbox-close';
    closeBtn.setAttribute('aria-label', 'Close lightbox');
    
    // Assemble and append lightbox to body
    lightboxContent.appendChild(lightboxImg);
    lightbox.appendChild(lightboxContent);
    lightbox.appendChild(closeBtn);
    document.body.appendChild(lightbox);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .image-lightbox {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.9);
            opacity: 0;
            transition: opacity 0.3s ease;
            overflow: auto;
            cursor: zoom-out;
        }
        .image-lightbox.active {
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 1;
        }
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            margin: auto;
        }
        .lightbox-img {
            width: auto;
            height: auto;
            max-width: 100%;
            max-height: 90vh;
            object-fit: contain;
            display: block;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            border-radius: var(--border-radius-medium);
            transform: scale(0.95);
            transition: transform 0.3s ease;
        }
        .image-lightbox.active .lightbox-img {
            transform: scale(1);
        }
        .lightbox-close {
            position: absolute;
            top: 20px;
            right: 25px;
            color: white;
            font-size: 35px;
            font-weight: bold;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 10000;
            opacity: 0.8;
            transition: opacity 0.2s ease;
        }
        .lightbox-close:hover {
            opacity: 1;
        }
        /* Add zoom-in cursor to zoomable images */
        .zoomable-image {
            cursor: zoom-in;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .zoomable-image:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
        }
    `;
    document.head.appendChild(style);

    // Initialize on DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeZoomableImages();
    });

    /**
     * Find and initialize zoomable images
     */
    function initializeZoomableImages() {
        // Target solo centered images in figures that aren't part of solution-point or image-grid components
        const zoomableImages = document.querySelectorAll('.centered-image:not(.solution-point img):not(.image-grid img):not(.other-project-card img)');
        
        zoomableImages.forEach(img => {
            // Add zoomable class and click event
            img.classList.add('zoomable-image');
            
            img.addEventListener('click', function() {
                showLightbox(this.src, this.alt);
            });
            
            // Add explicit role and tabindex for better accessibility
            img.setAttribute('role', 'button');
            img.setAttribute('tabindex', '0');
            img.setAttribute('aria-label', (img.alt || 'Image') + ' (click to zoom)');
            
            // Allow keyboard activation
            img.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    showLightbox(this.src, this.alt);
                }
            });
        });
    }

    /**
     * Show the lightbox with the clicked image
     */
    function showLightbox(src, alt) {
        // Set image source and alt text
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        
        // Show lightbox with animation
        lightbox.classList.add('active');
        
        // Prevent body scrolling while lightbox is open
        document.body.style.overflow = 'hidden';
        
        // Focus the lightbox for keyboard accessibility
        lightbox.focus();
    }

    /**
     * Close the lightbox
     */
    function closeLightbox() {
        lightbox.classList.remove('active');
        
        // Reset body overflow after animation completes
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                document.body.style.overflow = '';
                // Clear the image source
                lightboxImg.src = '';
            }
        }, 300);
    }

    // Close lightbox events
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
})(); 