const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const mazeSize = Math.trunc((Math.random()*4)+5);
let cellSize = 100;
const gameSong = document.getElementById('gameSong');
//ker je 20 default value range input-a
gameSong.volume = 0.2;

//s tem poskrbimo, da je maze vedno na sredini
let startX = (window.innerWidth/2) - (cellSize*mazeSize)/2;
let startY = (window.innerHeight/2) - (cellSize*mazeSize)/2;

let maze = [];
let game_loop = false;
let settings_flag = false;
let end_message_flag = true;
let keybind_flag = true;
let scoreboard_flag = false;
let loaded = false;
let player1, player2; 
let bullets = [];
let particles = [];
let powerups = [];
let lasers = [];
let lastParticleSpawnTime = 0;
let lastPowerupSpawnTime = 0;
let duelWin = true;
let matchWin = false;
let playColor = '#8e44ad';
let settingsColor = '#8e44ad';
let endMessageColor = '#8e44ad';
let returnMessageColor = '#8e44ad';
let scoreboardReturnMessageColor = '#8e44ad';
let scoreboardColor = '#8e44ad';

//v kateri funkciji smo (menu, game, settings,...)
let function_location = '';  

let keys = {
  a: {
    pressed: false
  },
  s: {
    pressed: false
  },
  d: {
    pressed: false
  },
  w: {
    pressed: false
  },
  up: {
    pressed: false
  },
  left: {
    pressed: false
  },
  right: {
    pressed: false
  },
  down: {
    pressed: false
  },
  shoot1: {
    pressed: false
  },
  shoot2: {
    pressed: false
  }
};

let keybinds = {
  player1: {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  },
  player2: {
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  }
};

const playButton = {
  x: canvas.width / 2 - 50, 
  y: canvas.height / 2 - 25, 
  width: 125, 
  height: 50, 
  text: 'Play', 
};
  
const settingsButton = {
  x: canvas.width / 2 - 50,
  y: canvas.height / 2 + 50, 
  width: 125, 
  height: 50, 
  text: 'Settings', 
}; 

const scoreboardButton = {
  x: canvas.width / 2 - 50,
  y: canvas.height / 2 + 125, 
  width: 125, 
  height: 50, 
  text: 'Scoreboard', 
}; 

const keybindButton = {
  x: canvas.width/4,
  y: canvas.height/8,
  width: 200,
  height: 50,
};

const scoreboardText = {
  x: canvas.width/2,
  y: canvas.height/4,
  width: 500,
  height: 50,
};

const volumeText = {
  x: canvas.width/2,
  y: canvas.height*0.75,
  width: 250,
  height: 50,
};

const returnText = {
  x: canvas.width/2,
  y: canvas.height*0.90,
  width: 250,
  height: 50,
};

const returnText2 = {
  x: canvas.width/2,
  y: 3*canvas.height/4 - 50,
  width: 200,
  height: 50,
};

const returnText3 = {
  x: canvas.width/2,
  y: canvas.height*0.90,
  width: 250,
  height: 50,
};

const scoreboardMessage = {
  x: canvas.width/2,
  y: canvas.height/2,
  width: 200,
  height: 50,
};

class Player {
  constructor(x, y, vx, vy, image, angle, points, keybinds, name) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.image = image;
    this.angle = angle;
    this.points = points;
    this.scale = cellSize/3;
    this.rotations = 0;
    this.width = 50;
    this.height = 50;
    this.keybinds = {
      up: keybinds.up,
      t_left: keybinds.t_left,
      down: keybinds.down,
      t_right: keybinds.t_right,
      shoot: keybinds.shoot,
    };
    this.name = name;
    this.lastShotTime = 0;
    this.powerup_flag = false;
  }
  draw(){
    ctx.save();
    ctx.translate(this.x+(this.scale/2),this.y+(this.scale/2));
    ctx.rotate(this.angle);
    ctx.translate(-this.x-(this.scale/2),-this.y-(this.scale/2));
    ctx.drawImage(this.image,this.x,this.y,this.scale,this.scale);
    ctx.restore();
  }
}

class Bullet{
  constructor(x,y,vx,vy){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 3;
    this.bounces = 10;
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.draw();
    this.x += this.vx;
    this.y += this.vy;
  }
}

class Laser{
  constructor(x,y,vx,vy,player){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = 2;
    this.bounces = 10;
    this.color = 'gray';
    this.player = player;
  }
  draw(){
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
  }
  update(){
    this.draw();
    this.x += this.vx;
    this.y += this.vy;
  }
}

class Powerup{
  constructor(x,y,image){
    this.x = x;
    this.y = y;
    this.image = image;
    this.width = cellSize/4;
    this.height = cellSize/4;
    this.angle = 0;
    this.radius = cellSize/4;
    this.flag = false;
  }
  
  draw(){
    if(this.flag)
      ctx.drawImage(this.image,this.x,this.y,this.width,this.height);
    ctx.beginPath();
    ctx.arc(this.x + this.width/2,this.y + this.height/2,this.radius,0,this.angle);
    ctx.strokeStyle = 'red';
    ctx.stroke();
    ctx.closePath();
  }
}

class Particle{
  constructor(x,y,vx,vy, radius, color){
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.opacity = 1;
  }
  draw(){
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.closePath();
    ctx.restore();
  }
  update(){
    this.draw();
    this.x += this.vx;
    this.y += this.vy;
    this.opacity -= 0.01;
  }
}

let powerupImage = new Image();
powerupImage.src = 'powerup.png';
let player1Image = new Image();
player1Image.src = 'player1.png';
let player2Image = new Image();
player2Image.src = 'player2.png';
//default keybind-i
let keybinds1 = {up: 'w', t_left: 'a', down: 's', t_right: 'd', shoot: ' '};
let keybinds2 = {up: 'ArrowUp', t_left: 'ArrowLeft', down: 'ArrowDown', t_right: 'ArrowRight', shoot: '-'};
//inicializacija player-jev, da se lahko v menu screen-u naload-ajo setting-i, ce so bili seveda prej set-ani
player1 = new Player(startX+(cellSize/2), startY+(cellSize/2),0,0,player1Image,0,0,keybinds1, 'Player1');
player2 = new Player(startX+(mazeSize*cellSize)-(cellSize/2), startY+(mazeSize*cellSize)-(cellSize/2),0,0,player2Image,0,0, keybinds2, 'Player2');

window.addEventListener('resize', function() {
  init();
});

canvas.addEventListener('mousemove', function(event){
  //dobimo pozicijo miske
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  if(function_location == 'menu'){
    if (mouseX >= playButton.x && mouseX <= playButton.x + playButton.width && mouseY >= playButton.y && mouseY <= playButton.y + playButton.height)
      playColor = '#a57dbf';
    else
      playColor = '#8e44ad';

    if (mouseX >= settingsButton.x && mouseX <= settingsButton.x + settingsButton.width && mouseY >= settingsButton.y && mouseY <= settingsButton.y + settingsButton.height)
      settingsColor = '#a57dbf';
    else
      settingsColor = '#8e44ad';

    if (mouseX >= scoreboardButton.x && mouseX <= scoreboardButton.x + scoreboardButton.width && mouseY >= scoreboardButton.y && mouseY <= scoreboardButton.y + scoreboardButton.height)
      scoreboardColor = '#a57dbf';
    else
      scoreboardColor = '#8e44ad';
  }
  else if(function_location == 'end-screen'){
    if(mouseX >= (returnText2.x - returnText2.width/2) && mouseX <= returnText2.x + returnText2.width/2 && mouseY >= (returnText2.y - returnText2.height/2) && mouseY <= returnText2.y + returnText2.height/2)
      endMessageColor = '#a57dbf';
    else
      endMessageColor = '#8e44ad';
  }
  else if(function_location == 'settings'){
    if(mouseX >= (returnText.x - returnText.width/2) && mouseX <= (returnText.x + returnText.width/2) && mouseY >= (returnText.y - returnText.height/2) && mouseY <= (returnText.y + returnText.height/2))
      returnMessageColor = '#a57dbf';
    else
      returnMessageColor = '#8e44ad';
  }
  else if(function_location == 'scoreboard'){
    if(mouseX >= (returnText3.x - returnText3.width/2) && mouseX <= returnText3.x + returnText3.width/2 && mouseY >= (returnText3.y - returnText3.height/2) && mouseY <= returnText3.y + returnText3.height/2)
      scoreboardReturnMessageColor = '#a57dbf';
    else
      scoreboardReturnMessageColor = '#8e44ad';
  }
});

//za menu
canvas.addEventListener('click', function(event) {
  //dobimo pozicijo miske
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  //pogledamo, ce so koordinate miske znotraj play gumba
  if (mouseX >= playButton.x && mouseX <= playButton.x + playButton.width && mouseY >= playButton.y && mouseY <= playButton.y + playButton.height){
    if(function_location == 'menu'){
      game_loop = true;
      game();
      end_message_flag = true;
      duelWin = true;
      matchWin = false;
      player1.points = 0;
      player2.points = 0;
      particles.splice(0,particles.length);
      lasers.splice(0,lasers.length);
      bullets.splice(0,bullets.length);
    }
  }
  //pogledamo, ce so koordinate znotraj settings gumba
  if (mouseX >= settingsButton.x && mouseX <= settingsButton.x + settingsButton.width && mouseY >= settingsButton.y && mouseY <= settingsButton.y + settingsButton.height){
    if(function_location == 'menu'){
      settings_flag = true;
      settings();
    }
  }
  //pogledamo, ce so koordinate znotraj scoreboard gumba
  if (mouseX >= scoreboardButton.x && mouseX <= scoreboardButton.x + scoreboardButton.width && mouseY >= scoreboardButton.y && mouseY <= scoreboardButton.y + scoreboardButton.height){
    if(function_location == 'menu'){
      scoreboard_flag = true;
      scoreboard();
    }
  }
});

//za settings
canvas.addEventListener('click', function(event) {
  //dobimo pozicijo miske
  let mouseX = event.clientX;
  let mouseY = event.clientY;
  if(mouseX >= (returnText.x - returnText.width/2) && mouseX <= returnText.x + returnText.width && mouseY >= (returnText.y - returnText.height/2) && mouseY <= returnText.y + returnText.height && keybind_flag){
    settings_flag = false;
    save();
  }
  //pogledamo, ce so koordinate miske znotraj player1 keybind settings gumba
  for(let i = 0;i<6;i++){
    if(mouseX >= keybindButton.x && mouseX <= keybindButton.x + keybindButton.width && mouseY >= keybindButton.y + (i*keybindButton.height) && mouseY <= keybindButton.y + (i*keybindButton.height) + keybindButton.height)
      if(function_location == 'settings'){
        switch(i){
          case 0: 
            if(checkKeybinds())
              keybinds.player1[0] = true;
            break;
          case 1: 
            if(checkKeybinds())
              keybinds.player1[1] = true;
            break;
          case 2: 
            if(checkKeybinds())
              keybinds.player1[2] = true;
            break;
          case 3: 
            if(checkKeybinds())          
              keybinds.player1[3] = true;
            break;
          case 4: 
            if(checkKeybinds())          
              keybinds.player1[4] = true;
            break;
          case 5: 
            if(checkKeybinds())          
              keybinds.player1[5] = true;
            break;
        }
      }
  }
  //pogledamo, ce so koordinate miske znotraj player2 keybind settings gumba
  for(let i = 0;i<6;i++){
    if(mouseX >= 3*keybindButton.x && mouseX <= 3*keybindButton.x + keybindButton.width && mouseY >= keybindButton.y + (i*keybindButton.height) && mouseY <= keybindButton.y + (i*keybindButton.height) + keybindButton.height)
      if(function_location == 'settings'){
        switch(i){
          case 0: 
            if(checkKeybinds())
              keybinds.player2[0] = true;
            break;
          case 1: 
            if(checkKeybinds())
              keybinds.player2[1] = true;
            break;
          case 2: 
            if(checkKeybinds())
              keybinds.player2[2] = true;
            break;
          case 3: 
            if(checkKeybinds())          
              keybinds.player2[3] = true;
            break;
          case 4: 
            if(checkKeybinds())          
              keybinds.player2[4] = true;
            break;
          case 5: 
            if(checkKeybinds())          
              keybinds.player2[5] = true;
            break;
        }
      }
  }  
});

