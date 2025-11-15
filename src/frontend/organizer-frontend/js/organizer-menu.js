document.addEventListener("DOMContentLoaded", () => {

  const dot = document.getElementById("dot");
  const menu = document.getElementById("menu");

  if (!dot || !menu) {
    console.warn("Organizer menu elements missing.");
    return;
  }

  // Toggle dropdown
  dot.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== dot) {
      menu.classList.remove("open");
    }
  });
});
