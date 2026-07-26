// Everything here touches elements that live inside header.html / footer.html,
// which loader.js injects asynchronously. Waiting for the custom "partialsLoaded"
// event (fired by loader.js once both partials are in the DOM) avoids running
// against elements that don't exist yet.
document.addEventListener("partialsLoaded", () => {

    /*==========================
        MOBILE MENU
    ==========================*/

    // const menuBtn = document.getElementById("menuBtn");
    // const navbar = document.getElementById("navbar");

    // menuBtn.addEventListener("click", () => {
    //     navbar.classList.toggle("active");
    // });
    

    /*==========================
        STICKY HEADER
    ==========================*/

    const header = document.getElementById("header");

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }

    });
    /*=========================================
        ACTIVE NAVIGATION
=========================================*/

const currentPage =
    window.location.pathname.split("/").pop() || "index.html";

document.querySelectorAll(".nav-links a").forEach(link=>{

    link.classList.toggle(

        "active",

        link.getAttribute("href")===currentPage

    );

});


/*=========================================
        MOBILE MENU
=========================================*/

const menuToggle =
    document.getElementById("menuToggle");

const navbar =
    document.getElementById("navbar");

if(menuToggle && navbar){

    menuToggle.addEventListener("click",()=>{

        navbar.classList.toggle("active");

        document.body.classList.toggle("menu-open");

        const icon = menuToggle.querySelector("i");

        if(navbar.classList.contains("active")){

            icon.classList.remove("fa-bars");

            icon.classList.add("fa-xmark");

        }

        else{

            icon.classList.remove("fa-xmark");

            icon.classList.add("fa-bars");

        }

    });

    document.querySelectorAll(".nav-links a").forEach(link=>{

        link.addEventListener("click",()=>{

            navbar.classList.remove("active");

            document.body.classList.remove("menu-open");

            const icon = menuToggle.querySelector("i");

            icon.classList.remove("fa-xmark");

            icon.classList.add("fa-bars");

        });

    });

}

/*=========================================
        CLOSE MENU WHEN LINK CLICKED
=========================================*/

document.querySelectorAll(".nav-links a").forEach(link=>{

    link.addEventListener("click",()=>{

        navbar.classList.remove("active");

        document.body.classList.remove("menu-open");

    });

});

    /*==========================
        TESTIMONIAL SLIDER
    ==========================*/

    const cards = document.querySelectorAll(".testimonial-card");
    const dotsContainer = document.querySelector(".testimonial-dots");

    let dots = [];
    let current = 0;

    function showSlide(index) {

        cards.forEach((card, i) => {

            card.style.display = i === index ? "block" : "none";

            if (dots[i]) {
                dots[i].classList.toggle("active", i === index);
            }

        });

    }

    if (cards.length > 0) {

        // Build exactly one dot per card, so the indicator always
        // matches the real number of testimonials (instead of relying
        // on a hardcoded count in the HTML that can drift out of sync).
        if (dotsContainer) {

            dotsContainer.innerHTML = "";

            cards.forEach((_, i) => {

                const dot = document.createElement("span");

                dot.className = "dot" + (i === 0 ? " active" : "");

                dot.addEventListener("click", () => {

                    current = i;

                    showSlide(current);

                });

                dotsContainer.appendChild(dot);

            });

            dots = Array.from(dotsContainer.querySelectorAll(".dot"));

        }

        showSlide(current);

        setInterval(() => {

            current++;

            if (current >= cards.length) {
                current = 0;
            }

            showSlide(current);

        }, 5000);

    }

    /*==========================
            FAQ
    ==========================*/

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {

        const question = item.querySelector(".faq-question");

        question.addEventListener("click", () => {

            faqItems.forEach(faq => {

                if (faq !== item) {
                    faq.classList.remove("active");
                }

            });

            item.classList.toggle("active");

        });

    });

    /*==========================
        BACK TO TOP
    ==========================*/

    const backToTop = document.getElementById("backToTop");

    if (backToTop) {

        window.addEventListener("scroll", () => {

            if (window.scrollY > 500) {
                backToTop.style.display = "block";
            } else {
                backToTop.style.display = "none";
            }

        });

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }

    /*==========================
        SCROLL REVEAL
    ==========================*/

    const reveals = document.querySelectorAll(".reveal");

    function revealSections() {

        reveals.forEach(item => {

            const top = item.getBoundingClientRect().top;

            if (top < window.innerHeight - 120) {
                item.classList.add("active");
            }

        });

    }

    window.addEventListener("scroll", revealSections);

    revealSections();

});

/* ==========================================
   Animated Counter
========================================== */

const counters = document.querySelectorAll(".counter");

let counterStarted = false;

function startCounters() {

    if (counterStarted) return;

    const statsSection = document.querySelector(".hero-stats");

    if (!statsSection) return;

    const top = statsSection.getBoundingClientRect().top;

    if (top < window.innerHeight - 100) {

        counterStarted = true;

        counters.forEach(counter => {

            const target = Number(counter.dataset.target);

            let current = 0;

            const increment = target / 100;

            const updateCounter = () => {

                if (current < target) {

                    current += increment;

                    if (target % 1 !== 0) {

                        counter.innerText = current.toFixed(1);

                    } else {

                        counter.innerText = Math.ceil(current);

                    }

                    requestAnimationFrame(updateCounter);

                } else {

                    if (target === 4.9) {

                        counter.innerText = "4.9★";

                    }

                    else if (target === 100) {

                        counter.innerText = "100%";

                    }

                    else {

                        counter.innerText = target + "+";

                    }

                }

            };

            updateCounter();

        });

    }

}

window.addEventListener("scroll", startCounters);


startCounters();