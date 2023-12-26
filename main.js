
window.addEventListener("load", function() {

const canvas = this.document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenHalf = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;
    curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;
})

const pie2 = Math.PI*2;
let loop = false;
let looping = false;
let fps = 30;
let int = 1000/fps;
let timer = 0;
let lastTime = 0;
let clearCanvas = true;
let currentShape = "";
let screenHalf = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;
let midX = canvas.width/2;
let midY = canvas.height/2;
let curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;
let iterations = 0;

function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    let stop = false;

    if (timer > int) {
        // console.log("looping", )
        if (clearCanvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (currentShape === "mystical") {
            shapes.forEach(eff => {
                eff.particles.forEach((part, i) => {
                    part.draw(ctx, i);
                    // console.log("part", part)
                })
                eff.particles.forEach((part, i) => {
                    part.update(i);
                })
                eff.particles.forEach(part => {
                    part.reached = [];
                })
            })
        }
        else if (currentShape === "mandala") {
            stop = true;
            shapes.forEach(shape => {
                console.log("looping", )
                if (shape.drawIt) {
                    stop = false;
                    shape.draw();
                }
            })
        }
        else if (currentShape === "mirror walk") {
            for (let i = 0; i < 50; i++) { 
                moveWalkers(shapes);
                iterations++;
                if (iterations > 500) {stop = true;}
            }
        }
        else if (currentShape === "tiles") {
            for (let i = 0; i < 50; i++) { 
                if (finishCount < cols*rows) {
                    fillTiles();
        
                    if (finishCount === cols*rows) {
                        stop = true;
                        console.log("solved", )
                    }
                }
            }
        }
        else if (currentShape === "maurer rose") {
            for (let i = 0; i < 50; i++) { 
                shapes.draw();
                if (shapes.stop) {stop = true;}
            }
        }
        else {
            shapes.forEach((shape) => {
                shape.draw();
            });
        }

        timer = 0;
    } else {timer += deltaTime;}

    if (currentShape === "mandala" && stop) {loop = false;}
    else if (currentShape === "mirror walk" && stop) {loop = false;}
    else if (currentShape === "maurer rose" && stop) {loop = false;}

    if (loop) {looping = requestAnimationFrame(animate);}
}

let shapes = [];

const linkBoxes = this.document.querySelectorAll(".link");
linkBoxes.forEach(box => {
    box.addEventListener("mouseenter", function(e) {
        const type = (e.target.firstElementChild.innerText).toLowerCase();
        generateShapes(type);
        currentShape = type;
        console.log("type", type);
    })
    box.addEventListener("mouseleave", function() {
        cancelShapes();
        currentShape = "";
    })
})

function generateShapes(type) {
    cancelShapes();
    switch(type) {
        case "spinners":
            spinnerSettings();
            break;
        case "mystical":
            mysticalSettings();
            break;
        case "spirals":
            spiralSettings();
            break;
        case "mandala":
            mandalaSettings();
            break;
        case "expansion":
            expansionSettings();
            break;
        case "mirror walk":
            mirrorwalkSettings();
            break;
        case "tiles":
            tilesSettings();
            break;
        case "maurer rose":
            roseSettings();
            break;
    }
    startOver();
}

function startOver() {
    loop = true;
    animate(0);
}

function stopAnimation() {

}

function cancelShapes() {
    loop = false;
    timer = 0;
    iterations = 0;
    cancelAnimationFrame(looping);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];
}

// spinner
function spinnerSettings() {
    clearCanvas = true;
    const circleNum = randomise(true, 10, 5);

    let radius = randomise(true, 10, 1)*5;
    let maxRadius = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;
    let maxSpeed = randomise(true, 20, 1)/100;
    let speed = 0;
    
    for (let i = 1; i <= circleNum; i++) {
        radius += Math.floor(maxRadius / circleNum);
        speed += (maxSpeed/circleNum);
        speed = Math.random() < 0.5 ? speed : speed * -1;

        shapes.push(new Spinner(canvas, ctx, speed, radius));
    }
    
}
class Spinner {
    constructor(canvas, context, speed, radius) {
        this.canvas = canvas;
        this.ctx = context;
        this.fillCircles = false;

        this.hue = 220; this.sat = 90; this.light = 60;

        this.x = this.canvas.width/2;
        this.y = this.canvas.height/2;

        this.startAngle = randomise(true, 360, 0);
        this.angle = pie2;
        
        this.rotation = 0;
        this.rotationSpeed = speed;
        this.vRotation = this.rotationSpeed;
        
        this.segments = randomise(true, 10, 2);

        this.rad = radius;
        console.log("radius", this.rad)

        this.circumference = this.rad * pie2;
        this.dashLength = randomise(true, ((360/this.segments)-30), 10);
        if (this.dashLength < 0) {this.dashLength = 1;}
        this.dashGap = this.circumference/this.segments - this.dashLength;
        this.vDash = Number(((this.rad/this.segments)/15).toFixed(2));

        this.lineWidth = randomise(true, 10, 3);
        this.lineCap = "round";

        this.opacity = 1;
    }
    draw() {
        this.ctx.save();
            this.ctx.lineCap = this.lineCap;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;

            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(this.rotation);

            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.rad, this.startAngle, this.startAngle + this.angle);
            this.ctx.closePath();

