document.addEventListener("DOMContentLoaded", async () => {

    const header = document.getElementById("header");

    if (header) {
        const response = await fetch("components/header.html");
        header.outerHTML = await response.text();
    }

    const footer = document.getElementById("footer");

    if (footer) {
        const response = await fetch("components/footer.html");
        footer.outerHTML = await response.text();
    }

    document.dispatchEvent(new Event("partialsLoaded"));

});