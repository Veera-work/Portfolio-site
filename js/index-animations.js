// NOTE: This script assumes THREE.js has been loaded globally via a <script> tag in index.html
// The 'import * as THREE from 'three';' line has been removed.

(function() {
    'use strict';
    console.log("index-animations.js: Script start.");

    // --- DOM Element References ---
    const webglWrapper = document.getElementById('webgl_wrapper');
    const navWrapper = document.querySelector('.nav_wrapper');

    // --- WebGL Blob Animation Class ---
    // [Shader code remains the same as previous versions]
    const vertexShader = `
        uniform float uTime; uniform float uNoiseScale; uniform float uNoiseMagnitude;
        uniform float uHoverEffect; uniform vec3 uIntersectPoint; uniform float uHoverMagnitude;
        varying vec3 vNormal; varying float vHoverEffect;
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 fade(vec3 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
        float snoise(vec3 v) { const vec2 C = vec2(1.0/6.0, 1.0/3.0) ; const vec4 D = vec4(0.0, 0.5, 1.0, 2.0); vec3 i = floor(v + dot(v, C.yyy) ); vec3 x0 = v - i + dot(i, C.xxx) ; vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min( g.xyz, l.zxy ); vec3 i2 = max( g.xyz, l.zxy ); vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.yyy; vec3 x3 = x0 - D.yyy; i = mod289(i); vec4 p = permute( permute( permute( i.z + vec4(0.0, i1.z, i2.z, 1.0 )) + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z); vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_ ); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4( x.xy, y.xy ); vec4 b1 = vec4( x.zw, y.zw ); vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0)); vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w); vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w; vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m; return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) ); }
        float fbm(vec3 p, int octaves, float persistence, float lacunarity) { float total = 0.0; float frequency = 1.0; float amplitude = 1.0; float maxValue = 0.0; for(int i = 0; i < octaves; i++) { total += snoise(p * frequency) * amplitude; maxValue += amplitude; amplitude *= persistence; frequency *= lacunarity; } return maxValue > 0.0 ? (total / maxValue) * 0.5 + 0.5 : 0.5; }
        void main() { vec3 noiseCoord = position * uNoiseScale + vec3(uTime * 0.1); float noiseValue = fbm(noiseCoord, 3, 0.5, 2.0); vec3 baseDisplacement = normal * noiseValue * uNoiseMagnitude; vec3 posWorld = (modelMatrix * vec4(position, 1.0)).xyz; float distToIntersect = distance(posWorld, uIntersectPoint); float hoverRadius = 0.8; vHoverEffect = smoothstep(hoverRadius, 0.0, distToIntersect) * uHoverEffect; vec3 hoverDisplacement = -normal * vHoverEffect * uHoverMagnitude; vec3 finalPosition = position + baseDisplacement + hoverDisplacement; vec4 viewPosition = modelViewMatrix * vec4(finalPosition, 1.0); vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * viewPosition; }
    `;
    const fragmentShader = `
        uniform sampler2D uMatcapBase; uniform sampler2D uMatcapHover;
        uniform float uHoverEffect;
        uniform float uHueShift;
        varying vec3 vNormal; varying float vHoverEffect;
        vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x); }
        vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www); return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }
        void main() { vec3 viewNormal = normalize(vNormal); vec2 uv = viewNormal.xy * 0.5 + 0.5; vec4 baseColor = texture2D(uMatcapBase, uv); vec4 hoverColor = texture2D(uMatcapHover, uv); vec4 mixedColor = mix(baseColor, hoverColor, vHoverEffect); vec3 hsv = rgb2hsv(mixedColor.rgb); hsv.x = fract(hsv.x + uHueShift); vec3 finalRgb = hsv2rgb(hsv); gl_FragColor = vec4(finalRgb, mixedColor.a); }
    `;

    class BlobAnimation {
        // --- BlobAnimation Class Definition (Uses global THREE) ---
        constructor(container, options = {}) {
            if (!container || !(container instanceof Element)) {
                throw new Error("Invalid container provided for BlobAnimation.");
            }
            // Ensure THREE is loaded globally
            if (typeof THREE === 'undefined') {
                 throw new Error("THREE.js is not loaded globally. Cannot initialize BlobAnimation.");
            }
            this.container = container;
            this.options = {
                baseMatcapUrl: 'https://raw.githubusercontent.com/nidorx/matcaps/master/1024/3E2335_D36A1B_8E4A2E_2842A5.png',
                hoverMatcapUrl: 'https://raw.githubusercontent.com/nidorx/matcaps/master/1024/0489C5_0DDDF9_04C3EE_04AFE1.png',
                noiseScale: 0.5, noiseMagnitude: 0.4, hoverMagnitude: 0.25, baseRadius: 1.2, subdivisions: 7,
                cameraDistance: 2.8, rotationSpeedX: 0.001, rotationSpeedY: 0.002, hoverFadeSpeed: 0.07,
                backgroundColor: null, backgroundAlpha: 0.0, hueShiftSpeed: 0.03, ...options
            };
            this.scene = null; this.camera = null; this.renderer = null; this.blobMesh = null; this.clock = null;
            this.uniforms = null; this.matcapTextureBase = null; this.matcapTextureHover = null; this.raycaster = null;
            this.mouseNdc = new THREE.Vector2(10, 10); this.intersectPoint = new THREE.Vector3();
            this.targetHoverEffect = 0.0; this.currentHoverEffect = 0.0; this.animationFrameId = null;
            this._onMouseMove = this._onMouseMove.bind(this); this._onMouseLeave = this._onMouseLeave.bind(this);
            this._onResize = this._onResize.bind(this); this.animate = this.animate.bind(this);
        }
        init() {
            try {
                this.scene = new THREE.Scene(); this.clock = new THREE.Clock(); this.raycaster = new THREE.Raycaster();
                const width = this.container.clientWidth; const height = this.container.clientHeight;
                if (width === 0 || height === 0) { console.warn("BlobAnimation container zero size on init."); }
                this.camera = new THREE.PerspectiveCamera(75, width / Math.max(height, 1), 0.1, 100);
                this.camera.position.z = this.options.cameraDistance;
                const canvas = document.createElement('canvas'); this.container.innerHTML = ''; this.container.appendChild(canvas);
                this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
                this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); this.renderer.setSize(width, height);
                this.renderer.setClearColor(this.options.backgroundColor || 0x000000, this.options.backgroundAlpha);
                const textureLoader = new THREE.TextureLoader(); let texturesLoaded = 0; const totalTextures = 2;
                const onTextureLoad = () => { texturesLoaded++; console.log(`Matcap loaded (${texturesLoaded}/${totalTextures})`); };
                const onTextureError = (url, err) => { console.error(`Error loading matcap: ${url}`, err); if (url === this.options.baseMatcapUrl && this.blobMesh) { console.warn("Applying fallback material."); this.blobMesh.material = new THREE.MeshNormalMaterial(); } };
                this.matcapTextureBase = textureLoader.load(this.options.baseMatcapUrl, onTextureLoad, undefined, (err) => onTextureError(this.options.baseMatcapUrl, err));
                this.matcapTextureHover = textureLoader.load(this.options.hoverMatcapUrl, onTextureLoad, undefined, (err) => onTextureError(this.options.hoverMatcapUrl, err));
                this.matcapTextureBase.wrapS = this.matcapTextureBase.wrapT = THREE.ClampToEdgeWrapping; this.matcapTextureHover.wrapS = this.matcapTextureHover.wrapT = THREE.ClampToEdgeWrapping;
                this.uniforms = { uTime: { value: 0.0 }, uNoiseScale: { value: this.options.noiseScale }, uNoiseMagnitude: { value: this.options.noiseMagnitude }, uMatcapBase: { value: this.matcapTextureBase }, uMatcapHover: { value: this.matcapTextureHover }, uHoverEffect: { value: 0.0 }, uIntersectPoint: { value: new THREE.Vector3() }, uHoverMagnitude: { value: this.options.hoverMagnitude }, uHueShift: { value: 0.0 } };
                const blobMaterial = new THREE.ShaderMaterial({ uniforms: this.uniforms, vertexShader: vertexShader, fragmentShader: fragmentShader, transparent: true });
                const blobGeometry = new THREE.IcosahedronGeometry(this.options.baseRadius, this.options.subdivisions);
                this.blobMesh = new THREE.Mesh(blobGeometry, blobMaterial); this.scene.add(this.blobMesh);
                this.container.addEventListener('mousemove', this._onMouseMove, false); this.container.addEventListener('mouseleave', this._onMouseLeave, false);
                window.addEventListener('resize', this._onResize, false);
                this.animate(); console.log("BlobAnimation initialized successfully.");
            } catch (error) { console.error("Error during BlobAnimation initialization:", error); if (this.container) { this.container.innerHTML = `<p style="color:red; padding: 1em;">Error initializing background animation.</p>`; } this.dispose(); throw error; }
        }
        _onMouseMove(event) { if (!this.container) return; const rect = this.container.getBoundingClientRect(); const x = event.clientX - rect.left; const y = event.clientY - rect.top; this.mouseNdc.x = (x / rect.width) * 2 - 1; this.mouseNdc.y = -(y / rect.height) * 2 + 1; }
        _onMouseLeave() { this.mouseNdc.x = 10; this.mouseNdc.y = 10; }
        _onResize() { if (!this.camera || !this.renderer || !this.container) return; const width = this.container.clientWidth; const height = this.container.clientHeight; if (width > 0 && height > 0) { this.camera.aspect = width / height; this.camera.updateProjectionMatrix(); this.renderer.setSize(width, height); this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); } else { console.warn("Blob container resized to zero."); } }
        animate() { if (!this.renderer || !this.scene || !this.camera || !this.uniforms || !this.blobMesh) { return; } this.animationFrameId = requestAnimationFrame(this.animate); const elapsedTime = this.clock.getElapsedTime(); this.raycaster.setFromCamera(this.mouseNdc, this.camera); const intersects = this.raycaster.intersectObject(this.blobMesh); this.targetHoverEffect = intersects.length > 0 ? 1.0 : 0.0; if (intersects.length > 0) { this.intersectPoint.copy(intersects[0].point); } this.currentHoverEffect += (this.targetHoverEffect - this.currentHoverEffect) * this.options.hoverFadeSpeed; this.currentHoverEffect = Math.max(0, Math.min(1, this.currentHoverEffect)); this.uniforms.uTime.value = elapsedTime; this.uniforms.uHoverEffect.value = this.currentHoverEffect; this.uniforms.uIntersectPoint.value.copy(this.intersectPoint); this.uniforms.uHueShift.value = (elapsedTime * this.options.hueShiftSpeed) % 1.0; this.blobMesh.rotation.x += this.options.rotationSpeedX; this.blobMesh.rotation.y += this.options.rotationSpeedY; this.renderer.render(this.scene, this.camera); }
        dispose() { console.log("Disposing BlobAnimation resources..."); if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; } if (this.container) { this.container.removeEventListener('mousemove', this._onMouseMove, false); this.container.removeEventListener('mouseleave', this._onMouseLeave, false); } window.removeEventListener('resize', this._onResize, false); try { const isTexture = (value) => typeof THREE !== 'undefined' && value instanceof THREE.Texture; this.scene?.traverse(object => { if (object.geometry) object.geometry.dispose(); if (object.material) { Object.values(object.material).forEach(value => { if (isTexture(value)) { value.dispose(); } }); object.material.dispose(); } }); this.scene?.clear(); this.renderer?.dispose(); if (this.renderer?.domElement?.parentNode === this.container) { this.container.removeChild(this.renderer.domElement); } } catch (error) { console.error("Error during Three.js resource disposal:", error); } this.scene = null; this.camera = null; this.renderer = null; this.blobMesh = null; this.clock = null; this.uniforms = null; this.matcapTextureBase = null; this.matcapTextureHover = null; this.raycaster = null; console.log("BlobAnimation disposed."); }
    }
    // --- End Blob Class ---

    /**
     * Initializes the WebGL Blob animation. Returns true on success, false on failure.
     */
    function initBlob() {
         if (webglWrapper && typeof THREE !== 'undefined') {
            console.log("index-animations.js: Attempting to initialize WebGL Blob...");
            const blobInstance = new BlobAnimation(webglWrapper, {
                subdivisions: 7, hueShiftSpeed: 0.03
            });
            try {
                blobInstance.init();
                console.log("index-animations.js: Blob initialized successfully.");
                return true; // Indicate success
            } catch (error) {
                console.error("index-animations.js: Failed to initialize BlobAnimation:", error);
                return false; // Indicate failure
            }
        } else if (!webglWrapper) {
            console.error("index-animations.js: WebGL container (#webgl_wrapper) not found. Blob animation skipped.");
            return false;
        } else {
            console.error("index-animations.js: THREE.js library not loaded globally. Blob animation skipped.");
            return false;
        }
    }

    /**
     * Splits text into letter spans for animation.
     */
    function splitTextIntoSpans(selector) {
        const elements = document.querySelectorAll(selector);
        if (!elements || elements.length === 0) {
            // console.warn(`splitTextIntoSpans: No elements found for selector: ${selector}.`);
            return null;
        }
        let letterCount = 0;
        elements.forEach(element => {
            if (!element || !element.textContent) return;
            const text = element.textContent;
            const letters = text.split('').map(char => {
                if (char.trim() === '') { return char; }
                else { letterCount++; return `<span class="letter" style="display:inline-block; visibility: hidden;">${char}</span>`; }
            }).join('');
            element.innerHTML = letters;
        });
        const letterSpans = document.querySelectorAll(selector + ' .letter');
        // console.log(`splitTextIntoSpans: Split text for "${selector}", found ${letterSpans.length} letters.`);
        return letterSpans;
    }


    /**
     * Runs intro animations (title, scroll indicator).
     */
    function runIntroAnimations() {
        console.log("index-animations.js: Attempting to run intro animations...");
        if (typeof gsap === 'undefined') {
            console.error("index-animations.js: GSAP not loaded. Intro animations skipped.");
            document.querySelectorAll('.title .stagger').forEach(el => { if(el) { el.style.visibility = 'visible'; el.innerHTML = el.textContent || ''; } });
            const scrollIndicator = document.querySelector(".scroll-indicator");
            if (scrollIndicator) scrollIndicator.style.opacity = '0.7';
            return;
        }

        const titleLetters = splitTextIntoSpans('.title .stagger');
        const tl = gsap.timeline({ delay: 0.8 });

        if (titleLetters && titleLetters.length > 0) {
            console.log(`index-animations.js: Animating ${titleLetters.length} title letters.`);
            tl.from(titleLetters, {
                duration: 0.8, y: '100%', skewY: 7, autoAlpha: 0,
                ease: "power3.out", stagger: 0.015
            });
        } else {
            console.warn("index-animations.js: No title letters found to animate. Making titles visible directly.");
            gsap.set('.title .stagger', { autoAlpha: 1 });
        }

        const scrollIndicator = document.querySelector(".scroll-indicator");
        if (scrollIndicator) {
            console.log("index-animations.js: Starting scroll indicator animation.");
            gsap.fromTo(scrollIndicator,
                { y: 0, opacity: 0 },
                {
                    delay: tl.duration() > 0 ? tl.duration() - 0.5 : 0.5,
                    y: 6, opacity: 0.7, duration: 1.2,
                    repeat: -1, yoyo: true, ease: "sine.inOut"
                }
            );
        } else {
            console.warn("index-animations.js: Scroll indicator element not found.");
        }
        console.log("index-animations.js: Intro animations setup complete.");
    }

    /**
     * Sets up scroll-triggered animations (projects, about section, nav).
     */
    function setupScrollAnimations() {
        console.log("index-animations.js: Attempting to set up scroll animations...");
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.error("index-animations.js: GSAP or ScrollTrigger not loaded. Scroll animations skipped.");
            gsap.set(".project-item, .about-section, .about-section .profile-pic-img, .about-section .floating-element", { autoAlpha: 1, clipPath: "none", yPercent: 0 });
            return;
        }
        gsap.registerPlugin(ScrollTrigger);

        // Project Item Animations
        const projectItems = document.querySelectorAll(".project-item");
        if (projectItems.length > 0) {
            console.log(`index-animations.js: Setting up animations for ${projectItems.length} project items.`);
            projectItems.forEach((item, index) => {
                if (!item) return;
                const imageWrapper = item.querySelector(".project-image-wrapper");
                const projectText = item.querySelector(".project-text");
                const itemTl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 85%", toggleActions: "play none none none", id: `project-${index}` } });
                itemTl.from(item, { duration: 1.0, autoAlpha: 0, rotationZ: 3, y: 50, ease: "expo.out" })
                      .from(projectText, { duration: 0.8, autoAlpha: 0, y: 30, ease: "expo.out" }, "-=0.7");
                if (imageWrapper) {
                    gsap.fromTo(imageWrapper, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: item, start: "top bottom", end: "bottom top", scrub: true, id: `project-parallax-${index}` } });
                }
            });
        } else { console.warn("index-animations.js: No project items found for scroll animations."); }

        // About Section Animations
        const aboutSection = document.querySelector(".about-section");
        if (aboutSection) {
            console.log("index-animations.js: Setting up about section animations.");
            gsap.to(".about-section", { autoAlpha: 1, clipPath: "circle(150% at 50% 50%)", duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: ".about-section", start: "top 80%", toggleActions: "play none none reverse", id: "about-reveal" } });
            const profilePic = aboutSection.querySelector(".profile-pic-img");
            if (profilePic) { gsap.fromTo(profilePic, { yPercent: -15 }, { yPercent: 15, ease: "none", scrollTrigger: { trigger: aboutSection, start: "top bottom", end: "bottom top", scrub: 1, id: "about-pic-parallax" } }); }
            const floatingElements = aboutSection.querySelectorAll(".floating-element");
            if (floatingElements.length > 0) {
                floatingElements.forEach((el, index) => { if (!el) return; const startY = index === 0 ? -30 : -10; const endY = index === 0 ? 30 : 10; const scrubSpeed = index === 0 ? 1.5 : 1; gsap.fromTo(el, { yPercent: startY }, { yPercent: endY, ease: "none", scrollTrigger: { trigger: aboutSection, start: "top bottom", end: "bottom top", scrub: scrubSpeed, id: `about-float-${index}` } }); });
            }
        } else { console.warn("index-animations.js: About section not found for animations."); }

        // Navigation Background Change
        if (navWrapper) {
            console.log("index-animations.js: Setting up navigation background scroll effect.");
            ScrollTrigger.create({
                trigger: "body", start: "top top", end: "+=50", id: "nav-background",
                onUpdate: (self) => {
                    if (self.direction === 1 && self.progress > 0) { gsap.to(navWrapper, { duration: 0.3, backgroundColor: 'rgba(30, 30, 30, 0.8)', ease: 'sine.out' }); }
                    else if (self.direction === -1 && self.progress === 0) { gsap.to(navWrapper, { duration: 0.3, backgroundColor: 'var(--nav-bg)', ease: 'sine.out' }); }
                },
            });
        } else { console.warn("index-animations.js: Nav wrapper not found for scroll animation."); }
        console.log("index-animations.js: Scroll animations setup complete.");
    }

    /**
     * Initializes all functions specific to the index page.
     */
    function initializeIndexPage() {
        console.log("index-animations.js: Initializing index page scripts...");
        let blobInitSuccess = false;
        try {
            console.log("index-animations.js: Calling initBlob...");
            blobInitSuccess = initBlob(); // Call blob init first
            console.log(`index-animations.js: initBlob call complete (Success: ${blobInitSuccess}).`);
        } catch(error) {
             console.error("index-animations.js: Error occurred during initBlob call:", error);
        }

        // Delay GSAP-dependent animations slightly
        setTimeout(() => {
            console.log("index-animations.js: Running delayed initializations (intro, scroll)...");
            try {
                console.log("index-animations.js: Calling runIntroAnimations...");
                runIntroAnimations();
                console.log("index-animations.js: runIntroAnimations call complete.");
            } catch (error) {
                console.error("index-animations.js: Error during runIntroAnimations:", error);
            }
            try {
                console.log("index-animations.js: Calling setupScrollAnimations...");
                setupScrollAnimations();
                console.log("index-animations.js: setupScrollAnimations call complete.");
            } catch (error) {
                console.error("index-animations.js: Error during setupScrollAnimations:", error);
                 // Fallback if scroll animations fail
                 if (typeof gsap !== 'undefined') {
                    gsap.set(".project-item, .about-section", { autoAlpha: 1 });
                 } else {
                     document.querySelectorAll(".project-item, .about-section").forEach(el => { if(el) el.style.visibility = 'visible'; el.style.opacity = '1'; });
                 }
            }
        }, 50); // 50ms delay

        console.log("index-animations.js: Index page initialization sequence started.");
    }

    // --- Execution ---
    if (document.readyState === 'loading') {
         console.log("index-animations.js: DOM not ready, adding DOMContentLoaded listener.");
        document.addEventListener('DOMContentLoaded', initializeIndexPage);
    } else {
         console.log("index-animations.js: DOM already ready, calling initializeIndexPage.");
        initializeIndexPage();
    }

})();
