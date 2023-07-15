


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
