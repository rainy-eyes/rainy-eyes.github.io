
window.addEventListener("load", function() {
    const canvas = this.document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // disable right-click menu
    this.document.body.addEventListener("contextmenu", function(evt){
        evt.preventDefault();
        return false;
    });

    this.window.addEventListener("keydown", function(e) {
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
            case "Tab":
                openSettingsPanel();
                break;
            case "d":
                debug = debug ? false : true;
                break;
        }
    })
    this.window.addEventListener("mousedown", function(e) {
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
    this.window.addEventListener("resize", function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    })

    const checkboxIcons = {true: `&#9745;`, false: `&#9744;`};
    const rndIcons = {true: "&#9883;",false: "&#9744;"};

    let debug = false;
    let looping;
    let gameOn = false;
    const pie2 = Math.PI * 2;
    let fps = 30;
    let int = 1000/fps;
    let timer = 0;
    let lastTime = 0;

    // settings
    class Settings {
        constructor() {
            this.drawCount = {
                "t": "drawCount",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => {return rndTrueFalse(0.75) ?
                    0 : randomise(true, 20, 1);},
                "rndCheck": true,
            };

            this.startHue = {
                "t": "startHue",
                "v": 220,
                "reset": () => {return 220},
                "rndVal": () => {return randomise(true, 360, 1);},
                "rndCheck": true,
            };

            this.startSaturate = {
                "t": "startSaturate",
                "v": 90,
                "reset": () => {return 90},
                "rndVal": () => {return randomise(true, 100, 0);
                },
                "rndCheck": true,
            };

            this.startLight = {
                "t": "startLight",
                "v": 60,
                "reset": () => {return 60},
                "rndVal": () => {return randomise(true, 100, 0);},
                "rndCheck": true,
            };

            this.changeHue = {
                "t": "changeHue",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": true,
            };

            this.changeSat = {
                "t": "changeSat",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": true,
            };

            this.changeLight = {
                "t": "changeLight",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": true,
            };

            this.shapeType = {
                "t": "shapeType",
                "v": "line",
                "reset": () => {return "line"},
                "rndVal": () => { 
                    return rndArryItem(this.shapeType.choices);
                },
                "rndCheck": true,
                "choices": ["line", "circle", "square"],
            };

            this.linesFromCenter = {
                "t": "linesFromCenter",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.2);},
                "rndCheck": true,
            };
            this.shapeSize = {
                "t": "shapeSize",
                "v": 5,
                "reset": () => {return 5},
                "rndVal": () => {
                    return randomise(true, 40, 1)*5;},
                "rndCheck": true,
            };
            this.maxSize = {
                "t": "maxSize",
                "v": 20,
                "reset": () => {return 20},
                "rndVal": () => { return randomise(true, 200, 20);},
                "rndCheck": true,

            };
            this.vSize = {
                "t": "vSize",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) ? 
                0 : (randomise(true, 20, 1) * 1)/10;
                },
                "rndCheck": true,
            };

            this.reverseSize = {
                "t": "reverseSize",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => {return rndTrueFalse(0.3);},
                "rndCheck": true,
            };
        
            this.linesWithinBorders = {
                "t": "linesWithinBorders",
                "v": true,
                "reset": () => {return true},
                "rndVal": () => {return rndTrueFalse(0.75);},
                "rndCheck": true,
            };

            this.radius1 = {
                "t": "radius1",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.5) ? 
                1 : randomise(true, Math.floor(canvas.width/2), 1);
                },
                "rndCheck": true,

            };
            this.radius2 = {
                "t": "radius2",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.5) ? 
                1 : randomise(true, Math.floor(canvas.height/2), 1);
                },
                "rndCheck": true,
            };

            this.vRadius1 = {
                "t": "vRadius1",
                "v": 1,
                "reset": () => {return 1},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,
            };

            this.vRadius2 = {
                "t": "vRadius2",
                "v": -1,
                "reset": () => {return -1},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,
            };

            this.vvRadius1 = {
                "t": "vvRadius1",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,
            };

            this.vvRadius2 = {
                "t": "vvRadius2",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return (randomise(true, 40, -40) * 5)/100;
                },
                "rndCheck": true,
            };
        
            this.vAngle = {
                "t": "vAngle",
                "v": 0.1,
                "reset": () => {return 0.1},
                "rndVal": () => { 
                    return (randomise(true, 100, 5) * 1)/100;
                },
                "rndCheck": true,

            };        // 0.05 - 1 for vAngle
            this.vvAngle = {
                "t": "vvAngle",
                "v":  0.01,
                "reset": () => {return 0.01},
                "rndVal": () => { 
                    return rndTrueFalse(0.3) ? 
                0 : (randomise(true, 10, 1) * 1)/10;
                },
                "rndCheck": true,

            };
            this.vAngleReversePoint = {
                "t": "vAngleReversePoint",
                "v": 1,
                "reset": () => {return 1},
                "rndVal": () => { 
                    return rndTrueFalse(0.75) ? 0 : randomise(true, 5, 1);
                },
                "rndCheck": true,
            };

            this.vAngleReverseChance = {
                "t": "vAngleReverseChance",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.75) ? 
                    0 : (randomise(true, 19, 1) * 5);
                },
                "rndCheck": true,
            };
        
            this.lineWidth = {
                "t": "lineWidth",
                "v": 2,
                "reset": () => {return 2},
                "rndVal": () => { 
                    return rndTrueFalse(0.75) ? 
                randomise(true, 5, 1) : randomise(true, 10, 6);
                },
                "rndCheck": true,
            };

            this.maxLineWidth = {
                "t": "maxLineWidth",
                "v": 5,
                "reset": () => {return 5},
                "rndVal": () => {
                    return randomise(true, 10, 0);
                },
                "rndCheck": true,
            };

            this.vLineWidth = {
                "t": "vLineWidth",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.75) ? 
                0 : (randomise(true, 20, 1) * 1)/10;
                },
                "rndCheck": true,
            };

            this.reverseLineWidth = {
                "t": "reverseLineWidth",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => {return rndTrueFalse(0.3);},
                "rndCheck": true,
            };

            this.opacityShift = {
                "t": "opacityShift",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.25) ? 
                    0 : (randomise(true, 10, 1));
                    },
                "rndCheck": true,
            };

            this.list = [];
        }
        collectSettings() {
            this.list = [];
            let keys = Object.keys(this);
            keys.forEach(key => {
                this.list.push(this[key])
            })
            this.list.pop();
        }
        initialize() {
            initSettings();
            
        }

    }
    const S = new Settings();
    S.collectSettings();
    S.initialize();

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
            this.changeHue = this.S.changeHue;
            this.changeSat = this.S.changeSat;
            this.changeLight = this.S.changeLight;
            this.vSat = 1;
            this.vLight = 1;

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
            this.vAngleReverseChance = this.S.vAngleReverseChance;
            this.vAngleReversePoint = this.S.vAngleReversePoint;

            this.linesFromCenter = this.S.linesFromCenter;
            this.lineWidth = this.S.lineWidth;
            this.vLineWidth = this.S.vLineWidth;
            this.maxLineWidth = this.S.maxLineWidth;
            this.reverseLineWidth = this.S.reverseLineWidth;
            this.linesWithinBorders = this.S.linesWithinBorders;

            this.opacity = 1;
            this.vOpac = this.S.opacityShift/100;

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
            if (this.changeHue) {
                this.hue++;
                if (this.hue > 360) {this.hue -= 360;}
            };
            if (this.changeSat) {
                this.sat += this.vSat;
                if (this.sat >= 100 || this.sat <= 0) {this.vSat *= -1;}
            };
            if (this.changeLight) {
                this.light += this.vLight;
                if (this.light >= 100 || this.light <= 0) {this.vLight *= -1;}
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
                this.vAngle *= -1;
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
            newShape.draw();
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


    // UI and buttons
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
const openBtn = this.document.getElementById("openBtn");
const settingsPanel = this.document.getElementById("cont");

openBtn.addEventListener("click", openSettingsPanel);
function openSettingsPanel() {
    console.log("swtich", )
    const status = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[status]);
}

