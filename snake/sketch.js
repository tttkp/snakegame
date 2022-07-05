let numSegments = 10;
let direction = 'right';

const diff = 10;

let xCor = [];
let yCor = [];

let xFruit = 0;
let yFruit = 0;
let scoreElem;
let scoreVal = 0

const commandChannel = "snakeCommandChannel";
const stateChannel = 'snakeStateChannel'

var url = new URL(window.location.href);
var name1 = url.searchParams.get("name");
var r = url.searchParams.get("r");
var g = url.searchParams.get("g");
var b = url.searchParams.get("b");

createServer(name1);

const OtherSnakes = {}

function setup() {
  scoreElem = createDiv('Your score = 0');
  scoreElem.position(10, 10);
  scoreElem.id = 'score';
  scoreElem.style('color', 'black');

  createCanvas(500, 500);
  frameRate(5);
  stroke(255);
  strokeWeight(10);

  updateFruitCoordinates();

  let yStart = random([200, 230, 250, 270, 300])
  for (let i = 0; i < numSegments; i++) {
    xCor.push(i * diff);
    yCor.push(yStart);
  }

  // listen for messages coming through the subcription feed on this specific channel. 
  dataServer.addListener({ message: readIncoming });
  dataServer.subscribe({ channels: [stateChannel] });
}

function draw() {
  background(240);



  sendSnakeStateMessage()

  drawOtherSnake()

  stroke(r, g, b)
  for (let i = 0; i < xCor.length - 1; i++) {
    line(xCor[i], yCor[i], xCor[i + 1], yCor[i + 1]);
  }
  updateSnakeCoordinates();
  checkGameStatus();
  checkForFruit();
}

function drawOtherSnake() {
  let lineNum = 0
  Object.keys(OtherSnakes).forEach(k => {
    if (k != name1) {

      const snake = OtherSnakes[k]
      stroke(snake.r, snake.g, snake.b)
      for (let i = 0; i < snake.xArray.length - 1; i++) {
        line(snake.xArray[i], snake.yArray[i], snake.xArray[i + 1], snake.yArray[i + 1]);
      }

      point(snake.xFruit, snake.yFruit);

      noStroke()
      fill(0)
      text(snake.who + ' score:' + snake.score, 10, 50 + lineNum * 20)
      lineNum++
    }

  })
}


function updateSnakeCoordinates() {
  for (let i = 0; i < numSegments - 1; i++) {
    xCor[i] = xCor[i + 1];
    yCor[i] = yCor[i + 1];
  }
  switch (direction) {
    case 'right':
      xCor[numSegments - 1] = xCor[numSegments - 2] + diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'up':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] - diff;
      break;
    case 'left':
      xCor[numSegments - 1] = xCor[numSegments - 2] - diff;
      yCor[numSegments - 1] = yCor[numSegments - 2];
      break;
    case 'down':
      xCor[numSegments - 1] = xCor[numSegments - 2];
      yCor[numSegments - 1] = yCor[numSegments - 2] + diff;
      break;
  }
}


function checkGameStatus() {
  if (
    xCor[xCor.length - 1] > width ||
    xCor[xCor.length - 1] < 0 ||
    yCor[yCor.length - 1] > height ||
    yCor[yCor.length - 1] < 0 ||
    checkSnakeCollision()
  ) {
    noLoop();
    scoreElem.html('Game ended! Your score was : ' + scoreVal);
  }
}

function checkSnakeCollision() {
  const snakeHeadX = xCor[xCor.length - 1];
  const snakeHeadY = yCor[yCor.length - 1];
  for (let i = 0; i < xCor.length - 1; i++) {
    if (xCor[i] === snakeHeadX && yCor[i] === snakeHeadY) {
      return true;
    }
  }
}


function checkForFruit() {
  point(xFruit, yFruit);
  if (xCor[xCor.length - 1] === xFruit && yCor[yCor.length - 1] === yFruit) {
    scoreVal++
    scoreElem.html('Score = ' + scoreVal);
    xCor.unshift(xCor[0]);
    yCor.unshift(yCor[0]);
    numSegments++;

    updateFruitCoordinates();
  }
}

function updateFruitCoordinates() {
  xFruit = floor(random(10, (width - 100) / 10)) * 10;
  yFruit = floor(random(10, (height - 100) / 10)) * 10;
}

function keyPressed() {
  changeDirection(keyCode)
}

function changeDirection(kc) {
  switch (kc) {
    case 74:
      if (direction !== 'right') {
        direction = 'left';
      }
      break;
    case 76:
      if (direction !== 'left') {
        direction = 'right';
      }
      break;
    case 73:
      if (direction !== 'down') {
        direction = 'up';
      }
      break;
    case 75:
      if (direction !== 'up') {
        direction = 'down';
      }
      break;
  }
}


// PubNub logic below
function sendSnakeStateMessage() {
  // Send Data to the server to draw it in all other canvases

  dataServer.publish({
    channel: stateChannel,
    message: {
      xCor: xCor,
      yCor: yCor,
      xFruit,
      yFruit,
      r,
      g,
      b,
      scoreVal
    },
  });
}


function readIncoming(inMessage) {
  // when new data comes in it triggers this function,
  // we call this function in the setup

  /*since an App can have many channels, we ensure that we are listening
  to the correct channel */
  if (inMessage.channel == stateChannel) {
    let who = inMessage.publisher; // who sent the message
    OtherSnakes[who] = {
      who: who,
      xArray: inMessage.message.xCor,
      yArray: inMessage.message.yCor,
      xFruit: inMessage.message.xFruit,
      yFruit: inMessage.message.yFruit,
      r: inMessage.message.r,
      g: inMessage.message.g,
      b: inMessage.message.b,
      score: inMessage.message.scoreVal
    }
  }
}