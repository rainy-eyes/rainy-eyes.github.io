
window.addEventListener("load", function() {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

// disable right-click menu
this.document.body.addEventListener("contextmenu", function(e){
    e.preventDefault();
    return false;
});
  
window.addEventListener("resize", function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = lineCap;
    screenHalf = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;
})

function pauseStart() {
    if (loop) {
        loop = false;
        this.cancelAnimationFrame(looping);
    } else {
        loop = true;
        animate(0);
    }
}

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
            
            break;
        case "Tab":
            openPanel();
            break;
    }
})

// })

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

const checkboxIcons = {true: "&#9745;", false: "&#9744;"}
const rndIcons = {true: "&#9883;", false: "&#9744;"};

let fps = 30;
let int = 1000/fps;
let timer = 0;
let lastTime = 0;

let loop = false;
let debug = false;
let looping;

let screenHalf = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;

class Settings {
    constructor() {
        this.spinners = {
            "t": "spinners",
            "v": 5,
            "reset":() => {return 5},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": true,
        }
        this.fillCircles = {
            "t": "fillCircles",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.25);},
            "rndCheck": false,
        }
        this.rotationType = {
            "t": "rotationType",
            "v": "random",
            "reset":() => {return "random"},
            "rndVal": () => {return randomArrayItem(this.rotationType.choices)},
            "rndCheck": true,
            "choices": ["random", "relative"],
        }
        this.rotationMaxSpeed = {
            "t": "rotationMaxSpeed",
            "v": 0.01,
            "reset":() => {return 0.01},
            "rndVal": () => {return randomise(true, 20, 1)/100;},
            "rndCheck": true,
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

        this.radiusType = {
            "t": "radiusType",
            "v": "setValue",
            "reset":() => {return "setValue"},
            "rndVal": () => {return randomArrayItem(this.radiusType.choices)},
            "rndCheck": true,
            "choices": ["setValue", "proportional", "random"],
        }

        this.minRadius = {
            "t": "minRadius",
            "v": 5,
            "reset":() => {return 5},
            "rndVal": () => {return randomise(true, 10, 1)*5;},
            "rndCheck": false,
        }

        this.maxRadius = {
            "t": "maxRadius",
            "v": screenHalf,
            "reset":() => {return screenHalf},
            "rndVal": () => {return (randomise(true, screenHalf/5, 10) * 5);},
            "rndCheck": false,
        }

        this.radiusStep = {
            "t": "radiusStep",
            "v": 25,
            "reset":() => {return 25},
            "rndVal": () => {return randomise(true, 60, 15);},
            "rndCheck": true,
        }

        this.lineCap = {
            "t": "lineCap",
            "v": "round",
            "reset":() => {return "round"},
            "rndVal": () => {return randomArrayItem(this.lineCap.choices)},
            "rndCheck": false,
            "choices": ["round", "square"],
        }
        this.lineWidth = {
            "t": "lineWidth",
            "v": 2,
            "reset":() => {return 2},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": true,
        }
        this.maxLineWidth = {
            "t": "maxLineWidth",
            "v": 10,
            "reset":() => {return 10},
            "rndVal": () => {return randomise(true, 50, 1);},
            "rndCheck": true,
        }
        this.lineWidthShift = {
            "t": "lineWidthShift",
            "v": 0,
            "reset":() => {return 0},
            "rndVal": () => {return randomise(true, 20, 1);},
            "rndCheck": false,
        }
        
        this.shadows = {
            "t": "shadows",
            "v": false,
            "reset":() => {return false},
            "rndVal": () => {return rndTrueFalse(0.1)},
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
// S.initialize();

let shapes = [];

class Circle {
    constructor(settings, canvas, context, hue, sat, light, speed, radius) {
        this.S = settings;
        this.canvas = canvas;
        this.ctx = context;
        this.fillCircles = this.S.fillCircles.v;
        
        // this.x = randomise(true, canvas.width, 0);
        // this.y = randomise(true, canvas.height, 0);;
        this.x = this.canvas.width/2;
        this.y = this.canvas.height/2;

        this.startAngle = randomise(true, 360, 0);
        this.angle = Math.PI*2;
        
        this.rotation = 0;
        this.rotationSpeed = speed;
        this.vRotation = this.rotationSpeed;
        
        this.spinners = this.S.spinners.v;
        this.segments = randomise(true, 10, 2);
        
        // this.rad = randomise(true, maxRadius, minRadius);
        this.rad = radius;

        this.circumference = 2 * this.rad * Math.PI;
        this.dashLength = randomise(true, ((360/this.segments)-30), 10);
        if (this.dashLength < 0) {this.dashLength = 1;}
        this.dashGap = this.circumference/this.segments - this.dashLength;
        // this.vDash = Number(((this.rad/this.segments)/15).toFixed(2));
        this.vDash = randomise(true, 10, 1)/10;
        // this.vDash = randomise(true, (1+(this.rad/10)), 1)/10;

        // this.vDash *= (1+(this.rad/100));
        // this.vDash = Number((this.vDash).toFixed(2));
        // console.log("vdash rad", this.vDash, this.rad)

        this.hue = hue;
        this.sat = sat;
        this.light = light;
        
        // this.hueShift = rndTrueFalse(0.5) ? 1 : -1;
        // this.satShift = rndTrueFalse(0.5) ? 1 : -1;
        // this.lightShift = rndTrueFalse(0.5) ? 1 : -1;

        this.hueShift = randomise(true, 10, 1);
        this.hueShift = rndTrueFalse(0.5) ? 
            this.hueShift/10 : this.hueShift/-10;

        this.satShift = randomise(true, 10, 1);
        this.satShift = rndTrueFalse(0.5) ? 
            this.satShift/10 : this.satShift/-10;

        this.lightShift = randomise(true, 10, 1);
        this.lightShift = rndTrueFalse(0.5) ? 
            this.lightShift/10 : this.lightShift/-10;
        
        this.minLineWidth = this.S.lineWidth.v;
        this.lineWidth = randomise(true, this.S.maxLineWidth.v, S.lineWidth.v);
        this.maxLineWidth = this.S.maxLineWidth.v;
        this.lineWidthShift = S.lineWidthShift.v;
        this.lineCap = this.S.lineCap.v;
        this.vWidth = randomise(true, this.lineWidthShift, 1)/10;

        this.opacityShift = this.S.opacityShift.v;
        this.opacity = 1;
        this.vOpac = randomise(false, this.opacityShift, 0, 2);
    }
    draw() {
        this.ctx.save();
            this.ctx.lineCap = this.lineCap;
            this.ctx.lineWidth = this.lineWidth;
            this.ctx.strokeStyle = `hsl(${this.hue}, ${this.sat}%, ${this.light}%)`;
            this.ctx.globalAlpha = this.opacity;            

            this.ctx.translate(this.x, this.y);
            this.ctx.rotate(this.rotation);

            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.rad, this.startAngle, this.startAngle + this.angle);
            this.ctx.closePath();

            this.ctx.setLineDash([this.dashLength, this.circumference/this.segments-this.dashLength])

            this.ctx.stroke();

        this.ctx.restore();

    }
    update() {
        this.rotation += this.vRotation;

        if (this.fillCircles) {
            if (this.dashLength > this.circumference/this.segments || this.dashLength < Math.abs(this.vDash)) {
                this.vDash *= -1;
            }
            this.dashLength += this.vDash;
            this.dashGap = this.circumference/this.segments-this.dashLength;
            if (this.dashLength < 0) {this.dashLength = 1;}
        }

        if (this.S.changeHue.v) {
            this.hue += this.hueShift;
            if (this.hue >= 360) {this.hue = 0;}
            else if (this.hue <= 0) {this.hue = 360;}
        }
        if (this.S.changeSat.v) {
            this.sat += this.satShift;
            if (this.sat >= 100 || this.sat <= 0) {
                this.satShift *= -1;}
        }
        if (this.S.changeLight.v) {
            this.light += this.lightShift;
            if (this.light >= 100 || this.light <= 0) {
                this.lightShift *= -1;}
        }

        if (this.lineWidthShift > 0) {
            this.lineWidth += this.vWidth;
    
            if (this.lineWidth <= this.minLineWidth || 
                this.lineWidth >= this.maxLineWidth) {
                this.vWidth *= -1;
            }
        }
        if (this.opacityShift > 0) {
            this.opacity -= this.vOpac;
    
            if (this.opacity <= this.vOpac || 
                this.opacity >= 1) {
                this.vOpac *= -1;
            }
        }
    }
}

function animate(timeStamp) {
    let deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    
    if (timer > int) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        shapes.forEach((circle) => {
            console.log("looping", )
            circle.draw();
            circle.update();
        });
        timer = 0;
    } else {timer += deltaTime;}

    if (loop) {
        looping = requestAnimationFrame(animate);
    } else { return }
}

