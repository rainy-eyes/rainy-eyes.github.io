import { createMainPanel, createSlider, createSelector } from "./settingsPanel2.js";


window.addEventListener("load", function() {})
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;
})

// disable right-click menu
document.body.addEventListener("contextmenu", function(e){
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

window.addEventListener("mousedown", function(e) {
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

// requires settingsPanel.js
createMainPanel();

let looping;
let loop = false;
let debug = false;

let fps = 30;
let int = 1000/fps;
let timer = 0;
let lastTime = 0;
let xoff = 0;
let yoff = 0;
let tInc = 0.005;

let margin = 5;

let curvePathRadius = canvas.height < canvas.width ? canvas.height/4 : canvas.width/4;

class Setting {
    constructor(name, value) {
        this.name = name;
        this.v = value;
        this.resetVal = value;
        this.rnd = false;
    }
    // requires settingsPanel2.js
    selector(options, separator) {
        this.options = [...options];
        createSelector(this.v, this.name, options, separator);
    }
    // requires settingsPanel2.js
    slider(min, max, step, separator) {
        this.min = min; this.max = max; this.step = step;

        this.possibilities = [];
        let item = this.min;
        let countDecimals = 0;
        if (Math.floor(this.step) === this.step) {
            countDecimals = 0;
        } else {
            countDecimals = this.step.toString().split(".")[1].length;
        }
        while (item <= this.max) {
            this.possibilities.push(item);
            item += this.step;
            if (countDecimals !== 0) {
                item = Number(item.toFixed(countDecimals));
            }
        }

        createSlider(this.v, this.name, min, max, step, separator)
    }
    get() {return this.v;}
    set(newVal) {this.v = newVal;}
    reset() {this.v = this.resetVal;}
    randomise() {
        // only if the setting's box is set on the settings panel
        if (this.rnd) {
            // if it is a selector
            if (this.options) {
                this.v = randomArrayItem(this.options);
            }
            // if it is a slider
            else {
                // if the steps between min-max float numbers
                this.v = randomArrayItem(this.possibilities);
            }
        }
    }

}
// variables to be used on the settingspanel and used for templates are to be put in here
export const S = new Object();


// S["var"] = new Setting("var", startValue);
// S.var.slider(min, max, step, separator[T/F]);

// S["var"] = new Setting("var", startValue);
// S.var.selector(optionsArray, separator[T/F]);

// fps
S["fps"] = new Setting("fps", 30);
S.fps.selector([30, 60], true);

S["maxSpeed"] = new Setting("maxSpeed", 10);
S.maxSpeed.slider(1, 20, 1, true);

S["maxShapes"] = new Setting("maxShapes", 1);
S.maxShapes.slider(1, 5, 1);

S["maxVertices"] = new Setting("maxVertices", 4);
S.maxVertices.slider(2, 10, 1);

S["connectAll"] = new Setting("connectAll", false);
S.connectAll.selector([true, false], true);

S["maxLines"] = new Setting("maxLines", 3);
S.maxLines.slider(1, 10, 1);

S["lineOffset"] = new Setting("lineOffset", 5);
S.lineOffset.slider(1, 20, 1);

S["lineWidth"] = new Setting("lineWidth", 2);
S.lineWidth.slider(1, 20, 1);

S["lineCap"] = new Setting("lineCap", "round");
S.lineCap.selector(["round", "square"]);

S["curves"] = new Setting("curves", "off");
S.curves.selector(["off", "bezier", "quadratic"]);

S["curveShift"] = new Setting("curveShift", false);
S.curveShift.selector([true, false]);

S["lineDash"] = new Setting("lineDash", false);
S.lineDash.selector([true, false], true);

S["dashLength"] = new Setting("dashLength", 50);
S.dashLength.slider(10, 100, 5);

S["dashGap"] = new Setting("dashGap", 50);
S.dashGap.slider(10, 100, 5);

S["maxSize"] = new Setting("maxSize", 0);
S.maxSize.slider(0, 20, 2);

S["colors"] = new Setting("colors", "equal");
S.colors.selector(["equal", "setValue", "random"], true);

S["colorStep"] = new Setting("colorStep", 5);
S.colorStep.slider(0, 180, 5);

S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 5);

S["startSat"] = new Setting("startSat", 90);
S.startSat.slider(0, 100, 5);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 5);

S["changeHue"] = new Setting("changeHue", false);
S.changeHue.selector([true, false], true);

S["changeSat"] = new Setting("changeSat", false);
S.changeSat.selector([true, false]);

S["changeLight"] = new Setting("changeLight", false);
S.changeLight.selector([true, false]);

S["opacityShift"] = new Setting("opacityShift", 0);
S.opacityShift.slider(0, 0.5, 0.02, true);

S["trailLength"] = new Setting("trailLength", 0);
S.trailLength.slider(0, 20, 2);

S["clearCanvas"] = new Setting("clearCanvas", true);
S.clearCanvas.selector([true, false]);

S["fillShapes"] = new Setting("fillShapes", false);
S.fillShapes.selector([true, false]);

S["shadows"] = new Setting("shadows", false);
S.shadows.selector([true, false]);


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
    } else {ctx.setLineDash([]);} // unset line dashing

    if (this.effect.shadows) {
        ctx.shadowColor = "#111";
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
        ctx.shadowBlur = 5;
    } else {ctx.shadowColor = 'rgba(0,0,0,0)';} // unset shadows

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

    // connect all vertices and if more than 3
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

    if (!this.effect.perlinNoise) {

        this.x = Math.floor(this.x + this.vx);
        this.y = Math.floor(this.y + this.vy);
    } else {
        this.x = perlinNoise(xoff, yoff) * canvas.width;
        this.y = perlinNoise(xoff, yoff) * canvas.height;
        // this.y = perlinNoise(t + this.vx + 1) * canvas.height;
        // this.x = perlinNoise(t + this.vy) * canvas.width;
    }

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
                this.S.startHue.randomise();
                startHue = this.S.startHue.v;
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
    xoff = 0;
    yoff = 0;
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
        cancelAnimationFrame(looping);
    } else {
        loop = true;
        animate(0);
    }
}

function clearAll() {
    console.log("stopping", )
    cancelAnimationFrame(looping);
    loop = false;
    effects = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}



function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", );
        xoff += tInc;
        yoff += tInc;

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