//za endMessage
canvas.addEventListener('click', function(event){
  if(function_location == 'end-screen'){
    //dobimo pozicijo miske
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    if(mouseX >= (returnText2.x - returnText2.width/2) && mouseX <= returnText2.x + returnText2.width/2 && mouseY >= (returnText2.y - returnText2.height/2) && mouseY <= returnText2.y + returnText2.height/2)
      end_message_flag = false;
  }
});

//za scoreboard
canvas.addEventListener('click', function(event){
  if(function_location == 'scoreboard'){
    //dobimo pozicijo miske
    let mouseX = event.clientX;
    let mouseY = event.clientY;
    if(mouseX >= (returnText3.x - returnText3.width/2) && mouseX <= returnText3.x + returnText3.width/2 && mouseY >= (returnText3.y - returnText3.height/2) && mouseY <= returnText3.y + returnText3.height/2)
      scoreboard_flag = false;
  }
});

//za settings
//DISCLAIMER: ce imate IDE, ki omogoca skrivanje funkcij, raje to naredite, ker je tale funkcija DOLGA (cca 1500 line-ov).
window.addEventListener('keydown', function(event){
  if(function_location == 'settings'){
    //katera tipka je bila pritisnjena
    let key = event.key;
    for(let i = 0;i<6;i++){
      if(keybinds.player1[i]){
        switch(key){
          case 'Backspace':
            switch(i){
              case 0:
                player1.keybinds.up = 'Backspace';
                break;
              case 1:
                player1.keybinds.t_left = 'Backspace';
                break;
              case 2:
                player1.keybinds.down = 'Backspace';
                break;
              case 3:
                player1.keybinds.t_right = 'Backspace';
                break;
              case 4:
                player1.keybinds.shoot = 'Backspace';
                break;
              case 5:
                player1.name = player1.name.slice(0,-1);
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'Enter':
            if(i == 5)
              keybinds.player1[i] = false;
            break;
          case 'q': 
            switch(i){
              case 0:
                player1.keybinds.up = 'q';
                break;
              case 1:
                player1.keybinds.t_left = 'q';
                break;
              case 2:
                player1.keybinds.down = 'q';
                break;
              case 3:
                player1.keybinds.t_right = 'q';
                break;
              case 4:
                player1.keybinds.shoot = 'q';
                break;
              case 5:
                player1.name += 'q';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'w': 
            switch(i){
              case 0:
                player1.keybinds.up = 'w';
                break;
              case 1:
                player1.keybinds.t_left = 'w';
                break;
              case 2:
                player1.keybinds.down = 'w';
                break;
              case 3:
                player1.keybinds.t_right = 'w';
                break;
              case 4:
                player1.keybinds.shoot = 'w';
                break;
              case 5:
                player1.name += 'w';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'e': 
            switch(i){
              case 0:
                player1.keybinds.up = 'e';
                break;
              case 1:
                player1.keybinds.t_left = 'e';
                break;
              case 2:
                player1.keybinds.down = 'e';
                break;
              case 3:
                player1.keybinds.t_right = 'e';
                break;
              case 4:
                player1.keybinds.shoot = 'e';
                break;
              case 5:
                player1.name += 'e';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'r': 
            switch(i){
              case 0:
                player1.keybinds.up = 'r';
                break;
              case 1:
                player1.keybinds.t_left = 'r';
                break;
              case 2:
                player1.keybinds.down = 'r';
                break;
              case 3:
                player1.keybinds.t_right = 'r';
                break;
              case 4:
                player1.keybinds.shoot = 'r';
                break;
              case 5:
                player1.name += 'r';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 't': 
            switch(i){
              case 0:
                player1.keybinds.up = 't';
                break;
              case 1:
                player1.keybinds.t_left = 't';
                break;
              case 2:
                player1.keybinds.down = 't';
                break;
              case 3:
                player1.keybinds.t_right = 't';
                break;
              case 4:
                player1.keybinds.shoot = 't';
                break;
              case 5:
                player1.name += 't';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'z': 
            switch(i){
              case 0:
                player1.keybinds.up = 'z';
                break;
              case 1:
                player1.keybinds.t_left = 'z';
                break;
              case 2:
                player1.keybinds.down = 'z';
                break;
              case 3:
                player1.keybinds.t_right = 'z';
                break;
              case 4:
                player1.keybinds.shoot = 'z';
                break;
              case 5:
                player1.name += 'z';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'u': 
            switch(i){
              case 0:
                player1.keybinds.up = 'u';
                break;
              case 1:
                player1.keybinds.t_left = 'u';
                break;
              case 2:
                player1.keybinds.down = 'u';
                break;
              case 3:
                player1.keybinds.t_right = 'u';
                break;
              case 4:
                player1.keybinds.shoot = 'u';
                break;
              case 5:
                player1.name += 'u';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'i': 
            switch(i){
              case 0:
                player1.keybinds.up = 'i';
                break;
              case 1:
                player1.keybinds.t_left = 'i';
                break;
              case 2:
                player1.keybinds.down = 'i';
                break;
              case 3:
                player1.keybinds.t_right = 'i';
                break;
              case 4:
                player1.keybinds.shoot = 'i';
                break;
              case 5:
                player1.name += 'i';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'o': 
            switch(i){
              case 0:
                player1.keybinds.up = 'o';
                break;
              case 1:
                player1.keybinds.t_left = 'o';
                break;
              case 2:
                player1.keybinds.down = 'o';
                break;
              case 3:
                player1.keybinds.t_right = 'o';
                break;
              case 4:
                player1.keybinds.shoot = 'o';
                break;
              case 5:
                player1.name += 'o';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'p': 
            switch(i){
              case 0:
                player1.keybinds.up = 'p';
                break;
              case 1:
                player1.keybinds.t_left = 'p';
                break;
              case 2:
                player1.keybinds.down = 'p';
                break;
              case 3:
                player1.keybinds.t_right = 'p';
                break;
              case 4:
                player1.keybinds.shoot = 'p';
                break;
              case 5:
                player1.name += 'p';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'a': 
            switch(i){
              case 0:
                player1.keybinds.up = 'a';
                break;
              case 1:
                player1.keybinds.t_left = 'a';
                break;
              case 2:
                player1.keybinds.down = 'a';
                break;
              case 3:
                player1.keybinds.t_right = 'a';
                break;
              case 4:
                player1.keybinds.shoot = 'a';
                break;
              case 5:
                player1.name += 'a';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 's': 
            switch(i){
              case 0:
                player1.keybinds.up = 's';
                break;
              case 1:
                player1.keybinds.t_left = 's';
                break;
              case 2:
                player1.keybinds.down = 's';
                break;
              case 3:
                player1.keybinds.t_right = 's';
                break;
              case 4:
                player1.keybinds.shoot = 's';
                break;
              case 5:
                player1.name += 's';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'd': 
            switch(i){
              case 0:
                player1.keybinds.up = 'd';
                break;
              case 1:
                player1.keybinds.t_left = 'd';
                break;
              case 2:
                player1.keybinds.down = 'd';
                break;
              case 3:
                player1.keybinds.t_right = 'd';
                break;
              case 4:
                player1.keybinds.shoot = 'd';
                break;
              case 5:
                player1.name += 'd';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'f': 
            switch(i){
              case 0:
                player1.keybinds.up = 'f';
                break;
              case 1:
                player1.keybinds.t_left = 'f';
                break;
              case 2:
                player1.keybinds.down = 'f';
                break;
              case 3:
                player1.keybinds.t_right = 'f';
                break;
              case 4:
                player1.keybinds.shoot = 'f';
                break;
              case 5:
                player1.name += 'f';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'g': 
            switch(i){
              case 0:
                player1.keybinds.up = 'g';
                break;
              case 1:
                player1.keybinds.t_left = 'g';
                break;
              case 2:
                player1.keybinds.down = 'g';
                break;
              case 3:
                player1.keybinds.t_right = 'g';
                break;
              case 4:
                player1.keybinds.shoot = 'g';
                break;
              case 5:
                player1.name += 'g';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'h': 
            switch(i){
              case 0:
                player1.keybinds.up = 'h';
                break;
              case 1:
                player1.keybinds.t_left = 'h';
                break;
              case 2:
                player1.keybinds.down = 'h';
                break;
              case 3:
                player1.keybinds.t_right = 'h';
                break;
              case 4:
                player1.keybinds.shoot = 'h';
                break;
              case 5:
                player1.name += 'h';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'j': 
            switch(i){
              case 0:
                player1.keybinds.up = 'j';
                break;
              case 1:
                player1.keybinds.t_left = 'j';
                break;
              case 2:
                player1.keybinds.down = 'j';
                break;
              case 3:
                player1.keybinds.t_right = 'j';
                break;
              case 4:
                player1.keybinds.shoot = 'j';
                break;
              case 5:
                player1.name += 'j';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'k': 
            switch(i){
              case 0:
                player1.keybinds.up = 'k';
                break;
              case 1:
                player1.keybinds.t_left = 'k';
                break;
              case 2:
                player1.keybinds.down = 'k';
                break;
              case 3:
                player1.keybinds.t_right = 'k';
                break;
              case 4:
                player1.keybinds.shoot = 'k';
                break;
              case 5:
                player1.name += 'k';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'l': 
            switch(i){
              case 0:
                player1.keybinds.up = 'l';
                break;
              case 1:
                player1.keybinds.t_left = 'l';
                break;
              case 2:
                player1.keybinds.down = 'l';
                break;
              case 3:
                player1.keybinds.t_right = 'l';
                break;
              case 4:
                player1.keybinds.shoot = 'l';
                break;
              case 5:
                player1.name += 'l';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'y': 
            switch(i){
              case 0:
                player1.keybinds.up = 'y';
                break;
              case 1:
                player1.keybinds.t_left = 'y';
                break;
              case 2:
                player1.keybinds.down = 'y';
                break;
              case 3:
                player1.keybinds.t_right = 'y';
                break;
              case 4:
                player1.keybinds.shoot = 'y';
                break;
              case 5:
                player1.name += 'y';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'x': 
            switch(i){
              case 0:
                player1.keybinds.up = 'x';
                break;
              case 1:
                player1.keybinds.t_left = 'x';
                break;
              case 2:
                player1.keybinds.down = 'x';
                break;
              case 3:
                player1.keybinds.t_right = 'x';
                break;
              case 4:
                player1.keybinds.shoot = 'x';
                break;
              case 5:
                player1.name += 'x';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'c': 
            switch(i){
              case 0:
                player1.keybinds.up = 'c';
                break;
              case 1:
                player1.keybinds.t_left = 'c';
                break;
              case 2:
                player1.keybinds.down = 'c';
                break;
              case 3:
                player1.keybinds.t_right = 'c';
                break;
              case 4:
                player1.keybinds.shoot = 'c';
                break;
              case 5:
                player1.name += 'c';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'v': 
            switch(i){
              case 0:
                player1.keybinds.up = 'v';
                break;
              case 1:
                player1.keybinds.t_left = 'v';
                break;
              case 2:
                player1.keybinds.down = 'v';
                break;
              case 3:
                player1.keybinds.t_right = 'v';
                break;
              case 4:
                player1.keybinds.shoot = 'v';
                break;
              case 5:
                player1.name += 'v';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'b': 
            switch(i){
              case 0:
                player1.keybinds.up = 'b';
                break;
              case 1:
                player1.keybinds.t_left = 'b';
                break;
              case 2:
                player1.keybinds.down = 'b';
                break;
              case 3:
                player1.keybinds.t_right = 'b';
                break;
              case 4:
                player1.keybinds.shoot = 'b';
                break;
              case 5:
                player1.name += 'b';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'n': 
            switch(i){
              case 0:
                player1.keybinds.up = 'n';
                break;
              case 1:
                player1.keybinds.t_left = 'n';
                break;
              case 2:
                player1.keybinds.down = 'n';
                break;
              case 3:
                player1.keybinds.t_right = 'n';
                break;
              case 4:
                player1.keybinds.shoot = 'n';
                break;
              case 5:
                player1.name += 'n';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'm': 
            switch(i){
              case 0:
                player1.keybinds.up = 'm';
                break;
              case 1:
                player1.keybinds.t_left = 'm';
                break;
              case 2:
                player1.keybinds.down = 'm';
                break;
              case 3:
                player1.keybinds.t_right = 'm';
                break;
              case 4:
                player1.keybinds.shoot = 'm';
                break;
              case 5:
                player1.name += 'm';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case ' ': 
            switch(i){
              case 0:
                player1.keybinds.up = ' ';
                break;
              case 1:
                player1.keybinds.t_left = ' ';
                break;
              case 2:
                player1.keybinds.down = ' ';
                break;
              case 3:
                player1.keybinds.t_right = ' ';
                break;
              case 4:
                player1.keybinds.shoot = ' ';
                break;
              case 5:
                player1.name += ' ';
                break;                
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case '.': 
            switch(i){
              case 0:
                player1.keybinds.up = '.';
                break;
              case 1:
                player1.keybinds.t_left = '.';
                break;
              case 2:
                player1.keybinds.down = '.';
                break;
              case 3:
                player1.keybinds.t_right = '.';
                break;
              case 4:
                player1.keybinds.shoot = '.';
                break;
              case 5:
                player1.name += '.';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case ',': 
            switch(i){
              case 0:
                player1.keybinds.up = ',';
                break;
              case 1:
                player1.keybinds.t_left = ',';
                break;
              case 2:
                player1.keybinds.down = ',';
                break;
              case 3:
                player1.keybinds.t_right = ',';
                break;
              case 4:
                player1.keybinds.shoot = ',';
                break;
              case 5:
                player1.name += ',';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case '-': 
            switch(i){
              case 0:
                player1.keybinds.up = '-';
                break;
              case 1:
                player1.keybinds.t_left = '-';
                break;
              case 2:
                player1.keybinds.down = '-';
                break;
              case 3:
                player1.keybinds.t_right = '-';
                break;
              case 4:
                player1.keybinds.shoot = '-';
                break;
              case 5:
                player1.name += '-';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'ArrowUp': 
            switch(i){
              case 0:
                player1.keybinds.up = 'ArrowUp';
                break;
              case 1:
                player1.keybinds.t_left = 'ArrowUp';
                break;
              case 2:
                player1.keybinds.down = 'ArrowUp';
                break;
              case 3:
                player1.keybinds.t_right = 'ArrowUp';
                break;
              case 4:
                player1.keybinds.shoot = 'ArrowUp';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'ArrowLeft': 
            switch(i){
              case 0:
                player1.keybinds.up = 'ArrowLeft';
                break;
              case 1:
                player1.keybinds.t_left = 'ArrowLeft';
                break;
              case 2:
                player1.keybinds.down = 'ArrowLeft';
                break;
              case 3:
                player1.keybinds.t_right = 'ArrowLeft';
                break;
              case 4:
                player1.keybinds.shoot = 'ArrowLeft';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'ArrowDown': 
            switch(i){
              case 0:
                player1.keybinds.up = 'ArrowDown';
                break;
              case 1:
                player1.keybinds.t_left = 'ArrowDown';
                break;
              case 2:
                player1.keybinds.down = 'ArrowDown';
                break;
              case 3:
                player1.keybinds.t_right = 'ArrowDown';
                break;
              case 4:
                player1.keybinds.shoot = 'ArrowDown';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
          case 'ArrowRight': 
            switch(i){
              case 0:
                player1.keybinds.up = 'ArrowRight';
                break;
              case 1:
                player1.keybinds.t_left = 'ArrowRight';
                break;
              case 2:
                player1.keybinds.down = 'ArrowRight';
                break;
              case 3:
                player1.keybinds.t_right = 'ArrowRight';
                break;
              case 4:
                player1.keybinds.shoot = 'ArrowRight';
                break;
            }
            if(i != 5)
              keybinds.player1[i] = false;
            else
              keybinds.player1[i] = true;
            break;
        }
      }
    }
    for(let i = 0;i<6;i++){
      if(keybinds.player2[i]){
        switch(key){
          case 'Backspace':
            switch(i){
              case 0:
                player2.keybinds.up = 'Backspace';
                break;
              case 1:
                player2.keybinds.t_left = 'Backspace';
                break;
              case 2:
                player2.keybinds.down = 'Backspace';
                break;
              case 3:
                player2.keybinds.t_right = 'Backspace';
                break;
              case 4:
                player2.keybinds.shoot = 'Backspace';
                break;
              case 5:
                player2.name = player2.name.slice(0,-1);
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'Enter':
            if(i == 5)
              keybinds.player2[i] = false;
            break;            
          case 'q': 
            switch(i){
              case 0:
                player2.keybinds.up = 'q';
                break;
              case 1:
                player2.keybinds.t_left = 'q';
                break;
              case 2:
                player2.keybinds.down = 'q';
                break;
              case 3:
                player2.keybinds.t_right = 'q';
                break;
              case 4:
                player2.keybinds.shoot = 'q';
                break;
              case 5:
                player2.name += 'q';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'w': 
            switch(i){
              case 0:
                player2.keybinds.up = 'w';
                break;
              case 1:
                player2.keybinds.t_left = 'w';
                break;
              case 2:
                player2.keybinds.down = 'w';
                break;
              case 3:
                player2.keybinds.t_right = 'w';
                break;
              case 4:
                player2.keybinds.shoot = 'w';
                break;
              case 5:
                player2.name += 'w';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'e': 
            switch(i){
              case 0:
                player2.keybinds.up = 'e';
                break;
              case 1:
                player2.keybinds.t_left = 'e';
                break;
              case 2:
                player2.keybinds.down = 'e';
                break;
              case 3:
                player2.keybinds.t_right = 'e';
                break;
              case 4:
                player2.keybinds.shoot = 'e';
                break;
              case 5:
                player2.name += 'e';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'r': 
            switch(i){
              case 0:
                player2.keybinds.up = 'r';
                break;
              case 1:
                player2.keybinds.t_left = 'r';
                break;
              case 2:
                player2.keybinds.down = 'r';
                break;
              case 3:
                player2.keybinds.t_right = 'r';
                break;
              case 4:
                player2.keybinds.shoot = 'r';
                break;
              case 5:
                player2.name += 'r';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 't': 
            switch(i){
              case 0:
                player2.keybinds.up = 't';
                break;
              case 1:
                player2.keybinds.t_left = 't';
                break;
              case 2:
                player2.keybinds.down = 't';
                break;
              case 3:
                player2.keybinds.t_right = 't';
                break;
              case 4:
                player2.keybinds.shoot = 't';
                break;
              case 5:
                player2.name += 't';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'z': 
            switch(i){
              case 0:
                player2.keybinds.up = 'z';
                break;
              case 1:
                player2.keybinds.t_left = 'z';
                break;
              case 2:
                player2.keybinds.down = 'z';
                break;
              case 3:
                player2.keybinds.t_right = 'z';
                break;
              case 4:
                player2.keybinds.shoot = 'z';
                break;
              case 5:
                player2.name += 'z';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'u': 
            switch(i){
              case 0:
                player2.keybinds.up = 'u';
                break;
              case 1:
                player2.keybinds.t_left = 'u';
                break;
              case 2:
                player2.keybinds.down = 'u';
                break;
              case 3:
                player2.keybinds.t_right = 'u';
                break;
              case 4:
                player2.keybinds.shoot = 'u';
                break;
              case 5:
                player2.name += 'u';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'i': 
            switch(i){
              case 0:
                player2.keybinds.up = 'i';
                break;
              case 1:
                player2.keybinds.t_left = 'i';
                break;
              case 2:
                player2.keybinds.down = 'i';
                break;
              case 3:
                player2.keybinds.t_right = 'i';
                break;
              case 4:
                player2.keybinds.shoot = 'i';
                break;
              case 5:
                player2.name += 'i';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'o': 
            switch(i){
              case 0:
                player2.keybinds.up = 'o';
                break;
              case 1:
                player2.keybinds.t_left = 'o';
                break;
              case 2:
                player2.keybinds.down = 'o';
                break;
              case 3:
                player2.keybinds.t_right = 'o';
                break;
              case 4:
                player2.keybinds.shoot = 'o';
                break;
              case 5:
                player2.name += 'o';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'p': 
            switch(i){
              case 0:
                player2.keybinds.up = 'p';
                break;
              case 1:
                player2.keybinds.t_left = 'p';
                break;
              case 2:
                player2.keybinds.down = 'p';
                break;
              case 3:
                player2.keybinds.t_right = 'p';
                break;
              case 4:
                player2.keybinds.shoot = 'p';
                break;
              case 5:
                player2.name += 'p';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'f': 
            switch(i){
              case 0:
                player2.keybinds.up = 'f';
                break;
              case 1:
                player2.keybinds.t_left = 'f';
                break;
              case 2:
                player2.keybinds.down = 'f';
                break;
              case 3:
                player2.keybinds.t_right = 'f';
                break;
              case 4:
                player2.keybinds.shoot = 'f';
                break;
              case 5:
                player2.name += 'f';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'g': 
            switch(i){
              case 0:
                player2.keybinds.up = 'g';
                break;
              case 1:
                player2.keybinds.t_left = 'g';
                break;
              case 2:
                player2.keybinds.down = 'g';
                break;
              case 3:
                player2.keybinds.t_right = 'g';
                break;
              case 4:
                player2.keybinds.shoot = 'g';
                break;
              case 5:
                player2.name += 'g';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'h': 
            switch(i){
              case 0:
                player2.keybinds.up = 'h';
                break;
              case 1:
                player2.keybinds.t_left = 'h';
                break;
              case 2:
                player2.keybinds.down = 'h';
                break;
              case 3:
                player2.keybinds.t_right = 'h';
                break;
              case 4:
                player2.keybinds.shoot = 'h';
                break;
              case 5:
                player2.name += 'h';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'j': 
            switch(i){
              case 0:
                player2.keybinds.up = 'j';
                break;
              case 1:
                player2.keybinds.t_left = 'j';
                break;
              case 2:
                player2.keybinds.down = 'j';
                break;
              case 3:
                player2.keybinds.t_right = 'j';
                break;
              case 4:
                player2.keybinds.shoot = 'j';
                break;
              case 5:
                player2.name += 'j';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'k': 
            switch(i){
              case 0:
                player2.keybinds.up = 'k';
                break;
              case 1:
                player2.keybinds.t_left = 'k';
                break;
              case 2:
                player2.keybinds.down = 'k';
                break;
              case 3:
                player2.keybinds.t_right = 'k';
                break;
              case 4:
                player2.keybinds.shoot = 'k';
                break;
              case 5:
                player2.name += 'k';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'l': 
            switch(i){
              case 0:
                player2.keybinds.up = 'l';
                break;
              case 1:
                player2.keybinds.t_left = 'l';
                break;
              case 2:
                player2.keybinds.down = 'l';
                break;
              case 3:
                player2.keybinds.t_right = 'l';
                break;
              case 4:
                player2.keybinds.shoot = 'l';
                break;
              case 5:
                player2.name += 'l';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'v': 
            switch(i){
              case 0:
                player2.keybinds.up = 'v';
                break;
              case 1:
                player2.keybinds.t_left = 'v';
                break;
              case 2:
                player2.keybinds.down = 'v';
                break;
              case 3:
                player2.keybinds.t_right = 'v';
                break;
              case 4:
                player2.keybinds.shoot = 'v';
                break;
              case 5:
                player2.name += 'v';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'b': 
            switch(i){
              case 0:
                player2.keybinds.up = 'b';
                break;
              case 1:
                player2.keybinds.t_left = 'b';
                break;
              case 2:
                player2.keybinds.down = 'b';
                break;
              case 3:
                player2.keybinds.t_right = 'b';
                break;
              case 4:
                player2.keybinds.shoot = 'b';
                break;
              case 5:
                player2.name += 'b';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'n': 
            switch(i){
              case 0:
                player2.keybinds.up = 'n';
                break;
              case 1:
                player2.keybinds.t_left = 'n';
                break;
              case 2:
                player2.keybinds.down = 'n';
                break;
              case 3:
                player2.keybinds.t_right = 'n';
                break;
              case 4:
                player2.keybinds.shoot = 'n';
                break;
              case 5:
                player2.name += 'n';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'm': 
            switch(i){
              case 0:
                player2.keybinds.up = 'm';
                break;
              case 1:
                player2.keybinds.t_left = 'm';
                break;
              case 2:
                player2.keybinds.down = 'm';
                break;
              case 3:
                player2.keybinds.t_right = 'm';
                break;
              case 4:
                player2.keybinds.shoot = 'm';
                break;
              case 5:
                player2.name += 'm';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'a': 
            switch(i){
              case 0:
                player2.keybinds.up = 'a';
                break;
              case 1:
                player2.keybinds.t_left = 'a';
                break;
              case 2:
                player2.keybinds.down = 'a';
                break;
              case 3:
                player2.keybinds.t_right = 'a';
                break;
              case 4:
                player2.keybinds.shoot = 'a';
                break;
              case 5:
                player2.name += 'a';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 's': 
            switch(i){
              case 0:
                player2.keybinds.up = 's';
                break;
              case 1:
                player2.keybinds.t_left = 's';
                break;
              case 2:
                player2.keybinds.down = 's';
                break;
              case 3:
                player2.keybinds.t_right = 's';
                break;
              case 4:
                player2.keybinds.shoot = 's';
                break;
              case 5:
                player2.name += 's';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'd': 
            switch(i){
              case 0:
                player2.keybinds.up = 'd';
                break;
              case 1:
                player2.keybinds.t_left = 'd';
                break;
              case 2:
                player2.keybinds.down = 'd';
                break;
              case 3:
                player2.keybinds.t_right = 'd';
                break;
              case 4:
                player2.keybinds.shoot = 'd';
                break;
              case 5:
                player2.name += 'd';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'y': 
            switch(i){
              case 0:
                player2.keybinds.up = 'y';
                break;
              case 1:
                player2.keybinds.t_left = 'y';
                break;
              case 2:
                player2.keybinds.down = 'y';
                break;
              case 3:
                player2.keybinds.t_right = 'y';
                break;
              case 4:
                player2.keybinds.shoot = 'y';
                break;
              case 5:
                player2.name += 'y';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'x': 
            switch(i){
              case 0:
                player2.keybinds.up = 'x';
                break;
              case 1:
                player2.keybinds.t_left = 'x';
                break;
              case 2:
                player2.keybinds.down = 'x';
                break;
              case 3:
                player2.keybinds.t_right = 'x';
                break;
              case 4:
                player2.keybinds.shoot = 'x';
                break;
              case 5:
                player2.name += 'x';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'c': 
            switch(i){
              case 0:
                player2.keybinds.up = 'c';
                break;
              case 1:
                player2.keybinds.t_left = 'c';
                break;
              case 2:
                player2.keybinds.down = 'c';
                break;
              case 3:
                player2.keybinds.t_right = 'c';
                break;
              case 4:
                player2.keybinds.shoot = 'c';
                break;
              case 5:
                player2.name += 'c';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case ' ': 
            switch(i){
              case 0:
                player2.keybinds.up = ' ';
                break;
              case 1:
                player2.keybinds.t_left = ' ';
                break;
              case 2:
                player2.keybinds.down = ' ';
                break;
              case 3:
                player2.keybinds.t_right = ' ';
                break;
              case 4:
                player2.keybinds.shoot = ' ';
                break;
              case 5:
                player2.name += ' ';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case '.': 
            switch(i){
              case 0:
                player2.keybinds.up = '.';
                break;
              case 1:
                player2.keybinds.t_left = '.';
                break;
              case 2:
                player2.keybinds.down = '.';
                break;
              case 3:
                player2.keybinds.t_right = '.';
                break;
              case 4:
                player2.keybinds.shoot = '.';
                break;
              case 5:
                player2.name += '.';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case ',': 
            switch(i){
              case 0:
                player2.keybinds.up = ',';
                break;
              case 1:
                player2.keybinds.t_left = ',';
                break;
              case 2:
                player2.keybinds.down = ',';
                break;
              case 3:
                player2.keybinds.t_right = ',';
                break;
              case 4:
                player2.keybinds.shoot = ',';
                break;
              case 5:
                player2.name += ',';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case '-': 
            switch(i){
              case 0:
                player2.keybinds.up = '-';
                break;
              case 1:
                player2.keybinds.t_left = '-';
                break;
              case 2:
                player2.keybinds.down = '-';
                break;
              case 3:
                player2.keybinds.t_right = '-';
                break;
              case 4:
                player2.keybinds.shoot = '-';
                break;
              case 5:
                player2.name += '-';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'ArrowUp': 
            switch(i){
              case 0:
                player2.keybinds.up = 'ArrowUp';
                break;
              case 1:
                player2.keybinds.t_left = 'ArrowUp';
                break;
              case 2:
                player2.keybinds.down = 'ArrowUp';
                break;
              case 3:
                player2.keybinds.t_right = 'ArrowUp';
                break;
              case 4:
                player2.keybinds.shoot = 'ArrowUp';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'ArrowLeft': 
            switch(i){
              case 0:
                player2.keybinds.up = 'ArrowLeft';
                break;
              case 1:
                player2.keybinds.t_left = 'ArrowLeft';
                break;
              case 2:
                player2.keybinds.down = 'ArrowLeft';
                break;
              case 3:
                player2.keybinds.t_right = 'ArrowLeft';
                break;
              case 4:
                player2.keybinds.shoot = 'ArrowLeft';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'ArrowDown': 
            switch(i){
              case 0:
                player2.keybinds.up = 'ArrowDown';
                break;
              case 1:
                player2.keybinds.t_left = 'ArrowDown';
                break;
              case 2:
                player2.keybinds.down = 'ArrowDown';
                break;
              case 3:
                player2.keybinds.t_right = 'ArrowDown';
                break;
              case 4:
                player2.keybinds.shoot = 'ArrowDown';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
          case 'ArrowRight': 
            switch(i){
              case 0:
                player2.keybinds.up = 'ArrowRight';
                break;
              case 1:
                player2.keybinds.t_left = 'ArrowRight';
                break;
              case 2:
                player2.keybinds.down = 'ArrowRight';
                break;
              case 3:
                player2.keybinds.t_right = 'ArrowRight';
                break;
              case 4:
                player2.keybinds.shoot = 'ArrowRight';
                break;
            }
            if(i != 5)
              keybinds.player2[i] = false;
            else
              keybinds.player2[i] = true;
            break;
        }
      }
    }
  }
});

//za game
window.addEventListener('keydown', function(event) {
  if(function_location == 'game'){
    //katera tipka je bila pritisnjena
    let key = event.key;
    switch(key){
      case player1.keybinds.t_left: 
        keys.left.pressed = true;
        break;
      case player1.keybinds.up:
        keys.up.pressed = true;        
        break;
      case player1.keybinds.t_right: 
        keys.right.pressed = true;        
        break;
      case player1.keybinds.down: 
        keys.down.pressed = true;        
        break;
      case player2.keybinds.t_left: 
        keys.a.pressed = true;        
        break;
      case player2.keybinds.up: 
        keys.w.pressed = true;        
        break;
      case player2.keybinds.t_right: 
        keys.d.pressed = true;        
        break;
      case player2.keybinds.down: 
        keys.s.pressed = true;        
        break;
      case player2.keybinds.shoot:
        keys.shoot2.pressed = true;
        break;
      case player1.keybinds.shoot:
        keys.shoot1.pressed = true;
        break;
    }
}});

//za game
window.addEventListener('keyup', function(event) {
  if(function_location == 'game'){
    let key = event.key;
    switch(key){
      case player1.keybinds.t_left: 
        keys.left.pressed = false;
        break;
      case player1.keybinds.up: 
        keys.up.pressed = false;        
        break;
      case player1.keybinds.t_right: 
        keys.right.pressed = false;        
        break;
      case player1.keybinds.down: 
        keys.down.pressed = false;        
        break;
      case player2.keybinds.t_left: 
        keys.a.pressed = false;        
        break;
      case player2.keybinds.up: 
        keys.w.pressed = false;        
        break;
      case player2.keybinds.t_right: 
        keys.d.pressed = false;        
        break;
      case player2.keybinds.down:
        keys.s.pressed = false;        
        break;
      case player1.keybinds.shoot:
        keys.shoot1.pressed = false;
        break;
      case player2.keybinds.shoot:
        keys.shoot2.pressed = false;
        break;
    }
  }
});

//na vsake 5 sekund spawn-a na map powerup box
function placePowerup(){
  if(function_location == 'game'){
    if(Date.now() - lastPowerupSpawnTime >= 10000){
      let cellX = Math.trunc(Math.random()*mazeSize);
      let cellY = Math.trunc(Math.random()*mazeSize);
      let x = startX + cellSize*cellX + cellSize/3;
      let y = startY + cellSize*cellY + cellSize/3;
      let powerup = new Powerup(x,y,powerupImage);
      powerups.push(powerup);
      lastPowerupSpawnTime = Date.now();
    }
    else if(Date.now() - lastPowerupSpawnTime < 10000){
        for(let i = 0;i<powerups.length;i++){
          powerups[i].angle += 2*Math.PI/750;
        if(powerups[i].angle > 2*Math.PI)
          powerups[i].flag = true;
        }
    }
  }
}

//resize-a content, da fit-a vse na en zaslon
function init(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = window.innerWidth - 17;
  canvas.height = window.innerHeight - 4;
  cellSize = Math.min(Math.trunc((window.innerWidth-400) / mazeSize), Math.trunc((window.innerHeight-300) / mazeSize));
  startX = (window.innerWidth/2) - (cellSize*mazeSize)/2;
  startY = (window.innerHeight/2) - (cellSize*mazeSize)/2;
  playButton.x = canvas.width / 2 - 50;
  playButton.y = canvas.height / 2 - 25;
  settingsButton.x = canvas.width / 2 - 50;
  settingsButton.y = canvas.height / 2 + 50;
  scoreboardButton.x = canvas.width / 2 - 50;
  scoreboardButton.y = canvas.height / 2 + 125;
  scoreboardText.x = canvas.width/2;
  scoreboardText.y = canvas.height/4;
  keybindButton.x = canvas.width/4-25;
  keybindButton.y = canvas.height/8;
  volumeText.x = canvas.width/2;
  volumeText.y = canvas.height*0.75;
  returnText.x = canvas.width/2;
  returnText.y = canvas.height*0.90;
  returnText2.x = canvas.width/2;
  returnText2.y = 3*canvas.height/4 - 50;
  returnText3.x = canvas.width/2;
  returnText3.y = canvas.height*0.90;  
  scoreboardMessage.x = canvas.width/2;
  scoreboardMessage.y = canvas.height/2;
  maze = [];
  for (let i = 0; i < mazeSize; i++) {
    maze[i] = [];
    for (let j = 0; j < mazeSize; j++) {
      maze[i][j] = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false,
      };
    }
  }
  generateMaze();
  player1.x = startX+(cellSize/2);
  player1.y = startY+(cellSize/2);
  player2.x = startX+(mazeSize*cellSize)-(cellSize/2);
  player2.y = startY+(mazeSize*cellSize)-(cellSize/2);
  bullets.splice(0,bullets.length);
  particles.splice(0,particles.length);
  powerups.splice(0,powerups.length);
  lasers.splice(0,lasers.length);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function findGroup(groups, cell) {
  if (groups[cell] === cell)
    return cell;
  else
    return findGroup(groups, groups[cell]);
}

function generateMaze() {
  //Kruskalov algoritem
  //naredimo tabelo skupin celic
  let groups = [];
  for (let i = 0; i < mazeSize * mazeSize; i++)
    groups.push(i);

  //naredimo tabelo zidov, ki morajo biti uniceni, da dobimo maze
  let walls = [];
  for (let i = 0; i < mazeSize; i++) {
    for (let j = 0; j < mazeSize; j++) {
      //dodamo zidove med to celico in njenimi sosedi
      if (i < mazeSize - 1) {
        walls.push({ x: i, y: j, direction: 'right' });
      }
      if (j < mazeSize - 1) {
        walls.push({ x: i, y: j, direction: 'bottom' });
      }
    }
  }

  //zidovi se nakljucno razporedijo
  walls = shuffle(walls);
  //gremo cez vse zidove ter unicimo tiste, ki naredijo slepo ulico
  for (let i = 0; i < walls.length; i++) {
    let wall = walls[i];
    let x = wall.x;
    let y = wall.y;

    //najdemo skupino celic na katerikoli strani zida
    let group1, group2;
    if (wall.direction === 'right') {
      group1 = findGroup(groups, x + y * mazeSize);
      group2 = findGroup(groups, x + 1 + y * mazeSize);
    } 
    else {
      group1 = findGroup(groups, x + y * mazeSize);
      group2 = findGroup(groups, x + (y + 1) * mazeSize);
    }

    //ce so celice v razlicnih skupinah, unici zidove med njimi ter jih zdruzi
    if (group1 !== group2) {
      //unici desni zid
      if (wall.direction === 'right') {
        maze[x][y].right = false;
        maze[x + 1][y].left = false;
      } 
      //unici spodnji zid
      else {
        maze[x][y].bottom = false;
        maze[x][y + 1].top = false;
      }
      //zdruzi skupine
      for (let j = 0; j < groups.length; j++) {
        if (groups[j] === group2)
          groups[j] = group1;
      }
    }
  }
}

function drawMaze() {
  //pocisti canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  //sirina zidov
  ctx.lineWidth = 3;
  //narisemo vsako celico
  for (let i = 0; i < mazeSize; i++) {
    for (let j = 0; j < mazeSize; j++) {
      //izracuna x in y koordinato celice (upostevamo tudi sredinsko lego maze-a)
      let x = startX + i * cellSize;
      let y = startY + j * cellSize;
      //narise celico
      ctx.strokeStyle = 'black';
      if (maze[i][j].top) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellSize, y);
        ctx.stroke();
      }
      if (maze[i][j].right) {
        ctx.beginPath();
        ctx.moveTo(x + cellSize, y);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (maze[i][j].bottom) {
        ctx.beginPath();
        ctx.moveTo(x, y + cellSize);
        ctx.lineTo(x + cellSize, y + cellSize);
        ctx.stroke();
      }
      if (maze[i][j].left) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellSize);
        ctx.stroke();
      }
    }
  }
}

function drawMenu() {
  if(!loaded){
    loadSaves();
    loaded = true;
  }
  function_location = 'menu';
  gameSong.play();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 1.5;
  //narise ime igre (title)
  ctx.fillStyle = '#2c3e50';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '72px comic-sans';
  ctx.fillText('Tank Duel', window.innerWidth/2,window.innerHeight/3);
  //narise play gumb
  ctx.fillStyle = playColor;
  ctx.fillRect(playButton.x, playButton.y, playButton.width, playButton.height);
  ctx.strokeRect(playButton.x, playButton.y, playButton.width, playButton.height);
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '32px comic-sans';
  ctx.fillText('Play', playButton.x + playButton.width / 2, playButton.y + playButton.height / 2);
  //narise settings gumb
  ctx.fillStyle = settingsColor;
  ctx.fillRect(settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height);
  ctx.strokeRect(settingsButton.x, settingsButton.y, settingsButton.width, settingsButton.height);
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '32px comic-sans';
  ctx.fillText('Settings', settingsButton.x + settingsButton.width / 2, settingsButton.y + settingsButton.height/2);
  //narise scoreboard gumb
  ctx.fillStyle = scoreboardColor;
  ctx.fillRect(scoreboardButton.x, scoreboardButton.y, scoreboardButton.width, scoreboardButton.height);
  ctx.strokeRect(scoreboardButton.x, scoreboardButton.y, scoreboardButton.width, scoreboardButton.height);
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '24px comic-sans';
  ctx.fillText('Scoreboard', scoreboardButton.x + scoreboardButton.width / 2, scoreboardButton.y + scoreboardButton.height/2);  
  requestAnimationFrame(drawMenu);
}

function drawUI(){
  let p1text = player1.name + ': ' + player1.points;
  let p2text = player2.name + ': ' + player2.points;

  ctx.fillStyle = '#2c3e50';
  ctx.textAlign = 'center';
  ctx.font = '32px comic-sans';
  ctx.fillText(p1text, window.innerWidth/4,startY+(mazeSize*cellSize) + (window.innerHeight - startY - (mazeSize*cellSize))/2);
  ctx.fillText(p2text, 3*window.innerWidth/4,startY+(mazeSize*cellSize) + (window.innerHeight - startY - (mazeSize*cellSize))/2);
  ctx.font = '20px comic-sans';
  ctx.fillText('First to 10 wins!', window.innerWidth/2, startY+(mazeSize*cellSize) + (window.innerHeight - startY - (mazeSize*cellSize))/4)
}

function update() {
  if(!duelWin){
    //zabelezimo kolikokrat se je slika zavrtela za 360 stopinj (oz. za 2*PI radianov, ker ctx.rotate() funkcija sprejme radiane)
    //mehanizem za obracanje je natancen na vsake 22.5 stopinj
    player1.rotations = Math.trunc(Math.abs(player1.angle)/(2*Math.PI));
    player2.rotations = Math.trunc(Math.abs(player2.angle)/(2*Math.PI));
  
    if(keys.a.pressed){
      player2.angle += -0.05;
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player2')
          lasers.splice(i,1);   
      }
    }
    else if(keys.d.pressed){
      player2.angle += 0.05;
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player2')
          lasers.splice(i,1);   
      }  
    }
    if(keys.left.pressed){
      player1.angle += -0.05;
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player1')
          lasers.splice(i,1);   
      }  
    }      
    else if(keys.right.pressed){
      player1.angle += 0.05;
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player1')
          lasers.splice(i,1);   
      }   
    }  

    if(keys.w.pressed && !checkCollision(player2)){
      //izracunamo kot, na kateri je slika zarotirana
      let angle = (Math.abs(player2.angle)-(player2.rotations*2*Math.PI));
      //0 do 90 stopinj
      if (angle >= 0 && angle < Math.PI/8) {
        player2.vx = 0;
        player2.vy = -2;
      } 
      else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
        player2.vx = -1;
        player2.vy = -1;
      } 
      else if (angle >= 3*Math.PI/8 && angle < Math.PI/2) {
        player2.vx = -2;
        player2.vy = 0;
      } 
      //90 do 180 stopinj
      else if(angle >= Math.PI/2 && angle < 5*Math.PI/8){
        player2.vx = -2;
        player2.vy = 0;      
      }
      else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
        player2.vx = -1;
        player2.vy = 1;      
      }
      else if(angle >= 7*Math.PI/8 && angle < Math.PI){
        player2.vx = 0;
        player2.vy = 2;       
      }
      //180 do 270 stopinj
      else if(angle >= Math.PI && angle < 9*Math.PI/8){
        player2.vx = 0;
        player2.vy = 2;       
      }
      else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8){
        player2.vx = 1;
        player2.vy = 1;
      }
      else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2){
        player2.vx = 2;
        player2.vy = 0;
      }
      //270 do 360 stopinj
      else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8){
        player2.vx = 2;
        player2.vy = 0;      
      }
      else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8){
        player2.vx = 1;
        player2.vy = -1;
      }
      else if(angle >= 15*Math.PI/8 && angle < 0){
        player2.vx = 0;
        player2.vy = -2;      
      }
      for(let i = 0;i<lasers.length;i++)
        if(lasers[i].player == 'player2')
          lasers.splice(i,1);   
    } 
    else if(keys.s.pressed && !checkCollision(player2)){
      //izracunamo kot, na kateri je slika zarotirana
      let angle = (Math.abs(player2.angle)-(player2.rotations*2*Math.PI));
      //0 do 90 stopinj
      if (angle >= 0 && angle < Math.PI/8) {
        player2.vx = 0;
        player2.vy = 2;
      } 
      else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
        player2.vx = 1;
        player2.vy = 1;
      } 
      else if (angle >= 3*Math.PI/8 && angle < Math.PI/2) {
        player2.vx = 2;
        player2.vy = 0;
      } 
      //90 do 180 stopinj
      else if(angle >= Math.PI/2 && angle < 5*Math.PI/8){
        player2.vx = 2;
        player2.vy = 0;      
      }
      else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
        player2.vx = 1;
        player2.vy = -1;      
      }
      else if(angle >= 7*Math.PI/8 && angle < Math.PI){
        player2.vx = 0;
        player2.vy = -2;       
      }
      //180 do 270 stopinj
      else if(angle >= Math.PI && angle < 9*Math.PI/8){
        player2.vx = 0;
        player2.vy = -2;       
      }
      else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8){
        player2.vx = -1;
        player2.vy = -1;
      }
      else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2){
        player2.vx = -2;
        player2.vy = 0;
      }
      //270 do 360 stopinj
      else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8){
        player2.vx = -2;
        player2.vy = 0;      
      }
      else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8){
        player2.vx = -1;
        player2.vy = 1;
      }
      else if(angle >= 15*Math.PI/8 && angle < 0){
        player2.vx = 0;
        player2.vy = 2;      
      }
      for(let i = 0;i<lasers.length;i++)
        if(lasers[i].player == 'player2')
          lasers.splice(i,1);    
    }
    else {
      //resetiramo hitrost
      player2.vx = 0;
      player2.vy = 0;
    }
  
    if(keys.up.pressed && !checkCollision(player1)){
      //izracunamo kot, na kateri je slika zarotirana
      let angle = (Math.abs(player1.angle)-(player1.rotations*2*Math.PI));
      //0 do 90 stopinj
      if (angle >= 0 && angle < Math.PI/8) {
        player1.vx = 0;
        player1.vy = -2;
      } 
      else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
        player1.vx = -1;
        player1.vy = -1;
      } 
      else if (angle >= 3*Math.PI/8 && angle < Math.PI/2) {
        player1.vx = -2;
        player1.vy = 0;
      } 
      //90 do 180 stopinj
      else if(angle >= Math.PI/2 && angle < 5*Math.PI/8){
        player1.vx = -2;
        player1.vy = 0;      
      }
      else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
        player1.vx = -1;
        player1.vy = 1;      
      }
      else if(angle >= 7*Math.PI/8 && angle < Math.PI){
        player1.vx = 0;
        player1.vy = 2;       
      }
      //180 do 270 stopinj
      else if(angle >= Math.PI && angle < 9*Math.PI/8){
        player1.vx = 0;
        player1.vy = 2;       
      }
      else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8){
        player1.vx = 1;
        player1.vy = 1;
      }
      else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2){
        player1.vx = 2;
        player1.vy = 0;
      }
      //270 do 360 stopinj
      else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8){
        player1.vx = 2;
        player1.vy = 0;      
      }
      else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8){
        player1.vx = 1;
        player1.vy = -1;
      }
      else if(angle >= 15*Math.PI/8 && angle < 0){
        player1.vx = 0;
        player1.vy = -2;      
      } 
      for(let i = 0;i<lasers.length;i++)
        if(lasers[i].player == 'player1')
          lasers.splice(i,1);    
    }
    else if(keys.down.pressed && !checkCollision(player1)){
      //izracunamo kot, na kateri je slika zarotirana
      let angle = (Math.abs(player1.angle)-(player1.rotations*2*Math.PI));
      //0 do 90 stopinj
      if (angle >= 0 && angle < Math.PI/8) {
        player1.vx = 0;
        player1.vy = 2;
      } 
      else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
        player1.vx = 1;
        player1.vy = 1;
      } 
      else if (angle >= 3*Math.PI/8 && angle < Math.PI/2) {
        player1.vx = 2;
        player1.vy = 0;
      } 
      //90 do 180 stopinj
      else if(angle >= Math.PI/2 && angle < 5*Math.PI/8){
        player1.vx = 2;
        player1.vy = 0;      
      }
      else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8){
        player1.vx = 1;
        player1.vy = -1;      
      }
      else if(angle >= 7*Math.PI/8 && angle < Math.PI){
        player1.vx = 0;
        player1.vy = -2;       
      }
      //180 do 270 stopinj
      else if(angle >= Math.PI && angle < 9*Math.PI/8){
        player1.vx = 0;
        player1.vy = -2;       
      }
      else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8){
        player1.vx = -1;
        player1.vy = -1;
      }
      else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2){
        player1.vx = -2;
        player1.vy = 0;
      }
      //270 do 360 stopinj
      else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8){
        player1.vx = -2;
        player1.vy = 0;      
      }
      else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8){
        player1.vx = -1;
        player1.vy = 1;
      }
      else if(angle >= 15*Math.PI/8 && angle < 0){
        player1.vx = 0;
        player1.vy = 2;      
      }
      for(let i = 0;i<lasers.length;i++)
        if(lasers[i].player == 'player1')
          lasers.splice(i,1);    
    }
    else{
      player1.vy = 0;
      player1.vx = 0;
    }

    if(keys.shoot1.pressed && !player1.powerup_flag)
      bulletSpawn(player1);
    if(keys.shoot2.pressed && !player2.powerup_flag)
      bulletSpawn(player2);

    if(player1.powerup_flag)
      laserSpawn(player1, 'player1');
    if(player2.powerup_flag)
      laserSpawn(player2, 'player2');

    if(player1.powerup_flag && keys.shoot1.pressed){
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player1')
          lasers[i].color = 'black';
      }
      player1.powerup_flag = false;
    }
    if(player2.powerup_flag && keys.shoot2.pressed){
      for(let i = 0;i<lasers.length;i++){
        if(lasers[i].player == 'player2')
          lasers[i].color = 'black';
      }
      player2.powerup_flag = false;      
    }

  
    //update-amo pozicijo player-jev
    player1.x += player1.vx;
    player1.y += player1.vy;
    player2.x += player2.vx;
    player2.y += player2.vy;
  
    drawMaze();
    drawUI();
    player1.draw();
    player2.draw();
    for(let i = 0;i<lasers.length;i++){
      checkBulletCollision(lasers[i]);
      if(lasers[i].bounces == 0)
        lasers.splice(i,1);
      else{
        lasers[i].update();
        if(checkPlayerCollision(lasers[i]) == 1 && lasers[i].color == 'black'){
          player2.points++;
          duelWin = true;
          lasers.splice(0,lasers.length);
          if(player2.points == 10)
            matchWin = true;
          if(Date.now() - lastParticleSpawnTime >= 1000){
            for(let i = 0;i<150;i++){
              particles.push(new Particle(player1.x + player1.width/2, player1.y + player1.height/2, (Math.random() - 0.5)*2, (Math.random() - 0.5)*2, Math.random()*3, '#222222')); 
            }
            lastParticleSpawnTime = Date.now();
          }
        }
        else if(checkPlayerCollision(lasers[i]) == 2 && lasers[i].color == 'black'){
          player1.points++;
          duelWin = true;
          lasers.splice(0,lasers.length);
          if(player1.points == 10)
            matchWin = true;
          if(Date.now() - lastParticleSpawnTime >= 1000){
            for(let i = 0;i<150;i++){
              particles.push(new Particle(player2.x + player2.width/2, player2.y + player2.height/2, (Math.random() - 0.5)*2, (Math.random() - 0.5)*2, Math.random()*3, '#222222')); 
            }
            lastParticleSpawnTime = Date.now();
          }
        }
      }
    }
    for(let i = 0;i<particles.length;i++){
      if(particles[i].opacity <= 0){
        setTimeout(() => {
          particles.splice(i,1);
        }, 0);
      }
      else
        particles[i].update();
    }
    for(let i = 0;i<bullets.length;i++){
      checkBulletCollision(bullets[i]);
      if(bullets[i].bounces == 0)
        bullets.splice(i,1);
      else{
        bullets[i].update();
        if(checkPlayerCollision(bullets[i]) == 1){
          player2.points++;
          duelWin = true;
          bullets.splice(0,bullets.length);
          if(player2.points == 10)
            matchWin = true;
          if(Date.now() - lastParticleSpawnTime >= 1000){
            for(let i = 0;i<150;i++){
              particles.push(new Particle(player1.x + player1.width/2, player1.y + player1.height/2, (Math.random() - 0.5)*2, (Math.random() - 0.5)*2, Math.random()*3, '#222222')); 
            }
            lastParticleSpawnTime = Date.now();
          }
        }
        else if(checkPlayerCollision(bullets[i]) == 2){
          player1.points++;
          duelWin = true;
          bullets.splice(0,bullets.length);
          if(player1.points == 10)
            matchWin = true;
          if(Date.now() - lastParticleSpawnTime >= 1000){
            for(let i = 0;i<150;i++){
              particles.push(new Particle(player2.x + player2.width/2, player2.y + player2.height/2, (Math.random() - 0.5)*2, (Math.random() - 0.5)*2, Math.random()*3, '#222222')); 
            }
            lastParticleSpawnTime = Date.now();
          }
        }
      }
    }
    for(let i = 0;i<powerups.length;i++){
      powerups[i].draw();
      if(checkPowerupCollision(powerups[i]) == 1 && powerups[i].flag){
        player1.powerup_flag = true;
        setTimeout(() => {
          powerups.splice(i,1);
        },0);
      }
      else if(checkPowerupCollision(powerups[i]) == 2 && powerups[i].flag){
        player2.powerup_flag = true;
        setTimeout(() => {
          powerups.splice(i,1);
        },0);
      }
    }
  }
}

//vrne true, ce je prislo do collision-a, vrne false, ce ni
function checkCollision(player) {
  let cellX = Math.floor((player.x - startX) / cellSize);
  let cellY = Math.floor((player.y - startY)/ cellSize);
  //da ne gre cez offset array-a
  if(cellY < 0)
    cellY = 0;
  else if(cellX < 0)
    cellX = 0;
  else if(cellX > mazeSize)
    cellX = mazeSize;
  else if(cellY > mazeSize)
    cellY = mazeSize;

  //zgornji zid
  if (maze[cellX][cellY].top && (player.y - player.width/8) <= (cellY * cellSize) + startY) {
    player.y += 1; return true;
  }
  //desni zid
  if (maze[cellX][cellY].right && (player.x + player.width)  >= ((cellX + 1) * cellSize) + startX) {
    player.x -= 1; return true;
  }
  //spodnji zid
  if (maze[cellX][cellY].bottom && (player.y + player.height - player.height/8) >= ((cellY + 1) * cellSize) + startY) {
    player.y -= 1; return true;
  }
  //levi zid
  if (maze[cellX][cellY].left && (player.x - player.width/16) <= (cellX * cellSize) + startX) {
    player.x += 1; return true;
  }
  return false;
}

//player lahko sprozi bullet vsako sekundo, zato da ni maze naspam-an
function bulletSpawn(player){
  if(Date.now() - player.lastShotTime >= 1000){
    player.lastShotTime = Date.now();
    //spet izracunamo, za koliko je slika zarotirana
    let angle = (Math.abs(player.angle)-(player.rotations*2*Math.PI));
    //bullet spawn je natancen tako kot movement, na vsake 22.5 stopinj
    //0 do 90 stopinj
    if (angle >= 0 && angle < Math.PI/8)
      bullets.push(new Bullet(player.x + player.width/2 - 3,player.y - 10,0,-2));
    else if (angle >= Math.PI/8 && angle < 3*Math.PI/8)
      bullets.push(new Bullet(player.x - 3,player.y - 10,-2,-2));
    else if (angle >= 3*Math.PI/8 && angle < Math.PI/2)
      bullets.push(new Bullet(player.x - 3,player.y + player.height/2,-2,0));
    //90 do 180 stopinj
    else if(angle >= Math.PI/2 && angle < 5*Math.PI/8)
      bullets.push(new Bullet(player.x - 3,player.y + player.height/2,-2,0));
    else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8)
      bullets.push(new Bullet(player.x - 3,player.y + player.height,-1,1));   
    else if(angle >= 7*Math.PI/8 && angle < Math.PI)
      bullets.push(new Bullet(player.x + player.width/2 - 3,player.y + player.height + 5,0,2));
    //180 do 270 stopinj
    else if(angle >= Math.PI && angle < 9*Math.PI/8)
      bullets.push(new Bullet(player.x + player.width/2 - 3,player.y + player.height + 5,0,2));    
    else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8)
      bullets.push(new Bullet(player.x + player.width + 3,player.y + player.height,1,1));
    else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2)
      bullets.push(new Bullet(player.x + player.width + 3,player.y + player.height/2,2,0));
    //270 do 360 stopinj
    else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8)
      bullets.push(new Bullet(player.x + player.width + 3,player.y + player.height/2,2,0));    
    else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8)
      bullets.push(new Bullet(player.x + player.width + 3,player.y - 10,1,-1));
    else if(angle >= 15*Math.PI/8 && angle < 0)
      bullets.push(new Bullet(player.x + player.width/2 - 3,player.y - 10,0,-2));
  }
}

function laserSpawn(player, kateri_player){
    //spet izracunamo, za koliko je slika zarotirana
    let angle = (Math.abs(player.angle)-(player.rotations*2*Math.PI));
    //laser spawn je natancen tako kot movement, na vsake 22.5 stopinj
    //0 do 90 stopinj
    if (angle >= 0 && angle < Math.PI/8)
      lasers.push(new Laser(player.x + player.width/2 - 3,player.y - 10,0,-4,kateri_player));
    else if (angle >= Math.PI/8 && angle < 3*Math.PI/8)
      lasers.push(new Laser(player.x - 3,player.y - 10,-4,-4,kateri_player));
    else if (angle >= 3*Math.PI/8 && angle < Math.PI/2)
      lasers.push(new Laser(player.x - 3,player.y + player.height/2,-4,0,kateri_player));
    //90 do 180 stopinj
    else if(angle >= Math.PI/2 && angle < 5*Math.PI/8)
      lasers.push(new Laser(player.x - 3,player.y + player.height/2,-4,0,kateri_player));
    else if(angle >= 5*Math.PI/8 && angle < 7*Math.PI/8)
      lasers.push(new Laser(player.x - 3,player.y + player.height,-2,2,kateri_player));   
    else if(angle >= 7*Math.PI/8 && angle < Math.PI)
      lasers.push(new Laser(player.x + player.width/2 - 3,player.y + player.height + 5,0,4,kateri_player));
    //180 do 270 stopinj
    else if(angle >= Math.PI && angle < 9*Math.PI/8)
      lasers.push(new Laser(player.x + player.width/2 - 3,player.y + player.height + 5,0,4,kateri_player));    
    else if(angle >= 9*Math.PI/8 && angle < 11*Math.PI/8)
      lasers.push(new Laser(player.x + player.width + 3,player.y + player.height,2,2,kateri_player));
    else if(angle >= 11*Math.PI/8 && angle < 3*Math.PI/2)
      lasers.push(new Laser(player.x + player.width + 3,player.y + player.height/2,4,0,kateri_player));
    //270 do 360 stopinj
    else if(angle >= 3*Math.PI/2 && angle < 13*Math.PI/8)
      lasers.push(new Laser(player.x + player.width + 3,player.y + player.height/2,4,0,kateri_player));    
    else if(angle >= 13*Math.PI/8 && angle < 15*Math.PI/8)
      lasers.push(new Laser(player.x + player.width + 3,player.y - 10,2,-2,kateri_player));
    else if(angle >= 15*Math.PI/8 && angle < 0)
      lasers.push(new Laser(player.x + player.width/2 - 3,player.y - 10,0,-4,kateri_player));  
}

//bullet ima tudi max 10 bounce-ev od sten
function checkBulletCollision(bullet){
  //izracunamo v kateri celici je bullet
  let cellX = Math.floor((bullet.x - startX - bullet.radius) / cellSize);
  let cellY = Math.floor((bullet.y - startY - bullet.radius)/ cellSize);

  //da ne gre cez offset array-a
  if(cellY < 0)
    cellY = 0;
  else if(cellX < 0)
    cellX = 0;
  else if(cellX > mazeSize)
    cellX = mazeSize;
  else if(cellY > mazeSize)
    cellY = mazeSize;

  //na kratko: ce zadene zgornji/spodnji zid, reverse-a vy, ce zadene levi/desni zid, reverse-a vx
  //zgornji zid
  if (maze[cellX][cellY].top && (bullet.y - bullet.radius) <= (cellY * cellSize) + startY) {
    bullet.vx = bullet.vx;
    bullet.vy = - bullet.vy;
    bullet.bounces--;
  }
  //desni zid
  if (maze[cellX][cellY].right && (bullet.x + bullet.radius)  >= ((cellX + 1) * cellSize) + startX) {
    bullet.vx = - bullet.vx;
    bullet.vy = bullet.vy;
    bullet.bounces--;
  }
  //spodnji zid
  if (maze[cellX][cellY].bottom && (bullet.y + bullet.radius) >= ((cellY + 1) * cellSize) + startY) {
    bullet.vx = bullet.vx;
    bullet.vy = - bullet.vy;
    bullet.bounces--;
  }
  //levi zid
  if (maze[cellX][cellY].left && (bullet.x - bullet.radius) <= (cellX * cellSize) + startX) {
    bullet.vx = - bullet.vx;
    bullet.vy = bullet.vy;
    bullet.bounces--;
  } 
}

//isto kot checkPlayerCollision, le da je namesto bullet-a powerup
function checkPowerupCollision(powerup){
  let dx1 = Math.abs(powerup.x - player1.x - player1.width/2);
  let dy1 = Math.abs(powerup.y - player1.y - player1.height/2);

  let dx2 = Math.abs(powerup.x - player2.x - player2.width/2);
  let dy2 = Math.abs(powerup.y - player2.y - player2.height/2);

  if (dx1 < powerup.radius + player1.width/2 && dy1 < powerup.radius + player1.height/2)
    return 1;
  else if(dx2 < powerup.radius + player2.width/2 && dy2 < powerup.radius + player2.height/2)
    return 2;
  return 0;  
}

//vrne 1, ce je bil player1 ubit, 2, ce je bil player2 ubit ter 0, ce ni prislo do collision-a
function checkPlayerCollision(bullet) {
  //izracunamo razdaljo med centrom bullet-a in centrom player-ja (bullet radius je zanemerljiv (1px))
  let dx1 = Math.abs(bullet.x - player1.x - player1.width/2);
  let dy1 = Math.abs(bullet.y - player1.y - player1.height/2);

  let dx2 = Math.abs(bullet.x - player2.x - player2.width/2);
  let dy2 = Math.abs(bullet.y - player2.y - player2.height/2);

  //pogledamo, ce je razdalja manjsa od vsote bullet radious-a in player width/height
  if (dx1 < bullet.radius + player1.width/2 && dy1 < bullet.radius + player1.height/2)
    return 1;
  else if(dx2 < bullet.radius + player2.width/2 && dy2 < bullet.radius + player2.height/2)
    return 2;
  return 0;
}

function game(){
  function_location = 'game';
  if(!matchWin){
    if(duelWin){
        duelWin = false;
        resetGame();
    }
    update();
    placePowerup();
    requestAnimationFrame(game);
  }
  else{
    scoreboardSave();
    displayEndScreenMessage();
  }
}

function resetGame(){
  //naredi se polni maze (vsaka celica ima 4 stene)
  maze = [];
  for (let i = 0; i < mazeSize; i++) {
    maze[i] = [];
    for (let j = 0; j < mazeSize; j++) {
      maze[i][j] = {
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false,
      };
    }
  }
  generateMaze();  
  player1.x = startX+(cellSize/2);
  player1.y = startY+(cellSize/2);
  player2.x = startX+(mazeSize*cellSize)-(cellSize/2);
  player2.y = startY+(mazeSize*cellSize)-(cellSize/2);
  bullets.splice(0,bullets.length);
  powerups.splice(0,powerups.length);
  lasers.splice(0,lasers.length);
  player1.powerup_flag = false;
  player2.powerup_flag = false;
}

function displayEndScreenMessage(){
  if(end_message_flag){
    function_location = 'end-screen';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(canvas.width/4, canvas.height/4, 2*canvas.width/4, 2*canvas.height/4);
    ctx.fillStyle = 'white';
    ctx.fillRect(canvas.width/4, canvas.height/4, 2*canvas.width/4, 2*canvas.height/4);
    ctx.font = '32px comic-sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'black';
    ctx.fillText('Match over!', canvas.width/2, canvas.height/4 + 25, 150, 50);
    if(player1.points == 10)
      ctx.fillText(player1.name + ' wins!', canvas.width/2, canvas.height/3 + 50, 200, 50);
    else if(player2.points == 10)
      ctx.fillText(player2.name + ' wins!', canvas.width/2, canvas.height/3 + 50, 200, 50);
    ctx.fillText('Final scores:', canvas.width/2, canvas.height/2, 150, 50);
    ctx.drawImage(player1.image, canvas.width/3 - 25, 2*canvas.height/3 - 75);
    ctx.drawImage(player2.image, 2*canvas.width/3 - 25, 2*canvas.height/3 - 75);
    ctx.fillText(player1.points, canvas.width/3, 2*canvas.height/3 - 100, 150, 50);
    ctx.fillText(player2.points, 2*canvas.width/3, 2*canvas.height/3 - 100, 150, 50);
    //return to main menu text
    ctx.font = '20px comis-sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = endMessageColor;
    ctx.fillRect(returnText2.x - returnText2.width/2,returnText2.y - returnText2.height/2,returnText2.width,returnText2.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(returnText2.x - returnText2.width/2,returnText2.y - returnText2.height/2,returnText2.width,returnText2.height);
    ctx.fillStyle = '#000000';
    ctx.fillText('Return to main menu',returnText2.x ,returnText2.y);
    requestAnimationFrame(displayEndScreenMessage);
  }
}

//iz localStorage bere shranjene keybind-e in vrednost volume-a (ce sploh obstaja)
function loadSaves(){
  //pogledamo, ce je set-an settings_player1 v localStorage
  if(localStorage.getItem('settings_player1')){
    let settings_player1 = JSON.parse(localStorage.getItem('settings_player1'));
    let settings_player2 = JSON.parse(localStorage.getItem('settings_player2'));
    //nastavi glasnost
    let volumeValue = localStorage.getItem("Volume");
    document.getElementById('volume').value = volumeValue;
    //nastavi keybind-e player-ja 1
    player1.keybinds.up = settings_player1[0];
    player1.keybinds.t_left = settings_player1[1];
    player1.keybinds.down = settings_player1[2];
    player1.keybinds.t_right = settings_player1[3];
    player1.keybinds.shoot = settings_player1[4];
    player1.name = settings_player1[5];
    //nastavi keybind-e player-ja 2
    player2.keybinds.up = settings_player2[0];
    player2.keybinds.t_left = settings_player2[1];
    player2.keybinds.down = settings_player2[2];
    player2.keybinds.t_right = settings_player2[3];
    player2.keybinds.shoot = settings_player2[4];
    player2.name = settings_player2[5];
  }
}

//shrani keybind-e in vrednost volume-a v localStorage
function save(){
  let settings_player1 = [player1.keybinds.up, player1.keybinds.t_left, player1.keybinds.down, player1.keybinds.t_right, player1.keybinds.shoot, player1.name];
  let settings_player2 = [player2.keybinds.up, player2.keybinds.t_left, player2.keybinds.down, player2.keybinds.t_right, player2.keybinds.shoot, player2.name];
  let volumeValue = document.getElementById('volume').value;
  localStorage.setItem("settings_player1", JSON.stringify(settings_player1));
  localStorage.setItem("settings_player2", JSON.stringify(settings_player2));
  localStorage.setItem("Volume", volumeValue);
}

function scoreboardSave(){
  let loaded_1 = false;
  let loaded_2 = false;
  let player1_name = player1.name;
  let player2_name = player2.name;
  let player1_points = player1.points;
  let player2_points = player2.points;
  if(localStorage.getItem('scoreboard')){
    let scoreboard = JSON.parse(localStorage.getItem('scoreboard'));
    for(let i = 0;i<scoreboard.length;i++){
      if(player1_name == scoreboard[i][0]){
        scoreboard[i][1] += player1_points;
        loaded_1 = true;
      }
      if(player2_name == scoreboard[i][0]){
        scoreboard[i][1] += player2_points;
        loaded_2 = true;
      }
    }
    if(!loaded_1){
      let player1_scores = [player1_name, player1_points];
      scoreboard.push(player1_scores);    
    }
    if(!loaded_2){
      let player2_scores = [player2_name, player2_points];
      scoreboard.push(player2_scores);
    }
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
  }
  else{
    let scoreboard = [];
    let player1_scores = [player1_name, player1_points];
    let player2_scores = [player2_name, player2_points];
    scoreboard.push(player1_scores);
    scoreboard.push(player2_scores);
    localStorage.setItem('scoreboard', JSON.stringify(scoreboard));
  }
}

function scoreboard(){
  function_location = 'scoreboard';
  if(scoreboard_flag){
    //display-a message, da nobenega player-ja se ni na scoreboard-u, else stavek pa sortira scoreboard po vrednosti tock, na zaslon izpise top 10 najboljsih
    if(localStorage.getItem('scoreboard')){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      let tmp = 0;
      let scoreboard = JSON.parse(localStorage.getItem('scoreboard'));
      for(let i = 0;i<scoreboard.length;i++){
        for(let j = 0;j<scoreboard.length-1;j++){
          if(scoreboard[j][1] < scoreboard[j+1][1]){
            tmp = scoreboard[j];
            scoreboard[j] = scoreboard[j+1];
            scoreboard[j+1] = tmp;
          }
        }
      }
      //za zaslon damo 10 najboljsih player-jev ter njihovo stevilo tock/zmag
      let stevec = 0;
      for(let i = 0;i<scoreboard.length;i++){
        if(stevec == 10)
          break;
        else{
          ctx.fillStyle = 'black';
          ctx.fillText(i+1 + '. ' + scoreboard[i][0] + ' with ' + scoreboard[i][1] + ' wins',scoreboardText.x,scoreboardText.y + (i)*50 - scoreboardText.height);
          stevec++;
        }
      }
    }
    else{
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillText('No players on the scoreboard yet!',scoreboardMessage.x ,scoreboardMessage.y);
    }
    ctx.font = '20px comic-sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = scoreboardReturnMessageColor;
    ctx.fillRect(returnText3.x - returnText3.width/2,returnText3.y - returnText3.height/2,returnText3.width,returnText3.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(returnText3.x - returnText3.width/2,returnText3.y - returnText3.height/2,returnText3.width,returnText3.height);
    ctx.fillStyle = '#000000';
    ctx.fillText('Return to main menu ',returnText3.x,returnText3.y);    
    requestAnimationFrame(scoreboard);
  }
}

function checkKeybinds(){
  for(let i = 0;i<6;i++){
    if(keybinds.player1[i])
    return 0;
  }
  for(let i = 0;i<6;i++){
    if(keybinds.player2[i])
    return 0;
  }
  return 1;
}

//pogleda, ce sta dve tipki isti
function checkKeybindsValue(keyValue){
  let unavailable_keys = [player1.keybinds.up, player1.keybinds.t_left, player1.keybinds.down, player1.keybinds.t_right, player1.keybinds.shoot, player2.keybinds.up, player2.keybinds.t_left, player2.keybinds.down, player2.keybinds.t_right, player2.keybinds.shoot];
  let stevec = 0;
  for(let i = 0;i<unavailable_keys.length;i++){
    if(keyValue == unavailable_keys[i])
      stevec++;
  }
  if(stevec > 1)
    return 1;
  return 0;
}

function settings(){
  if(settings_flag){
    let text = ['Up: ', 'Turn left: ', 'Down: ', 'Turn right: ', 'Shoot: ', 'Name: '];
    let keybinds_player1 = [player1.keybinds.up, player1.keybinds.t_left, player1.keybinds.down, player1.keybinds.t_right, player1.keybinds.shoot, player1.name];
    let keybinds_player2 = [player2.keybinds.up, player2.keybinds.t_left, player2.keybinds.down, player2.keybinds.t_right, player2.keybinds.shoot, player2.name];
    function_location = 'settings';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '16px comic-sans';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black';
    //za player1
    for(let i = 0;i<text.length;i++){
      if(keybinds.player1[i] && i == 5){
        ctx.strokeStyle = '#8e44ad';
        ctx.strokeRect(keybindButton.x,keybindButton.y + i*keybindButton.height,keybindButton.width,keybindButton.height);
        ctx.strokeStyle = 'black';
      }
      else{
        if(checkKeybindsValue(keybinds_player1[i]))
          ctx.strokeStyle = 'red';
        ctx.strokeRect(keybindButton.x,keybindButton.y + i*keybindButton.height,keybindButton.width,keybindButton.height);
        ctx.strokeStyle = 'black';
      }
      if(keybinds.player1[i] && i != 5)
        ctx.fillText('Press any key',keybindButton.x + keybindButton.width/2,keybindButton.y + (i+1)*50 - keybindButton.height/2);
      else
        ctx.fillText(text[i] + keybinds_player1[i].toUpperCase(),keybindButton.x + keybindButton.width/2,keybindButton.y + (i+1)*50 - keybindButton.height/2);
    }
    //za player2
    for(let i = 0;i<text.length;i++){
      if(keybinds.player2[i] && i == 5){
        ctx.strokeStyle = '#8e44ad';
        ctx.strokeRect(3*keybindButton.x,keybindButton.y + i*keybindButton.height,keybindButton.width, keybindButton.height);
        ctx.strokeStyle = 'black';
      }
      else {
        if(checkKeybindsValue(keybinds_player2[i]))
          ctx.strokeStyle = 'red';
        ctx.strokeRect(3*keybindButton.x,keybindButton.y + i*keybindButton.height,keybindButton.width, keybindButton.height);
        ctx.strokeStyle = 'black';
      }  
      if(keybinds.player2[i] && i != 5)
        ctx.fillText('Press any key',3*keybindButton.x + keybindButton.width/2,keybindButton.y + (i+1)*50 - keybindButton.height/2);
      else
        ctx.fillText(text[i] + keybinds_player2[i].toUpperCase(),3*keybindButton.x + keybindButton.width/2,keybindButton.y + (i+1)*50 - keybindButton.height/2);
    }
    //slikci
    let img1 = new Image();
    let img2 = new Image();
    img1.src = './player1.png';
    img2.src = './player2.png';
    ctx.drawImage(img1,keybindButton.x + keybindButton.width/2 - img1.width/2,keybindButton.y + (text.length+1)*50 - keybindButton.height/2);
    ctx.drawImage(img2,3*keybindButton.x + keybindButton.width/2 - img2.width/2,keybindButton.y + (text.length+1)*50 - keybindButton.height/2);
    //volume
    ctx.font = '26px comic-sans';
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(volumeText.x - volumeText.width/2,volumeText.y - volumeText.height/2,volumeText.width,volumeText.height);
    ctx.fillText('Volume control: ',volumeText.x ,volumeText.y)
    let audioRange = document.getElementById('volume');
    audioRange.style.visibility = 'visible';
    audioRange.style.width = volumeText.width + 'px';
    audioRange.style.left = volumeText.x - volumeText.width/2 + 'px';
    let volume_value = audioRange.value;
    gameSong.volume = volume_value/100;
    //return to main menu text
    ctx.font = '20px comis-sans';
    ctx.textAlign = 'center';
    ctx.fillStyle = returnMessageColor;
    ctx.fillRect(returnText.x - returnText.width/2,returnText.y - returnText.height/2,returnText.width,returnText.height);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(returnText.x - returnText.width/2,returnText.y - returnText.height/2,returnText.width,returnText.height);
    ctx.fillStyle = '#000000';
    ctx.fillText('Save & return to main menu ',returnText.x ,returnText.y);
    let stevec = 0;
    for(let i = 0;i<5;i++){
      if(checkKeybindsValue(keybinds_player1[i]))
        stevec++;
      if(checkKeybindsValue(keybinds_player2[i]))
        stevec++;
    }
    if(stevec >= 2)
      keybind_flag = false;
    else
      keybind_flag = true;
    requestAnimationFrame(settings);
  }
  else{
    let audioRange = document.getElementById('volume');
    audioRange.style.visibility = 'hidden';
  }
}

init();
drawMenu();