// fps
const fpsStep = 5;
const fpsDisplay = this.document.querySelector("#fps .display");
const fpsMinus = this.document.querySelector("#fps .minus");
const fpsPlus = this.document.querySelector("#fps .plus");

fpsDisplay.innerText = fps;
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

const linesFromCenterBox = this.document.querySelector("#linesFromCenter .checkbox");
linesFromCenterBox.addEventListener("click", trueFalseSetting);

const reverseSizeBox = this.document.querySelector("#reverseSize .checkbox");
reverseSizeBox.addEventListener("click", trueFalseSetting);

const linesWithinBordersBox = this.document.querySelector("#linesWithinBorders .checkbox");
linesWithinBordersBox.addEventListener("click", trueFalseSetting);

const reverseLineWidthBox = this.document.querySelector("#reverseLineWidth .checkbox");
reverseLineWidthBox.addEventListener("click", trueFalseSetting);

const shapeTypeDisplay = this.document.querySelector("#shapeType");
shapeTypeDisplay.addEventListener("click", function() {
    adjustModes("shapeType");
});



// initialise all settings
function initSettings() {
    S.list.forEach(set => {
        setDisplayAndInput(set.t);
        initCheckbox(set.t);
    })

    displayColor();
}

// inputs
const inputs = this.document.querySelectorAll("input");
inputs.forEach(input => {
    input.addEventListener("input", function(e) {
        const id = e.target.parentElement.id;
        S[id].v = Number(e.target.value);
        setDisplayAndInput(id);
    })
})

