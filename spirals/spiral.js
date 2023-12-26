import { createMainPanel, createSlider, createSelector, defaultPresets } from "./settingsPanel3.js";

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
            clearAll(); 
            break;
        case "s":
            // clear all
            savePattern(); 
            break;
        case "r":
            randomiseSettings();
            break;
        case "Tab":

            break;
        case "d":
            debug = debug ? false : true;
            break;
    }
})
window.addEventListener("mousedown", function(e) {
    if (e.target.id === "canvas1") {
        switch(e.which) {
            case 1:
                // start over
                startOver()
                break;
            case 3:
                // pause/start
                pauseGame()
                break;
        }
    }
})
window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})


let settingsPanel = false;

// requires settingsPanel
settingsPanel = createMainPanel();
// settingsPanel = createMainPanel("closed");

// clicking on big randomiser icon starts drawing
if (settingsPanel) {
    document.querySelector("#settingsPanel #randomiseBtn").addEventListener("click", startOver);
}

let debug = false;
let looping;
let gameOn = false;
const pie2 = Math.PI * 2;

let timer = 0;
let lastTime = 0;

class Setting {
    constructor(name, value, tooltip) {
        this.name = name;
        this.v = value;
        this.resetVal = value;
        this.rnd = false;
        this.tooltip = tooltip;
    }
    // requires settingsPanel
    selector(options, separator) {
        this.options = [...options];
        if (settingsPanel) {
            createSelector(this.v, this.name, options, separator, this.tooltip);

        }
    }
    // requires settingsPanel
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

        if (this.step > 0) { // safeguard against infinite loop
            while (item <= this.max) {
                this.possibilities.push(item);
                item += this.step;
                if (countDecimals !== 0) {
                    item = Number(item.toFixed(countDecimals));
                }
            }
        }
        else {
            console.log("step is an invalid number in setting: ", this.title);
            return;
        }

        if (settingsPanel) {
            createSlider(this.v, this.name, min, max, step, separator, this.tooltip)
        }
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


// variables to be used on the settingspanel and for templates are to be put in here
export const S = new Object();

// fps
S["fps"] = new Setting("fps", 30);
delete S.fps.rnd;
S.fps.selector([30, 60]);
let int = 1000/S.fps.v;

S["drawSpeed"] = new Setting("drawSpeed", 5);
delete S.drawSpeed.rnd;
S.drawSpeed.slider(1, 10, 1);

S["drawCount"] = new Setting("drawCount", 0);
delete S.drawCount.rnd;
S.drawCount.slider(0, 20, 1);

S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 1, true);

S["startSaturate"] = new Setting("startSaturate", 90);
S.startSaturate.slider(0, 100, 1);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 1);



S["hueShift"] = new Setting("hueShift", 0);
S.hueShift.slider(-180, 180, 5, true);

S["satShift"] = new Setting("satShift", 0);
S.satShift.slider(-5, 5, 1);

S["lightShift"] = new Setting("lightShift", 0);
S.lightShift.slider(-5, 5, 1);



S["linesFromCenter"] = new Setting("linesFromCenter", false);
S.linesFromCenter.selector([true, false], true);

S["linesWithinBorders"] = new Setting("linesWithinBorders", true);
S.linesWithinBorders.selector([true, false]);



S["shapeType"] = new Setting("shapeType", "line");
S.shapeType.selector(["line", "circle", "square"], true);

S["shapeSize"] = new Setting("shapeSize", 5);
S.shapeSize.slider(5, 200, 5);

S["maxSize"] = new Setting("maxSize", 20);
S.maxSize.slider(20, 200, 5);

S["vSize"] = new Setting("vSize", 0);
S.vSize.slider(0, 2, 0.2);

S["reverseSize"] = new Setting("reverseSize", false);
S.reverseSize.selector([true, false]);



S["radius1"] = new Setting("radius1", 2);
S.radius1.slider(0, Math.floor(canvas.width/2), 2, true);

S["radius2"] = new Setting("radius2", 2);
S.radius2.slider(0, Math.floor(canvas.width/2), 2);

S["vRadius1"] = new Setting("vRadius1", 1);
S.vRadius1.slider(-2, 2, 0.05);

