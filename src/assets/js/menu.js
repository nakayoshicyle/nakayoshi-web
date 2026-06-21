document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  if (!menuToggle || !navLinks) {
    return;
  }

  menuToggle.addEventListener("click", function () {
    menuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  const links = navLinks.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", function () {
      menuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });
});
