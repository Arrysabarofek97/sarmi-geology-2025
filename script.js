// Interactive script for Sarmi Geology HTML package
const stages = [
  {title: 'Magma Purba (Miocene–Pliocene)', desc: 'Intrusi granitik, kantong magma purba, zona alterasi hidrotermal.'},
  {title: 'Mineralisasi (Late Miocene–Pliocene)', desc: 'Fluida hidrotermal mengendapkan Au–Cu di urat kuarsa dan zona alterasi.'},
  {title: 'Erosi & Endapan Alluvial (Pleistosen–Holosen)', desc: 'Transport butiran mineral berat dan emas halus ke sungai dan pantai.'},
  {title: 'Tektonik Aktif & Gempa (Kini)', desc: 'Sesar aktif dan transfer tegangan menghasilkan gempa dan aftershock.'}
];
const stageRange = document.getElementById('stageRange');
const stageTitle = document.getElementById('stageTitle');
const stageDesc = document.getElementById('stageDesc');
function renderStage(i){
  const s = stages[i]; stageTitle.textContent = s.title; stageDesc.textContent = s.desc;
  if(i===0){ setLayerVisibility('magma', true); setLayerVisibility('veins', false); setLayerVisibility('alluvial', false); }
  if(i===1){ setLayerVisibility('magma', true); setLayerVisibility('veins', true); setLayerVisibility('alluvial', false); }
  if(i===2){ setLayerVisibility('magma', false); setLayerVisibility('veins', false); setLayerVisibility('alluvial', true); }
  if(i===3){ setLayerVisibility('magma', false); setLayerVisibility('veins', false); setLayerVisibility('alluvial', false); }
}
if(stageRange){ stageRange.addEventListener('input', (e)=>{ renderStage(Number(e.target.value)); }); }
const toggleTheme = document.getElementById('toggleTheme');
if(toggleTheme){ toggleTheme.addEventListener('click', ()=>{ document.body.classList.toggle('dark'); document.body.classList.toggle('light'); }); }
function pageUrlForShare(){ return window.location.href; }
document.getElementById('shareWhats').onclick = ()=>{ const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent('Lihat Peta Geologi Sarmi: ' + pageUrlForShare()); window.open(url,'_blank'); };
document.getElementById('shareX').onclick = ()=>{ const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('Peta Geologi Sarmi — ' + pageUrlForShare()); window.open(url,'_blank'); };
document.getElementById('shareFB').onclick = ()=>{ const url = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(pageUrlForShare()); window.open(url,'_blank'); };
const map = L.map('map', {zoomControl:true}).setView([ -2.45, 139.02 ], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19, attribution:''}).addTo(map);
const legend = L.control({position:'topright'});
legend.onAdd = function(map){ const div = L.DomUtil.create('div','legend'); div.innerHTML = '<strong>Legenda</strong><br/><span style="color:#d4af37">●</span> Mineral/Vein<br/><span style="color:#2b9bd7">—</span> Ses/river'; return div; };
legend.addTo(map);
const magmaLayer = L.layerGroup().addTo(map);
const veinsLayer = L.layerGroup().addTo(map);
const alluvialLayer = L.layerGroup().addTo(map);
const faultLayer = L.layerGroup().addTo(map);
const sampleLayer = L.layerGroup().addTo(map);
const epicenterLayer = L.layerGroup().addTo(map);
function setLayerVisibility(name, v){ const mapLayers = {magma: magmaLayer, veins: veinsLayer, alluvial: alluvialLayer}; if(mapLayers[name]){ if(v) map.addLayer(mapLayers[name]); else map.removeLayer(mapLayers[name]); } }
fetch('data/sarmi.geojson').then(r=>r.json()).then(g=>{ L.geoJSON(g, { style: function(feature){ if(feature.properties.type==='fault') return {color:'#ef4444', weight:3}; if(feature.properties.type==='river') return {color:'#1e40af', weight:3, dashArray:'4 6'}; return {color:'#0f172a'}; }, onEachFeature: function(ft, layer){ if(ft.properties.type==='sample'){ layer.bindPopup('<strong>'+ft.properties.name+'</strong><br/>'+ (ft.properties.notes||'')); sampleLayer.addLayer(layer); } else if(ft.geometry.type==='LineString' && ft.properties.type==='fault'){ faultLayer.addLayer(layer); } else{ faultLayer.addLayer(layer); } } }).addTo(map); renderStage(Number(stageRange.value)); }).catch(e=>{ console.warn('GeoJSON load failed', e); });
function fetchUSGSEarthquakes(){ const bbox = [138.5, -3.5, 139.6, -1.8]; const url = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + new Date(Date.now()-30*24*3600*1000).toISOString().slice(0,10) + '&minmagnitude=4&minlatitude=' + bbox[1] + '&maxlatitude=' + bbox[3] + '&minlongitude=' + bbox[0] + '&maxlongitude=' + bbox[2]; fetch(url).then(r=>r.json()).then(data=>{ data.features.forEach(f=>{ const coords = [f.geometry.coordinates[1], f.geometry.coordinates[0]]; const mag = f.properties.mag; const c = L.circleMarker(coords, {radius:4+mag, fillColor:'#ef4444', color:'#7f1d1d', fillOpacity:0.7}).bindPopup('M'+mag+' - '+f.properties.place); epicenterLayer.addLayer(c); }); epicenterLayer.addTo(map); }).catch(err=>console.warn('USGS fetch failed', err)); } fetchUSGSEarthquakes();