            this.ctx.setLineDash([this.dashLength, this.circumference/this.segments-this.dashLength])

            this.ctx.stroke();

        this.ctx.restore();
        this.update();
    }
    update() {this.rotation += this.vRotation;}
}

// mystical
function mysticalSettings() {
    clearCanvas = true;
    shapes.push(new MysticalEffect(canvas));
}

function getXandY(marginX, marginY) {
    let x = randomise(true, canvas.width-5, 5);
    let y = randomise(true, canvas.height-5, 5);
    
    if (x+marginX < 0) {x -= (x+marginX);}
    else if (x+marginX > canvas.width) {
        x -= (x+marginX - canvas.width);
    }
    if (y+marginY < 0) {y -= (y+marginY);} 
    else if (y+marginY > canvas.height) {
        y -= (y+marginY - canvas.height);
    }

    if (x+marginX === 0 ) {x += 20;}
    else if (x+marginX === canvas.width) {x -= 20;}
    if (y+marginY === 0 ) {y += 20;}
    else if (y+marginY === canvas.height) {y -= 20;}

    return [x, y];
}

class MysticalEffect {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.particles = [];
        this.vertices = [];
        this.maxVertices = randomise(true, 6, 3);
        this.maxLines = randomise(true, 6, 3);
        this.lineOffset = 5;
        this.lineWidth = 3;
        this.lineCap = "round";
        this.curves = "off";

        this.speed = randomise(true, 15, 5);
        this.connectAll = false;

        this.colorType = "equal";
        this.mainHue = 220;
        this.mainSat = 90;
        this.mainLight = 60;

        this.shapeEdges = [];
        this.createParticles();
    }
    createParticles() {
        let createID = 0;
        let edgeGrp = 0;
        let shapeGrp = 0;

        for (let i = 0; i < this.maxLines; i++) {
            let empty = [];
            this.shapeEdges.push(empty);
        }

        for (let i = 0; i < this.maxVertices; i++) {
            shapeGrp = 0;
            let vx = Math.floor(Math.random() * this.speed - this.speed/2);
            let vy = Math.floor(Math.random() * this.speed - this.speed/2);

            const c = Math.hypot(Math.abs(vy), Math.abs(vx));
            const realDist = (this.lineOffset/c) * 5;
            const offSetX = vx*realDist*-1;
            const offSetY = vy*realDist*-1;

            const marginX = (offSetX)*this.maxLines;
            const marginY = (offSetY)*this.maxLines;

            let [x, y] = getXandY(marginX, marginY);
            let vert = [];
            
            for (let j = 0; j < this.maxLines; j++) {
                // invert vx and vy points
                x += offSetX;
                y += offSetY;
               
                this.particles.push(new MysticalParticle(this, x, y, vx, vy, createID, edgeGrp, shapeGrp));

                vert.push(createID);
                this.shapeEdges[j].push(createID);
                
                createID++;
                shapeGrp++;
            }
            this.vertices.push(vert);
            edgeGrp++;
        }
    }
}

class MysticalParticle {
    constructor(effect, x, y, vx, vy, index, edgeGrp, shapeGrp) {
        this.effect = effect;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;

        // bezier curve points
        this.angle1 = Math.floor(Math.random()*360);
        this.bx1 = Math.floor(curvePathRadius*Math.sin(this.angle1)+this.effect.width/2);
        this.by1 = Math.floor(curvePathRadius*Math.cos(this.angle1)+this.effect.height/2);

        this.angle2 = Math.floor(Math.random()*360);
        this.bx2 = Math.floor(curvePathRadius*Math.sin(this.angle2)+this.effect.width/2);
        this.by2 = Math.floor(curvePathRadius*Math.cos(this.angle2)+this.effect.height/2);

        this.vAngle1 = this.effect.speed*0.01*(Math.random()*0.5-0.25);
        this.vAngle2 = this.effect.speed*0.01*(Math.random()*0.5-0.25);

        this.vSpeed = 0;
        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.ID = index;
        this.edgeGrp = edgeGrp;
        this.shapeGrp = shapeGrp;
        this.reached = []; // IDs of where line was drawn
    }
    draw(ctx, i) {
        ctx.lineCap = this.effect.lineCap;
        ctx.lineWidth = this.effect.lineWidth;

        let count = this.effect.particles.length;

        // if not connecting vertices
        let next = i + this.effect.maxLines < count ? 
            this.effect.particles[i+this.effect.maxLines] : 
            this.effect.particles[i+this.effect.maxLines-count];

        if (this.ID !== next.ID && 
            this.reached.indexOf(next.ID) === -1) {
            this.reached.push(next.ID);
            ctx.save();
                ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(next.x, next.y);

                ctx.stroke();
            ctx.restore();
        }
    }
    update() {
        // collision with boundaries
        if (this.x < 5 || this.x > this.effect.width-5) 
            {this.vx *= -1;}
        if (this.y < 5 || this.y > this.effect.height-5) 
            {this.vy *= -1;}

        this.x = Math.floor(this.x + this.vx);
        this.y = Math.floor(this.y + this.vy);
    }
}