function trueFalseSetting(e) {
    const id = e.target.parentElement.id;
    S[id].v = !S[id].v;
    e.target.innerHTML = checkboxIcons[S[id].v];
}


function adjustModes(id) {
    const i = S[id].choices.indexOf(S[id].v);

    if (i+1 < S[id].choices.length) {
        S[id].v = S[id].choices[i+1];
    } else {S[id].v = S[id].choices[0];}

    setDisplayAndInput(id);
}

// reset all
const resetBtn = this.document.getElementById("resetBtn");
resetBtn.addEventListener("click", resetSettings);
function resetSettings() {
    S.list.forEach(set => {
        set.v = set.reset();
        initCheckbox(set.t);
    })
    initSettings();
}

// doubleclick to reset
const displays = this.document.querySelectorAll(".display");
displays.forEach(display => {
    display.addEventListener("dblclick", function() {
        const id = display.parentElement.id;
        S[id].v = S[id].reset();
        setDisplayAndInput(id);
    })
})

// randomise all
const randomiseBtn = this.document.getElementById("randomiseBtn");
randomiseBtn.addEventListener("mousedown", function(e) {
    switch(e.which) {
        case 1:
            randomiseAll();
            break;
        case 3:
            switchRndBoxes();
            break;
    }
});


// randomise all
function randomiseAll() {
    S.list.forEach(set => {
        if (set.rndCheck) {set.v = set.rndVal();}
    })

    initSettings();
    startOver();
}

// randomise each
const rndButtons = this.document.querySelectorAll("#rndbox");
rndButtons.forEach(btn => btn.addEventListener("mousedown", function(e) {
        const id = e.target.parentElement.id;

        // switch randomising
        if (e.which === 3) {
            S[id].rndCheck = !S[id].rndCheck;
            e.target.innerHTML = rndIcons[S[id].rndCheck];
        }
        // randomise
        else if (e.which === 1) {
            randomiseEach(id);
        }
}))

function randomiseEach(id) {
    S[id].v = S[id].rndVal();
    setDisplayAndInput(id);
    initCheckbox(id);
}



function switchRndBoxes() {
    let val = randomiseBtn.getAttribute("value");
    val = val === "true" ? false : true;
    randomiseBtn.setAttribute("value", val);

    rndButtons.forEach(btn => {
        btn.innerHTML = rndIcons[val];
        const id = btn.parentElement.id;
        S[id].rndCheck = val;
    })
}

// randomise random checkboxes
randomiseBtn.addEventListener("dblclick", setRndCheckBoxes);
function setRndCheckBoxes() {
    let count = 0;
    const list = Object.keys(S);
    const rnd = [];

    while (count < 10) {
        const key = rndArryItem(list);
        console.log("key", key)
        list.splice(list.indexOf(key), 1);
        rnd.push(key);

        count++;
    }
    

    S.list.forEach(set => {
        if (rnd.indexOf(set.t) > -1) {set.rndCheck = true;}
        else {set.rndCheck = false;}
        const el = document.querySelector(`#${set.t} #rndbox`);

        if (el !== null) {
            el.innerHTML = `${rndIcons[set.rndCheck]}`;
        }
        if (set.rndCheck) {count++;}
    })
    initSettings(); 

}



function setDisplayAndInput(id) {
    const display = document.querySelector(`#${id} .display`);
    if (display !== null) {
        display.innerText = S[id].v;
    }

    const input = document.querySelector(`#${id} input`);
    if (input !== null) {input.value = S[id].v;}

    if (id === "startHue" ||
        id === "startSaturate" ||
        id === "startLight") {
            displayColor();
        }
    if (id === "changeHue" ||
        id === "changeSat" ||
        id === "changeLight") {
            const checkbox = document.querySelector(`#${id}`);
            checkbox.innerHTML = checkboxIcons[S[id].v];
        }
}


