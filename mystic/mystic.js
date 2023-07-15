
window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;
    })

    // disable right-click menu
this.document.body.addEventListener("contextmenu", function(e){
    e.preventDefault();
    return false;
});

    window.addEventListener("keydown", function(e) {
        switch(e.key) {
            case " ":
                pauseStart();
                break;
            case "x":
                clearAll(); 
                break;
            case "d":
                debug = debug ? false : true;
                break;
            case "s":
                createTemplate();
                break;
            case "Tab":
                openClosePanel();
                break;
        }
    })

    this.window.addEventListener("mousedown", function(e) {
        if (e.target.id === "canvas1") {
            switch(e.which) {
                case 1: 
                    startOver();
                    break;
                case 3:
                    pauseStart();
                    break;
            }
        }
    }) 

    let looping;
    let loop = false;
    let debug = false;

    let fps = 30;
    let int = 1000/fps;
    let timer = 0;
    let lastTime = 0;

    const checkboxIcons = {true: "&#9745;", false: "&#9744;"}
    const rndIcons = {true: "&#9883;", false: "&#9744;"};

    let margin = 0;

    let curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;

class Settings {
    constructor() {
        this.maxSpeed = {
            "t": "maxSpeed",
            "v": 10,
            "reset":() => {return 10;},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": true,
        }
        this.maxShapes = {
            "t": "maxShapes",
            "v": 1,
            "reset":() => {return 1},
            "rndVal": () => {return rndTrueFalse(0.75) ? 1 : randomise(true, 5, 2);},
            "rndCheck": false,
        }
        this.maxVertices = {
            "t": "maxVertices",
            "v": 4,
            "reset":() => {return 4;},
            "rndVal": () => {return randomise(true, 10, 2);},
            "rndCheck": true,
        }
        this.connectAll = {
            "t": "connectAll",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.9)},
            "rndCheck": false,
        }
        this.maxLines = {
            "t": "maxLines",
            "v": 3,
            "reset":() => {return 3;},
            "rndVal": () => {return randomise(true, 10, 1);},
            "rndCheck": true,
        }
        this.lineOffset = {
            "t": "lineOffset",
            "v": 5,
            "reset":() => {return 5;},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": true,
        }
        this.lineWidth = {
            "t": "lineWidth",
            "v": 2,
            "reset":() => {return 2;},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": true,
        }
        this.lineCap = {
            "t": "lineCap",
            "v": "round",
            "reset":() => {return "round";},
            "rndVal": () => {return randomArrayItem(this.lineCap.choices);},
            "rndCheck": true,
            "choices": ["round", "square"],
        }
        this.curves = {
            "t": "curves",
            "v": "off",
            "reset":() => {return "off";},
            "rndVal": () => {return randomArrayItem(this.curves.choices);},
            "rndCheck": true,
            "choices": ["off", "bezier", "quadratic"],
        }
        this.curveShift = {
            "t": "curveShift",
            "v": false,
            "reset":() => {return false;},
            "rndVal": () => {return rndTrueFalse(0.75);},
            "rndCheck": false,
        }
        this.lineDash = {
            "t": "lineDash",
            "v": false,
            "reset":() => {return false;},
            "rndVal": () => {return rndTrueFalse(0.75);},
            "rndCheck": false,
        }
        this.dashLength = {
            "t": "dashLength",
            "v": 50,
            "reset":() => {return 50;},
            "rndVal": () => {return randomise(true, 20, 2)*5;},
            "rndCheck": false,
        }
        this.dashGap = {
            "t": "dashGap",
            "v": 50,
            "reset":() => {return 50;},
            "rndVal": () => {return randomise(true, 20, 2)*5;},
            "rndCheck": false,
        }
        this.maxSize = {
            "t": "maxSize",
            "v": 0,
            "reset":() => {return 0;},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": false,
        }
        this.colors = {
            "t": "colors",
            "v": "equal",
            "reset":() => {return "equal"},
            "rndVal": () => {return randomArrayItem(this.colors.choices)},
            "rndCheck": true,
            "choices": ["equal", "setValue", "random"],
        }
        this.colorStep = {
            "t": "colorStep",
            "v": 5,
            "reset":() => {return 5},
            "rndVal": () => {return (randomise(true, 36, 1))*5;},
            "rndCheck": true,
        }        
        this.startHue = {
            "t": "startHue",
            "v": 220,
            "reset":() => {return 220},
            "rndVal": () => {return randomise(true, 360, 0);},
            "rndCheck": true,
        }
        this.startSat = {
            "t": "startSat",
            "v": 90,
            "reset":() => {return 90},
            "rndVal": () => {return randomise(true, 100, 0);},
            "rndCheck": false,
        }
        this.startLight = {
            "t": "startLight",
            "v": 60,
            "reset":() => {return 60},
            "rndVal": () => {return randomise(true, 100, 0);},
            "rndCheck": false,
        }
        this.changeHue = {
            "t": "changeHue",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.2);},
            "rndCheck": false,
        }
        this.changeSat = {
            "t": "changeSat",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.2);},
            "rndCheck": false,
        }
        this.changeLight = {
            "t": "changeLight",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.2);},
            "rndCheck": false,
        }
        this.opacityShift = {
            "t": "opacityShift",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return rndTrueFalse(0.7) ?
                0 : randomise(true, 10, 1)/100},
            "rndCheck": false,
        }
        this.trailLength = {
            "t": "trailLength",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return rndTrueFalse(0.75) ?
                0 : randomise(true, 20, 1)},
            "rndCheck": false,
        }
        this.clearCanvas = {
            "t": "clearCanvas",
            "v": true,
            "reset":() => {return true},
            "rndVal": () => {return rndTrueFalse(0.9)},
            "rndCheck": false,
        }
        this.fillShapes = {
            "t": "fillShapes",
            "v": false,
            "reset":() => {return false;},
            "rndVal": () => {return rndTrueFalse(0.75);},
            "rndCheck": false,
        }
        this.shadows = {
            "t": "shadows",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.1)},
            "rndCheck": false,
        }

        this.list = [];
    }
    collectSettings() {
        let keys = Object.keys(this);
        keys.forEach(key => {
            this.list.push(this[key])
        })
        this.list.pop();
    }
}

