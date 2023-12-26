import { createMainPanel, createSlider, createSelector, defaultPresets } from "./settingsPanel3.js";

export const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenHalf = canvas.width < canvas.height ?
        canvas.width/2 : canvas.height/2;
})

// disable right-click menu
document.body.addEventListener("contextmenu", function(evt) {
    evt.preventDefault();
    return false;
});

window.addEventListener("keydown", function(e) {
    // console.log("pressed key:", e.key)
    switch(e.key) {
        case " ":
            if (!running) {
                startOver()
            }
            break;
        case "x":
            cancelAnimationFrame(running);
            running = false;
            break;
        case "d":
            debug = !debug;
            break;
        case "r":
            randomiseSettings();
            break;
        case "s":
            //
            break;
        case "Tab":
            //
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
const mouse = {x: null, y: null};

// window.addEventListener("mousemove", function(e) {
//     mouse.x = e.x;
//     mouse.y = e.y;
// })

// window.addEventListener("mouseleave", function() {
//     mouse.x = null;
//     mouse.y = null;
// })

let settingsPanel = false;

// requires settingsPanel3.js
settingsPanel = createMainPanel();
// settingsPanel = createMainPanel("closed");

// clicking on big randomiser icon starts drawing
if (settingsPanel) {
    document.querySelector("#settingsPanel #randomiseBtn").addEventListener("click", startOver);
}

const noLoop = false;
let loopOn = false;
let running = false;
let debug = true;
const fps = 20;
const int = 1000/fps;
let timer = 0;
let lastTime = 0;
const pie2 = Math.PI * 2;
let screenHalf = canvas.width < canvas.height ?
    canvas.width/2 : canvas.height/2;
const midX = canvas.width/2;
const midY = canvas.height/2;


class Setting {
    constructor(name, value, tooltip) {
        this.name = name;
        this.v = value;
        this.resetVal = value;
        this.rnd = false;
        this.tooltip = tooltip;
    }
    // requires settingsPanel2.js
    selector(options, separator) {
        this.options = [...options];
        if (settingsPanel) {
            createSelector(this.v, this.name, options, separator, this.tooltip);

        }
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

// variables to be used on the settingspanel and used for templates are to be put in here
export const S = new Object();

S["speed"] = new Setting("speed", 100);
S.speed.slider(10, 100, 10);

S["points"] = new Setting("points", 350);
S.points.slider(50, 1000, 50);

S["shape1"] = new Setting("shape1", true);
S.shape1.selector([true, false], true);

S["shape2"] = new Setting("shape2", false);
S.shape2.selector([true, false]);

S["hueDiff"] = new Setting("hueDiff", 0, "Hue difference between 2 shapes");
S.hueDiff.slider(0, 180, 10);


S["N"] = new Setting("N", 2);
S.N.rnd = true;
S.N.slider(1, 40, 1, true);

S["D"] = new Setting("D", 39);
S.D.rnd = true;
S.D.slider(1, 100, 1);

S["size"] = new Setting("size", 200);
S.size.slider(100, 500, 50);


S["hue"] = new Setting("hue", 220);
S.hue.slider(0, 360, 5, true);

S["sat"] = new Setting("sat", 90);
S.sat.slider(10, 100, 5);

S["light"] = new Setting("light", 60);
S.light.slider(0, 100, 5);


S["hueShift"] = new Setting("hueShift", 0);
S.hueShift.slider(-1/2, 1/2, 1/2, true);
S["satShift"] = new Setting("satShift", 0);
S.satShift.slider(-1, 1, 1);
S["lightShift"] = new Setting("lightShift", 0);
S.lightShift.slider(-1, 1, 1);


S["lineWidth"] = new Setting("lineWidth", 1);
S.lineWidth.slider(1, 10, 1, true);

const presets = [
    {N: 2, D: 39},
    {N: 3, D: 47},
    {N: 4, D: 31},
    {N: 5, D: 97},
    {N: 6, D: 71},
    {N: 7, D: 19},
];
if (settingsPanel) {defaultPresets(presets);}

class Rose {
    constructor() {
        this.shape1 = S.shape1.v;
        this.shape2 = S.shape2.v;

        this.x0 = 0; this.y0 = 0;

        this.points = S.points.v;
        this.a = 0;
        this.n = S.N.v;
        this.d = (pie2/360) * S.D.v;
        
        this.va = 1;

        this.k = this.a * this.d;
        this.r = S.size.v * Math.sin(this.n * this.k);

        this.x0 = Math.cos(this.k) * this.r + midX;
        this.y0 = Math.sin(this.k) * this.r + midY;
        this.x1 = this.x0; this.y1 = this.y0;

        this.xa0 = 0; this.ya0;
        this.xa1 = 0; this.ya1;
        this.r2 = 0; this.vR2 = 1;

        this.hue = S.hue.v;
        this.sat = S.sat.v;
        this.light = S.light.v;
        this.hueShift = S.hueShift.v;
        this.satShift = S.satShift.v;
        this.lightShift = S.lightShift.v;
        
        this.hueDiff = S.hueDiff.v;

        this.stop = false;
    }
    draw() {
        if (this.shape1) {
            ctx.save();
                ctx.lineWidth = S.lineWidth.v;
                ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                ctx.beginPath();
                ctx.moveTo(this.x0, this.y0);
                ctx.lineTo(this.x1, this.y1);
                ctx.stroke();
            ctx.restore();
        }

        if (this.shape2) {
            ctx.save();
                ctx.lineWidth = 2;
                ctx.strokeStyle = `hsl(${this.hue+this.hueDiff}, ${this.sat}%, ${this.light}%)`;
                ctx.beginPath();
                ctx.moveTo(this.xa0, this.ya0);
                ctx.lineTo(this.xa1, this.ya1);
                ctx.stroke();
            ctx.restore();
        }

        this.update();

    }
    update() {
        this.x0 = this.x1; this.y0 = this.y1;
        this.x1 = Math.cos(this.k) * this.r + midX;
        this.y1 = Math.sin(this.k) * this.r + midY;

        this.xa0 = this.xa1; this.ya0 = this.ya1;
        this.xa1 = Math.cos(this.a*(pie2/360)) * this.r2 + midX;
        this.ya1 = Math.sin(this.a*(pie2/360)) * this.r2 + midY;

        this.a += this.va;
        this.k = this.a * this.d;

        this.r = S.size.v * Math.sin(this.n * this.k);
        this.r2 = S.size.v * Math.sin(this.n * this.a*(pie2/360));

        this.hue = (this.hue + this.hueShift) % 360;

        this.sat += this.satShift;
        if (this.sat > 100 || this.sat < 0) {
            this.satShift *= -1;}

        this.light += this.lightShift;
        if (this.light > 100 || this.light < 0) {
            this.lightShift *= -1;}


        if (this.a >= this.points) {this.stop = true;}
    }
}

let rose;
function init() {
    // console.log("---Start", )
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    rose = new Rose();
}

function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )

        for (let i = 0; i < S.speed.v; i++) { 
            rose.draw();
            if (rose.stop) {loopOn = false;}



            // displayInfo(`debug: ${debug}`)
        }

        timer = 0;
        if (noLoop) {loopOn = false;}
    } else {timer += deltaTime;}

    if (loopOn) {running = requestAnimationFrame(animate);}
    else {console.log("stopped", )}
}


function startOver() {
    clearAll();
    loopOn = true;

    init();
    animate(0);
}

function clearAll() {
    console.log("cleared", )
    loopOn = false;
    cancelAnimationFrame(running);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function pauseGame() {
    if (loopOn) {
        loopOn = false;
        cancelAnimationFrame(running);
        console.log("pause", )
    }
    else {
        loopOn = true;
        animate(0);
        console.log("resume", )
    }
}

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

function map(n, start1, stop1, start2, stop2) {
    var newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;

    return Math.max(Math.min(newval, stop2), start2);
}

function createVector(x,y) {
    return {x: x, y: y}
}

const debugInfo = document.createElement("div");
function addDebugInfoDiv() {
    document.querySelector("body").append(debugInfo);
    debugInfo.setAttribute("id", "debugInfo");
    debugInfo.style.position = "absolute";
    debugInfo.style.bottom = "0px";
    debugInfo.style.left = "5px";
    debugInfo.style.fontSize = "20px";
    debugInfo.style.color = "#ccc";
}
addDebugInfoDiv();

function displayInfo(info) {
    if (debug) {
        debugInfo.innerText = info;
    } else {debugInfo.innerText = "";}
}

