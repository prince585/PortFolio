const THEME_KEY = "portfolio-theme";
const popups = document.querySelectorAll(".popup");
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
let topLayer = 20;

function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark", isDark);
    if (themeLabel) {
        themeLabel.textContent = isDark ? "Light" : "Dark";
    }
}

function bringToFront(el) {
    topLayer += 1;
    el.style.zIndex = String(topLayer);
}

function openWindow(id) {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.classList.add("active");
    popup.setAttribute("aria-hidden", "false");
    bringToFront(popup);
    popup.focus();
}

function closeWindow(id) {
    const popup = document.getElementById(id);
    if (!popup) return;
    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");
}

function closeTopWindow() {
    const active = [...popups].filter((p) => p.classList.contains("active"));
    if (!active.length) return;
    active.sort((a, b) => Number(a.style.zIndex || 0) - Number(b.style.zIndex || 0));
    closeWindow(active[active.length - 1].id);
}

const savedTheme = localStorage.getItem(THEME_KEY);
setTheme(savedTheme === "dark" ? "dark" : "light");

themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
});

document.addEventListener("click", (event) => {
    const openButton = event.target.closest("[data-window]");
    if (openButton) {
        openWindow(openButton.dataset.window);
        return;
    }

    const closeButton = event.target.closest("[data-close]");
    if (closeButton) {
        closeWindow(closeButton.dataset.close);
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeTopWindow();
    }
});

document.querySelectorAll(".drag").forEach((header) => {
    const popup = header.parentElement;

    header.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (event.target.closest("[data-close]")) return;

        event.preventDefault();
        bringToFront(popup);

        const rect = popup.getBoundingClientRect();
        popup.style.left = `${rect.left}px`;
        popup.style.top = `${rect.top}px`;
        popup.style.transform = "none";

        const shiftX = event.clientX - rect.left;
        const shiftY = event.clientY - rect.top;

        function onPointerMove(moveEvent) {
            const maxLeft = window.innerWidth - popup.offsetWidth;
            const maxTop = window.innerHeight - popup.offsetHeight;
            const nextLeft = Math.min(Math.max(0, moveEvent.clientX - shiftX), Math.max(0, maxLeft));
            const nextTop = Math.min(Math.max(0, moveEvent.clientY - shiftY), Math.max(0, maxTop));
            popup.style.left = `${nextLeft}px`;
            popup.style.top = `${nextTop}px`;
        }

        function onPointerUp() {
            document.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerup", onPointerUp);
        }

        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp);
    });

    header.ondragstart = () => false;
});
