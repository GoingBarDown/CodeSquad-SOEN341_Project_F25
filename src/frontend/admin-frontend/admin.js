const dot=document.getElementById('dot');
const menu=document.getElementById('menu');
dot.onclick=()=>{
  const isOpen=menu.classList.toggle('open');
  dot.innerHTML=isOpen?'&#8211;':'&#215;';
  //minus and x symbols

};