function generatePattern() {
    const circleNum = S.spinners.v;

    let hue = 0;
    let sat = 0;
    let light = 0;

    if (S.colors.v === "random") {
        hue = randomise(true, 360, 0);
        sat = randomise(true, 100, 0);
        light = randomise(true, 100, 0);
    } else { 
        hue = S.startHue.v;
        sat = S.startSat.v;
        light = S.startLight.v;
    }

    if (S.shadows.v) {
        ctx.shadowColor = "white";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
    } else {
        ctx.shadowColor = 'rgba(0,0,0,0)';
    }

    let radius = S.minRadius.v;
    let maxSpeed = S.rotationMaxSpeed.v;
    let speed = 0;
    
    for (let i = 1; i <= circleNum; i++) {
        
        if (S.radiusType.v === "setValue") {
            radius += S.radiusStep.v;
        }
        else if (S.radiusType.v === "proportional") {
            radius += S.maxRadius.v / circleNum;
        }
        else if (S.radiusType.v === "random") {
            radius = randomise(true, S.maxRadius.v, S.minRadius.v);
        }

        if (S.rotationType.v === "random") {
            speed = randomise(false, maxSpeed, 0.05, 3);
            speed = Math.random() < 0.5 ? speed : speed * -1;
        } else {
            speed += (maxSpeed/circleNum);
            speed = Math.random() < 0.5 ? speed : speed * -1;
        }

        if (S.colors.v === "random") {
            hue = randomise(true, 360, 0);
            sat = randomise(true, 100, 0);
            light = randomise(true, 100, 0);
        } else if (S.colors.v === "setValue") {
            hue += S.colorStep.v;
        }

        shapes.push(new Circle(S, canvas, ctx, hue, sat, light, speed, radius));
    }
}

