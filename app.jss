document.addEventListener("DOMContentLoaded", function () {
    const rows = 10;
    const cols = 8;
    const container = document.createElement("div");
    container.className = "grid-container";
    
    for (let i = 0; i < rows * cols; i++) {
        const seat = document.createElement("div");
        seat.className = "grid-item";
        seat.textContent = i + 1;
        seat.addEventListener("click", function () {
            seat.classList.toggle("selected");
        });
        container.appendChild(seat);
    }

    document.getElementById("root").appendChild(container);
});