// spirals
function spiralSettings() {
    clearCanvas = false;
    shapes.push(new Spirals());
}

class Spirals {
    constructor() {
        this.midX = canvas.width/2;
        this.midY = canvas.height/2;
        this.drawCount = 0;

        this.x = this.midX; this.y = this.midY;
        this.nextX = this.midX; this.nextY = this.midY;

        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.shapeType = randomArrayItem(["line", "circle", "square"]);
        this.size = randomise(true, 20, 5)*5;

        this.rad1 = 20;
        this.rad2 = 20;
        this.vRad1 = (randomise(true, 40, 1) * 5)/100;
        this.vRad2 = this.vRad1;
        this.vvRad1 = 0;
        this.vvRad2 = 0;
        // this.vvRad1 = (randomise(true, 10, -10) * 5)/100;
        // this.vvRad2 = (randomise(true, 10, -10) * 5)/100;

        this.firstAngle = Math.random() * pie2;
        // this.angle = (randomise(true, 50, 20) * 2)/100;
        this.angle = 1;
        this.vAngle = (randomise(true, 10, 2) * 2)/10;
        // this.vAngle = 2;

        this.vvAngle = 0;
        this.vAngleReversePoint = 0;

        this.lineWidth = 3;
        this.linesWithinBorders = true;
        this.opacity = 1;
        this.count = 0;
    }
    draw() {
        if (this.count > 1) {

        ctx.save();
            ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = "round";
            ctx.globalAlpha = this.opacity;
            
            if (this.shapeType === "line") {
                if (this.count > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.nextX, this.nextY);
                    ctx.stroke();
                }
            }

            else if (this.shapeType === "circle") {
                ctx.beginPath();
                ctx.arc(this.nextX, this.nextY, this.size, 0, pie2);
                ctx.stroke();
            }
            else if (this.shapeType === "square") {
                // ctx.fillStyle = `hsl(${this.hue}, ${this.saturate}%, ${this.light}%)`;

                ctx.strokeRect(this.nextX-this.size/2, this.nextY-this.size/2, this.size, this.size);
            }

        ctx.restore();
    }
        this.update();
    }
    update() {
        if (this.count < 2) {this.count++;}
        else {

        // change radius
        if (this.vRad1 !== 0 ) {
            this.rad1 += this.vRad1;
            if (this.rad1 < 0) {this.vRad1 *= -1;} 

            if (this.linesWithinBorders &&
                this.rad1 > this.midX) {
                    this.vRad1 *= -1;}

            if (this.vvRad1 !== 0) {
                this.vRad1 += this.vvRad1;
                if (this.vRad1 > 3 || this.vRad1 < -3) {
                    this.vvRad1 *= -1;}
            }
        }
        if (this.vRad2 !== 0) {
            this.rad2 += this.vRad2;
            if (this.rad2 < 0) {this.vRad2 *= -1;} 

            if (this.linesWithinBorders &&
                this.rad2 > this.midY) {
                    this.vRad2 *= -1;}

            if (this.vvRad2 !== 0) {
                this.vRad2 += this.vvRad2;
                if (this.vRad2 > 3 || this.vRad2 < -3) {
                    this.vvRad2 *= -1;}
            }

        }
        
        // shift angle
        this.angle += this.vAngle;
        
            // finite drawing
            if (this.drawCount > 0 && 
                this.angle > (Math.PI*2) * this.drawCount + this.firstAngle) {
                pauseGame();
            }

    }
        this.x = this.nextX; this.y = this.nextY; 

        this.nextX = Math.floor(Math.cos(this.angle) * this.rad1 + this.midX);
        this.nextY = Math.floor(Math.sin(this.angle) * this.rad2 + this.midY);

        
    }
}

