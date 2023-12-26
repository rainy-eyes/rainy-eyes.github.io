import { createMainPanel, createSlider, createSelector } from "./settingsPanel3.js";

window.addEventListener("load", function() { })

const canvas = document.getElementById("canvas1");
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
    switch(e.key) {
        case " ":
            if (!running) {
                startOver()
            }
            break;
        case "x":
            this.cancelAnimationFrame(running);
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


let settingsPanel = false;

// requires settingsPanel
settingsPanel = createMainPanel();
// settingsPanel = createMainPanel("closed");

// clicking on big randomiser icon starts drawing
if (settingsPanel) {
    document.querySelector("#settingsPanel #randomiseBtn").addEventListener("click", startOver);
}

let noLoop = false;
let loopOn = false;
let running = false;
let debug = false;
const fps = 30;
const int = 1000/fps;
let timer = 0;
let lastTime = 0;
let frames = 0;
const pie2 = Math.PI * 2;
let screenHalf = canvas.width < canvas.height ?
    Math.floor(canvas.width/2) : Math.floor(canvas.height/2);

let width = 0;
let height = 0;
// const dirs = [
//     // [1, 0],[-1, 0],[0, 1],[0, -1],
//     // [1, -1],[-1, -1],[-1, 1],[-1, -1],
//     // [2, 0],[-2, 0],[0, 2],[0, -2],
//     // [2, -2],[-2, -2],[-2, 2],[-2, -2],

//     [-1, -1], [ 0,-1], [1, -1],
//     [-1,  0], [1,  0],
//     [-1,  1], [ 0, 1], [1,  1],

//     [-2, -2], [ 0,-2], [2, -2],
//     [-2,  0], [2,  0],
//     [-2,  2], [ 0, 2], [2,  2],
// ];


const directions = {
    "non-diagonal": [   [ 0,-1], 
                    [-1,  0], [1,  0],
                    [ 0, 1],
    ],
    "diagonal": [   [-1, -1], [1, -1],
                    [-1,  1], [1,  1],
    ],
    "both": [   [-1, -1], [ 0,-1], [1, -1],
                [-1,  0], [1,  0],
                [-1,  1], [ 0, 1], [1,  1],
    ],
    "diagonal+": [   
                [1, 0],[-1, 0],[0, 1],[0, -1],
                [1, -1],[-1, -1],[-1, 1],[-1, -1],
                // [2, 0],[-2, 0],[0, 2],[0, -2],
                // [2, -2],[-2, -2],[-2, 2],[-2, -2],
    ],
}

let dirs = [];
let allWalkers = [];
let hue = 0;

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


export const S = new Object();

S["drawSpeed"] = new Setting("drawSpeed", 50);
delete S.drawSpeed.rnd;
S.drawSpeed.slider(10, 500, 50);

S["endRunAt"] = new Setting("endRunAt", 1000);
S.endRunAt.slider(0, 2000, 100);


S["layers"] = new Setting("layers", 1);
S.layers.slider(1, 5, 1, true);

S["offset"] = new Setting("offset", 0);
S.offset.slider(0, 50, 5);


S["type"] = new Setting("type", "square");
S.type.selector(["dot", "square"], true);

S["direction"] = new Setting("direction", "both");
S.direction.selector(Object.keys(directions));

S["stepSize"] = new Setting("stepSize", 1);
S.stepSize.slider(1, 5, 1);

S["size"] = new Setting("size", 5);
S.size.slider(1, 20, 1);

S["sizeMod"] = new Setting("sizeMod", 1, "Size adjustment for each particle");
S.sizeMod.slider(0.5, 2, 0.1);

S["sizeShift"] = new Setting("sizeShift", 0);
S.sizeShift.slider(0, 0.02, 0.001);

S["hueDiffMode"] = new Setting("hueDiffMode", "random", "For more than 1");
S.hueDiffMode.selector(["fixed", "random"], true);

S["hueDiffVal"] = new Setting("hueDiffVal", 0);
S.hueDiffVal.slider(-180, 180, 20);

S["satDiffMode"] = new Setting("satDiffMode", "fixed");
S.satDiffMode.selector(["fixed", "random"]);

S["satDiffVal"] = new Setting("satDiffVal", 0);
S.satDiffVal.slider(-50, 50, 5);

S["lightDiffMode"] = new Setting("lightDiffMode", "fixed");
S.lightDiffMode.selector(["fixed", "random"]);

S["lightDiffVal"] = new Setting("lightDiffVal", 0);
S.lightDiffVal.slider(-50, 50, 5);


S["hueShift"] = new Setting("hueShift", 0);
S.hueShift.slider(0, 10, 1, true);

S["satShift"] = new Setting("satShift", 0);
S.satShift.slider(0, 10, 1);

S["lightShift"] = new Setting("lightShift", 0);
S.lightShift.slider(0, 10, 1);

S["fade"] = new Setting("fade", 0);
S.fade.slider(0, 0.2, 0.02, true);

let offset = 1;

class Square {
    constructor(startx, starty, size, hue, sat, light, type) {
        this.x = startx
        this.y = starty;

        this.size = size/2;
        
        this.mod = S.sizeMod.v; // adjust size 50%-200%
        this.w = this.size*this.mod;
        this.vW = S.sizeShift.v;

        this.step = size;
        this.hue = hue;
        this.sat = sat;
        this.light = light;

        this.type = type;

        this.vx = 0;
        this.vy = 0;

    }
    draw(ctx, dir) {
        if (this.type === "square") {
            ctx.save();
                ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                ctx.fillRect(this.x * this.step - this.w/2,
                            this.y * this.step - this.w/2,
                            this.w, this.w);
                // ctx.fillStyle = `white`;  
                // ctx.fillRect(this.x*this.step-1,
                //             this.y*this.step-1,
                //             2, 2);
            ctx.restore();
        }
        else if (this.type === "dot") {
            ctx.save();
                ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
                ctx.beginPath();
                ctx.arc(this.x*this.step, this.y*this.step, this.w, 0, pie2);
                ctx.fill();

                // ctx.fillStyle = `white`;            
                // ctx.fillRect(this.x*this.step-1,
                //             this.y*this.step-1,
                //             2, 2);
            ctx.restore();
        }
        this.move(dir);
    }
    move(dir) {
        this.vx = dir[0];
        this.vy = dir[1];

        if (this.x <= 0) {
            this.vx = Math.abs(this.vx);
        }
        else if (this.x >= width) {
            this.vx = Math.abs(this.vx) * -1;
        }

        if (this.y <= 0) {
            this.vy = Math.abs(this.vy);
        }
        else if (this.y >= height) {
            this.vy = Math.abs(this.vy) * -1;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (S.hueShift.v > 0) {
            this.hue = (this.hue + S.hueShift.v) % 360;
        }
        if (S.lightShift.v > 0) {
            this.light = (this.light + S.lightShift.v) % 100;
        }
        if (S.satShift.v > 0) {
            this.sat = (this.sat + S.satShift.v) % 100;
        }

        if (this.vW > 0) {this.w += this.vW;}
    }
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

function mirrorDir(dir, multipliers) {
    let newDir = [...dir];
    newDir[0] *= multipliers[0];
    newDir[1] *= multipliers[1];
    return newDir;
}

function init3(hue, sat, light) {

    const num = allWalkers.length;
    allWalkers.push([]);

    width = Math.floor(canvas.width/S.size.v);
    height = Math.floor(canvas.height/S.size.v);

    const width2 = Math.floor(width/2);
    const height2 = Math.floor(height/2);

    if (num > 0) {offset += S.offset.v;}

    /// start in the middle
    allWalkers[num].push(new Square(
        width2-offset, height2-offset, S.size.v, hue, sat, light, S.type.v)); 

    allWalkers[num].push(new Square(
        width2+offset, height2-offset, S.size.v, hue, sat, light, S.type.v)); 

    allWalkers[num].push(new Square(
        width2-offset, height2+offset, S.size.v, hue, sat, light, S.type.v)); 

    allWalkers[num].push(new Square(
        width2+offset, height2+offset, S.size.v, hue, sat, light, S.type.v)); 

    // console.log("", allWalkers)
}

function addDirectionSteps() {
    const newDirs = [];
    for (let i = 2; i <= S.stepSize.v; i++) { 
        dirs.forEach(dir => {
            const d1 = dir[0] * i;
            const d2 = dir[1] * i;
            newDirs.push([d1, d2]);
        })
    }
    dirs = dirs.concat(newDirs);
}

function animate(timeStamp) {
    let deltaTime = timeStamp-lastTime;
    lastTime = timeStamp;

    if (timer > int) {
        console.log("looping", )
        // ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (S.fade.v > 0) {
            ctx.save();
                ctx.fillStyle = `rgba(0, 0, 0, ${S.fade.v})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        for (let i = 0; i < S.drawSpeed.v; i++) { 
            frames++;
            for (let k in allWalkers) {
                moveWalkers(allWalkers[k]);
            }
        }
        // displayIsnfo(`debug: ${debug}`)

        timer = 0;

        if (S.endRunAt.v > 0 && frames >= S.endRunAt.v) {
            loopOn = false; frames = 0;
        }
    } else {timer += deltaTime;}

    if (loopOn) {running = requestAnimationFrame(animate);}
}

function adjustedSat() {
    // set a max to keep it under 100, if offset is incremental
    if (S.satDiffVal.v > 0) {
        const diff = Math.abs(S.layers.v * S.satDiffVal.v);
        const max = Math.floor((100 - diff) / 5);
        return randomise(true, max, 1) * 5;
    }
    // set a min to keep it over 0, if offset is decremental
    else if (S.satDiffVal.v < 0) {
        const diff = Math.abs((S.layers.v-1) * S.satDiffVal.v);
        const min = Math.floor((0 + diff) / 5);
        return randomise(true, 19, min) * 5;
    }
}

function adjustedLight() {
    // set a max to keep it under 100, if offset is incremental
    if (S.lightDiffVal.v > 0) {
        const diff = Math.abs(S.layers.v * S.lightDiffVal.v);
        const max = Math.floor((100 - diff) / 5);
        return randomise(true, max, 1) * 5;
    }
    // set a min to keep it over 0, if offset is decremental
    else if (S.lightDiffVal.v < 0) {
        const diff = Math.abs((S.layers.v-1) * S.lightDiffVal.v);
        const min = Math.floor((0 + diff) / 5);
        return randomise(true, 19, min) * 5;
    }
}

function startOver() {
    clearAll()
    loopOn = true;
    const layers = S.layers.v;
    let hue = randomise(true, 360, 0);
    let sat = 90;
    let light = 60;
    // let sat = randomise(true, 19, 6)*5;
    // let light = randomise(true, 19, 6)*5;

    // ensure the values stay between 0-100 when there are multiple layers, and sat and light are offset, but this can still fail with over 3 layers and large offset values
    if (layers > 1) {
        if (S.satDiffMode.v === "fixed"
        && S.satDiffVal.v !== 0) {
            sat = adjustedSat();
        }
        if (S.lightDiffMode.v === "fixed" 
        && S.lightDiffVal.v !== 0) {
            light = adjustedLight();
        }
    }

    dirs = [...directions[S.direction.v]];
    if (S.stepSize.v > 1) {addDirectionSteps();}

    for (let i = 0; i < layers; i++) { 
        console.log("init hsl", hue, sat, light)
        init3(hue, sat, light);

        if (S.hueDiffMode.v === "random") {
            hue = randomise(true, 72, 0)*5;
        }
        else if (S.hueDiffMode.v === "fixed") {
            hue = (hue + S.hueDiffVal.v) % 360;
        }

        if (S.satDiffMode.v === "random") {
            sat = randomise(true, 20, 6)*5;
        }
        else if (S.satDiffMode.v === "fixed") {
            sat = (sat + S.satDiffVal.v) % 100;
        }

        if (S.lightDiffMode.v === "random") {
            light = randomise(true, 20, 6)*5;
        }
        else if (S.lightDiffMode.v === "fixed") {
            light = (light + S.lightDiffVal.v) % 100;
        }
    }
    animate(0);
}

function clearAll() {
    console.log("cleared", )
    loopOn = false;

    allWalkers = [];
    dirs = [];
    offset = 1;

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


//helper functions
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

