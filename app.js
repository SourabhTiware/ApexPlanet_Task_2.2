document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("task-input");
    const taskList = document.getElementById("task-list");
    const emptyImage = document.querySelector(".empty-image");
    const progressBar = document.getElementById("progressbar");
    const progressNumber = document.getElementById("numbers");
    const appContainer = document.querySelector(".todo-app");

    let hasCelebrated = false;


    const ensureConfettiStyles = (() => {
        let injected = false;
        return () => {
            if (injected) return;
            injected = true;
            const css = `
                .confetti-piece {
                    position: absolute;
                    width: 10px;
                    height: 14px;
                    pointer-events: none;
                    will-change: transform, opacity;
                    opacity: 1;
                    transform-origin: center;
                    border-radius: 2px;
                    animation-name: confetti-fall, confetti-tilt;
                    animation-duration: 1400ms, 1200ms;
                    animation-timing-function: cubic-bezier(.2,.8,.2,1), ease-in-out;
                    animation-iteration-count: 1, infinite;
                }
                @keyframes confetti-fall {
                    0% { transform: translate3d(var(--x), -10vh, 0) rotate(0deg); opacity: 1; }
                    100% { transform: translate3d(calc(var(--x) + var(--drift)), 110vh, 0) rotate(540deg); opacity: 0; }
                }
                @keyframes confetti-tilt {
                    0% { transform: rotate(0deg); }
                    50% { transform: rotate(180deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            const style = document.createElement("style");
            style.textContent = css;
            document.head.appendChild(style);
        };
    })();

    const domConfetti = (count = 40, duration = 1400) => {
        ensureConfettiStyles();
        const colors = ["#FFC107", "#FF5252", "#4CAF50", "#2196F3", "#9C27B0", "#FFEB3B"];
        const containerRect = appContainer.getBoundingClientRect();
        const pieces = [];

        for (let i = 0; i < count; i++) {
            const p = document.createElement("div");
            p.className = "confetti-piece";
            const leftPct = Math.random() * 100;
            const drift = (Math.random() - 0.5) * 200 + "px";
            p.style.left = leftPct + "%";
            p.style.top = "-20vh";
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.setProperty("--x", leftPct + "vw");
            p.style.setProperty("--drift", drift);

            const delay = Math.random() * 300;
            p.style.animationDelay = `${delay}ms, ${delay + 50}ms`;

            const w = 6 + Math.random() * 12;
            p.style.width = `${w}px`;
            p.style.height = `${Math.round(w * 1.4)}px`;

            appContainer.appendChild(p);
            pieces.push(p);
        }

        setTimeout(() => {
            pieces.forEach(el => el.remove());
        }, duration + 600);
    };

    const celebrate = (duration = 2000) => {
        if (window.confetti && typeof window.confetti === "function") {
            const end = Date.now() + duration;
            (function frame() {
                window.confetti({ particleCount: 8, angle: 60, spread: 55, origin: { x: 0 } });
                window.confetti({ particleCount: 8, angle: 120, spread: 55, origin: { x: 1 } });
                if (Date.now() < end) requestAnimationFrame(frame);
            })();
        } else {
            domConfetti(50, 1400);
        }
    };

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? "block" : "none";
        updateProgress();
    };

    const updateProgress = () => {
        const total = taskList.children.length;
        const completed = taskList.querySelectorAll("li.completed").length;
        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        progressBar.style.width = percent + "%";
        progressNumber.textContent = percent + "%";

        if (total > 0 && percent === 100 && !hasCelebrated) {
            hasCelebrated = true;
            celebrate();
        }

        if (percent < 100) {
            hasCelebrated = false;
        }
    };

    const addTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        const li = document.createElement("li");
        li.innerHTML = `
            <input type="checkbox" class="checkbox">
            <span>${escapeHtml(taskText)}</span>
            <div class="task-buttons">
                <button class="edit-btn" title="Edit"><i class="fa-solid fa-pen"></i></button>
                <button class="delete-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        taskList.appendChild(li);
        taskInput.value = "";
        toggleEmptyState();
    };

    function escapeHtml(str) {
        return str.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
    }

    taskList.addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".delete-btn");
        if (deleteBtn) {
            const li = deleteBtn.closest("li");
            li.remove();
            toggleEmptyState();
            return;
        }

        const editBtn = e.target.closest(".edit-btn");
        if (editBtn) {
            const li = editBtn.closest("li");
            if (editBtn.disabled) return;
            const span = li.querySelector("span");
            const newText = prompt("Edit your task:", span.textContent);
            if (newText !== null && newText.trim() !== "") {
                span.textContent = newText.trim();
            }
            return;
        }
    });

    taskList.addEventListener("change", (e) => {
        if (!e.target.matches('input[type="checkbox"]')) return;
        const checkbox = e.target;
        const li = checkbox.closest("li");
        li.classList.toggle("completed", checkbox.checked);

        const editBtn = li.querySelector(".edit-btn");
        if (editBtn) {
            if (checkbox.checked) {
                editBtn.disabled = true;
                editBtn.style.opacity = "0.5";
                editBtn.style.cursor = "not-allowed";
            } else {
                editBtn.disabled = false;
                editBtn.style.opacity = "1";
                editBtn.style.cursor = "pointer";
            }
        }
        updateProgress();
    });


    document.querySelector("form").addEventListener("submit", addTask);

    toggleEmptyState();
});