// mandala
function mandalaSettings() {
    clearCanvas = false;
    const layers = randomise(true, 8, 3);
    let radius = 0;

    for (let i = 0; i < layers; i++) {
        radius += randomise(true, screenHalf/layers, 5);

        shapes.push(new Mandala(i, radius));
    }
}

class Mandala {
    constructor(num, radius) {
        this.num = num;
        this.drawCount = 1;

        // this.firstAngle = Math.random() * (pie2);
        this.firstAngle = 0;
        this.angle = this.firstAngle;
        this.changeAngle = randomise(true, 30, 2);
        this.vAngle = (pie2)/this.changeAngle + 0;
        // this.vAngle = Math.PI*2/100; // 100 steps
        this.maxAngle = this.firstAngle + pie2 + this.vAngle;
        this.steps = Math.ceil(pie2 / this.vAngle);

        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.midX = canvas.width/2;
        this.midY = canvas.height/2;

        this.startX = 0;
        this.startY = 0;
        this.x = this.midX;
        this.y = this.midY;
        this.nextX = this.midX;
        this.nextY = this.midY;

        this.ellipseVal = 0;
        this.rad1 = radius + radius*this.ellipseVal;
        this.rad2 = radius - radius*this.ellipseVal;

        this.maxRad1 = this.rad1;
        this.minRad1 = this.rad1;
        this.maxRad2 = this.rad2;
        this.minRad2 = this.rad2;

        this.shapeType = randomArrayItem(["line", "circle", "n-Shape"]);        
        this.shapeSize = randomise(true, 50, 1);
        this.vSize = 0.1;
        this.shapeSides = randomise(true, 6, 3);

        this.lineCap = rndTrueFalse(0.5) ? "round" : "square";
        this.lineWidth = randomise(true, 10, 1);
        this.minLineWidth = this.lineWidth;
        this.maxLineWidth = this.lineWidth + 0;

        this.steps += 2;
        this.count = 0;
        this.drawIt = true;

        this.draw();
    }
    draw() {
    if (this.count > 1) {
         ctx.save();
            ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = this.lineCap;

            if (this.shapeType === "line") {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.nextX, this.nextY);
                ctx.stroke();
            }
            
            else if (this.shapeType === "circle") {
                ctx.beginPath();
                ctx.arc(this.nextX, this.nextY, this.shapeSize, 0, pie2);
                ctx.stroke();
            }

            else if (this.shapeType === "n-Shape") {
                ctx.save();
                    ctx.translate(this.nextX, this.nextY);
                    ctx.rotate(this.angle);
                    
                    if (this.shapeSides === 4) {
                        ctx.strokeRect(0-this.shapeSize/2, 0-this.shapeSize/2, this.shapeSize, this.shapeSize);
                    } else {
                        this.drawShape(0, 0, this.shapeSize, this.shapeSides);
                    }
                ctx.restore();
            }

        ctx.restore();
    }
        this.update();
    }
    update() {
        // if (this.count < 2) {this.count++;}
        this.count++;
        if (this.drawCount > 0 && 
            this.count === this.steps * this.drawCount 
            ) {this.drawIt = false;}

        if (this.count > 1000) {
            this.drawIt = false;
            return;
        }

        if (this.count > 1) {


        // increase angle to draw in a circle
        if (this.drawIt) {this.angle += this.vAngle;}
        

        }

        this.nextX = (Math.cos(this.angle) * this.rad1 + this.midX);
        this.nextY = (Math.sin(this.angle) * this.rad2 + this.midY);
    }

    drawShape(x, y, size, sides) {
        ctx.save();
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(0, 0 - size);

            for (let i = 0; i < sides; i++) {
                ctx.rotate(Math.PI/sides*2);
                ctx.lineTo(0, 0 - (size));
            }
        
            ctx.stroke();
        ctx.restore();
    }
}

// expansion
function expansionSettings() {
    clearCanvas = true;

    let index = 1;
    let sides = randomise(true, 8, 5);
    let maxSides = sides;

    const distStep = Math.floor(screenHalf/(sides+1));
    let dist = 0;

    const midX = canvas.width/2;
    const midY = canvas.height/2;

    shapes.push(new Expansion(index, midX, midY));

    for (let j = 1; j <= maxSides; j++) {
        dist += distStep;
        let angle = (Math.PI*2/sides)/j;

        for (let i = 1; i <= sides*j; i++) {
            let cos = (Math.cos(angle*i));
            let sin = (Math.sin(angle*i));

            let x = Math.floor(midX + (dist * cos));
            let y = Math.floor(midY + (dist * sin));

            shapes.push(new Expansion(index, x, y));
            index++;
        }
    }
}

