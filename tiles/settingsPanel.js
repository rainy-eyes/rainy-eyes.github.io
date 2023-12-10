import { changeVariables } from "./tiles.js"

// create an exported changeVariables object in the main js file where the function that updates the variable is put. The object holds each variable that is put onto the settings panel

// slider example:
// let silderVar = 0.123;
// createSlider(silderVar, "slider1", 0.005, 0.5, 0.001);
// changeVariables["slider1"] = (newVal) => silderVar = newVal;

// let optionVar = "a";
// createSelector(optionVar, "options1", ["a", "b", "c"]);
// changeVariables["optionTest"] = function(newVal) {
//  optionVar = newVal;}

const body = document.querySelector("body");

const checkboxChange = {true: "&#9745;", false: "&#9744;"}
const rndIcons = {true: "&#9883;", false: "&#9744;"};
const panelChange = {
    "opened": "closed",
    "closed": "opened",
}


let mainPanel;
export function createMainPanel() {
    mainPanel = createDOMElement("div", {
        "id": "cont",
        "class": "opened"
    })
    body.appendChild(mainPanel);

    // tab with arrows to open and close the panel
    const openBtn = createDOMElement("div", {
        "id": "openBtn",
        "class": "btn tab"
    })
    openBtn.innerHTML = "&#10096; &#10097;";
    mainPanel.appendChild(openBtn);

    // tab to take screenshot of the canvas
    const screenshotBtn = createDOMElement("div", {
        "id": "screenshot",
        "class": "btn tab"
    })
    mainPanel.appendChild(screenshotBtn);

    const scrShotSpan = createDOMElement("span");
    scrShotSpan.innerHTML = "&#10048;";
    screenshotBtn.appendChild(scrShotSpan);

    // css rules
    addCSSRules();

    // eventlisteners
    openBtn.addEventListener("click", openClosePanel);
    function openClosePanel() {
        let status = mainPanel.getAttribute("class");
        mainPanel.setAttribute("class", panelChange[status]);
    }
}

// css rules
function addCSSRules() {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(cssrules);
    document.adoptedStyleSheets = [sheet];
}


export function createSlider(variable, title, min, max, step, divider) {
    const mainPanel = document.getElementById("cont");

    const container = createDOMElement("div", {
        id: title,
        class: "setting"
    })
    if (divider) {container.classList.add("break")}
    mainPanel.appendChild(container);

    const titleDiv = createDOMElement("div", {
        class: title
    })
    titleDiv.innerText = `${title}:`;
    container.appendChild(titleDiv);

    const displayDiv = createDOMElement("div", {
        class: "display"
    })
    displayDiv.innerText = variable;
    container.appendChild(displayDiv);
    
    const input = createDOMElement("input", {
        type: "range",
        min: min,
        max: max,
        step: step,
        value: variable,
    })
    container.appendChild(input);

    // eventlisteners
    input.addEventListener("input", function(e) {
        const id = e.target.parentElement.id;
        const newVal = Number(e.target.value);
        displayDiv.innerText = newVal;
        changeVariables[id](newVal);
      })
      
    }


// this hold the options for selector type variables
const selectors = {}
export function createSelector(variable, title, options, divider) {
    const mainPanel = document.getElementById("cont");

    const container = createDOMElement("div", {
        id: title,
        class: "setting"
    })
    if (divider) {container.classList.add("break")}
    mainPanel.appendChild(container);

    const titleDiv = createDOMElement("div", {
        class: title
    })
    titleDiv.innerText = `${title}:`;
    container.appendChild(titleDiv);

    const displayDiv = createDOMElement("div", {
        class: "display",
        value: variable
    })
    container.appendChild(displayDiv);

    if (variable === true || variable === false) {
      displayDiv.innerHTML = checkboxChange[variable];
    } else {displayDiv.innerText = variable;}

    selectors[title] = [...options];
    // eventlistener
    displayDiv.addEventListener("click", function(e) {
      const id = e.target.parentElement.id;
      let value = displayDiv.getAttribute("value");
      
      if (value === "true") {value = true;}
      else if (value === "false") {value = false;}
      else if (value === "null") {value = null;}
      else if (value === "undefined") {value = undefined;}
      
      const newValue = nextArrayItem(value, selectors[id]);
      
      displayDiv.setAttribute("value", newValue);

      if (newValue === true || newValue === false) {
        displayDiv.innerHTML = checkboxChange[newValue];
      } else {displayDiv.innerText = newValue;}

      changeVariables[title](newValue);

    })
   
    
}

function createDOMElement(type, attributes) {
  const el = document.createElement(type);
  if (attributes !== undefined) {
      for (let key in attributes) {
          el.setAttribute(key, attributes[key]);
      }
  }

  return el;
}

function nextArrayItem(currentitem, arr) {
  const i = arr.indexOf(currentitem);
 
  return i === arr.length-1 ? arr[0] : arr[i+1];
}



