import { createMainPanel, createSlider, createSelector } from "./settingsPanel2.js";

window.addEventListener("load", function() {})
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// disable right-click menu
document.body.addEventListener("contextmenu", function(evt){
    evt.preventDefault();
    return false;
});

window.addEventListener("keydown", function(e) {
    switch(e.key) {
        case " ":
            // start/pause
            pauseGame();
            break;
        case "x":
            // clear all
            clearAll()
            break;
        case "d":
            debug = debug ? false : true;
            break;
        case "r":
            // repeat();
            break;
        case "s":
            tryTemplateSave();
            break;
        case "Tab":
            openPanel();
            break;
    }
})
window.addEventListener("mousedown", function(e) {
    if (e.target.id === "canvas1") {
        switch(e.which) {
            case 1:
                // start over
                startOver();
                break;
            case 3:
                // pause/start
                pauseGame();
                break;
        }
    }
})
window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenHalf = canvas.width < canvas.height ?
    canvas.width/2 : canvas.height/2;
})

// requires settingsPanel.js
createMainPanel();

let debug = false;
let looping;
let gameOn = false;
let fps = 30;
let int = 1000/fps;
let timer = 0;
let lastTime = 0;

const pie2 = Math.PI * 2;
let screenHalf = canvas.width < canvas.height ?
    canvas.width/2 : canvas.height/2;

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

S["drawCount"] = new Setting("drawCount", 1);
S.drawCount.slider(0, 10, 1, true);

S["layers"] = new Setting("layers", 3);
S.layers.slider(0, 20, 1);

// colorDifferenceMode;
S["colorDifferenceMode"] = new Setting("colorDifferenceMode", "random");
S.colorDifferenceMode.selector(["setvalue", "proportional", "random"], true);

S["colorDifference"] = new Setting("colorDifference", 0);
S.colorDifference.slider(0, 355, 5);

S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 5, true);

S["startSaturate"] = new Setting("startSaturate", 90);
S.startSaturate.slider(0, 100, 5);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 5);

S["changeHue"] = new Setting("changeHue", false);
S.changeHue.selector([true, false], true);

S["changeSat"] = new Setting("changeSat", false);
S.changeSat.selector([true, false]);

S["changeLight"] = new Setting("changeLight", false);
S.changeLight.selector([true, false]);


S["shapeType"] = new Setting("shapeType", "line");
S.shapeType.selector(["line", "circle", "n-Shape"], true);

S["drawLinesFromCenter"] = new Setting("drawLinesFromCenter", false);
S.drawLinesFromCenter.selector([true, false]);

S["shapeSides"] = new Setting("shapeSides", 3);
S.shapeSides.slider(3, 6, 1, true);

S["shapeSize"] = new Setting("shapeSize", 5);
S.shapeSize.slider(1, 50, 1);

S["vAngle"] = new Setting("vAngle", 30);
S.vAngle.slider(2, 30, 1);

S["vAngleOffset"] = new Setting("vAngleOffset", 0);
S.vAngleOffset.slider(0, 1, 0.05);

// lineCap;
S["lineCap"] = new Setting("lineCap", "round");
S.lineCap.selector(["round", "square"], true);

S["maxLineWidth"] = new Setting("maxLineWidth", 10);
S.maxLineWidth.slider(5, 20, 1);

S["lineWidth"] = new Setting("lineWidth", 10);
S.lineWidth.slider(5, 20, 1);

S["lineShiftRepeat"] = new Setting("lineShiftRepeat", 0);
S.lineShiftRepeat.slider(0, 10, 1);

S["ellipseVal"] = new Setting("ellipseVal", 0);
S.ellipseVal.slider(0, 1, 0.05, true);

// shiftRadiusType;
S["shiftRadiusType"] = new Setting("shiftRadiusType", "rounded");
S.shiftRadiusType.selector(["rounded", "jagged"]);

S["shiftRadRepeat"] = new Setting("shiftRadRepeat", 0);
S.shiftRadRepeat.slider(0, 10, 1);

S["shiftRadMax"] = new Setting("shiftRadMax", 50);
S.shiftRadMax.slider(0, 100, 5);

S["opacityShift"] = new Setting("opacityShift", 0);
S.opacityShift.slider(0, 0.5, 0.05, true);

