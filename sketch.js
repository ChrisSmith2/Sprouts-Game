let canDraw = false;
let dots = [];
let dotRadius = 15;
let lines = [];
let currentLine = null;

function setup() {
  createCanvas(700, 700);
  background(220);
}

function draw() {
  background(220);
  drawLines();
  drawDots();
}

function drawDots() {
  noStroke();
  fill('black');
  for (let i = 0; i < dots.length; i++) {
    circle(dots[i].x, dots[i].y, dotRadius*2);
  } 
}

function drawLines() {
  // let c = color(250,128,114);
  let c = color('rgba(255,0,0,0.1)');
  stroke(c);
    
  // stroke('red');
  strokeWeight(10);
  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    for (let j = 0; j < l.lineSegs.length; j++) {
      let ls = l.lineSegs[j];
      line(ls.x1, ls.y1, ls.x2, ls.y2);
    }
  }
}

function mouseDragged() {
  if (canDraw) {
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
        currentLine = new Line(d);
        lines.push(currentLine);
      }
    }
  }
}

function mouseReleased() {
  if (!canDraw && dots.length == 2) {
    canDraw = true;
  }
  
  if (currentLine) {
    let endDot = insideOpenDot();
    // console.log(currentLine.lineSegs.length);
    if (!endDot || currentLine.lineSegs.length < 30) {
      cancelCurrentLine();
    } else {
      currentLine.startDot.lineCount++;
      endDot.lineCount++;
      currentLine = null;
    }
    
    console.log(lines);
    console.log(dots);
  }
}

function mousePressed() {
  if (dots.length < 2) {
    dots.push(new Dot(mouseX, mouseY));
  }
}

function insideOpenDot() {
  for (let i = 0; i < dots.length; i++) {
    if (dist(dots[i].x, dots[i].y, mouseX, mouseY) <= dotRadius) {
      if (dots[i].lineCount < 3)
        return dots[i];
      return null;
    }
  }
  return null;
}

function cancelCurrentLine() {
    lines.pop();
    currentLine = false;
}

function Dot(x, y) {
  this.x = x;
  this.y = y;
  this.lineCount = 0;
}

function Line(startDot) {
  this.startDot = startDot;
  this.lineSegs = [];
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
  
  // from https://stackoverflow.com/a/24392281
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