class Expansion {
    constructor(index, x, y) {
        this.x = x;
        this.y = y;
        this.index = index;

        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.startSize = 0;
        this.size = this.startSize;
        this.maxSize = this.size + screenHalf;
        this.vRad = 50 / 100;
        this.pi2 = pie2;

        this.lineWidth = 2;
        this.opacity = 1;

    }
    draw() {
        ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = this.lineWidth;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, this.pi2);
        ctx.stroke();

        this.update();
    }
    update() {
        this.size += this.vRad;
        if (this.size > this.maxSize || 
            this.size <= 0) {
                this.vRad *= -1;
            }
    }   
}


// mirror walk
let dirs = [
        [-1, -1], [ 0,-1], [1, -1],
        [-1,  0], [1,  0],
        [-1,  1], [ 0, 1], [1,  1],

        [-2, -2], [ 0,-2], [2, -2],
        [-2,  0], [2,  0],
        [-2,  2], [ 0, 2], [2,  2]
];

function mirrorwalkSettings() {
    clearCanvas = false;

    let size = 7;

    let width = Math.floor(canvas.width/size);
    let height = Math.floor(canvas.height/size);

    const width2 = Math.floor(width/2);
    const height2 = Math.floor(height/2);
    let offset = 1;

    /// start in the middle
    shapes.push(new Square(
        width2-offset, height2-offset, size)); 

    shapes.push(new Square(
        width2+offset, height2-offset, size)); 

    shapes.push(new Square(
        width2-offset, height2+offset, size)); 

    shapes.push(new Square(
        width2+offset, height2+offset, size)); 
}

function mirrorDir(dir, multipliers) {
    let newDir = [...dir];
    newDir[0] *= multipliers[0];
    newDir[1] *= multipliers[1];
    return newDir;
}

function moveWalkers(arr) {
    const newDir = randomArrayItem(dirs);

    let dir1 = [...newDir];
    let dir2 = mirrorDir(newDir, [-1, 1]);
    let dir3 = mirrorDir(newDir, [1, -1]);
    let dir4 = mirrorDir(newDir, [-1, -1]);

    arr[0].draw(ctx, dir1);
    arr[1].draw(ctx, dir2);
    arr[2].draw(ctx, dir3);
    arr[3].draw(ctx, dir4);

}

class Square {
    constructor(startx, starty, size) {
        this.x = startx
        this.y = starty;

        this.size = size/2;
        this.w = this.size;

        this.step = size;
        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.vx = 0;
        this.vy = 0;
    }
    draw(ctx, dir) {
        ctx.save();
            ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            ctx.fillRect(this.x * this.step - this.w/2,
                        this.y * this.step - this.w/2,
                        this.w, this.w);
        ctx.restore();


        this.move(dir);
    }
    move(dir) {
        this.vx = dir[0];
        this.vy = dir[1];

        if (this.x <= 0) {
            this.vx = Math.abs(this.vx);
        }
        else if (this.x >= canvas.width) {
            this.vx = Math.abs(this.vx) * -1;
        }

        if (this.y <= 0) {
            this.vy = Math.abs(this.vy);
        }
        else if (this.y >= canvas.height) {
            this.vy = Math.abs(this.vy) * -1;
        }

        this.x += this.vx;
        this.y += this.vy;
    }
}


// tiles
const rules = {
    AA: [1, 1, 0, 1],
    AB: [1, 1, 1, 0],
    AC: [0, 1, 1, 1],
    AD: [1, 0, 1, 1],

    BA: [1, 0, 1, 0],
    BB: [0, 1, 0, 1],

    // CA: [1, 1, 0, 0, 1],
    // CB: [0, 1, 1, 0, 2],
    // CC: [0, 0, 1, 1, 3],
    // CD: [1, 0, 0, 1, 0],

    DA: [1, 1, 1, 1, 1],
    DB: [1, 1, 1, 1, 2],
    DC: [1, 1, 1, 1, 3],

    // X: [0, 0, 0, 0],
}

const rulesAll = {
    AA: [1, 1, 0, 1],
    AB: [1, 1, 1, 0],
    AC: [0, 1, 1, 1],
    AD: [1, 0, 1, 1],

    BA: [1, 0, 1, 0],
    BB: [0, 1, 0, 1],

    CA: [1, 1, 0, 0, 1],
    CB: [0, 1, 1, 0, 2],
    CC: [0, 0, 1, 1, 3],
    CD: [1, 0, 0, 1, 0],

    DA: [1, 1, 1, 1, 1],
    DB: [1, 1, 1, 1, 2],
    DC: [1, 1, 1, 1, 3],

    X: [0, 0, 0, 0],

    ZA: [1, 0, 0, 0],
    ZB: [0, 1, 0, 0],
    ZC: [0, 0, 1, 0],
    ZD: [0, 0, 0, 1],
}