class Shape {
    constructor(num, settings, radius, hue, sat, light) {
        this.num = num;
        this.S = settings;
        this.shapeType = this.S.shapeType.v;
        this.drawCount = this.S.drawCount.v;

        // this.firstAngle = Math.random() * (pie2);
        this.firstAngle = 0;
        this.angle = this.firstAngle;
        this.vAngle = (pie2)/this.S.vAngle.v + this.S.vAngleOffset.v;
        // this.vAngle = Math.PI*2/100; // 100 steps
        this.maxAngle = this.firstAngle + pie2 + this.vAngle;
        this.steps = Math.ceil(pie2 / this.vAngle);

        this.hue = hue;
        this.saturate = sat;
        this.light = light;
        this.vHue = (360/this.steps) * 1;
        this.vSat = (100/this.steps) * 1;
        this.vLight = (100/this.steps) * 1;
        this.changeHue = this.S.changeHue.v;
        this.changeSat = this.S.changeSat.v;
        this.changeLight = this.S.changeLight.v;

        this.midX = canvas.width/2;
        this.midY = canvas.height/2;

        this.startX = 0; this.startY = 0;
        this.x = this.midX; this.y = this.midY;
        this.nextX = this.midX; this.nextY = this.midY;

        this.ellipseVal = this.S.ellipseVal.v;

        this.rad1 = radius + radius*this.ellipseVal;
        this.rad2 = radius - radius*this.ellipseVal;

        // this.shiftRadRepeat = randomise(true, 10, 0);
        this.shiftRadiusType = this.S.shiftRadiusType.v;
        this.shiftRadMax = this.S.shiftRadMax.v;
        this.shiftRadRepeat = this.S.shiftRadRepeat.v;
        this.radStep = this.shiftRadMax/((this.steps/this.shiftRadRepeat)/2);
        this.shiftRadStep1 = this.radStep;
        this.shiftRadStep2 = this.radStep;
                    
        this.maxRad1 = this.rad1 + this.shiftRadMax;
        this.minRad1 = this.rad1;
        this.maxRad2 = this.rad2 + this.shiftRadMax;
        this.minRad2 = this.rad2;
        
        this.shapeSize = this.S.shapeSize.v;
        this.vSize = 0.1;
        this.shapeSides = this.S.shapeSides.v;

        this.lineCap = this.S.lineCap.v;
        this.lineWidth = this.S.lineWidth.v;
        this.minLineWidth = this.lineWidth;
        this.maxLineWidth = this.lineWidth + this.S.maxLineWidth.v;
        this.lineShiftRepeat = this.S.lineShiftRepeat.v;

        this.vLineWidth = this.S.maxLineWidth.v/(((this.steps) / this.lineShiftRepeat)/2);
        this.vLineWidth = Number(this.vLineWidth.toFixed(3));

        this.opacity = 1;
        this.opacityShift = this.S.opacityShift.v;
        this.vOpac = this.opacityShift;

        this.drawLinesFromCenter = this.S.drawLinesFromCenter.v;
        this.steps += 2;
        this.count = 0;
        this.drawIt = true;

        this.draw();
    }
    draw() {
    if (this.count > 1) {
            ctx.save();
            ctx.strokeStyle = `hsl(${this.hue}, ${this.saturate}%, ${this.light}%)`;
            ctx.lineWidth = this.lineWidth;
            ctx.lineCap = this.lineCap;
            ctx.globalAlpha = this.opacity;

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

        // color
        if (this.changeHue) {
            this.hue += this.vHue;
            if (this.hue > 360) {this.hue -= 360;}
        };
        if (this.changeSat) {
            this.saturate += this.vSat;
            if (this.saturate >= 100 || this.saturate <= 0) {this.vSat *= -1;}
        };
        if (this.changeLight) {
            this.light += this.vLight;
            if (this.light >= 100 || this.light <= 0) {this.vLight *= -1;}
        };

        // size
        // if (this.S.shapeType.v !== "line" && this.vSize !== 0) {
        //     this.size += this.vSize;

        //     if (!this.S.reverseSize.v && this.size > this.S.maxSize.v) {
        //         this.vSize = 0;
        //     }

        //     else if (this.S.reverseSize.v && (this.size >= this.S.maxSize.v || this.size < 1)) {
        //         this.vSize *= -1;
        //     }
        // }

        // linewidth
        if (this.lineShiftRepeat > 0) {
            this.lineWidth += this.vLineWidth;
            // console.log("linewidth", this.lineWidth)

            if ((this.lineWidth >= this.maxLineWidth)
                || this.lineWidth <= this.minLineWidth) {
                this.vLineWidth *= -1;
            }
        }

        // shift opacity
        if (this.opacityShift > 0) {
            this.opacity -= this.vOpac;
    
            if (this.opacity < this.vOpac) {
                this.vOpac *= -1;
            }
            else if (this.opacity > 1) {
                this.vOpac *= -1;
            }
        }

        // increase angle to draw in a circle
        if (this.drawIt) {this.angle += this.vAngle;}
        
        // change radius
        if (this.shiftRadRepeat > 0) {
            if (this.shiftRadiusType === "rounded") {
                this.rad1 += this.shiftRadStep1;
                if (this.rad1 >= this.maxRad1
                    || this.rad1 <= this.minRad1) {
                    this.shiftRadStep1 *= -1;}

                this.rad2 += this.shiftRadStep2;
                if (this.rad2 >= this.maxRad2
                    || this.rad2 <= this.minRad2) {
                    this.shiftRadStep2 *= -1;}
            }
            else { // shiftRadiusType === jagged
                this.rad1 += this.shiftRadStep1;
                this.rad2 += this.shiftRadStep2;
                this.shiftRadStep1 *= -1;
                this.shiftRadStep2 *= -1;
            }
        }

        // draw from the middle
        if (!this.drawLinesFromCenter) {
            this.x = this.nextX; this.y = this.nextY; 
        } else {
            this.x = this.midX;
            this.y = this.midY;
            }

        }

        this.nextX = (Math.cos(this.angle) * this.rad1 + this.midX);
        this.nextY = (Math.sin(this.angle) * this.rad2 + this.midY);

        // if (this.count === 1) {
        //     console.log("next x y", this.nextX,this.nextY)
        //     this.startX = this.nextX;
        //     this.startY = this.nextY;
        // }

        // // previous to last round returns to the starting point
        // if (this.angle >= this.maxAngle*S.drawCount.v) {
        //     this.nextX = this.startX;
        //     this.nextY = this.startY;
        // }
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

let shapes = [];

function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;
    let stop = false;

    if (timer > int) {
        console.log("looping", )
        stop = true;
        shapes.forEach(shape => {
            if (shape.drawIt) {
                stop = false;
                shape.draw();
            }
        })

        timer = 0;
    } else {timer += deltaTime;}

    if (gameOn) {
        looping = requestAnimationFrame(animate);
    }

    if (stop) {
        console.log("stopping");
        pauseGame();
    }
}

function createShapes() {
    console.log("--create shapes", )
    const layers = S.layers.v;
    let hue = S.startHue.v;
    let sat = S.startSaturate.v;
    let light = S.startLight.v;
    let hueDiff = setColorDifference(layers);
    console.log("layers", layers)

    let radius = 0;
    for (let i = 0; i < layers; i++) {
        if (S.colorDifferenceMode.v === "random") {
            hueDiff = randomise(true, 350, 5);
        }
        radius += randomise(true, screenHalf/layers, 5);

        shapes.push(new Shape(i, S, radius, hue, sat, light));

        hue += hueDiff;
        if (hue > 360) {hue -= 360;}
    }
}

function setColorDifference(layers) {
    const mode = S.colorDifferenceMode.v;
    let diff = 0;
    switch(mode) {
        case "setvalue":
            diff = S.colorDifference.v;
            break;
        case "proportional":
            diff = Math.floor(360/layers);
            break;
        case "random":
            diff = randomise(true, 350, 5);
            break;
    }
    return diff;
}

function repeat() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOn = true;
    shapes.forEach(shape => {
        shape.drawIt = true;
        shape.count = 0;
    })
    animate(0);

}

function clearAll() {
    gameOn = false;
    cancelAnimationFrame(looping);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];
}

function startOver() {
    clearAll();
    gameOn = true;
    createShapes();
    
    animate(0);
}

function pauseGame() {
    if (gameOn) {
        gameOn = false;
        cancelAnimationFrame(looping);
    }
    else if (!gameOn){
        gameOn = true;
        animate(0);
    }
}


// helper functions
function randomise(floor, max, min, toFixed) {
if (floor === true) {
    return Math.floor(Math.random() * (max-min+1) + min);
} else if (floor === false) {
    return Number((Math.random() * (max-min+1) + min).toFixed(toFixed));
}
}
function rndTrueFalse(threshold) {
return Math.random() < threshold ? true : false;
}


function randomArrayItem(arr) {
const i = Math.floor(Math.random() * arr.length);
return arr[i];
}

