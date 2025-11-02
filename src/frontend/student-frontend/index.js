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
