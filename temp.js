
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
                clearAll()
                break;
            case "d":
                debug = debug ? false : true;
                break;
            case "r":
                repeat();
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
        fitMaxSize = canvas.width < canvas.height ?
        canvas.width/2 : canvas.height/2;
    })
    const colorDisplay = document.getElementById("displaycolor");
    
    let debug = false;
    let looping;
    let gameOn = false;
    const pie2 = Math.PI * 2;
    let fps = 30;
    let int = 1000/fps;
    let timer = 0;
    let lastTime = 0;
    let fitMaxSize = canvas.width < canvas.height ?
        canvas.width/2 : canvas.height/2;

    const checkboxChange = {true: "&#9745;", false: "&#9744;"}
    const rndIcons = {true: "&#9883;", false: "&#9744;"};

    // const shapesTypeChange = ["line", "circle", "ellipses", "square", "nShape", "line"];

    // settings
    class Settings {
        constructor() {
            this.clearCanvas = {
                "t": "clearCanvas",
                "v": false,
                "reset":() => {return false},
                "rndVal": () => {return false},
                "rndCheck": false,
            };
            this.drawCount = {
                "t": "drawCount",
                "v": 1,
                "reset":() => {return 1},
                "rndVal": () => {return rndTrueFalse(0.2) ? 0 : rndTrueFalse(0.7) ? 1 : randomise(true, 10, 2);},
                "rndCheck": true,
            };
            this.layers = {
                "t": "layers",
                "v": 1,
                "reset":() => {return 3},
                "rndVal": () => {return randomise(true, 10, 1);},
                "rndCheck": true,
            };
            this.colorShift = {
                "t": "colorShift",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => {return rndTrueFalse(0.5);},
                "rndCheck": true,
            };

            this.colorDifferenceMode = {
                "t": "colorDifferenceMode",
                "v": "random",
                "reset": () => {return "setvalue"},
                "rndVal": () => { return randomArrayItem(this.colorDifferenceMode["choices"])},
                "rndCheck": true,
                "choices": ["setvalue", "proportional", "random"]
            };

            this.colorDifference = {
                "t": "colorDifference",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => {return randomise(true, 350, 0);},
                "rndCheck": true,
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
                "rndVal": () => {return randomise(true, 100, 0);
                },
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
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": false,
            };

            this.changeSat = {
                "t": "changeSat",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": false,
            };

            this.changeLight = {
                "t": "changeLight",
                "v": false,
                "reset": () => {return false},
                "rndVal": () => { return rndTrueFalse(0.25);},
                "rndCheck": false,
            };

            this.shapeType = {
                "t": "shapeType",
                "v": "line",
                "reset":() => {return "line"},
                "rndVal": () => { 
                    return randomArrayItem(this.shapeType.choices);
                },
                "rndCheck": true,
                "choices": ["line", "circle", "n-Shape"],
            };

            this.shapeSides = {
                "t": "shapeSides",
                "v": 4,
                "reset": () => {return 3},
                "rndVal": () => { 
                    return randomise(true, 6, 3);
                },
                "rndCheck": true,
            };
            this.shapeSize = {
                "t": "shapeSize",
                "v": 5,
                "reset": () => {return 5},
                "rndVal": () => { 
                    return (randomise(true, 50, 1));
                },
                "rndCheck": true,
            };

            this.vAngle = {
                "t": "vAngle",
                "v": 30,
                "reset": () => {return 30},
                "rndVal": () => { 
                    return (randomise(true, 30, 2) * 1);
                },
                "rndCheck": true,
            };

            this.vAngleOffset = {
                "t": "vAngleOffset",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.5) ? 
                    0 : (randomise(true, 20, 1) * 5)/100;
                },
                "rndCheck": false,
            };
            this.ellipseVal = {
                "t": "ellipseVal",
                "v": 0,
                "reset": () => {return 0},
                "rndVal": () => { 
                    return rndTrueFalse(0.5) ?
                    0 : (randomise(true, 95, 5) * 1)/100;
                },
                "rndCheck": false,
            };

            this.lineCap = {
                "t": "lineCap",
                "v": "round",
                "reset": () => {return "round"},
                "rndVal": () => {return rndTrueFalse(0.5) ? "round" : "square"},
                "rndCheck": true,
                "choices": ["round", "square"],
            };
            this.maxLineWidth = {
                "t": "maxLineWidth",
                "v": 10,
                "reset": () => {return 10},
                "rndVal": () => {return randomise(true, 20, 5)},
                "rndCheck": true,
            };

            this.lineWidth = {
                "t": "lineWidth",
                "v": 5,
                "reset":() => {return 5},
                "rndVal": () => {return randomise(true, 20, 1)},
                "rndCheck": true,
            };

            this.lineShiftRepeat = {
                "t": "lineShiftRepeat",
                "v": 0,
                "reset":() => {return 0},
                "rndVal": () => {return rndTrueFalse(0.5) ?
                    0 : randomise(true, 10, 1)},
                "rndCheck": false,
            };

            this.shiftRadiusType = {
                "t": "shiftRadiusType",
                "v": "rounded",
                "reset":() => {return "rounded"},
                "rndVal": () => {return rndTrueFalse(0.5) ? 'rounded' : 'jagged'},
                "rndCheck": false,
                "choices": ["rounded", "jagged"]
            };
            this.shiftRadRepeat = {
                "t": "shiftRadRepeat",
                "v": 0,
                "reset":() => {return 0},
                "rndVal": () => {return rndTrueFalse(0.5) ?
                    0 : randomise(true, 10, 1)},
                "rndCheck": false,
            };
            this.shiftRadMax = {
                "t": "shiftRadMax",
                "v": 50,
                "reset":() => {return 50},
                "rndVal": () => {return randomise(true, 100, 0)},
                "rndCheck": true,
            };

            this.opacityShift = {
                "t": "opacityShift",
                "v": 0,
                "reset":() => {return 0},
                "rndVal": () => {return rndTrueFalse(0.25) ?
                    0 : randomise(true, 100, 1)/100},
                "rndCheck": true,
            };
            this.drawLinesFromCenter = {
                "t": "drawLinesFromCenter",
                "v": false,
                "reset":() => {return false},
                "rndVal": () => {return rndTrueFalse(0.2)},
                "rndCheck": true,
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
        }

    }
    const S = new Settings();
    S.collectSettings();
    S.initialize();
    

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

            // console.log("steps", num, this.steps, this.S.vAngle.v)
            // console.log("steps", this.steps)

            this.colorShift = this.S.colorShift.v;
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
            this.shiftRad = this.S.shiftRadMax.v;
            this.shiftRadRepeat = this.S.shiftRadRepeat.v;
            this.radStep = this.shiftRad/((this.steps/this.shiftRadRepeat)/2);
            this.shiftRadStep1 = this.radStep;
            this.shiftRadStep2 = this.radStep;
                        
            this.maxRad1 = this.rad1 + this.shiftRad;
            this.minRad1 = this.rad1;
            this.maxRad2 = this.rad2 + this.shiftRad;
            this.minRad2 = this.rad2;
            
            this.shapeSize = this.S.shapeSize.v;
            this.vSize = 0.1;

            

            this.lineCap = this.S.lineCap.v;
            this.lineWidth = this.S.lineWidth.v;
            this.minLineWidth = this.lineWidth;
            this.maxLineWidth = this.lineWidth + this.S.maxLineWidth.v;
            this.lineShiftRepeat = this.S.lineShiftRepeat.v;

            this.vLineWidth = this.S.maxLineWidth.v/(((this.steps) / this.lineShiftRepeat)/2);
            this.vLineWidth = Number(this.vLineWidth.toFixed(3));

            console.log("steps, repeat, v", this.steps, this.lineShiftRepeat, this.vLineWidth);

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
                        
                        if (this.S.shapeSides.v === 4) {
                            ctx.strokeRect(0-this.shapeSize/2, 0-this.shapeSize/2, this.shapeSize, this.shapeSize);
                        } else {
                            this.drawShape(0, 0, this.shapeSize, this.S.shapeSides.v);
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
            if (this.colorShift) {
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
            }

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
                else {
                    // if (this.count === 2) {
                    //     console.log("count", this.count);
                    //     this.rad1 -= this.shiftRadStep1/2;
                    //     this.rad2 -= this.shiftRadStep2/2;
                    // }
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
            if (S.clearCanvas.v) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            stop = true;
            shapes.forEach(shape => {
                if (shape.drawIt) {
                    stop = false;
                    shape.draw();
                }
            })

            // 
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
        console.log("creating new", )
        let hue = S.startHue.v;
        let sat = S.startSaturate.v;
        let light = S.startLight.v;
        let hueDiff = setColorDifference();

        let radius = 0;
        for (let i = 0; i < S.layers.v; i++) {
            S.list.forEach(set => {
                if (set.rndCheck) {set.v = set.rndVal();}
            })

            if (S.colorDifferenceMode.v === "random") {
                hueDiff = randomise(true, 350, 5);
            }
            radius += randomise(true, fitMaxSize/S.layers.v, 5);

            shapes.push(new Shape(i, S, radius, hue, sat, light));

            hue += hueDiff;
            if (hue > 360) {hue -= 360;}
        }
    }

    function setColorDifference() {
        const mode = S.colorDifferenceMode.v;
        let diff = 0;
        switch(mode) {
            case "setvalue":
                diff = S.colorDifference.v;
                break;
            case "proportional":
                diff = Math.floor(360/S.layers.v);
                break;
            case "random":
                diff = randomise(true, 350, 5);
                break;
        }
        // console.log("diff", diff)
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

function initRndChkBoxes() {
    S.list.forEach(set => {
        const el = document.querySelector(`#${set.t} #rndbox`);
        if (el !== null) {
            el.innerHTML = `${rndIcons[set.rndCheck]}`;
        }
    })
}
initRndChkBoxes();

    // UI and buttons
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}
const openBtn = this.document.getElementById("openBtn");
const settingsPanel = this.document.getElementById("cont");

openBtn.addEventListener("click", function() {
    const status = settingsPanel.getAttribute("class");
    settingsPanel.setAttribute("class", panelChange[status]);
    console.log("settingsPanel", settingsPanel)

})

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

// clearCanvas;
const clearCanvasDisplay = this.document.querySelector("#clearCanvas .display");

clearCanvasDisplay.addEventListener("click", function() {
    S.clearCanvas.v = !S.clearCanvas.v;
    clearCanvasDisplay.innerText = S.clearCanvas.v;
})
//

// colorShift;
const colorShiftDisplay = this.document.querySelector("#colorShift .display");

colorShiftDisplay.addEventListener("click", function() {
    S.colorShift.v = !S.colorShift.v;
    colorShiftDisplay.innerText = S.colorShift.v;
})
//

// colorDifferenceMode;
const colorDifferenceModeDisplay = this.document.querySelector("#colorDifferenceMode .display");

colorDifferenceModeDisplay.addEventListener("click", function() {
    adjustModes("colorDifferenceMode");
})
//

// shapeType;
const shapeTypeDisplay = this.document.querySelector("#shapeType .display");

shapeTypeDisplay.addEventListener("click", function() {
    adjustModes("shapeType");
})
//

// lineCap;
const lineCapDisplay = this.document.querySelector("#lineCap .display");

lineCapDisplay.addEventListener("click", function() {
    adjustModes("lineCap");
})
//

// shiftRadiusType;
const shiftRadiusTypeDisplay = this.document.querySelector("#shiftRadiusType .display");

shiftRadiusTypeDisplay.addEventListener("click", function() {
    adjustModes("shiftRadiusType");
})
//

// shiftRadius;
const drawLinesFromCenterDisplay = this.document.querySelector("#drawLinesFromCenter .display");

drawLinesFromCenterDisplay.addEventListener("click", function() {
    S.drawLinesFromCenter.v = !S.drawLinesFromCenter.v;
    drawLinesFromCenterDisplay.innerText = S.drawLinesFromCenter.v;
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
        checkClrBoxes();
    })
})

