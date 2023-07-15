
window.addEventListener("load", function() {
const canvas = this.document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

this.window.addEventListener("keydown", function(e) {
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
this.window.addEventListener("mousedown", function(e) {
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
this.document.body.addEventListener("contextmenu", function(evt){
    evt.preventDefault();
    return false;
});

this.window.addEventListener("resize", function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    screenHalf = canvas.width < canvas.height ?
    canvas.width/2 : canvas.height/2;


})

let debug = false;
let looping;
let gameOn = false;
let fps = 30;
let int = 1000/fps;
let timer = 0;
let lastTime = 0;

const pie2 = Math.PI*2;

const checkboxChange = {true: "&#9745;", false: "&#9744;"}
const rndIcons = {true: "&#9883;", false: "&#9744;"};

ctx.fillStyle = "red";
ctx.font = "16px Arial";

let shapes = [];
let screenHalf = canvas.width <= canvas.height ?
    canvas.width/2 : canvas.height/2;

class Settings {
    constructor() {
        this.layout = {
            "t": "layout",
            "v": "circular",
            "reset":() => {return "circular"},
            "rndVal": () => {return randomArrayItem(this.layout.choices)},
            "rndCheck": true,
            "choices": ["circular", "hexagonal"],
        };

        this.side = {
            "t": "side",
            "v": 5,
            "reset":() => {return 5},
            "rndVal": () => {return randomise(true, 10, 3);},
            "rndCheck": true,
        };
        this.maxSide = {
            "t": "maxSide",
            "v": 5,
            "reset":() => {return 5},
            "rndVal": () => {return randomise(true, 10, 3);},
            "rndCheck": true,
        };
        this.fit = {
            "t": "fit",
            "v": "to screen",
            "reset":() => {return "to screen"},
            "rndVal": () => {
                return randomArrayItem(this.fit.choices)},
            "rndCheck": false,
            "choices": ["to screen", "setValue"],
        };
        this.fitValue = {
            "t": "fitValue",
            "v": 20,
            "reset":() => {return 20},
            "rndVal": () => {return randomise(true, 10, 2)*5;},
            "rndCheck": false,
        };
        //
        this.colorDifferenceMode = {
            "t": "colorDifferenceMode",
            "v": "setValue",
            "reset": () => {return "setValue"},
            "rndVal": () => { return randomArrayItem(this.colorDifferenceMode["choices"])},
            "rndCheck": false,
            "choices": ["setValue", "proportional", "random"]
        };

        this.colorDifference = {
            "t": "colorDifference",
            "v": 0,
            "reset": () => {return 0},
            "rndVal": () => {return randomise(true, 36, 0)*5;},
            "rndCheck": false,
        };

        this.startHue = {
            "t": "startHue",
            "v": 220,
            "reset": () => {return 220},
            "rndVal": () => { return randomise(true, 360, 1, 0);},
            "rndCheck": true,
        };

        this.startSaturate = {
            "t": "startSaturate",
            "v": 90,
            "reset": () => {return 90},
            "rndVal": () => {return randomise(true, 100, 0);},
            "rndCheck": false,
        };

        this.startLight = {
            "t": "startLight",
            "v": 60,
            "reset": () => {return 60},
            "rndVal": () => {return randomise(true, 100, 0);},
            "rndCheck": false,
        };

        this.changeHue = {
            "t": "changeHue",
            "v": false,
            "reset": () => {return false},
            "rndVal": () => {return rndTrueFalse(0.25);},
            "rndCheck": false,
        };

        this.changeSat = {
            "t": "changeSat",
            "v": false,
            "reset": () => {return false},
            "rndVal": () => {return rndTrueFalse(0.25);},
            "rndCheck": false,
        };

        this.changeLight = {
            "t": "changeLight",
            "v": false,
            "reset": () => {return false},
            "rndVal": () => {return rndTrueFalse(0.25);},
            "rndCheck": false,
        };
        //
        this.sizeChange = {
            "t": "sizeChange",
            "v": "expand/reverse",
            "reset":() => {return "expand/reverse"},
            "rndVal": () => {return randomArrayItem(this.sizeChange.choices)},
            "rndCheck": false,
            "choices": ["expand/reverse", "fade/reset", "static"],
        };
        this.startSize = {
            "t": "startSize",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return randomise(true, 10, 0)*10;},
            "rndCheck": false,
        };
        this.maxSize = {
            "t": "maxSize",
            "v": 200,
            "reset":() => {return 200},
            "rndVal": () => {return randomise(true, 20, 0)*10;},
            "rndCheck": false,
        };
        this.expansionSpeed = {
            "t": "expansionSpeed",
            "v": 20,
            "reset":() => {return 20},
            "rndVal": () => {return randomise(true, 10, 2)*5;},
            "rndCheck": true,
        };
        //
        this.shapeSides = {
            "t": "shapeSides",
            "v": 1,
            "reset":() => {return 1},
            "rndVal": () => {return randomise(true, 8, 1)},
            "rndCheck": true,
        };
        this.rotationSpeed = {
            "t": "rotationSpeed",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return rndTrueFalse(0.75) ?
                0 : randomise(true, 10, 1);},
            "rndCheck": true,
        };
        //
        this.lineWidth = {
            "t": "lineWidth",
            "v": 1,
            "reset":() => {return 1},
            "rndVal": () => {return rndTrueFalse(0.75) ?
                1 : randomise(true, 10, 2);},
            "rndCheck": true,
        };
        this.maxLineWidth = {
            "t": "maxLineWidth",
            "v": 1,
            "reset":() => {return 1},
            "rndVal": () => {return randomise(true, 20, 2);},
            "rndCheck": false,
        };
        this.lineShift = {
            "t": "lineShift",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return rndTrueFalse(0.75) ?
                0 : randomise(true, 10, 1);},
            "rndCheck": false,
        };
        //
        this.opacityShift = {
            "t": "opacityShift",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return rndTrueFalse(0.75) ?
                0 : randomise(true, 10, 1)},
            "rndCheck": false,
        };

        this.list = [];
    }
    collectSettings() {
        let keys = Object.keys(this);
        keys.forEach(key => {
            this.list.push(this[key])
        })
        this.list.pop();
    }
    initialize() {
        initSettings();
        presetRndBoxes();
    }
}

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



    
// UI and buttons
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
const openBtn = this.document.getElementById("openBtn");
const settingsPanel = this.document.getElementById("cont");

openBtn.addEventListener("click", openClosePanel)

function openClosePanel() {
    let status = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[status]);
}

