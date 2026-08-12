gameId = sessionStorage.getItem("game");

function renderWorldMap() {
  const imgMap = "./" + gameId + "/img/assets/world.png";
  const container = document.getElementById("main-content");
  container.innerHTML = ``;

  const cities = guideData.cities || [];

  container.innerHTML = `<div class="map-container">
                        <img src = "${imgMap}" usemap="#worldmap" id="mapImage" />
                        <canvas id="highlightCanvas"></canvas>
                        <map id="worldmap" name="worldmap">
                        ${cities.map((c, index) => renderMapArea(c, index)).join("")}
                        </map>
                        <div id="city-tooltip" ></div>
                        <div id="city-info"></div>
                        </div>`;

  const map = document.getElementById("worldmap");
  const tooltip = document.getElementById("city-tooltip");
  const canvas = document.getElementById("highlightCanvas");
  const ctx = canvas.getContext("2d");
  const mapImage = document.getElementById("mapImage");

  if (mapImage.complete) {
    syncCanvasSize(canvas, mapImage, ctx);
  } else {
    mapImage.addEventListener("load", syncCanvasSize);
  }

  map.addEventListener("mouseover", (e) => {
    if (e.target.tagName === "AREA") {
      //tooltip.textContent = e.target.getAttribute('alt');
      drawHighlight(e.target, ctx);
      if (
        guideData.cities[e.target.getAttribute("data")].type === "city" ||
        true
      ) {
        tooltip.innerHTML = renderCityMini(e.target.getAttribute("data"));
        tooltip.style.display = "block";
        //tooltip.style.width = '200px';
        tooltip.style.position = "absolute";
        tooltip.style.top = "1em";
        tooltip.style.left =
          document.getElementById("main-content").style.marginLeft;
      } else {
        tooltip.textContent = e.target.getAttribute("alt");
        tooltip.style.display = "block";
        tooltip.style.position = "absolute";
        tooltip.style.top = "1em";
        tooltip.style.left =
          document.getElementById("main-content").style.marginLeft;
      }
    }
  });

  map.addEventListener("mousemove", (e) => {
    if (
      tooltip.style.display === "block" &&
      guideData.cities[e.target.getAttribute("data")].type != "city"
    ) {
      /*
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 10}px`;
      */
    }
  });

  map.addEventListener("mouseout", (e) => {
    if (e.target.tagName === "AREA") {
      clearHighlight(ctx, canvas);
      tooltip.style.display = "none";
      tooltip.style.position = "";
    }
  });
}

function displayCity(index) {
  const container = document.getElementById("city-info");
  container.innerHTML = ``;

  container.innerHTML = renderCity(index, guideData.cities[index]);
}

function syncCanvasSize(canvas, mapImage, ctx) {
  canvas.width = mapImage.clientWidth;
  canvas.height = mapImage.clientHeight;
}

function clearHighlight(ctx, canvas) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawHighlight(area, ctx) {
  clearHighlight(ctx, area);

  const shape = area.getAttribute("shape").toLowerCase();
  const coords = area.getAttribute("coords").split(",").map(Number);

  ctx.beginPath();

  // Style config
  ctx.fillStyle = "rgba(255, 0, 76, 0.25)"; // Highlight fill color
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)"; // Outline color
  ctx.lineWidth = 2;

  if (shape === "rect") {
    const [x1, y1, x2, y2] = coords;
    ctx.rect(x1, y1, x2 - x1, y2 - y1);
  } else if (shape === "circle") {
    const [x, y, radius] = coords;
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
  } else if (shape === "poly") {
    ctx.moveTo(coords[0], coords[1]);
    for (let i = 2; i < coords.length; i += 2) {
      ctx.lineTo(coords[i], coords[i + 1]);
    }
    ctx.closePath();
  }

  //ctx.fill();
  ctx.stroke();
}
