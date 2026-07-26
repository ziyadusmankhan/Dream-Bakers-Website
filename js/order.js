/*=========================================
        DOM ELEMENTS
=========================================*/

// Inputs
const cakeDesign = document.getElementById("cakeDesign");
const flavor = document.getElementById("flavor");
const occasion = document.getElementById("occasion");
const cakeMessage = document.getElementById("cakeMessage");
const deliveryDate = document.getElementById("deliveryDate");
const removeImage =
    document.getElementById("removeImage");
const notes = document.getElementById("notes");
const deliveryAddress =
    document.getElementById("deliveryAddress");

const addressGroup =
    document.getElementById("addressGroup");

const referenceImage =
    document.getElementById("referenceImage");

const imagePreview =
    document.getElementById("imagePreview");
const uploadArea =
    document.getElementById("uploadArea");


uploadArea.addEventListener("click",()=>{

    referenceImage.click();

});
// Summary
const summaryCake = document.getElementById("summaryCake");
const summaryWeight = document.getElementById("summaryWeight");
const summaryFlavor = document.getElementById("summaryFlavor");
const summaryOccasion = document.getElementById("summaryOccasion");
const summaryMessage = document.getElementById("summaryMessage");
const summaryDelivery = document.getElementById("summaryDelivery");
const summaryDate = document.getElementById("summaryDate");
const summaryNotes =
    document.getElementById("summaryNotes");
// Buttons
const whatsappButton =
document.getElementById("whatsappOrder");

function updateSummary(){

    const selectedWeight =
        document.querySelector(
            'input[name="weight"]:checked'
        );

    const selectedDelivery =
        document.querySelector(
            'input[name="delivery"]:checked'
        );

    summaryCake.textContent =
        cakeDesign.value || "—";

    summaryWeight.textContent =
        selectedWeight
            ? selectedWeight.value
            : "—";

    summaryFlavor.textContent =
        flavor.value || "—";

    summaryOccasion.textContent =
        occasion.value || "—";

    summaryMessage.textContent =
        cakeMessage.value || "—";

    summaryDelivery.textContent =
        selectedDelivery
            ? selectedDelivery.value
            : "—";

    summaryDate.textContent =
        deliveryDate.value || "—";
    summaryNotes.textContent =

    notes.value.trim()

    ||

    "No additional instructions.";

    animateSummary(summaryNotes);

    updateWhatsApp();
    animateSummary(summaryWeight);

}

function updateWhatsApp(){

    const weight =
        document.querySelector(
            'input[name="weight"]:checked'
        );

    const delivery =
        document.querySelector(
            'input[name="delivery"]:checked'
        );

    const message = `Hello Dream Bakers,

I would like to order a custom cake.

Cake Design:
${cakeDesign.value || "-"}

Weight:
${weight ? weight.value : "-"}

Flavor:
${flavor.value || "-"}

Occasion:
${occasion.value || "-"}

Message on Cake:
${cakeMessage.value || "-"}

Delivery Date:
${deliveryDate.value || "-"}

Delivery Method:
${delivery ? delivery.value : "-"}

Additional Instructions:
${notes.value || "-"}

Please let me know the final quotation.

Thank you!`;

    whatsappButton.href =
        `https://wa.me/923477268670?text=${encodeURIComponent(message)}`;

}
function setMinimumDate(){

    const today = new Date();

    const yyyy = today.getFullYear();

    const mm = String(today.getMonth()+1).padStart(2,"0");

    const dd = String(today.getDate()).padStart(2,"0");

    deliveryDate.min = `${yyyy}-${mm}-${dd}`;

}
function toggleAddress(){

    const delivery =
        document.querySelector(
            'input[name="delivery"]:checked'
        );

    if(

        delivery &&

        delivery.value === "Home Delivery"

    ){

        addressGroup.classList.remove("hidden");

    }

    else{

        addressGroup.classList.add("hidden");

    }

}
function previewImage(){

    const file = referenceImage.files[0];

    if(!file){

        imagePreview.style.display = "none";

        removeImage.style.display = "none";

        fileName.textContent = "";

        return;

    }

    imagePreview.src = URL.createObjectURL(file);

    imagePreview.style.display = "block";

    removeImage.style.display = "inline-block";

    fileName.textContent = "✔ " + file.name;

}
function clearImage(){

    referenceImage.value = "";

    imagePreview.src = "";

    imagePreview.style.display = "none";

    removeImage.style.display = "none";

    fileName.textContent = "";

}

/*=========================================
EVENTS
=========================================*/