const S = new Settings();
S.collectSettings();
// console.log("S", S)

class Particle {
    constructor(effect, x, y, vx, vy, hue, sat, light, index, edgeGrp, shapeGrp) {
        this.effect = effect;
        this.radius = this.effect.S.maxSize.v;
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
        this.hue = hue;
        this.sat = sat;
        this.light = light;
        this.vHue = this.effect.vHue;
        this.vSat = this.effect.vSat;
        this.vLight = this.effect.vLight;

        this.opacity = 1;
        this.opacityShift = this.effect.S.opacityShift.v;
        this.vOpac = this.effect.S.opacityShift.v;

        this.ID = index;
        this.edgeGrp = edgeGrp;
        this.shapeGrp = shapeGrp;
        this.reached = []; // IDs of where line was drawn
    }
    draw(ctx, i) {
        ctx.lineCap = this.effect.lineCap;
        ctx.lineWidth = this.effect.lineWidth;
        ctx.globalAlpha = this.opacity;

        if (this.effect.lineDash) {
            ctx.setLineDash([this.effect.dashLength, this.effect.dashGap]);
        }

        if (this.effect.shadows) {
            ctx.shadowColor = "#111";
            ctx.shadowOffsetX = 3;
            ctx.shadowOffsetY = 3;
            ctx.shadowBlur = 5;
        } else {ctx.shadowColor = 'rgba(0,0,0,0)';}

        if (this.radius > 0 && this.effect.maxVertices === 1) {
            ctx.save();
                ctx.beginPath();
                ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
                // ctx.fillRect(this.x, this.y, this.size, this.size);
                ctx.stroke();
                ctx.fill();
            ctx.restore();
        }
        if (debug) {
            ctx.save();
                ctx.strokeStyle = "red";
                ctx.fillStyle = "red";
                ctx.font = "16px Arial"
                ctx.beginPath();
                // ctx.arc(this.bx1, this.by1, 2, 0, Math.PI*2);
                ctx.fillRect(this.bx2, this.by2, 3, 3);
                ctx.fillText("b1", this.bx1, this.by1-16);
                ctx.fill();

                if (this.effect.S.curves.v === "bezier") {
                    ctx.beginPath();
                    // ctx.arc(this.bx2, this.by2, 2, 0, Math.PI*2);
                    ctx.fillRect(this.bx2, this.by2, 3, 3);
                    ctx.fillText("b2", this.bx2, this.by2-16);
                    ctx.fill();
                }
                ctx.fill();
            ctx.restore();
        }

        let count = this.effect.particles.length;

        // connect all verices and if more than 3
        if (this.effect.connectAll &&
            this.effect.maxVertices > 3)
            {
            let count2 = this.effect.shapeEdges[this.shapeGrp].length;

            for (let i = 0; i < count2; i++) {
                let nextIndex = this.effect.shapeEdges[this.shapeGrp][i];
                let next = this.effect.particles[nextIndex];

                if (this.ID !== next.ID &&
                    this.reached.indexOf(next.ID) === -1 &&
                    next.reached.indexOf(this.ID) === -1 ) 
                    {
                    this.reached.push(next.ID);
                    next.reached.push(this.ID);

                    ctx.save();
                        if (this.vOpac > 0) {
                            ctx.globalAlpha = this.opacity;
                        }
                        ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                        ctx.beginPath();
                        ctx.moveTo(this.x, this.y);

                        if (this.effect.curves === "bezier") {
                            ctx.bezierCurveTo(this.bx1, this.by1, this.bx2, this.by2, next.x, next.y);

                        }
                        else if (this.effect.curves === "quadratic") {
                            ctx.quadraticCurveTo(this.bx1, this.by1, next.x, next.y);
                            }

                        else {ctx.lineTo(next.x, next.y);}

                        ctx.stroke();
                        if (this.effect.fillShapes) {
                            ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                            ctx.fill();
                        }
                    ctx.restore();
                } 
            }
        }
        // if not connecting vertices
        else {
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

                if (this.effect.curves === "bezier") {
                    ctx.bezierCurveTo(this.bx1, this.by1, this.bx2, this.by2, next.x, next.y);
                }
                else if (this.effect.curves === "quadratic") {
                    ctx.quadraticCurveTo(this.bx1, this.by1, next.x, next.y);
                    }
                // no curves
                else {ctx.lineTo(next.x, next.y);}

                ctx.stroke();
                if (this.effect.fillShapes) {
                    ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                    ctx.fill();
                }
            ctx.restore();
            }
        }
    }
    update() {
        // curve point movement if curveShift is true
        if (this.effect.curves !== "off" && 
            this.effect.curveShift) 
        {
            this.angle1 += this.vAngle1;
            this.bx1 = Math.floor(curvePathRadius*Math.sin(this.angle1)+this.effect.width/2);
            this.by1 = Math.floor(curvePathRadius*Math.cos(this.angle1)+this.effect.height/2);

            this.angle2 += this.vAngle2;
            this.bx2 = Math.floor(curvePathRadius*Math.sin(this.angle2)+this.effect.width/2);
            this.by2 = Math.floor(curvePathRadius*Math.cos(this.angle2)+this.effect.height/2);
        }

        if (this.opacityShift > 0) {
            this.opacity -= this.vOpac;
            if (this.opacity >= 1 || this.opacity < this.vOpac) {this.vOpac *= -1;}
        }
        
        if (this.effect.changeHue) {
            this.hue += 1;
            if (this.hue > 360) {this.hue -= 360;}
            else if (this.hue <= 0) {this.hue += 360;}
        }
        if (this.effect.changeSat) {
            this.sat += this.vSat;
            if (this.sat >= 100 || this.sat <= 0) {
                this.vSat *= -1;}
        }
        if (this.effect.changeLight) {
            this.light += this.vLight;
            if (this.light >= 100 || this.light <= 0) {
                this.vLight *= -1;}
        }

        // collision with boundaries
        if (this.x < this.radius+margin || 
            this.x > this.effect.width-this.radius-margin) 
            {
            this.vx *= -1;
            // this.changeSpeed();
        }

        if (this.y < this.radius+margin || 
            this.y > this.effect.height-this.radius-margin) 
            {
            this.vy *= -1;
            // this.changeSpeed();
        }

        this.x = Math.floor(this.x + this.vx);
        this.y = Math.floor(this.y + this.vy);

    }
    // unused
    changeSpeed() {
        if (this.vSpeed === 0) {
            // this.vSpeed = Math.random() * 1.2 + 0.3;
            this.vSpeed = 0.95;
            // let count = this.particles.length;

            // pass vSpeed to points of the same edge
            this.effect.vertices[this.edgeGrp].forEach(j => {
                if (j !== this.ID) {
                    this.effect.particles[j].vSpeed = this.vSpeed;
                }
            })

            // this.effect.vertices.forEach(vert => {
            //     if (vert.indexOf(this.ID) > -1) {
            //         vert.forEach(j => {
            //             if (j !== this.ID) {
            //                 this.effect.particles[j].vSpeed = this.vSpeed;
            //             }
            //         })
            //     }
            // })
        } 
        this.vx *= this.vSpeed;
        this.vy *= this.vSpeed;
        this.vSpeed = 0;
        // console.log("x y vx vy", this.x, this.y, this.vx, this.vy)
    }
}