let cols = 0;
let rows = 0;
let finishCount = 0;

let grid1D = [];
let grid2D = [];

let tileNames;
let tileNamesAll = Object.keys(rulesAll);

class Tile {
    constructor(index, pos) {
        this.i = index;
        this.pos = pos;
        this.size = 30;
        this.connectionType = "middle";

        this.drawn = false;
        this.collapsed = false;
        this.options = [...tileNames];
        this.offsets = [0,0,0,0];
    }
    draw() {
        if (this.collapsed && this.options[0] !== undefined) {
            chooseDrawPattern(this);
        }
    }

    collapse() {
        this.collapsed = true;
        let choice = randomArrayItem(this.options);

        this.offsets = getNearbyOffsets(choice, this.i);

        if (choice === undefined) {
            choice = getTileForGap(this.offsets);
        }
        this.options = [choice];

        for (let i = 0; i < 4; i++) { 
            if (rulesAll[choice][i] === 1 && 
                this.offsets[i] === 0) {
                if (this.connectionType === "random") {
                    this.offsets[i] = randomise(true, this.size-5, 5);
                }
                else if (this.connectionType === "middle") {
                    this.offsets[i] = this.size/2;
                }
            }
        }

        this.draw();
        
        finishCount++;
        grid1D.splice(grid1D.indexOf(this), 1);
        changeNearby(this);
    }

    reduceOptions(target, index) {
        if (!this.collapsed && target !== undefined) {
            const targetType = rulesAll[target][index];
            const i = (index + 2) % 4;
            
            this.options = this.options.filter(name => {
                const thisType = rulesAll[name][i];
                if (thisType === targetType) {return name;}
            })
        }
    }
}

function fillTiles() {
    let gridCopy = grid1D.slice();

    let len = 100;
    for (let i = 0; i < gridCopy.length; i++) { 
        if (gridCopy[i].options.length < len) {
            len = gridCopy[i].options.length;
        }
    }
    let gridFilter = gridCopy.filter(tile => {
        if (!tile.collapsed && tile.options.length === len) {
            return tile;
        }
    });

    let rndTile = randomArrayItem(gridFilter);
    rndTile.collapse();
}

function changeNearby(tile) {
    const type = tile.options[0];
    const pos = createVector(tile.i.x, tile.i.y);
    
    // check tile above
    if (pos.y-1 >= 0) {
        grid2D[pos.x][pos.y-1].reduceOptions(type, 0);}
    else {
        grid2D[pos.x][rows-1].reduceOptions(type, 0);}

    // check tile to the right
    if (pos.x+1 < cols) {
        grid2D[pos.x+1][pos.y].reduceOptions(type, 1);}
    else {
        grid2D[0][pos.y].reduceOptions(type, 1);}

    // check tile below
    if (pos.y+1 < rows) {
        grid2D[pos.x][pos.y+1].reduceOptions(type, 2);}
    else {
        grid2D[pos.x][0].reduceOptions(type, 2);}

    // check tile to the left
    if (pos.x-1 >= 0) {
        grid2D[pos.x-1][pos.y].reduceOptions(type, 3);}
    else {
        grid2D[cols-1][pos.y].reduceOptions(type, 3);}

}

function getNearbyOffsets(type, pos) {
    const offsets = [0, 0, 0, 0];
    let offs;

    const target = rules[type] === undefined ? rules["DA"] : rules[type];

    let targetTile;

    // above
    if (target[0] === 1) {
        if (pos.y-1 >= 0) {
            targetTile = grid2D[pos.x][pos.y-1];
            offs = targetTile.offsets[2];
        } else {
            targetTile = grid2D[pos.x][rows-1];
            offs = targetTile.offsets[2];
        }
        if (offs !== 0) {offsets[0] = offs;}
    }
    // right
    if (target[1] === 1) {
        if (pos.x+1 < cols) {
            targetTile = grid2D[pos.x+1][pos.y];
            offs = targetTile.offsets[3];
        } else {
            targetTile = grid2D[0][pos.y];
            offs = targetTile.offsets[3];
        }
        if (offs !== 0) {offsets[1] = offs;}
    }
    // below
    if (target[2] === 1) {
        if (pos.y+1 < rows) {
            targetTile = grid2D[pos.x][pos.y+1];
            offs = targetTile.offsets[0];
        } else {
            targetTile = grid2D[pos.x][0];
            offs = targetTile.offsets[0];
        }
        if (offs !== 0) {offsets[2] = offs;}
    }
    // left
    if (target[3] === 1) {
        if (pos.x-1 >= 0) {
            targetTile = grid2D[pos.x-1][pos.y];
            offs = targetTile.offsets[1];
        } else {
            targetTile = grid2D[cols-1][pos.y];
            offs = targetTile.offsets[1];
        }
        if (offs !== 0) {offsets[3] = offs;}
    }

    return offsets;
}

