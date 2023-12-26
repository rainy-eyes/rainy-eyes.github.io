import { createMainPanel, createSlider, createSelector, defaultPresets } from "./settingsPanel3.js";

window.addEventListener("load", function() {})
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

// disable right-click menu
document.body.addEventListener("contextmenu", function(e){
    e.preventDefault();
    return false;
});
  
window.addEventListener("resize", function(e) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.lineCap = lineCap;
    screenHalf = canvas.width < canvas.height ? canvas.width/2 : canvas.height/2;
})

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
        case "r":
            randomiseSettings();
            break;
        case "s":
            
            break;
        case "Tab":

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


let settingsPanel = false;

// requires settingsPanel
settingsPanel = createMainPanel();
// settingsPanel = createMainPanel("closed");

// clicking on big randomiser icon starts drawing
if (settingsPanel) {
    document.querySelector("#settingsPanel #randomiseBtn").addEventListener("click", startOver);
}


let timer = 0;
let lastTime = 0;

let loop = false;
let debug = false;
let looping;

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

S["fillCircles"] = new Setting("fillCircles", false);
S.fillCircles.selector([true, false], true);

S["spinners"] = new Setting("spinners", 5);
S.spinners.slider(1, 20, 1);

S["direction"] = new Setting("direction", "random");
S.direction.selector(["random", "same", "alternating"]);

S["spinSpeedType"] = new Setting("spinSpeedType", "random");
S.spinSpeedType.selector(["random", "relative", "equal"]);

S["spinMaxSpeed"] = new Setting("maxSpeed", 0.02);
S.spinMaxSpeed.slider(0.02, 0.2, 0.02);



S["radiusType"] = new Setting("radiusType", "fixed");
S.radiusType.selector(["fixed", "proportional", "random"], true);

S["minRadius"] = new Setting("minRadius", 5);
S.minRadius.slider(1, 50, 5);

S["maxRadius"] = new Setting("maxRadius", Math.floor(screenHalf), "used if radiusType is proportional");
S.maxRadius.slider(50, Math.floor(screenHalf), 10);

S["radiusStep"] = new Setting("radiusStep", 25);
S.radiusStep.slider(5, 60, 5);



S["startHue"] = new Setting("startHue", 220);
S.startHue.slider(0, 360, 5, true);

S["startSat"] = new Setting("startSat", 90);
S.startSat.slider(0, 100, 5);

S["startLight"] = new Setting("startLight", 60);
S.startLight.slider(0, 100, 5);



S["colors"] = new Setting("colorDifference", "equal");
S.colors.selector(["equal", "fixed", "random"], true);

S["hueStep"] = new Setting("hueStep", 0);
S.hueStep.slider(-180, 180, 10);

S["satStep"] = new Setting("satStep", 0);
S.satStep.slider(-5, 5, 5);

S["lightStep"] = new Setting("lightStep", 0);
S.lightStep.slider(-5, 5, 5);


S["hueShift"] = new Setting("hueShift", false);
S.hueShift.selector([true, false], true);

S["satShift"] = new Setting("satShift", false);
S.satShift.selector([true, false]);

S["lightShift"] = new Setting("lightShift", false);
S.lightShift.selector([true, false]);



S["lineCap"] = new Setting("lineCap", "round");
S.lineCap.selector(["round", "square"], true);

S["lineWidth"] = new Setting("lineWidth", 2);
S.lineWidth.slider(1, 20, 1);

S["maxLineWidth"] = new Setting("maxWidth", 4);
S.maxLineWidth.slider(2, 50, 2);

S["lineWidthShift"] = new Setting("widthShift", 0);
S.lineWidthShift.slider(0, 20, 1);

S["shadows"] = new Setting("shadows", false);
S.shadows.selector([true, false], true);

S["opacityShift"] = new Setting("opacityShift", 0);
S.opacityShift.slider(0, 0.2, 0.02);

// global composite operator
const gcoChange = [
    "off", "soure-over", "source-atop", "source-in", "source-out",
    "destination-over", "destination-atop", "destination-in", "destination-out", "lighter", "copy", "xor"
];

S["GCO"] = new Setting("GCO", "off", "global composite operator");
S.GCO.selector(gcoChange);

let shapes = [];

class Circle {
    constructor(settings, canvas, context, hue, sat, light, direction, speed, radius) {
        this.S = settings;
        this.canvas = canvas;
        this.ctx = context;
        this.fillCircles = this.S.fillCircles.v;
        
        // this.x = randomise(true, canvas.width, 0);
        // this.y = randomise(true, canvas.height, 0);
        this.x = this.canvas.width/2;
        this.y = this.canvas.height/2;

        this.startAngle = randomise(true, 360, 0);
        this.angle = pie2;
        
        this.rotation = 0;
        this.direction = direction;
        this.rotationSpeed = speed;
        this.vRotation = this.rotationSpeed * this.direction;
        
        this.spinners = this.S.spinners.v;
        this.segments = randomise(true, 10, 2);
        
        this.rad = radius;

        this.circumference = this.rad * pie2;
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

        if (this.S.hueShift.v) {
            this.hue += this.hueShift;
            if (this.hue >= 360) {this.hue = 0;}
            else if (this.hue <= 0) {this.hue = 360;}
        }
        if (this.S.satShift.v) {
            this.sat += this.satShift;
            if (this.sat >= 100 || this.sat <= 0) {
                this.satShift *= -1;}
        }
        if (this.S.lightShift.v) {
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
    let vSat = S.satStep.v;
    let vLight = S.lightStep.v;

    if (S.shadows.v) {
        ctx.shadowColor = "white";
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.shadowBlur = 2;
    } else {
        ctx.shadowColor = 'rgba(0,0,0,0)';
    }

    let direction = 1;
    let radius = S.minRadius.v;
    let maxSpeed = S.spinMaxSpeed.v;
    let speed = randomise(false, maxSpeed, 0.01, 3);
    
    for (let i = 1; i <= circleNum; i++) {
        
        if (S.radiusType.v === "fixed") {
            radius += S.radiusStep.v;
        }
        else if (S.radiusType.v === "proportional") {
            radius += S.maxRadius.v / circleNum;
        }
        else if (S.radiusType.v === "random") {
            radius = randomise(true, S.maxRadius.v, S.minRadius.v);
        }

        if (S.spinSpeedType.v === "random") {
            speed = randomise(false, maxSpeed, 0.05, 3);
        }
        else if (S.spinSpeedType.v === "equal") {
            speed += 0;
        }
        else {
            speed += (maxSpeed/circleNum);
        }

        if (S.direction.v === "random") {
            direction = rndTrueFalse(0.5) ? 
                direction : direction * -1;
        } else if (S.direction.v === "alternating") {
            direction *= -1;
        }

        if (S.colors.v === "random") {
            hue = randomise(true, 360, 0);
            sat = randomise(true, 100, 0);
            light = randomise(true, 100, 0);
        } 
        else if (S.colors.v === "fixed") {
            hue = (hue + S.hueStep.v) % 360;

            sat += vSat;
            if (sat >= 100 || sat <= 0) {vSat *= -1}
            
            light += vLight;
            if (light >= 100 || light <= 0) {vLight *= -1}
        }

        shapes.push(new Circle(S, canvas, ctx, hue, sat, light, direction, speed, radius));
    }
}

function startOver() {
    clearAll();
    int = 1000/S.fps.v;
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

function pauseStart() {
    if (loop) {
        loop = false;
        cancelAnimationFrame(looping);
    } else {
        loop = true;
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