function displayColor() {
    const startHueDisplayColor = this.document.querySelector("#startHue .displaycolor");
    startHueDisplayColor.style.backgroundColor = `hsl(${S.startHue.v}, ${S.startSaturate.v}%, ${S.startLight.v}%)`;
}

// checkboxes
const checkboxes = this.document.querySelectorAll(".checkbox");

function initCheckbox(id) {
    const box1 = document.querySelector(`#${id} .checkbox`);
    const box2 = document.querySelector(`#${id}.checkbox`);

    if (box1 !== null) {
        box1.innerHTML = checkboxIcons[S[id].v];
    }
    else if (box2 !== null) {
        box2.innerHTML = checkboxIcons[S[id].v];
    }


}

checkboxes.forEach(box => {
    box.addEventListener("click", changeCheckbox);
})
function changeCheckbox(e) {
    const id = e.target.id;
    if (id !== "") {
        S[id].v = !S[id].v;
        console.log("e", e.target, id, S[id].v)
    
        const checkbox = document.querySelector(`#${id}`);
        checkbox.innerHTML = checkboxIcons[S[id].v];
    }
}


// helper functions

function randomise(floor, max, min, toFixed) {
    if (floor === true) {
        return Math.floor(Math.random() * max + min);
    } else if (floor === false) {
        return Number((Math.random() * max + min).toFixed(toFixed));
    }
}
function rndTrueFalse(threshold) {
    return Math.random() < threshold ? true : false;
}

function rndArryItem(arr) {
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



                    // take screenshot
const scrshotBtn = this.document.getElementById("screenshot");
scrshotBtn.addEventListener("click", function() {
    takeScreenshot(canvas, settingsPanel);
});


                    // templates
let tabCount = 0;
const tabStartY = 125;
const tabYIncrease = 30;
const tabMaxY = Math.floor(settingsPanel.getBoundingClientRect().height);

const templates = {};
class Template {
    constructor(num, settings, firstAngle) {
        this.num = num;
        this.S = extractSettingsValue(settings);
        this.firstAngle = firstAngle;
    }
}

const saveBtn = this.document.getElementById("saveBtn");
saveBtn.addEventListener("mousedown", function(e) {
    switch (e.which) {
        case 1:
            savePattern();
            break;
        case 3:
            const temps = Object.keys(templates);
            if (temps.length > 0) {
                temps.forEach(temp => {deleteTemplate(temp);})
            }
            break;
    }
})

function savePattern() {
    if (newShape !== false && checkSpace()) {
        createTemplate();
    } else {
        setFullWarning() 
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

    const firstAngle = newShape.firstAngle;
    // const settings = {...newShape.S};
    templates[tabCount] = new Template(tabCount, S, firstAngle);
    templates[tabCount].S = {...newShape.S};

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

    // console.log("templates", templates);
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
    // inject template's settings into the main settings object
    const keys = Object.keys(S);
    keys.forEach(key => {
        S[key].v = templates[num].S[key];
    })
    S.collectSettings();

    const firstAngle = templates[num].firstAngle;
    newShape = new Shape(S, firstAngle);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    gameOn = true;
    newShape.count = 0;

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


                        // download patterns

const downloadBtn = this.document.getElementById("exportBtn");
downloadBtn.addEventListener("mousedown", function(e) {
    switch(e.which) {
        case 1: // download current pattern
            const values = extractSettingsValue(S);
            downloadJSON(values, "pattern");
            break;
        case 3: // download all templates
            downloadJSON(templates, "template");
            break;
    }
})


function downloadJSON(settingsObj, type) {
    const json = JSON.stringify(settingsObj, null, 4);
    const filename = `${type}-settings.json`;

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// import jSON settngs

const importBtn = this.document.getElementById("importBtn");
importBtn.addEventListener("mousedown", function(e) {
    switch(e.which) {
        case 1: // download current pattern
            uploadBtn();
            break;
        case 3: // download all templates

            break;
    }
})

function uploadBtn() {
    console.log("upladbtn", )
    const element = document.createElement("input");
    element.setAttribute("type", "file");
    document.body.appendChild(element);
    element.addEventListener("submit", uploadJSON);
    element.click();
    document.body.removeChild(element);
}

function uploadJSON(e) {
    console.log("btn clicked", )
    e.preventDefault;
}


})