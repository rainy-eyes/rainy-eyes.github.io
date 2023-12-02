import { createMainPanel, createSlider, createSelector } from "./settingsPanel2.js";

window.addEventListener("load", function() {})
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

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
        case "Tab":
            openClosePanel();
            break;
        case "s":
            tryTemplateSave();
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

// disable right-click menu
document.body.addEventListener("contextmenu", function(evt){
    evt.preventDefault();
    return false;
});

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


let timer = 0;
let lastTime = 0;
const pie2 = Math.PI*2;

// const checkboxChange = {true: "&#9745;", false: "&#9744;"}
// const rndIcons = {true: "&#9883;", false: "&#9744;"};

ctx.fillStyle = "red";
ctx.font = "16px Arial";


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

// S["noLoop"] = new Setting("noLoop", false);
// S.noLoop.selector([true, false], false);

// slider example
// S["var"] = new Setting("var", 0);
// S.var.slider(0, 30, 5, true);

// selector
// S["var"] = new Setting("var", false);
// S.var.selector([true, false]);

S["fps"] = new Setting("fps", 30);
S.fps.slider(0, 60, 5, true);
let int = 1000/S.fps.v;

S["layout"] = new Setting("layout", "circular");
S.layout.selector(["circular", "hexagonal"], true);

S["side"] = new Setting("side", 5);
S.side.slider(3, 10, 1);

S["maxSide"] = new Setting("maxSide", 5);
S.maxSide.slider(3, 10, 1);

S["fit"] = new Setting("fit", "to screen");
S.fit.selector(["to screen", "setValue"]);

S["fitValue"] = new Setting("fitValue", 20);
S.fitValue.slider(10, 50, 5);


S["colorDifferenceMode"] = new Setting("colorDifferenceMode", "setValue", true);
S.colorDifferenceMode.selector(["setValue", "proportional", "random"], true);

S["colorDifference"] = new Setting("colorDifference", 0);
S.colorDifference.slider(0, 180, 5);


S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 0, true);

S["startSaturate"] = new Setting("startSaturate", 90);
S.startSaturate.slider(0, 100, 0);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 0);


S["changeHue"] = new Setting("changeHue", false);
S.changeHue.selector([true, false], true);

S["changeSat"] = new Setting("changeSat", false);
S.changeSat.selector([true, false]);

S["changeLight"] = new Setting("changeLight", false);
S.changeLight.selector([true, false]);


S["sizeChange"] = new Setting("sizeChange", "expand/reverse");
S.sizeChange.selector(["expand/reverse", "fade/reset", "static"], true);

S["startSize"] = new Setting("startSize", 1);
S.startSize.slider(0, 100, 0);

S["maxSize"] = new Setting("maxSize", 200);
S.maxSize.slider(0, 200, 0);

S["expansionSpeed"] = new Setting("expansionSpeed", 20);
S.expansionSpeed.slider(10, 50, 5);

S["opacityShift"] = new Setting("opacityShift", 0);
S.opacityShift.slider(0, 10, 1);

S["shapeSides"] = new Setting("shapeSides", 1);
S.shapeSides.slider(1, 8, 1, true);

S["rotationSpeed"] = new Setting("rotationSpeed", 0);
S.rotationSpeed.slider(0, 10, 1);

S["lineWidth"] = new Setting("lineWidth", 1);
S.lineWidth.slider(1, 10, 1, true);

S["maxLineWidth"] = new Setting("maxLineWidth", 1);
S.maxLineWidth.slider(1, 20, 1);

S["lineShift"] = new Setting("lineShift", 0);
S.lineShift.slider(0, 5, 1);


let shapes = [];
let screenHalf = canvas.width <= canvas.height ?
    canvas.width/2 : canvas.height/2;


