let maxLinesPerDot = 3;
let startingDots = 2;
let minDistBetweenDots = 20;
let player1 = new Player(1, '#ff324b', '#e9001c');
let player2 = new Player(2, '#43cff4', '#0dbbe9');
let currentPlayer = player1;
let startDotColor = 'black';

let dots = [];
let dotRadius = 15;
let lines = [];
let currentLine = null;
let dotsPlaced = false;
let waitingDotRelease = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  // background(220);
  background('white');
  drawLines();
  drawDots();
}

function drawDots() {
  noStroke();
  for (let i = 0; i < dots.length; i++) {
    if (dots[i].owner)
      fill(dots[i].owner.dotColor);
    else
      fill(startDotColor);
    circle(dots[i].x, dots[i].y, dotRadius*2);
  } 
}

function drawLines() {
  // let c = color(250,128,114);
  // let c = color('rgba(255,0,0,0.1)');
  // stroke(c);
    
  strokeWeight(10);
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    stroke(l.owner.lineColor);
    for (let j = 0; j < l.lineSegs.length; j++) {
      let ls = l.lineSegs[j];
      line(ls.x1, ls.y1, ls.x2, ls.y2);
    }
  }
}

function mouseDragged() {
  if (dotsPlaced) {
    if (currentLine) {
      let ls = new LineSeg(mouseX, mouseY, pmouseX, pmouseY);
      if (lineSegValid(ls)) {
        currentLine.lineSegs.push(ls);
      } else {
        cancelCurrentLine();
        console.log(lines);
      }
    } else {
      let d = insideOpenDot();
      if (d) {      
        currentLine = new Line(d, currentPlayer);
        lines.push(currentLine);
      }
    }
  }
}

function mouseReleased() {
  if (!dotsPlaced && dots.length >= startingDots && waitingDotRelease) {
    dotsPlaced = true;
    waitingDotRelease = false;

    if (dots.length > startingDots) {
      changePlayer();
    }
  }
  
  if (currentLine) {
    let endDot = insideOpenDot();
    // console.log(currentLine.lineSegs.length);
    if (!endDot || currentLine.lineSegs.length < 60) {
      cancelCurrentLine();
    } else {
      currentLine.startDot.lineCount++;
      endDot.lineCount++;
      currentLine = null;

      dotsPlaced = false;
    }
    
    console.log(lines);
    console.log(dots);
  }
}

function mousePressed() {
  if (!dotsPlaced) {
    if (!closeToDot(mouseX, mouseY)) {
      if (dots.length < startingDots) {
        dots.push(new Dot(mouseX, mouseY));
        waitingDotRelease = true;
      } else {
        if (closeToLine(mouseX, mouseY, lines[lines.length-1])) {
          dots.push(new Dot(mouseX, mouseY, true, currentPlayer));
          waitingDotRelease = true;
          console.log(dots);
        } else {
          console.log("Dot must be placed on line");
        }
      }
    } else {
      console.log("Dot is too close to another dot");
    }
  }
}

function insideOpenDot() {
  for (let i = 0; i < dots.length; i++) {
    if (dist(dots[i].x, dots[i].y, mouseX, mouseY) <= dotRadius) {
      if (dots[i].lineCount < maxLinesPerDot)
        return dots[i];
      return null;
    }
  }
  return null;
}

function cancelCurrentLine() {
    lines.pop();
    currentLine = null;
}

function Player(num, lineColor, dotColor) {
  this.num = num;
  this.lineColor = lineColor;
  this.dotColor = dotColor;
}

function changePlayer() {
  if (currentPlayer.num == 1)
    currentPlayer = player2;
  else
    currentPlayer = player1;
}

function Dot(x, y, onLine, owner) {
  this.x = x;
  this.y = y;
  if (onLine)
    this.lineCount = 2;
  else
    this.lineCount = 0;
  this.owner = owner;
}

function Line(startDot, owner) {
  this.startDot = startDot;
  this.lineSegs = [];
  this.owner = owner;
}

function LineSeg(x1, y1, x2, y2) {
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
}

function lineSegValid(ls) {
  for (var i = 0; i < lines.length; i++) {
    for (var j = 0; j < lines[i].lineSegs.length; j++) {
      if (intersect(ls, lines[i].lineSegs[j]))
        return false;
    }
  }
  return true;
}

function intersect(ls1, ls2) {
  let a = ls1.x1, b = ls1.y1, c = ls1.x2, d = ls1.y2;
  let p = ls2.x1, q = ls2.y1, r = ls2.x2, s = ls2.y2;
  
  // https://stackoverflow.com/a/24392281
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
}

function closeToLine(mouseX, mouseY, line) {
  for (var i = 0; i < line.lineSegs.length; i++) {
    if (isOnLineWithEndCaps(mouseX, mouseY, line.lineSegs[i], 5)) {
      return true;
    }
  }
  return false;
}

function closeToDot(mouseX, mouseY) {
  for (var i = 0; i < dots.length; i++) {
    if (dist(dots[i].x, dots[i].y, mouseX, mouseY) <= dotRadius + minDistBetweenDots)
      return true;
  }
  return false;
}

function isOnLineWithEndCaps(xp, yp, ls, maxDistance) {
  // https://stackoverflow.com/a/34474547
  let x1 = ls.x1, y1 = ls.y1, x2 = ls.x2, y2 = ls.y2;

  var dxL = x2 - x1, dyL = y2 - y1;  // line: vector from (x1,y1) to (x2,y2)
  var dxP = xp - x1, dyP = yp - y1;  // point: vector from (x1,y1) to (xp,yp)
  var dxQ = xp - x2, dyQ = yp - y2;  // extra: vector from (x2,y2) to (xp,yp)

  var squareLen = dxL * dxL + dyL * dyL;  // squared length of line
  var dotProd   = dxP * dxL + dyP * dyL;  // squared distance of point from (x1,y1) along line
  var crossProd = dyP * dxL - dxP * dyL;  // area of parallelogram defined by line and point

  // perpendicular distance of point from line
  var distance = Math.abs(crossProd) / Math.sqrt(squareLen);

  // distance of (xp,yp) from (x1,y1) and (x2,y2)
  var distFromEnd1 = Math.sqrt(dxP * dxP + dyP * dyP);
  var distFromEnd2 = Math.sqrt(dxQ * dxQ + dyQ * dyQ);

  // if the point lies beyond the ends of the line, check if
  // it's within maxDistance of the closest end point
  if (dotProd < 0) return distFromEnd1 <= maxDistance;
  if (dotProd > squareLen) return distFromEnd2 <= maxDistance;

  // else check if it's within maxDistance of the line
  return distance <= maxDistance;
}