function getTileForGap(offsets) {
    midX = canvas.width/2;
    midY = canvas.height/2;
    const matchNames = [];
    const count = [];

    offsets.forEach(num => {
        num > 0 ? count.push(1) : count.push(0);
    })

    for (let i = 0; i < tileNamesAll.length; i++) { 
        const targetArr = rulesAll[tileNamesAll[i]]; 
        let match = 0;

        for (let j = 0; j < 4; j++) { 
            if (targetArr[j] === count[j]) {match++;}
        }
        if (match === 4) {matchNames.push(tileNamesAll[i])}
    }

    const finalName = randomArrayItem(matchNames)
    return finalName;
}

function tilesSettings() {
    clearCanvas = false;

    // addRules();
    tileNames = Object.keys(rules);
    const tileSize = 30;

    finishCount = 0;
    grid2D = [];
    grid1D = [];

    cols = Math.floor(canvas.width / tileSize);
    rows = Math.floor(canvas.height / tileSize);
    // cols = 3; rows = 3;

    const startX = Math.floor(midX - (cols/2 * tileSize));
    const startY = Math.floor(midY - (rows/2 * tileSize));

    for (let x = 0; x < cols; x++) { 
        grid2D.push([])

        for (let y = 0; y < rows; y++) { 
            const posX = x*tileSize + startX;
            const posY = y*tileSize + startY;

            grid2D[x].push(new Tile(createVector(x,y),createVector(posX, posY), tileSize));

            grid1D.push(grid2D[x][y]);
        }
    }
}

function chooseDrawPattern(tile) {
    const type = tile.options[0];

        switch(type[0]) {
            case "A":
                drawTile3P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type]);
                break;

            case "B":
            case "C":
                drawTile2P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type]);
                break;

            case "D":
                drawTile4P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type]);
                break;
                
            case "Z":
                drawTile1P(tile.offsets, tile.pos.x, tile.pos.y, tile.size, rulesAll[type]);
                break;
        }
}
function drawTile1P(offsets, x,y,s,arr) {
    // console.log("draw1", )
    const offs = offsets;
    const midx = x+s/2; const midy = y+s/2;
    let innerX = midx; let innerY = midy;

    let startLine; let endLine;
    let cp11; let cp12; let cp21;

    // top-right and bottom-left
    if (arr[0] === 1) {
        startLine = createVector(x+offs[0], y);
    }
    else if (arr[1] === 1) {
        startLine = createVector(x+s, y+offs[1]);
    }
    else if (arr[2] === 1) {
        startLine = createVector(x+offs[2], y+s);
    }
    else if (arr[3] === 1) {
        startLine = createVector(x, y+offs[3]);
    }
    endLine = createVector(innerX, innerY);

    drawLine(startLine, endLine, cp11, cp12);
}
function drawTile2P(offsets, x,y,s,arr) {
    // console.log("draw2", )
    const offs = offsets;
    let startLine; let endLine;
    let cp1; let cp2;
    const cpOffset = 3;
    // console.log("arr", arr)

    // top and bottom
    if (arr[0] === 1 && arr[2] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);
    } 
    // right and left
    else if (arr[1] === 1 && arr[3] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x, y+offs[3]);
    }
    // top and right
    else if (arr[0] === 1 && arr[1] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+s, y+offs[1]);

    } 
    // top and left
    else if (arr[0] === 1 && arr[3] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x, y+offs[3]);

    } 
    // right and bottom
    else if (arr[1] === 1 && arr[2] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x+offs[2], y+s);

    } 

    // bottom and left
    else if (arr[2] === 1 && arr[3] === 1) {
        startLine = createVector(x+offs[2], y+s);
        endLine = createVector(x, y+offs[3]);

    }

    // console.log("--st", startLine)
    // console.log("en", endLine)
    drawLine(startLine, endLine, cp1, cp2);

}
function drawTile3P(offsets,x,y,s,arr) {
    // console.log("draw3", )
    const offs = offsets;
    let startLine; let endLine;
    let startLine2; let endLine2;
    let endLine0; // this is where the line from the 2nd point would go to if it was drawn to the opposite side


    // top and bottom
    if (arr[0] === 1 && arr[2] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);

        if (arr[1] === 1) {
            startLine2 = createVector(x+s, y+offs[1]);
            endLine0 = createVector(x, y+s-offs[1]);
        }

        else if (arr[3] === 1) {
            startLine2 = createVector(x, y+offs[3]);
            endLine0 = createVector(x+s, y+s-offs[3]);
        }
    }
     // right and left
    else if (arr[1] === 1 && arr[3] === 1) {
        startLine = createVector(x+s, y+offs[1]);
        endLine = createVector(x, y+offs[3]);

        if (arr[0] === 1) {
            startLine2 = createVector(x+offs[0], y);
            endLine0 = createVector(x+s-offs[0], y+s);
        }
        else if (arr[2] === 1) {
            startLine2 = createVector(x+offs[2], y+s);
            endLine0 = createVector(x+s-offs[2], y);
        }
    }

    // this connects the line from the 2nd point to the middle of the crossing line; this requires much fewer maths
    endLine2 = getIntercept2(startLine, endLine);

    // drawLine(startLine, endLine, 0, 90, 60, width);
    drawLine(startLine, endLine);
    drawLine(startLine2, endLine2);
}
function drawTile4P(offsets, x,y,s,arr) {
    // console.log("draw4", )
    const offs = offsets;
    const midx = x+s/2; const midy = y+s/2;
    let startLine; let endLine; let startLine2; let endLine2;
    let cp11; let cp12; let cp21; let cp22;

    // top-bottom and right-left
    if (arr[4] === 1) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+offs[2], y+s);
        startLine2 = createVector(x+s, y+offs[1]);
        endLine2 = createVector(x, y+offs[3]);
    }
    // top-right and bottom-left
    else if (arr[4] === 2) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x+s, y+offs[1]);
        startLine2 = createVector(x+offs[2], y+s);
        endLine2 = createVector(x, y+offs[3]);
    }
    // top-left and bottom-right
    else if (arr[4] === 3) {
        startLine = createVector(x+offs[0], y);
        endLine = createVector(x, y+offs[3]);
        startLine2 = createVector(x+offs[2], y+s);
        endLine2 = createVector(x+s, y+offs[1]);
    }

    drawLine(startLine, endLine, cp11, cp12);
    drawLine(startLine2, endLine2, cp21, cp22);
}