class Shape {
    constructor(settings, index, x, y, hue, vHue, vSat, vLight) {
        this.S = settings;
        this.x = x;
        this.y = y;
        this.index = index;

        this.hue = hue;
        this.sat = this.S.startSaturate.v;
        this.light = this.S.startLight.v;
        this.vHue = vHue;
        this.vSat = vSat;
        this.vLight = vLight;

        this.changeHue = this.S.changeHue.v;
        this.changeSat = this.S.changeSat.v;
        this.changeLight = this.S.changeLight.v;

        this.sizeChange = this.S.sizeChange.v;
        this.shapeSides = this.S.shapeSides.v;

        this.startSize = this.S.startSize.v;
        this.size = this.startSize;
        this.maxSize = this.size + this.S.maxSize.v;
        this.vRad = 1 * this.S.expansionSpeed.v / 100;
        this.pi2 = pie2;
        this.lineWidth = this.S.lineWidth.v;
        this.maxLineWidth = this.lineWidth + this.S.maxLineWidth.v;
        this.vLine = this.S.lineShift.v/10;

        this.opacity = 1;
        this.vOpac = this.S.opacityShift.v/100;

        this.rotationSpeed = this.S.rotationSpeed.v;
        this.rotation = 0;
        this.vRotate = this.S.rotationSpeed.v / 100;
        this.reverse = false;

    }
    draw() {
        if (debug) {
            ctx.fillText(`${this.x}:${this.y}`, this.x, this.y)
        }
        ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
        ctx.globalAlpha = this.opacity;
        ctx.lineWidth = this.lineWidth;

        if (this.shapeSides === 1) { // draw circles
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, this.pi2);
            ctx.stroke();
            }
        else { // shapes other than circle
            if (this.rotationSpeed !== 0) { // rotate shapes
                ctx.save();
                    ctx.translate(this.x, this.y);
                    ctx.rotate(this.rotation);

                    if (this.shapeSides === 2) {
                        ctx.beginPath();
                        ctx.moveTo(0-this.size/2, 0-this.size/2);
                        ctx.lineTo(this.size/2, this.size/2);
                    }

                    else if (this.shapeSides === 4) {
                        ctx.strokeRect(0-this.size/2, 0-this.size/2, this.size, this.size);
                    }
                    else {
                        this.drawShape(0, 0, this.size, this.shapeSides);
                    }
                ctx.restore();

            } else { // no rotation
                if (this.shapeSides === 2) { // line
                    ctx.beginPath();
                    ctx.moveTo(this.x-this.size/2, this.y-this.size/2);
                    ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
                }

                else if (this.shapeSides === 4) { // rectangle
                    ctx.strokeRect(this.x-this.size/2, this.y-this.size/2, this.size, this.size);
                }
                else { // triangle and others
                    this.drawShape(this.x, this.y, this.size, this.shapeSides);
                }
            }
            ctx.stroke();
        }

        this.update();
    }
    update() {
        if (this.shapeSides !== 1 && this.rotationSpeed !== 0 ) {this.rotation += this.vRotate;}

        if (this.vOpac !== 0) {
            this.opacity -= this.vOpac;
            if (this.opacity >= 1 || 
                this.opacity <= this.vOpac) {
                    this.vOpac *= -1;
            }
        }

        if (this.sizeChange === "expand/reverse") {
            this.size += this.vRad;
            if (this.size > this.maxSize || 
                this.size <= 0) {
                    this.vRad *= -1;
                }
        } 
        else if (this.sizeChange === "fade/reset") {
            this.size += this.vRad;
            if (this.size > this.maxSize) {
                this.opacity = Number((this.opacity - this.vOpac).toFixed(3));

                if (this.opacity < this.vOpac) {
                    this.size = this.S.startSize.v;
                    this.opacity = 1;
                }
            }
        }
        // color
        if (this.changeHue) {
            this.hue += this.vHue;
            if (this.hue > 360) {this.hue -= 360;}
            else if (this.hue < 0) {this.hue += 360;}
        };
        if (this.changeSat) {
            this.sat += this.vSat;
            if (this.sat >= 100 || this.sat <= 0) {
                this.vSat *= -1;}
        };
        if (this.changeLight) {
            this.light += this.vLight;
            if (this.light >= 100 || this.light <= 0) {this.vLight *= -1;}
        };
        
        if (this.vLine !== 0) {
            this.lineWidth = Number((this.lineWidth + this.vLine).toFixed(2));

            if (this.lineWidth >= this.maxLineWidth ||
                this.lineWidth <= 1) {this.vLine *= -1;}
        }
        
    }   

    checkCollision() {
        // if (
        //     this.x + this.size === canvas.width ||
        //     this.x - this.size === 0 ||
        //     this.y + this.size === canvas.height ||
        //     this.y - this.size === 0
        //     ) {
        //         return true;
        //     }
        if (this.size >= screenHalf) {
            return true;
        }
    }

    drawShape(x, y, radius, sides) {
        ctx.save();
            ctx.beginPath();
            ctx.translate(x, y);
            ctx.moveTo(0, 0 - radius);

            for (let i = 0; i < sides; i++) {
                ctx.rotate(Math.PI/sides*2);
                ctx.lineTo(0, 0 - (radius));
            }
        
            ctx.stroke();
        ctx.restore();
    }
}