const colorDisplay = document.getElementById("displaycolor");

// fps
const fpsStep = 5;
const fpsDisplay = this.document.querySelector("#fps .display");
const fpsMinus = this.document.querySelector("#fps .minus");
const fpsPlus = this.document.querySelector("#fps .plus");

fpsMinus.addEventListener("click", function() {
    if (fps > 0) {
        fps -= fpsStep;
        int = 1000/fps;
        fpsDisplay.innerText = fps;
    }
})
fpsPlus.addEventListener("click", function() {
    if (fps < 60) {
        fps += fpsStep;
        int = 1000/fps;
        fpsDisplay.innerText = fps;
    }
})

// layout;
const layoutDisplay = this.document.querySelector("#layout .display");
layoutDisplay.addEventListener("click", function() {
    adjustModes("layout");
})
//

// colorDifferenceMode;
const colorDifferenceModeDisplay = this.document.querySelector("#colorDifferenceMode .display");
colorDifferenceModeDisplay.addEventListener("click", function() {
    adjustModes("colorDifferenceMode");
})
//

// sizeChange;
const sizeChangeDisplay = this.document.querySelector("#sizeChange .display");
sizeChangeDisplay.addEventListener("click", function() {
    adjustModes("sizeChange");
})
//

// fit;
const fitDisplay = this.document.querySelector("#fit .display");
fitDisplay.addEventListener("click", function() {
    adjustModes("fit");
})
//


function adjustModes(id) {
    const i = S[id].choices.indexOf(S[id].v);

    if (i+1 < S[id].choices.length) {
        S[id].v = S[id].choices[i+1];
    } else {S[id].v = S[id].choices[0];}
    setDisplayAndInput(id);
}

const allInput = this.document.querySelectorAll("#cont input");
allInput.forEach(input => {
    input.addEventListener("input", function(e) {
    adjustInput(e);})
})

function adjustInput(e) {
    const id = e.target.parentElement.id;
    S[id].v = Number(e.target.value);
    e.target.parentElement.querySelector(".display").innerText = S[id].v;

    setColorDisplay(id);
}

const checkboxes = this.document.querySelectorAll(".checkbox");
checkboxes.forEach(box => {
    box.addEventListener("click", function(e) {
        checkBoxSwitch(box);
    })
})


