/* Leaflet maps initialise only when their day is opened. No live routing requests. */
const ACTIVITY_CATEGORIES = {
 adventure:{label:'Adventure',color:'#b64c22'},
 fun:{label:'Fun & relaxation',color:'#7c45a0'},
 nature:{label:'Nature',color:'#167a8b'},
 place:{label:'Extra place',color:'#285cb2'}
};
let tripMapInstances = [];
function mapHTML(day, index) {
 const categories=[...new Set((day.optionalActivities||[]).map(a=>a.category))];
 const legend=categories.length?`<fieldset class="optional-map-filters"><legend>Optional pins · show / hide</legend>${categories.map(key=>`<label style="--category-color:${ACTIVITY_CATEGORIES[key].color}"><input type="checkbox" data-option-category="${key}" checked><span class="legend-dot"></span>${ACTIVITY_CATEGORIES[key].label}</label>`).join('')}</fieldset>`:'';
 const country = day.country === 'NZ' ? 'New Zealand' : 'Australia';
 return `<section class="day-map-section" aria-label="Interactive route for day ${index + 1}"><div class="map-section-heading"><h4>Today’s route</h4><button type="button" class="fit-map" data-fit-map="${index}">Show whole route ↗</button></div>${legend}<div class="day-map-grid"><div class="interactive-map" id="route-map-${index}" aria-label="Interactive route map for ${escapeHTML(day.region)}" role="region" tabindex="0"></div><aside class="map-sidebar"><div><p class="overview-label">${country} · overview</p><div class="country-map" id="country-map-${index}" role="img" aria-label="Whole of ${country} with today’s route highlighted"></div></div><div class="map-stops" id="map-stops-${index}" aria-label="Route stops"></div></aside></div><p class="map-caption">Select a numbered pin or stop for details. Drag to explore; use + / − to zoom. <span class="route-key">Today</span> <span class="prior-key">Earlier days</span><br>${day.route.schematic ? 'Dashed connections are schematic, not navigable routes.' : 'Saved road route from OSRM; optional activities are not added to the driving route. No live traffic or navigation.'} Map tiles need an internet connection. <a href="https://www.openstreetmap.org/fixthemap" target="_blank" rel="noopener noreferrer">Report a map issue ↗</a></p><p class="map-load-status" id="map-status-${index}" role="status"></p></section>`;
}
function disposeTripMaps() {
 tripMapInstances.forEach(({map, overview, observer}) => {observer.disconnect();map.remove();overview.remove()});
 tripMapInstances = [];
}
function setupTripMaps(tripData) {
 document.querySelectorAll('.day[data-country="NZ"], .day[data-country="AU"]').forEach((details, index) => {
  let instance;
  const init = () => {
   if (!details.open || instance) return;
   const day = tripData.days[index];
   const host = document.getElementById(`route-map-${index}`);
   const status = document.getElementById(`map-status-${index}`);
   if (!window.L) {status.textContent = 'The map could not load. The stop details remain available in the daily schedule.';return;}
   const map = L.map(host, {scrollWheelZoom:false, attributionControl:true,zoomSnap:0.25});
   const tiles = L.tileLayer(tripData.mapTiles.url, {attribution:tripData.mapTiles.attribution,maxZoom:19});
   tiles.on('tileerror', () => {status.textContent = 'Some map tiles could not load. Check your connection; route pins and stop details are still available.'});
   tiles.addTo(map);
   const overview = L.map(`country-map-${index}`, {zoomControl:false, attributionControl:true, dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,touchZoom:false});
   L.tileLayer(tripData.mapTiles.url,{attribution:tripData.mapTiles.attribution,maxZoom:19}).addTo(overview);
   const latLngs = day.route.coordinates.map(([lng,lat])=>[lat,lng]);
   tripData.days.slice(0,index).filter(d=>d.country===day.country).forEach(d=>{
    const earlier=d.route.coordinates.map(([lng,lat])=>[lat,lng]);
    [map,overview].forEach(m=>L.polyline(earlier,{color:'#8c9a94',weight:m===map?3:2,opacity:.6,interactive:false}).addTo(m));
   });
   const route = L.polyline(latLngs,{color:'#386b47',weight:5,opacity:.9,dashArray:day.route.schematic?'8 8':undefined}).addTo(map);
   L.polyline(latLngs,{color:'#386b47',weight:3,dashArray:day.route.schematic?'4 4':undefined,interactive:false}).addTo(overview);
   const markers=[];
   const optionalMarkers=new Map();
   const optionalGroups={};
   const list=document.getElementById(`map-stops-${index}`);
   day.keys.forEach((key,n)=>{
    const p=tripData.places[key];
    const time=day.stop_times?.[n]||p.time||'Time TBC';
    const marker=L.marker([p.lat,p.lon],{icon:L.divIcon({className:'numbered-pin',html:`<span><b>${n+1}</b></span>`,iconSize:[30,30],iconAnchor:[15,30]}),title:`Stop ${n+1}: ${p.name}`,alt:`Stop ${n+1}: ${p.name}`,keyboard:true}).addTo(map);
    marker.bindTooltip(`${n+1}. ${escapeHTML(p.name)}`,{permanent:true,direction:['left','right','top','bottom'][n%4],offset:[[-16,-17],[16,-17],[0,-35],[0,4]][n%4],className:'stop-name-label'});
    marker.bindPopup(`<strong>${n+1}. ${escapeHTML(p.name)}</strong><br>${escapeHTML(time)} · target local time<br><a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}" target="_blank" rel="noopener noreferrer">Open in Google Maps ↗</a>`);
    L.circleMarker([p.lat,p.lon],{radius:3,color:'#fff',weight:1,fillColor:'#386b47',fillOpacity:1,interactive:false}).addTo(overview);
    const button=document.createElement('button');button.type='button';button.className='map-stop';
    button.innerHTML=`<span class="stop-number">${n+1}</span><span><strong>${escapeHTML(p.name)}</strong><small>${escapeHTML(time)} · target</small></span>`;
    button.addEventListener('click',()=>{map.setView(marker.getLatLng(),Math.max(map.getZoom(),12));marker.openPopup()});
    list.append(button);markers.push(marker);
   });
   (day.optionalActivities||[]).forEach((activity,n)=>{
    const cat=ACTIVITY_CATEGORIES[activity.category];
    const letter=String.fromCharCode(65+n);
    const group=optionalGroups[activity.category]||(optionalGroups[activity.category]=L.layerGroup().addTo(map));
    const marker=L.marker([activity.lat,activity.lon],{icon:L.divIcon({className:'optional-map-pin',html:`<span style="background:${cat.color}">${letter}</span>`,iconSize:[28,28],iconAnchor:[14,14]}),title:`Optional ${letter}: ${activity.name}`,keyboard:true}).addTo(group);
    marker.bindTooltip(`${letter}. ${escapeHTML(activity.name)}`,{direction:'top',className:'option-name-label'});
    marker.bindPopup(`<span class="activity-category category-${activity.category}">${letter} · ${cat.label} · OPTIONAL</span><br><strong>${escapeHTML(activity.name)}</strong><br>${escapeHTML(activity.duration)}<br><em>${escapeHTML(activity.fit)}</em><br><a href="${activity.source}" target="_blank" rel="noopener noreferrer">Details & availability ↗</a><br><small>Approximate activity / access area. Not part of the base driving route.</small>`);
    optionalMarkers.set(activity.id,marker);
    L.circleMarker([activity.lat,activity.lon],{radius:3,color:cat.color,fillColor:cat.color,fillOpacity:.9,interactive:false}).addTo(overview);
    const button=document.createElement('button');button.type='button';button.className='map-stop';
    button.innerHTML=`<span class="stop-number" style="background:${cat.color}">${letter}</span><span><strong>${escapeHTML(activity.name)}</strong><small>Optional · ${cat.label}</small></span>`;
    const show=()=>{
     const checkbox=details.querySelector(`[data-option-category="${activity.category}"]`);
     checkbox.checked=true;if(!map.hasLayer(group))group.addTo(map);
     map.stop();map.setView(marker.getLatLng(),Math.max(map.getZoom(),12),{animate:false});marker.openPopup();
    };
    button.addEventListener('click',show);list.append(button);
    details.querySelector(`[data-show-option="${activity.id}"]`).addEventListener('click',()=>{host.scrollIntoView({block:'center',behavior:'instant'});show()});
   });
   details.querySelectorAll('[data-option-category]').forEach(input=>input.addEventListener('change',()=>{
    const group=optionalGroups[input.dataset.optionCategory];
    if(input.checked)group.addTo(map);else map.removeLayer(group);
   }));
   const bounds=route.getBounds().extend(L.latLngBounds(markers.map(m=>m.getLatLng())));
   optionalMarkers.forEach(marker=>bounds.extend(marker.getLatLng()));
   const fit=()=>{map.stop();map.closePopup();map.invalidateSize();map.fitBounds(bounds,{padding:[map.getSize().x<500?32:65,45],maxZoom:14,animate:false})};
   document.querySelector(`[data-fit-map="${index}"]`).addEventListener('click',fit);
   const countryBounds=day.country==='NZ'?[[-47.6,166],[-34,179.2]]:[[-44,112],[-10,154]];
   const fitOverview=()=>{overview.invalidateSize();overview.fitBounds(countryBounds,{padding:[4,4]})};
   const observer=new ResizeObserver(()=>{if(details.open){map.invalidateSize();fitOverview()}});
   observer.observe(host);
   instance={map,overview,observer};tripMapInstances.push(instance);
   requestAnimationFrame(()=>{fit();fitOverview()});
  };
  details.addEventListener('toggle',()=>{
   if(details.open){init();if(instance)requestAnimationFrame(()=>{instance.map.invalidateSize();instance.overview.invalidateSize()})}
  });
  init();
 });
}