const cssrules = `
  #cont {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 0px;
    width: 250px;
    height: auto;
    padding: 10px;
    border: 1px solid #aaa;
    border-radius: 5px;
    background: transparent;
    font-family: "Segoe UI";
    color: #aaa;
    opacity: 0.1;
    z-index: 10;
  }
  #cont:hover {
    background: #111;
    opacity: 1;
  }
  #cont:hover .template {
    background: #111;
    opacity: 1;
  }
  #cont:hover #saveBtn {
    background: #111;
    opacity: 1;
  }
  #cont:hover .tab {
    background: #111;
    opacity: 1;
  }
  #cont.closed {
    transform: translate(100%, 0);
  }
  #cont.opened {
    transform: translate(0, 0);
  }
  #cont .tab {
    position: absolute;
    display: block;
    right: 250px;
    width: 45px;
    height: 30px;
    padding-left: 5px;
    font-size: 20px;
    text-align: center;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    border: 1px solid #aaa;
  }
  #cont #openBtn {
    top: -1px;
  }
  #cont #openBtn:hover {
    color: cadetblue;
  }
  #cont #openBtn:active {
    color: royalblue;
  }

  #cont #screenshot {
    top: 30px;
  }
  #cont #screenshot span {
    position: relative;
    top: -5px;
    padding: 0;
    display: block;
    font-size: 25px;
    text-align: center;
  }
  #cont #screenshot:hover {
    color: cadetblue;
  }
  #cont #screenshot:active {
    color: royalblue;
  }
  #cont #saveBtn {
    top: 90px;
    font-size: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #cont #saveBtn:hover {
    color: cadetblue;
  }
  #cont #saveBtn:active {
    color: royalblue;
  }
  #cont #saveBtn.full:active {
    color: red;
  }
  #cont .template {
    font-size: 16px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  #cont .template:hover {
    color: cadetblue;
  }
  #cont .template:active {
    color: royalblue;
  }
  #cont #exportBtn {
    position: absolute;
    top: 0px;
    right: 65px;
    font-size: 30px;
    rotate: 90deg;
  }
  #cont #exportBtn:hover {
    color: cadetblue;
  }
  #cont #exportBtn:active {
    color: royalblue;
  }
  #cont #resetBtn {
    position: absolute;
    top: 0px;
    right: 35px;
    font-size: 25px;
  }
  #cont #resetBtn:hover {
    color: cadetblue;
  }
  #cont #resetBtn:active {
    color: royalblue;
  }
  #cont #randomiseBtn {
    position: absolute;
    top: -2px;
    right: 5px;
    font-size: 30px;
  }
  #cont #randomiseBtn:hover {
    color: cadetblue;
  }
  #cont #randomiseBtn:active {
    color: royalblue;
  }
  #cont .setting {
    display: flex;
    flex-direction: row;
    justify-content: left;
    align-items: center;
    gap: 5px;
    width: auto;
  }
  #cont .setting.break {
    border-top: 1px #aaa solid;
    margin-top: 10px;
  }
  #cont .setting:hover {
    color: white;
  }
  #cont .setting .display {
    width: auto;
    text-align: center;

  }
  #cont .setting .display:hover {
    color: cadetblue;
  }
  #cont .setting .display:active {
    color: royalblue;
  }
  #cont .setting .btn {
    font-size: 18px;
    font-weight: bold;
  }
  #cont .setting .btn:hover {
    color: cadetblue;
  }
  #cont .setting .btn:active {
    color: royalblue;
  }
  #cont .display:hover, #cont .checkbox:hover {
    color: cadetblue;
  }
  #cont .checkbox:active {
    color: royalblue;
  }
  #cont .setting #displaycolor {
    width: 15px;
    height: 15px;
    margin-left: 10px;
    border-radius: 2px;
  }
  #cont .setting #rndbox {
    position: absolute;
    right: 10px;
  }
  #cont .setting input {
    position: absolute;
    right: 30px;
    width: 110px;
  }`



// take screenshot
window.addEventListener("load", function() {
  const canvas = this.document.querySelector("canvas");

  const scrshotBtn = document.getElementById("screenshot");
  scrshotBtn.addEventListener("click", function() {
      takeScreenshot(canvas, mainPanel);
  });

} )


function takeScreenshot(canvas, settingsPanel) {
  const anchor = document.createElement("a");
  const capture = async () => {
      try {
          anchor.setAttribute("target", "_blank");
          document.body.appendChild(anchor);

          settingsPanel.classList.add("hide");
          canvas.style.cursor = "none";

          const video = document.createElement("video");
          const captureStream = await navigator.mediaDevices.getDisplayMedia({preferCurrentTab: true});
          video.srcObject = captureStream;

          video.addEventListener("loadedmetadata", function() {
          const canvas2 = document.createElement("canvas");
          const ctx2 = canvas2.getContext("2d");

          canvas2.width = window.innerWidth;
          canvas2.height = window.innerHeight;

          const y = window.outerHeight - window.innerHeight;

          video.play();

          ctx2.drawImage(video, 
              0, y, canvas.width, canvas.height,
              0, 0, canvas.width, canvas.height);
          captureStream.getVideoTracks()[0].stop();
          const data = canvas2.toDataURL();
          // window.location.href = data;
          anchor.href = data;
          anchor.click();

          anchor.remove();
          settingsPanel.classList.remove("hide");
          canvas.style.cursor = "initial";
          // scrshotImg.src = data;
      })

      } catch (err) {
        console.error("Error: " + err);
        settingsPanel.classList.remove("hide");
        canvas.style.cursor = "initial";
      //   anchor.remove();
      }
    };
    
  capture();
}