function generateOnGrid() {
    let index = 1;
    let sides = S.side.v;
    let sideIncrease = 1;
    let maxSides = S.maxSide.v;
    const colorType = S.colorDifferenceMode.v;
    let hue = S.startHue.v;
    let hueStep = S.colorDifference.v;

    let vHue = 1;
    let vSat = 1;
    let vLight = 1;

    const distStep = calculateDistance(sides);

    let y = canvas.height/2 - (distStep * maxSides);
    for (let i = 0; i < maxSides*2-1; i++) {
        let x = canvas.width/2 - (distStep * (sides/2)) - distStep/2;
        y += distStep;
        hue += hueStep;

        if (colorType === "setValue") {
            hue += hueStep;
        }
        else if (colorType === "proportional") {
            hue += 360/maxSides;
            if (hue > 360) {hue -= 360};

            vHue *= -1;
            vSat *= -1;
            vLight *= -1;
        }
        else if (colorType === "random") {
            hue = randomise(true, 360, 0);
        }
        
        for (let j = 0; j < sides; j++) {

            if (colorType === "random") {
                vHue = Math.random() < 0.5 ? 1 : -1;
                vSat = Math.random() < 0.5 ? 1 : -1;
                vLight = Math.random() < 0.5 ? 1 : -1;
            }

            x += distStep;
            shapes.push(new Shape(S, index, x, y, hue, vHue, vSat, vLight));
        }

        x -= distStep/2;
        if (i === maxSides-1) {sideIncrease *= -1;}

        sides += sideIncrease;
        index++;
    }
}

function generateOnCircle() {
    let index = 1;
    let sides = S.side.v;
    let maxSides = S.maxSide.v;

    const distStep = calculateDistance(sides);
    let dist = 0;

    const colorType = S.colorDifferenceMode.v;
    let hue = S.startHue.v;
    let hueStep = S.colorDifference.v;

    let vHue = 1;
    let vSat = 1;
    let vLight = 1;

    const midX = canvas.width/2;
    const midY = canvas.height/2;

    shapes.push(new Shape(S, index, midX, midY, hue, vHue, vSat, vLight));

    for (let j = 1; j <= maxSides; j++) {
        dist += distStep;

        if (colorType === "setValue") {
            hue += hueStep;
        }
        else if (colorType === "proportional") {
            hue += 360/maxSides;
            if (hue > 360) {hue -= 360};

            vHue *= -1;
            vSat *= -1;
            vLight *= -1;
        }
        else if (colorType === "random") {
            hue = randomise(true, 360, 0);
        }

        let angle = (Math.PI*2/sides)/j;

        for (let i = 1; i <= sides*j; i++) {

            if (colorType === "random") {
                vHue = Math.random() < 0.5 ? 1 : -1;
                vSat = Math.random() < 0.5 ? 1 : -1;
                vLight = Math.random() < 0.5 ? 1 : -1;
            }

            let cos = (Math.cos(angle*i));
            let sin = (Math.sin(angle*i));

            let x = Math.floor(midX + (dist * cos));
            let y = Math.floor(midY + (dist * sin));

            shapes.push(new Shape(S, index, x, y, hue, vHue, vSat, vLight));
            index++;
        }
    }
}

function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach(c => {
            c.draw();
        })
        if (shapes[0].checkCollision() === true) {
            shapes.forEach(c => {c.reverse = true;})
        }

        timer = 0;
    } else {timer += deltaTime;}

    if (gameOn) {looping = requestAnimationFrame(animate);}
}

function clearAll() {
    // console.log("cleared", )
    int = 1000/S.fps.v;
    gameOn = false;
    cancelAnimationFrame(looping);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function startOver() {
    // console.log("startover", )
    clearAll();
    gameOn = true;
    shapes = [];

    if (S.layout.v === "hexagonal") {
        generateOnGrid(side, maxSide, startHue);
    }
    else if (S.layout.v === "circular") {
        generateOnCircle(side, maxSide, startHue);
    }

    animate(0);
}
function pauseGame() {
    if (gameOn) {
        gameOn = false;
        cancelAnimationFrame(looping);
        // console.log("pause", )
    }
    else {
        gameOn = true;
        animate(0);
        // console.log("resume", )
    }
}



    
function calculateDistance(side) {
    if (S.fit.v === "to screen") {
        return Math.floor(screenHalf/(side+1));
    }
    else {return S.fitValue.v;}
}

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



// })