class Effect {
    constructor(settings, canvas, hue) {
        this.S = settings;
        this.canvas = canvas;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.particles = [];
        this.vertices = [];
        this.maxVertices = this.S.maxVertices.v;

        this.maxLines = this.S.maxLines.v;
        this.lineOffset = this.S.lineOffset.v;
        this.lineWidth = this.S.lineWidth.v;
        this.lineCap = this.S.lineCap.v;
        this.curves = this.S.curves.v;
        this.curveShift = this.S.curveShift.v;

        this.lineDash = this.S.lineDash.v;
        this.dashLength = this.S.dashLength.v;
        this.dashGap = this.S.dashGap.v;

        this.speed = this.S.maxSpeed.v;
        this.connectAll = this.S.connectAll.v;
        this.fillShapes = this.S.fillShapes.v;
        this.shadows = this.S.shadows.v;

        this.colorType = this.S.colors.v;
        this.mainHue = hue;
        this.mainSat = this.S.startSat.v;
        this.mainLight = this.S.startLight.v;

        this.changeHue = this.S.changeHue.v;
        this.changeSat = this.S.changeSat.v;
        this.changeLight = this.S.changeLight.v;

        this.vHue = rndTrueFalse(0.5) ? 1 : -1;
        this.vSat = rndTrueFalse(0.5) ? 1 : -1;
        this.vLight = rndTrueFalse(0.5) ? 1 : -1;

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
            let startHue = this.mainHue;
            let vert = [];
            
            for (let j = 0; j < this.maxLines; j++) {
                if (this.colorType === "setValue") {
                    startHue += this.S.colorStep.v;
                }
                else if (this.colorType === "random") {
                    startHue = this.S.startHue.rndVal();
                }

                // use trigonometry to calculate the offset points based on the angle of vx and vy
                // let [newX, newY] = trigonometry(vx, vy, j*lineOffset)
                // x += newX;
                // y += newY;

                // invert vx and vy points
                x += offSetX;
                y += offSetY;
               
                this.particles.push(new Particle(this, x, y, vx, vy, startHue, this.mainSat, this.mainLight, createID, edgeGrp, shapeGrp));

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

function getXandY(marginX, marginY) {
    let x = randomise(true, canvas.width-(S.maxSize.v+margin), S.maxSize.v+margin);
    let y = randomise(true, canvas.height-(S.maxSize.v+margin), S.maxSize.v+margin);
    
    // console.log("canvas", canvas.width, canvas.height)
    // console.log("x y", x, y)
    // console.log("offset x y", offSetX, offSetY)
    // console.log("x y + margin", x+marginX, y+marginY)

    if (S.maxLines.v > 1) {
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
    }
    return [x, y];
}

let effects = [];
function init() {
    // allShapeEdgeGroups = [];
    const shapeNum = S.maxShapes.v;
    let hue = S.startHue.v;

    for (let i = 0; i < shapeNum; i++) {
        hue += 360/shapeNum;
        if (hue > 360) {hue -= 360;}

        effects.push(new Effect(S, canvas, hue));
    }
}

function startOver() {
    clearAll();
    init();
    loop = true;
    animate(0);
}

function pauseStart() {
    if (loop) {
        loop = false;
        this.cancelAnimationFrame(looping);
    } else {
        loop = true;
        animate(0);
    }
}


function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )

        if (S.trailLength.v > 0) {
            const trails = (S.trailLength.v);
            ctx.save();
            ctx.fillStyle = `rgba(0, 0, 0, ${trails})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

        } else if (S.clearCanvas.v) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // effect.handleParticles(ctx);
        effects.forEach(eff => {
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

        timer = 0;
    } else {timer += deltaTime;}

    if (loop) {looping = requestAnimationFrame(animate);}
}

function clearAll() {
    console.log("stopping", )
    this.cancelAnimationFrame(looping);
    loop = false;
    effects = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// unused
function trigonometry(vx, vy, c) {
    // angle opposite: b -> vy
    // angle adjecent: a -> vx
    // angle: tan(angle) = opposite/adjacent -> vy/vx
    const angle = Math.tan(vy/vx);

    // hypoteneuse "c" is the lineOffset, the distance between the line and the main line
    // cos(angle) = a/c -> a = c * cos(angle);
    // sin(angle) = b/c -> b = c * sin(angle)
    const newX = Math.floor(c * Math.cos(angle));
    const newY = Math.floor(c * Math.sin(angle));

    // multiply by -1 to get the points in the opposite direction with the same angle value
    return [-newX, -newY];
}



// UI and buttons
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
const openBtn = this.document.getElementById("openBtn");
const settingsPanel = this.document.getElementById("cont");

openBtn.addEventListener("click", openClosePanel);

function openClosePanel() {
    const status = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[status]);
}

// fps
const fps_step = 5;
const fps_display = this.document.querySelector("#fps .display");
const fps_minus = this.document.querySelector("#fps .minus");
const fps_plus = this.document.querySelector("#fps .plus");

fps_minus.addEventListener("click", function() {
    fps -= fps_step;
    int = 1000/fps;
    fps_display.innerText = fps;
})
fps_plus.addEventListener("click", function() {
    fps += fps_step;
    int = 1000/fps;
    fps_display.innerText = fps;
})

const colorDisplay = this.document.getElementById("displaycolor");

const inputs = this.document.querySelectorAll("#cont input");
inputs.forEach(input => {
    input.addEventListener("input", function(e) {
        adjustInput(e);
    })
})

const clickerSettings = this.document.querySelectorAll(".clickChange");
clickerSettings.forEach(set => {
    set.addEventListener("click", function() {
        const id = set.parentElement.id;
        adjustModes(id);
    })
})

function adjustModes(id) {
    const i = S[id].choices.indexOf(S[id].v);

    if (i+1 < S[id].choices.length) {
        S[id].v = S[id].choices[i+1];
    } else {S[id].v = S[id].choices[0];}

    setDisplayAndInput(id);
}

function adjustInput(e) {
    const id = e.target.parentElement.id;
    S[id].v = Number(e.target.value);
    e.target.parentElement.querySelector(".display").innerText = S[id].v;

    setColorDisplay(id);
}

function setColorDisplay(id) {
    if (id === "startHue" || 
        id === "startSat" || 
        id === "startLight"  ) {
        colorDisplay.style.backgroundColor = `hsl(${S.startHue.v}, ${S.startSat.v}%, ${S.startLight.v}%)`;
    }
}

const checkBoxes = this.document.querySelectorAll(".checkbox");
checkBoxes.forEach(box => {
    box.addEventListener("click", function(e) {
        let id = e.target.id;
        if (id === "") {
            id = e.target.parentElement.id;
        }
        S[id].v = !S[id].v;

        e.target.innerHTML = checkboxIcons[S[id].v];

        if (id.includes("change")) {
            S[id].rndCheck = S[id].v;
        }
    })
})

function initSettings() {
    fps_display.innerText = fps;
    int = 1000/fps;

    S.list.forEach(set => {setDisplayAndInput(set.t);})
}
initSettings();

function setDisplayAndInput(id) {
    const display = document.querySelector(`#${id} .display`);
    const input = document.querySelector(`#${id} input`);
    const checkbox1 = document.querySelector(`#${id}.checkbox`);
    const checkbox2 = document.querySelector(`#${id} .checkbox`);

    if (display !== null) {display.innerText = S[id].v;}
    if (input !== null) {input.value = S[id].v;}
    if (checkbox1 !== null) {
        checkbox1.innerHTML = checkboxIcons[S[id].v];
    }
    if (checkbox2 !== null && !id.includes("start")) {
        checkbox2.innerHTML = checkboxIcons[S[id].v];
    }
    setColorDisplay(id);
}

const resetBtn = this.document.getElementById("resetBtn");
resetBtn.addEventListener("click", function() {
    S.list.forEach(set => {resetParamenter(set.t);})
});

function resetParamenter(id) {
    S[id].v = S[id].reset();
    setDisplayAndInput(id);
}

const displayBtns = this.document.querySelectorAll(".display");
displayBtns.forEach(btn => {
    btn.addEventListener("dblclick", function(e) {
        const id = e.target.parentElement.id;
        resetParamenter(id);
    })
})

const randomiseBtn = this.document.getElementById("randomiseBtn");
randomiseBtn.addEventListener("mousedown", function(e) {
    switch(e.which) {
        case 1:
            randomiseParameters();
            break;
        case 3:
            setRndCheckboxes();
            break;
    }
})

function randomiseParameters() {
    S.list.forEach(set => {
        if (set.rndCheck) {randomiseParameter(set.t);}
    })
    startOver();
}

const rndboxes = this.document.querySelectorAll("#rndbox");
rndboxes.forEach(box => {
    box.addEventListener("mousedown", function(e) {
        const id = e.target.parentElement.id;
        switch(e.which) {
            case 1:
                randomiseParameter(id);
                break;
            case 3:
                setRndCheckbox(id);
                break;
        }
    })
})

function setRndIcons() {
    rndboxes.forEach(box => {
        const id = box.parentElement.id;
        box.innerHTML = rndIcons[S[id].rndCheck];
    })
}
setRndIcons();

function randomiseParameter(id) {
    S[id].v = S[id].rndVal();
    setDisplayAndInput(id);
}

function setRndCheckboxes() {
    let val = randomiseBtn.getAttribute("value");
    val = val === "true" ? false : true;
    randomiseBtn.setAttribute("value", val);

    S.list.forEach(set => setRndCheckbox(set.t, val))
}

function setRndCheckbox(id, value) {
    if (value === undefined) {
        S[id].rndCheck = !S[id].rndCheck;
    } else {S[id].rndCheck = value;}
    
    const box = document.querySelector(`#${id} #rndbox`);
    if (box !== null) {
        box.innerHTML = rndIcons[S[id].rndCheck];
    }
}

randomiseBtn.addEventListener("dblclick", function(e) {
    const selected = [];
    const list = [...S.list];
    console.log("list", list)

    while (selected.length <= 10) {
        const item = randomArrayItem(list);
        selected.push(item);
        list.splice(list.indexOf(item), 1);
    }

    S.list.forEach(set => {
        if (selected.indexOf(set) > 0) {
            console.log("true set", set)
            set.rndCheck = true;
        }
        else {set.rndCheck = false;}

        const box = document.querySelector(`#${set.t} #rndbox`);
        if (box !== null) {
            box.innerHTML = rndIcons[set.rndCheck];
        }
    })
})



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



                        // templates

let tabCount = 0;
const tabStartY = 125;
const tabYIncrease = 30;
const tabMaxY = Math.floor(settingsPanel.getBoundingClientRect().height);

const templates = {};
class Template {
    constructor(num, shapesArr) {
        this.num = num;
        this.allShapes = [...shapesArr];
    }
}

const saveBtn = this.document.getElementById("saveBtn");
saveBtn.addEventListener("mousedown", function(e) {
    switch (e.which) {
        case 1:
            tryTemplateSave();
            break;
        case 3:
            const temps = Object.keys(templates);
            if (temps.length > 0) {
                temps.forEach(temp => {
                    deleteTemplate(temp);
                })
            }
            break;
    }
})

function tryTemplateSave() {
    if (effects.length > 0 && checkSpace()) {
        createTemplate();
    } else {
        setFullWarning();
    }
}

function checkSpace() {
    const length = Object.keys(templates).length;
    const y = tabStartY + (tabYIncrease * (length-1));
    const maxY = tabMaxY - (tabYIncrease * 2);

    return y <= maxY ? true : false;
}

function setFullWarning() {
    saveBtn.classList.add("full");

    setTimeout(() => {
        saveBtn.classList.remove("full");
    }, 1000);
}


function createTemplate() {
    tabCount++;
    templates[tabCount] = new Template(tabCount, effects);
    // console.log("--new", templates[tabCount])

    const props = {
        "id": `tab-${tabCount}`,
        "class": "btn tab template",
        "data-count": tabCount
    }

    const tab = createElement("div", props);
    tab.innerText = tabCount;
    settingsPanel.appendChild(tab);

    const length = Object.keys(templates).length;
    const y = tabStartY + (tabYIncrease * (length-1));
    tab.style.top = `${y}px`;

    tab.addEventListener("mousedown", function(e) {
        templateClick(e);
    })
}
function createElement(el, props) {
    const newEl = document.createElement(el);
    for (k in props) {
        newEl.setAttribute(k, props[k]);
    }
    return newEl;
}

function templateClick(e) {
    const num = e.target.getAttribute("data-count");
    switch(e.which) {
        case 1: 
            loadTemplate(num);
            break;
        case 3:
            deleteTemplate(num);
            break;
    }
}

function loadTemplate(num) {
    clearAll();
    effects = [...templates[num].allShapes];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    loop = true;

    animate(0);
}


function deleteTemplate(num) {
    if (templates[num].num == num) {delete templates[num];}

    const tab = document.getElementById(`tab-${num}`);
    tab.remove();

    resetTabPositions();
};

function resetTabPositions() {
    const tempTabs = document.querySelectorAll(".template");
    tempTabs.forEach((tab, i) => {
        tab.style.top = `${tabStartY + tabYIncrease*i}px`;
    })
}

   
// take screenshot
const scrshotBtn = this.document.getElementById("screenshot");
scrshotBtn.addEventListener("click", function() {
    takeScreenshot(canvas, settingsPanel);
});


})