function checkClrBoxes() {
    if (S.changeHue.rndCheck ||
        S.changeSat.rndCheck ||
        S.changeLight.rndCheck) {
            S.colorShift.v = true;
            colorShiftDisplay.innerText = S.colorShift.v;
        }
    else if (!S.changeHue.rndCheck &&
            !S.changeSat.rndCheck &&
            !S.changeLight.rndCheck) {
            S.colorShift.v = false;
            colorShiftDisplay.innerText = S.colorShift.v;
        }
}


// initialise all settings
function initSettings() {
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
console.log("max", tabMaxY);

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
            if (shapes.length > 0 && checkSpace()) {
                createTemplate();
            } else {
                setFullWarning(e) 
            }
            break;
        case 3:
            const temps = Object.keys(templates);
            if (temps.length > 0) {
                temps.forEach(temp => {
                    console.log("delete temp", temp)
                    deleteTemplate(temp);
                })
            }
            break;
    }
})

function checkSpace() {
    const length = Object.keys(templates).length;
    const y = tabStartY + (tabYIncrease * (length-1));
    const maxY = tabMaxY - (tabYIncrease * 2);

    return y <= maxY ? true : false;
}

function setFullWarning(e) {
    e.target.classList.add("full");

    setTimeout(() => {
        e.target.classList.remove("full");
    }, 500);
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
    console.log("clicked tab value", num);

    console.log("which button", e.which)
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



// save as json
const exportBtn = this.document.getElementById("exportBtn");
exportBtn.addEventListener("click", function() {
    downloadJSON();
})

function downloadJSON() {
    const json = JSON.stringify(shapes, null, 4);
    const filename = 'data.json';

    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

                    // take screenshot
const scrshotBtn = this.document.getElementById("screenshot");
scrshotBtn.addEventListener("click", function() {
    takeScreenshot(canvas, settingsPanel);
});





})
