(function () {
    "use strict";

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const progress = document.createElement("div");
    progress.className = "scroll-progress";
    document.body.prepend(progress);
    window.addEventListener("load", () => document.body.classList.add("page-ready"));

    const nav = $("#nav");
    const hamburger = $(".hamburger");
    const mobileNav = $("#mobNav");
    const mobileClose = $(".mob-close");
    const overlay = $("#overlay");

    const setNavState = () => {
        if (!nav) return;
        nav.classList.toggle("scrolled", window.scrollY > 24);
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const percent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
        progress.style.transform = `scaleX(${Math.min(Math.max(percent, 0), 1)})`;
        document.documentElement.style.setProperty("--hero-shift", `${Math.min(window.scrollY * 0.08, 34)}px`);
    };

    const closeMenu = () => {
        mobileNav?.classList.remove("open");
        if (overlay) overlay.style.display = "none";
        hamburger?.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    };

    const openMenu = () => {
        mobileNav?.classList.add("open");
        if (overlay) overlay.style.display = "block";
        hamburger?.setAttribute("aria-expanded", "true");
        document.body.style.overflow = "hidden";
    };

    window.addEventListener("scroll", setNavState, { passive: true });
    setNavState();

    hamburger?.addEventListener("click", openMenu);
    mobileClose?.addEventListener("click", closeMenu);
    overlay?.addEventListener("click", closeMenu);
    $$("#mobNav a").forEach((link) => link.addEventListener("click", closeMenu));

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    const revealItems = $$(".reveal, .reveal-l, .reveal-r");
    revealItems.forEach((item, index) => {
        item.classList.add("is-ready");
        item.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 70, 210)}ms`);
    });

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.14 }
    );
    revealItems.forEach((item) => revealObserver.observe(item));

    const motionCards = $$(".service-card, .showcase-card, .why-item");
    motionCards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            if (window.innerWidth < 900) return;
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-5px) rotateX(${y * -3.5}deg) rotateY(${x * 3.5}deg)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });

    const animateCounter = (counter) => {
        const target = Number(counter.dataset.target || 0);
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            counter.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.5 }
    );
    $$(".counter").forEach((counter) => counterObserver.observe(counter));

    const track = $("#track");
    const dots = $$(".dot");
    const sliderButtons = $$("[data-slider]");
    let currentSlide = 0;

    const showSlide = (index) => {
        if (!track || !dots.length) return;
        currentSlide = (index + dots.length) % dots.length;
        track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach((dot, dotIndex) => dot.classList.toggle("active", dotIndex === currentSlide));
    };

    dots.forEach((dot) => {
        dot.addEventListener("click", () => showSlide(Number(dot.dataset.slide || 0)));
    });

    sliderButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showSlide(currentSlide + (button.dataset.slider === "next" ? 1 : -1));
        });
    });

    if (track) {
        setInterval(() => showSlide(currentSlide + 1), 6500);
    }

    const fixtureTests = [
        {
            button: $(".tap-cta"),
            media: $(".tap-media"),
            video: $(".tap-media video"),
            status: $("#tapStatus"),
            runningText: "Water running from tap",
            readyText: "Mixer system ready"
        },
        {
            button: $(".flush-cta"),
            media: $(".wc-media"),
            video: $(".wc-media video"),
            status: $("#flushStatus"),
            runningText: "Opening pan and flushing",
            readyText: "Concealed system ready"
        }
    ];

    fixtureTests.forEach(({ button, media, video, status, runningText, readyText }) => {
        let testing = false;
        video?.play().catch(() => {});

        button?.addEventListener("click", () => {
            if (testing) return;
            testing = true;
            button.classList.remove("idle-pulse");
            status?.classList.add("active");
            media?.classList.add("testing");
            if (status) status.textContent = runningText;
            if (video) {
                video.currentTime = 0;
                video.play().catch(() => {});
            }

            window.setTimeout(() => {
                status?.classList.remove("active");
                media?.classList.remove("testing");
                if (status) status.textContent = readyText;
                button.classList.add("idle-pulse");
                testing = false;
            }, 2900);
        });
    });

    const qrcodeEl = $("#qrcode");
    const urlInput = $("#urlInput");
    let qr;

    const renderQr = () => {
        if (!qrcodeEl || typeof QRCode === "undefined") return;
        qrcodeEl.innerHTML = "";
        qr = new QRCode(qrcodeEl, {
            text: urlInput?.value || window.location.href,
            width: 180,
            height: 180,
            colorDark: "#071012",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    };

    $("#updateQr")?.addEventListener("click", renderQr);
    $("#downloadQr")?.addEventListener("click", () => {
        const canvas = $("#qrcode canvas");
        const image = $("#qrcode img");
        const source = canvas?.toDataURL("image/png") || image?.src;
        if (!source) return;

        const link = document.createElement("a");
        link.href = source;
        link.download = "tcoded-plumbing-qr.png";
        link.click();
    });

    window.addEventListener("load", renderQr);

    const form = $("#quoteForm");
    const formOk = $("#formOk");
    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        if (formOk) formOk.style.display = "block";
        form.reset();
        window.setTimeout(() => {
            if (formOk) formOk.style.display = "none";
        }, 4500);
    });

    const canvas = $("#particles");
    const ctx = canvas?.getContext("2d");
    const particles = [];

    const resizeCanvas = () => {
        if (!canvas || !ctx) return;
        canvas.width = window.innerWidth * window.devicePixelRatio;
        canvas.height = window.innerHeight * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };

    const createParticles = () => {
        particles.length = 0;
        const count = Math.min(70, Math.floor(window.innerWidth / 18));
        for (let i = 0; i < count; i += 1) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                r: Math.random() * 1.8 + 0.4,
                s: Math.random() * 0.25 + 0.08,
                a: Math.random() * 0.35 + 0.08
            });
        }
    };

    const drawParticles = () => {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach((particle) => {
            particle.y -= particle.s;
            if (particle.y < -10) {
                particle.y = window.innerHeight + 10;
                particle.x = Math.random() * window.innerWidth;
            }
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(79, 195, 247, ${particle.a})`;
            ctx.fill();
        });
        requestAnimationFrame(drawParticles);
    };

    if (canvas && ctx && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        resizeCanvas();
        createParticles();
        drawParticles();
        window.addEventListener("resize", () => {
            resizeCanvas();
            createParticles();
        });
    }
})();
