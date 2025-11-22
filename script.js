/* script.js
   Improved: defensive checks + mobile menu + smooth scroll + intersection animations
*/

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Helpers ---------- */
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ---------- Header scroll effect ---------- */
    const header = $('.main-header');
    if (header) {
        const scrolledClass = 'scrolled';
        const onScroll = () => {
            if (window.scrollY > 60) header.classList.add(scrolledClass);
            else header.classList.remove(scrolledClass);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        // init
        onScroll();
    }

    /* ---------- Mobile menu toggle ---------- */
    const mobileToggle = $('.mobile-menu-toggle');
    const mainNav = $('.main-nav');
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', toggleMobileNav);
        mobileToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileNav();
            }
        });
    }
    function toggleMobileNav() {
        if (!mainNav) return;
        mainNav.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (!icon) return;
        if (mainNav.classList.contains('active')) icon.classList.replace('fa-bars', 'fa-times');
        else icon.classList.replace('fa-times', 'fa-bars');
    }

    /* ---------- Smooth scroll for anchors (guarded) ---------- */
    $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') {
                e.preventDefault(); // avoid jumping to top
                return;
            }
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const topOffset = (document.querySelector('.main-header')?.offsetHeight || 0) + 8;
                const top = target.getBoundingClientRect().top + window.scrollY - topOffset;
                window.scrollTo({ top, behavior: 'smooth' });
                // close mobile nav if open
                if (mainNav && mainNav.classList.contains('active')) {
                    mainNav.classList.remove('active');
                    const icon = document.querySelector('.mobile-menu-toggle i');
                    if (icon) icon.classList.replace('fa-times', 'fa-bars');
                }
            } else {
                // if no target found — prevent default to avoid '#'
                e.preventDefault();
            }
        });
    });

    /* ---------- scroll indicator button ---------- */
    const scrollBtns = $$('[data-scroll-to]');
    scrollBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const selector = btn.getAttribute('data-scroll-to');
            if (!selector) return;
            const el = document.querySelector(selector);
            if (!el) return;
            const topOffset = (document.querySelector('.main-header')?.offsetHeight || 0) + 8;
            const top = el.getBoundingClientRect().top + window.scrollY - topOffset;
            window.scrollTo({ top, behavior: 'smooth' });
        });
    });

    /* ---------- Intersection Observer animations ---------- */
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.12 };
    const io = ('IntersectionObserver' in window) ? new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions) : null;

    const toObserve = $$('.mgh-card, .portfolio-item, .service-item, h2, .contact-form-wrapper, .contact-info-wrapper, .testimonial-item');
    toObserve.forEach(el => {
        el.classList.add('animate-on-scroll');
        if (io) io.observe(el);
        else el.classList.add('is-visible'); // fallback
    });

    /* ---------- Testimonial carousel (basic, robust) ---------- */
    const carousel = $('.testimonial-carousel');
    const prevBtn = $('.carousel-prev');
    const nextBtn = $('.carousel-next');
    if (carousel) {
        const items = $$('.testimonial-item', carousel);
        let currentIndex = 0;

        function updateCarousel() {
            carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
        }

        if (prevBtn && nextBtn && items.length > 0) {
            prevBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === 0) ? items.length - 1 : currentIndex - 1;
                updateCarousel();
            });
            nextBtn.addEventListener('click', () => {
                currentIndex = (currentIndex === items.length - 1) ? 0 : currentIndex + 1;
                updateCarousel();
            });

            // Auto-slide, respect prefers-reduced-motion
            let autoSlide = null;
            const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (!prefersReduced) {
                autoSlide = setInterval(() => nextBtn.click(), 6000);
            }

            const carouselParent = carousel.parentElement;
            if (carouselParent) {
                carouselParent.addEventListener('mouseenter', () => {
                    if (autoSlide) clearInterval(autoSlide);
                });
                carouselParent.addEventListener('mouseleave', () => {
                    if (!prefersReduced) {
                        autoSlide = setInterval(() => nextBtn.click(), 6000);
                    }
                });
            }
        }
        // initial update
        updateCarousel();
        // resize safety
        window.addEventListener('resize', () => updateCarousel(), { passive: true });
    }

    /* ---------- Lazy video play on view (optional performance) ---------- */
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        // If video heavy, we can pause autoplay on mobile to save data
        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        if (isMobile) heroVideo.pause();
    }

    /* ---------- Accessibility & small fixes ---------- */
    // ensure dropdowns close if clicked outside (mobile)
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            $$('.dropdown-content').forEach(d => d.style.display = '');
        }
    });

    // keyboard escape to close mobile nav
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mainNav && mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                const icon = document.querySelector('.mobile-menu-toggle i');
                if (icon) icon.classList.replace('fa-times', 'fa-bars');
            }
        }
    });

});
// Testimonials Carousel Functionality
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".testimonial-carousel");
    const items = document.querySelectorAll(".testimonial-item");
    const prevBtn = document.querySelector(".carousel-prev");
    const nextBtn = document.querySelector(".carousel-next");

    let index = 0;

    function showSlide(i) {
        const width = items[0].offsetWidth;
        carousel.style.transform = `translateX(-${i * width}px)`;
    }

    nextBtn.addEventListener("click", () => {
        index = (index + 1) % items.length;
        showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
        index = (index - 1 + items.length) % items.length;
        showSlide(index);
    });

    // Auto-slide every 5 seconds
    setInterval(() => {
        index = (index + 1) % items.length;
        showSlide(index);
    }, 5000);
});