S["vRadius2"] = new Setting("vRadius2", 1);
S.vRadius2.slider(-2, 2, 0.05);

S["vvRadius1"] = new Setting("vvRadius1", 0);
S.vvRadius1.slider(-2, 2, 0.05);

S["vvRadius2"] = new Setting("vvRadius2", 0);
S.vvRadius2.slider(-2, 2, 0.05);



S["vAngle"] = new Setting("vAngle", 0.05);
S.vAngle.slider(0.05, 1, 0.02, true);

S["vvAngle"] = new Setting("vvAngle", 0);
S.vvAngle.slider(0, 0.1, 0.02);

S["vAngleReversePoint"] = new Setting("reversePoint", 0);
S.vAngleReversePoint.slider(0, 5, 1);

S["vAngleReverseChance"] = new Setting("reverseChance", 0);
S.vAngleReverseChance.slider(0, 95, 5);



S["lineWidth"] = new Setting("lineWidth", 2);
S.lineWidth.slider(1, 10, 1, true);

S["maxLineWidth"] = new Setting("maxLineWidth", 5);
S.maxLineWidth.slider(0, 10, 1);

S["vLineWidth"] = new Setting("vLineWidth", 0);
S.vLineWidth.slider(0, 2, 0.1);

S["reverseLineWidth"] = new Setting("reverseLineWidth", false);
S.reverseLineWidth.selector([true, false]);



S["opacityShift"] = new Setting("opacityShift", 0);
S.opacityShift.slider(0, 0.5, 0.02, true);


class Shape {
    constructor(settings, firstAngle) {
        this.S = extractSettingsValue(settings);
        // console.log("this.S", this.S)
        this.midX = canvas.width/2;
        this.midY = canvas.height/2;
        this.drawCount = this.S.drawCount;

        this.x = this.midX; this.y = this.midY;
        this.nextX = this.midX; this.nextY = this.midY;

        this.hue = this.S.startHue;
        this.sat = this.S.startSaturate;
        this.light = this.S.startLight;

        this.vHue = this.S.hueShift;
        this.vSat = this.S.satShift;
        this.vLight = this.S.lightShift;

        this.shapeType = this.S.shapeType;
        this.size = this.S.shapeSize;
        this.maxSize = this.S.maxSize;
        this.vSize = this.S.vSize;
        this.reverseSize = this.S.reverseSize;

        this.rad1 = this.S.radius1;
        this.rad2 = this.S.radius2;
        this.vRad1 = this.S.vRadius1;
        this.vRad2 = this.S.vRadius2;
        this.vvRad1 = this.S.vvRadius1;
        this.vvRad2 = this.S.vvRadius2;

        this.firstAngle = firstAngle;
        this.angle = this.firstAngle;
        this.vAngle = this.S.vAngle;
        this.vvAngle = this.S.vvAngle;
        this.vAngleReversePoint = this.S.vAngleReversePoint;
        this.vAngleReverseChance = this.S.vAngleReverseChance;

        this.linesFromCenter = this.S.linesFromCenter;
        this.lineWidth = this.S.lineWidth;
        this.vLineWidth = this.S.vLineWidth;
        this.maxLineWidth = this.S.maxLineWidth;
        this.reverseLineWidth = this.S.reverseLineWidth;
        this.linesWithinBorders = this.S.linesWithinBorders;

        this.opacity = 1;
        this.vOpac = this.S.opacityShift;

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

        // color
        if (this.vHue !== 0) {
            this.hue = (this.hue + this.vHue) % 360;
        };
        if (this.vSat !== 0) {
            this.sat += this.vSat;
            if (this.sat >= 100 || this.sat <= 0) {
                    this.vSat *= -1;}
        };
        if (this.vLight !== 0) {
            this.light += this.vLight;
            if (this.light >= 100 || this.light <= 0) {
                    this.vLight *= -1;}
        };


        // size
        if (this.shapeType !== "line" && this.vSize !== 0) {
            this.size += this.vSize;

            if (!this.reverseSize && 
                this.size > this.maxSize) {
                    this.vSize = 0;
            }

            else if (this.reverseSize &&
                (this.size >= this.maxSize || this.size < 1)) {
                    this.vSize *= -1;
            }
        }

        // linewidth
        if (this.vLineWidth !== 0) {
            this.lineWidth += this.vLineWidth;

            if (!this.reverseLineWidth && 
                (this.lineWidth > this.maxLineWidth)) {
                this.vLineWidth = 0;
            }

            else if (this.reverseLineWidth &&
                (this.lineWidth >= this.maxLineWidth 
                    || this.lineWidth < 1)) {
                this.vLineWidth *= -1;
            }
        }

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

        // shift opacity
        if (this.vOpac !== 0) {
            this.opacity -= this.vOpac;
    
            if (this.opacity < this.vOpac) {
                this.vOpac *= -1;
            }
            else if (this.opacity > 1) {
                this.vOpac *= -1;
            }
        }

        // shift angle
        if (this.vAngleReverseChance > 0 ) {
            if (rndTrueFalse(this.vAngleReverseChance/100)) {
                this.vAngle *= -1;
            }
            // this.hue += Math0.floor(Math.random()*19+1);
        }

        this.angle += this.vAngle;
        
        if (this.vvAngle > 0 ||
            this.vAngleReversePoint > 0) {
                this.vAngle += this.vvAngle;

            if (this.vAngleReversePoint > 0) {
                if (this.vAngle < 0.1 || this.vAngle > this.vAngleReversePoint) {
                    this.vvAngle *= -1;
                }
            }
        }

            // finite drawing
            if (this.drawCount > 0 && 
                this.angle > (Math.PI*2) * this.drawCount + this.firstAngle) {
                pauseGame();
            }

    }
        // draw from the middle
        if (!this.linesFromCenter) {
            this.x = this.nextX; this.y = this.nextY; 
        } else {
            this.x = canvas.width/2;
            this.y = canvas.height/2;
        }
        this.nextX = Math.floor(Math.cos(this.angle) * this.rad1 + this.midX);
        this.nextY = Math.floor(Math.sin(this.angle) * this.rad2 + this.midY);
    }
}

