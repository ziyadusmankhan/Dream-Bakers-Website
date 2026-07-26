/*=========================================
        DOM ELEMENTS
=========================================*/

const contactForm =
    document.getElementById("contactForm");

if(contactForm){

    const contactName =
        document.getElementById("contactName");

    const contactPhone =
        document.getElementById("contactPhone");

    const contactEmail =
        document.getElementById("contactEmail");

    const contactSubject =
        document.getElementById("contactSubject");

    const contactMessage =
        document.getElementById("contactMessage");

    const contactWhatsappButton =
        document.getElementById("contactWhatsappButton");


    /*=========================================
            TOAST
            (self-contained: works even if the
            #toast element is missing, and doesn't
            depend on order.js being loaded)
    =========================================*/

    function showToast(message,type){

        let toast = document.getElementById("toast");

        if(!toast){

            toast = document.createElement("div");

            toast.id = "toast";

            document.body.appendChild(toast);

        }

        toast.textContent = message;

        toast.className = `toast ${type} show`;

        clearTimeout(showToast._timer);

        showToast._timer = setTimeout(()=>{

            toast.classList.remove("show");

        },3000);

    }


    /*=========================================
            VALIDATION HELPERS
    =========================================*/

    function clearErrors(){

        document
            .querySelectorAll(".input-error")
            .forEach(input=>{

                input.classList.remove("input-error");

            });

        document
            .querySelectorAll(".error-message")
            .forEach(error=>{

                error.remove();

            });

    }

    function showError(element,message){

        element.classList.add("input-error");
        element.classList.remove("input-success");

        const error =
            document.createElement("div");

        error.className = "error-message";

        error.textContent = message;

        element.insertAdjacentElement(
            "afterend",
            error
        );

    }

    function markValid(element){

        element.classList.remove("input-error");

        element.classList.add("input-success");

    }


    /*=========================================
            VALIDATION
    =========================================*/

    function validateForm(){

        clearErrors();

        let valid = true;

        let firstError = null;

        function check(condition,element,message){

            if(condition) return;

            valid = false;

            showError(element,message);

            if(!firstError){

                firstError = element;

            }

        }

        check(

            contactName.value.trim(),

            contactName,

            "Please enter your name."

        );

        check(

            contactPhone.value.trim(),

            contactPhone,

            "Please enter your phone number."

        );

        check(

            contactSubject.value,

            contactSubject,

            "Please choose a subject."

        );

        check(

            contactMessage.value.trim(),

            contactMessage,

            "Please enter your message."

        );

        if(contactEmail.value.trim()){

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            check(

                emailPattern.test(contactEmail.value),

                contactEmail,

                "Please enter a valid email."

            );

        }

        if(firstError){

            firstError.scrollIntoView({

                behavior:"smooth",

                block:"center"

            });

            firstError.focus({ preventScroll:true });

        }

        return valid;

    }


    /*=========================================
            WHATSAPP
    =========================================*/

    function createWhatsAppMessage(){

        return `Hello Dream Bakers,

Name:
${contactName.value}

Phone:
${contactPhone.value}

Email:
${contactEmail.value || "-"}

Subject:
${contactSubject.value}

Message:
${contactMessage.value}

Thank you!`;

    }


    /*=========================================
            EVENTS
    =========================================*/

    // Guard against accidental native form submission
    // (e.g. pressing Enter in a field), which would
    // otherwise reload the page.
    contactForm.addEventListener("submit",(e)=>{

        e.preventDefault();

    });

    contactWhatsappButton.addEventListener("click",()=>{

        if(!validateForm()){

            showToast(

                "Please complete all required fields.",

                "error"

            );

            return;

        }

        showToast(

            "Opening WhatsApp...",

            "success"

        );

        window.open(

            `https://wa.me/923477268670?text=${encodeURIComponent(createWhatsAppMessage())}`,

            "_blank"

        );

    });


    [
        contactName,
        contactPhone,
        contactEmail,
        contactMessage
    ].forEach(field=>{

        field.addEventListener("input",()=>{

            if(field.value.trim()){

                markValid(field);

            }

        });

    });


    contactSubject.addEventListener("change",()=>{

        if(contactSubject.value){

            markValid(contactSubject);

        }

    });

}