// DARK MODE HANDLER

const themeBtn = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// Load saved mode
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeIcon.classList = "fa-solid fa-sun";
}

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        themeIcon.classList = "fa-solid fa-sun";
        localStorage.setItem("theme", "dark");
    } else {
        themeIcon.classList = "fa-solid fa-moon";
        localStorage.setItem("theme", "light");
    }
});