let newShape = false;

function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )
        for (let i = 0; i < S.drawSpeed.v; i++) { 
            newShape.draw();
        }
        // 
        timer = 0;
    } else {timer += deltaTime;}

    if (gameOn) {looping = requestAnimationFrame(animate);}
}

function generatePattern() {
    const firstAngle = Math.random() * pie2;
    newShape = new Shape(S, firstAngle);
}

function startOver() {
    clearAll();
    int = 1000/S.fps.v;
    gameOn = true;
    generatePattern();
    animate(0);
}

function clearAll() {
    gameOn = false;
    cancelAnimationFrame(looping);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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


// randomise with the R key
const checkboxChange = {true: "&#9745;", false: "&#9744;"}
function randomiseSettings() {
    for (let key in S) {
        if (S[key].rnd) {S[key].randomise();}

        // if settingsPanel is used, add newly randomised value to the panel
        if (settingsPanel) {
            const val = S[key].v;
            const el = document.querySelector(`#settingsPanel #${key}`);
            const display = el.querySelector(".display");
          
            if (el.classList.contains("slider")) {
              display.innerText = val;
              el.querySelector(".inputSlider").value = val;
            }
            else if (el.classList.contains("selector")) {
              if (val === true || val === false) {
                display.innerHTML = checkboxChange[val];
              }
              else {display.innerText = val;}
              display.setAttribute("value", val);
            }
        }
    }
}


// helper functions
function randomise(floor, max, min, toFixed) {
    if (floor === true) {
        // return Math.floor(Math.random() * max + min);
    } else if (floor === false) {
        // return Number((Math.random() * max + min).toFixed(toFixed));
    }
}
function rndTrueFalse(threshold) {
    return Math.random() < threshold ? true : false;
}

function randomArrayItem(arr) {
    const i = Math.floor(Math.random() * arr.length);
    return arr[i];
}

function extractSettingsValue(obj) {
    const keys = Object.keys(obj);
    const newObj = {};
    keys.forEach(key => {
        newObj[key] = obj[key].v;
    })

    return newObj;
}


