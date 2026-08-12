gameId = sessionStorage.getItem('game');

function renderWorldMap() {
    const imgMap = "./" + gameId + "/img/assets/world.png";
    const container = document.getElementById('main-content');
    container.innerHTML = ``;
    
    const cities = guideData.cities || [];

    container.innerHTML = `<img src = "${imgMap}" usemap="#worldmap" />
                        <map id="worldmap" name="worldmap">
                        ${cities.map((c, index) => renderMapArea(c, index)).join('')}
                        </map>
                        <div id="city-tooltip" ></div>
                        <div id="city-info"></div>`;    


 const map = document.getElementById('worldmap') ;
    const tooltip = document.getElementById('city-tooltip');

    map.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'AREA') {
        //tooltip.textContent = e.target.getAttribute('alt');
        if( guideData.cities[e.target.getAttribute('data')].type === "city" ) {
        tooltip.innerHTML = renderCityMini(e.target.getAttribute('data'));
        tooltip.style.display = 'block';
        //tooltip.style.width = '200px';
        tooltip.style.position = "absolute";
        tooltip.style.top = "1em";
        tooltip.style.left = document.getElementById('main-content').style.marginLeft;
        }
        else {
          tooltip.textContent = e.target.getAttribute('alt');
          tooltip.style.display = 'block';
        }
      }
    });

    map.addEventListener('mousemove', (e) => {
      if (tooltip.style.display === 'block' && tooltip.style.position != "absolute") {
        tooltip.style.left = `${e.pageX + 10}px`;
        tooltip.style.top = `${e.pageY + 10}px`;
      }
    });

    map.addEventListener('mouseout', (e) => {
      if (e.target.tagName === 'AREA') {
        tooltip.style.display = 'none';
        tooltip.style.position = '';
      }
    });


}

function displayCity(index) {
    const container = document.getElementById('city-info');
    container.innerHTML = ``;

    container.innerHTML = renderCity(index, guideData.cities[index]);
}