function drawLine(start, end, cp1, cp2) {
    ctx.save();
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsl(220, 90%, 60%)`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);

        if (cp2) {
            ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
        }
        else if (cp1) {
            ctx.quadraticCurveTo(cp1.x, cp1.y, end.x, end.y);
        } else {
            ctx.lineTo(end.x, end.y);
        }
        ctx.stroke();
    ctx.restore();
}

function getIntercept2(start1, end1) {
    const halfX = start1.x + (end1.x - start1.x)/2;
    const halfy = start1.y + (end1.y - start1.y)/2;

    return createVector(halfX, halfy); 
}


// maurer rose
function roseSettings() {
    clearCanvas = false;
    const n = randomise(true, 100, 1);
    const d = randomise(true, 30, 1);
    shapes = new Rose(n, d);
}

class Rose {
    constructor(n, d) {
        this.x0 = 0; this.y0 = 0;

        this.points = 360;
        this.a = 0;
        this.n = n;
        this.d = (pie2/360) * d;
        
        this.va = 1;

        this.k = this.a * this.d;
        this.r = screenHalf * Math.sin(this.n * this.k);

        this.x0 = Math.cos(this.k) * this.r + midX;
        this.y0 = Math.sin(this.k) * this.r + midY;
        this.x1 = this.x0; this.y1 = this.y0;

        this.hue = 220;
        this.sat = 90;
        this.light = 60;

        this.stop = false;
    }
    draw() {
        ctx.save();
            ctx.lineWidth = 1;
            ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            ctx.beginPath();
            ctx.moveTo(this.x0, this.y0);
            ctx.lineTo(this.x1, this.y1);
            ctx.stroke();
        ctx.restore();

        this.update();
    }
    update() {
        this.x0 = this.x1; this.y0 = this.y1;
        this.x1 = Math.cos(this.k) * this.r + midX;
        this.y1 = Math.sin(this.k) * this.r + midY;

        this.a += this.va;
        this.k = this.a * this.d;

        this.r = screenHalf * Math.sin(this.n * this.k);

        if (this.a >= this.points) {this.stop = true;}
    }
}


// helper functions
function randomise(floor, max, min, toFixed) {
    if (floor) {
        return Math.floor(Math.random() * (max-min) + min);
    } else {
        return Number((Math.random() * (max-min) + min).toFixed(toFixed));
    }
}

function rndTrueFalse(threshold) {
    return Math.random() < threshold ? true : false;
}

function randomArrayItem(arr) {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

function removeArrayItems(fromArr, itemsArr) {
    itemsArr.forEach(item => {
        const i = fromArr.indexOf(item);
        fromArr.splice(i,1);
    })
}

function createVector(x,y) {
    return {x: x, y: y}
}


})