function checkBoxSwitch(box) {
    const id = box.id;
    S[id].v = !S[id].v;
    console.log("S[id].v", id, S[id].v)
    box.innerHTML = checkboxChange[S[id].v];
}


function setColorDisplay(id) {
    if (id === "startHue" || 
        id === "startSaturate" || 
        id === "startLight"  ) {
        colorDisplay.style.backgroundColor = `hsl(${S.startHue.v}, ${S.startSaturate.v}%, ${S.startLight.v}%)`;
    }
}

const clrCheckBoxes = this.document.querySelectorAll(".checkbox");
clrCheckBoxes.forEach(box => {
    box.addEventListener("click", function(e) {
        const id = e.target.id;
        S[id].rndCheck = !S[id].rndCheck;
        e.target.innerHTML = checkboxChange[S[id].rndCheck];
    })
})

// initialise all settings
function initSettings() {
    fpsDisplay.innerText = fps;
    S.list.forEach(set => {setDisplayAndInput(set.t);})
}

function setDisplayAndInput(id) {
    const display = document.querySelector(`#${id} .display`);
    const input = document.querySelector(`#${id} input`);
    if (display !== null) {display.innerText = S[id].v;}
    if (input !== null) {input.value = S[id].v;}
    setColorDisplay(id);
}

// reset all
const resetBtn = this.document.getElementById("resetBtn");
resetBtn.addEventListener("click", resetSettings);
function resetSettings() {
    S.list.forEach(set => {
        set.v = set.reset();
    })
    initSettings();
}

const displays = this.document.querySelectorAll(".display");
displays.forEach(display => {
    display.addEventListener("dblclick", function(e) {
        const id = e.target.parentElement.id;
        S[id].v = S[id].reset();
        setDisplayAndInput(id);
    })
})

// randomise all
const randomiseBtn = this.document.getElementById("randomiseBtn");
randomiseBtn.addEventListener("mousedown", function(e) {
    switch (e.which) {
        case 1:
            randomiseParameters();
            break;
        case 3:
            setRndChecks();
            break;
    }
});

function randomiseParameters() {
    S.list.forEach(set => {
        if (set.rndCheck) {
            set.v = set.rndVal();
            // console.log("set.v", set.v)
        }
    })
    initSettings();
    startOver();
}
function setRndChecks() {
    const value = randomiseBtn.getAttribute("value") === "true" ? false : true;
    randomiseBtn.setAttribute("value", value);

    S.list.forEach(set => {
        set.rndCheck = value;
        const el = document.querySelector(`#${set.t} #rndbox`);
        // console.log("", set.t, el)
        if (el !== null) {
            el.innerHTML = `${rndIcons[set.rndCheck]}`;
        }
    })
    initSettings();
}

randomiseBtn.addEventListener("dblclick", setRndCheckBoxes);
function setRndCheckBoxes() {
    let count = 1;

    S.list.forEach(set => {
        if (count < 6) {set.rndCheck = rndTrueFalse(0.25);}
        else {set.rndCheck = false;}
        const el = document.querySelector(`#${set.t} #rndbox`);

        if (el !== null) {
            el.innerHTML = `${rndIcons[set.rndCheck]}`;
        }
        if (set.rndCheck) {count++;}
    })
    initSettings(); 
}




// randomise each
const rndButtons = this.document.querySelectorAll("#rndbox");
rndButtons.forEach(btn => btn.addEventListener("mousedown", function(e) {
    const id = e.target.parentElement.id;
    switch(e.which) {
        case 1: 
            S[id].v = S[id].rndVal();
            setDisplayAndInput(id);
            break;

        case 3:
            S[id].rndCheck = !S[id].rndCheck;
            e.target.innerHTML = `${rndIcons[S[id].rndCheck]}`;
            break;
    }
}))

function presetRndBoxes() {
    rndButtons.forEach(btn => {
        const id = btn.parentElement.id;
        btn.innerHTML = rndIcons[S[id].rndCheck];
    })
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
    if (shapes.length > 0 && checkSpace()) {
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
    templates[tabCount] = new Template(tabCount, shapes);
    console.log("--new", templates[tabCount])

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
    shapes = [];
    shapes = [...templates[num].allShapes];

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOn = true;
    shapes.forEach(shape => {
        shape.drawIt = true;
        shape.count = 0;
    })
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

const S = new Settings();
S.collectSettings();
S.initialize();


// take screenshot
const scrshotBtn = this.document.getElementById("screenshot");
scrshotBtn.addEventListener("click", function() {
    takeScreenshot(canvas, settingsPanel);
});


})