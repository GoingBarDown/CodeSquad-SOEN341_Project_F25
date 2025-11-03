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

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://127.0.0.1:5000/events');
    const events = await response.json();

    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ''; // Clear existing cards

    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <p><strong>${event.title}</strong></p>
        <p>${event.description || ''}</p>
        <p>${event.start_date ? new Date(event.start_date).toLocaleString() : ''}</p>
      ${event.link ? `<a href="${event.link}" target="_blank" rel="noopener noreferrer">${event.link}</a>` : ''}      `;
      cardContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load events:', err);
  }
});

function changeBackground() {
  document.getElementById("slideshow").style.backgroundImage = `url('${images[index]}')`;
  index = (index + 1) % images.length;
}

//initial image
changeBackground();

//change every 30 seconds (5000 ms)
setInterval(changeBackground, 10000);

