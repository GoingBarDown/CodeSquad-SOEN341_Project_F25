const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#8801;';}
  //minus and menu symbols

const images = [
  "views/image.png", //ew
  "views/hackathon.png", //good
  "views/hockey.png", //good
  "views/jobfair.png", //switch
  "views/october.png", //nicee
  "views/openhouse.png" //nice
];

let index = 0;

function changeBackground() {
  document.getElementById("slideshow").style.backgroundImage = `url('${images[index]}')`;
  index = (index + 1) % images.length;
}

//initial image
changeBackground();

//change every 30 seconds (5000 ms)
setInterval(changeBackground, 10000);


// ===== LOGIN FORM =====
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert(`Logging in as: ${email}`);
  });
}

// ===== SIGNUP FORM =====
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = document.getElementById('signupPassword')?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    alert(`Signing up as: ${name} (${email})`);
  });
}

// ===== FORGOT PASSWORD FORM =====
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('forgotEmail')?.value.trim();

    if (!email) {
      alert("Please enter your email.");
      return;
    }

    alert(`Password reset link sent to: ${email}`);
  });
}