function attachEvents(){
    
    cakeDesign.addEventListener(
        "change",
        updateSummary
    );
    removeImage.addEventListener(
    
        "click",
    
        clearImage
    
    );
    uploadArea.addEventListener("dragover",(e)=>{
    
        e.preventDefault();
    
        uploadArea.classList.add("dragover");
    
    });
    
    uploadArea.addEventListener("dragleave",()=>{
    
        uploadArea.classList.remove("dragover");
    
    });
    
    uploadArea.addEventListener("drop",(e)=>{
    
        e.preventDefault();
    
        uploadArea.classList.remove("dragover");
    
        referenceImage.files = e.dataTransfer.files;
    
        previewImage();
    
    });
    

    flavor.addEventListener(
        "change",
        updateSummary
    );

    occasion.addEventListener(
        "change",
        updateSummary
    );

    cakeMessage.addEventListener(
        "input",
        updateSummary
    );

    deliveryDate.addEventListener(
        "change",
        updateSummary
    );

    notes.addEventListener(
        "input",
        updateSummary
    );
    referenceImage.addEventListener(

    "change",

    previewImage

);

document

.querySelectorAll('input[name="delivery"]')

.forEach(radio=>{

    radio.addEventListener("change",()=>{

        toggleAddress();

        updateSummary();

    });

});

    document.querySelectorAll('input[name="weight"]').forEach(radio=>{

        radio.addEventListener(
            "change",
            updateSummary
        );

    });

    document
    .querySelectorAll('input[name="delivery"]')
    .forEach(radio=>{

        radio.addEventListener(
            "change",
            updateSummary
        );

    });

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
function animateSummary(element){

    element.classList.add("updated");

    setTimeout(()=>{

        element.classList.remove("updated");

    },300);

}
function showError(element,message){

    element.classList.add("input-error");
    element.classList.remove("input-success");


    const error =
        document.createElement("div");

    error.className="error-message";

    error.textContent=message;

    element.insertAdjacentElement(

        "afterend",

        error

    );

}
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

        cakeDesign.value,
        

        cakeDesign,

        "Please choose a cake design."

    );

    check(

        flavor.value,

        flavor,

        "Please choose a flavor."

    );

    check(

        occasion.value,

        occasion,

        "Please choose an occasion."

    );

    check(

        deliveryDate.value,

        deliveryDate,

        "Please select a delivery date."

    );

    const weight =

    document.querySelector(

        'input[name="weight"]:checked'

    );

    check(

        weight,

        document.querySelector(".weight-options"),

        "Please select a cake weight."

    );

    const delivery =

    document.querySelector(

        'input[name="delivery"]:checked'

    );

    check(

        delivery,

        document.querySelector(".delivery-options"),

        "Please select delivery method."

    );

    if(

        delivery &&

        delivery.value==="Home Delivery"

    ){

        check(

            deliveryAddress.value.trim(),

            deliveryAddress,

            "Please enter your delivery address."

        );

    }

    if(firstError){

        firstError.scrollIntoView({

            behavior:"smooth",

            block:"center"

        });

    }

    return valid;

}
whatsappButton.addEventListener("click",(e)=>{

    e.preventDefault();

    if(!validateForm()){

        showToast(

            "Please complete all required fields.",

            "error"

        );

        return;

    }

    showToast(

        "Order ready! Redirecting to WhatsApp...",

        "success"

    );

   setTimeout(() => {

    window.open(
        whatsappButton.href,
        "_blank"
    );

}, 600);

});
/*=========================================
        TOAST
=========================================*/

function showToast(message,type){

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.className =

        `toast ${type} show`;

    setTimeout(()=>{

        toast.classList.remove("show");

    },3000);

}
function markValid(element){

    element.classList.remove("input-error");

    element.classList.add("input-success");

}
cakeDesign.addEventListener("change",()=>{

    if(cakeDesign.value){

        markValid(cakeDesign);

    }

});
flavor.addEventListener("change",()=>{

    if(flavor.value){

        markValid(flavor);

    }

});
deliveryAddress.addEventListener("change",()=>{

    if(deliveryAddress.value){

        markValid(deliveryAddress);

    }

});
deliveryDate.addEventListener("change",()=>{

    if(deliveryDate.value){

        markValid(deliveryDate);

    }

});
occasion.addEventListener("change",()=>{

    if(occasion.value){

        markValid(occasion);

    }

});
/*=========================================
        INITIALIZE
=========================================*/

function initOrderPage(){

    attachEvents();

    updateSummary();

    setMinimumDate();

    toggleAddress();

}

/*=========================================
        START
=========================================*/

initOrderPage();