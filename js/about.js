/*=========================================
        FAQ ACCORDION
=========================================*/

const faqItems =
    document.querySelectorAll(".faq-item");

faqItems.forEach(item=>{

    const button =
        item.querySelector(".faq-question");

    button.addEventListener("click",()=>{

        faqItems.forEach(faq=>{

            if(faq!==item){

                faq.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});

/*=========================================
        SCROLL REVEAL ANIMATION
=========================================*/

const revealItems =
    document.querySelectorAll(".reveal");

if("IntersectionObserver" in window){

    const revealObserver = new IntersectionObserver(
        (entries)=>{

            entries.forEach((entry,index)=>{

                if(entry.isIntersecting){

                    setTimeout(()=>{

                        entry.target.classList.add("in-view");

                    },(index%3)*100);

                    revealObserver.unobserve(entry.target);

                }

            });

        },
        {
            threshold:0.15,
            rootMargin:"0px 0px -40px 0px"
        }
    );

    revealItems.forEach(item=>{

        revealObserver.observe(item);

    });

}else{

    revealItems.forEach(item=>{

        item.classList.add("in-view");

    });

}