function startOver() {
    clearAll();
    loop = true;
    generatePattern();

    animate(0);
}

function clearAll() {
    cancelAnimationFrame(looping);
    loop = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes = [];

}


// settings panel
const settingsPanel = this.document.getElementById("cont");
const openBtn = this.document.getElementById("openBtn");

const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
openBtn.addEventListener("click", openPanel);

function openPanel() {
    const val = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[val]);
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
//


//
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
        console.log("id", id, S[id].v)

        e.target.innerHTML = checkboxIcons[S[id].v];

        if (id.includes("change")) {
            S[id].rndCheck = S[id].v;
        }
    })
})


// global composite operator
const gcoChange = [
    "off", "soure-over", "source-atop", "source-in", "source-out",
    "destination-over", "destination-atop", "destination-in", "destination-out", "lighter", "copy", "xor"
];


function initSettings() {
    fps_display.innerText = fps;
    int = 1000/fps;

    S.list.forEach(set => {setDisplayAndInput(set.t);})
}
initSettings();

function setDisplayAndInput(id) {
    const display = document.querySelector(`#${id} .display`);
    const input = document.querySelector(`#${id} input`);
    const checkbox = document.querySelector(`#${id}.checkbox`);

    if (display !== null) {display.innerText = S[id].v;}
    if (input !== null) {input.value = S[id].v;}
    if (checkbox !== null) {
        checkbox.innerHTML = checkboxIcons[S[id].v];
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
    shapes = [...templates[num].allShapes];

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


// take screenshot - doesn't work
const screenshotBtn = this.document.getElementById("screenshot");
screenshotBtn.addEventListener("click", function() {
    takeScreenshot(canvas, settingsPanel);
})


// save as json
const exportBtn = this.document.getElementById("exportBtn");
exportBtn.addEventListener("click", function() {
    downloadJSON();
})
function downloadJSON() {
    const json = JSON.stringify(shapes);
    const filename = 'pattern-settings.json';

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

})

