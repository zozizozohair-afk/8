'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';
import NavigationDialog from '@/components/NavigationDialog';
import 'leaflet/dist/leaflet.css';
import './ProjectLocationPicker.css';
const cities = { 'الرياض': [24.7136,46.6753], 'جدة': [21.5433,39.1728], 'مكة المكرمة': [21.4225,39.8262], 'المدينة المنورة': [24.4672,39.6111], 'الدمام': [26.4207,50.0888], 'الطائف': [21.2703,40.4158] };
function fromLink(value) {
 try { const s=decodeURIComponent(value || ''); const m=s.match(/(?:[?&](?:q|query|ll)=|@)(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/); if(m){const point=[Number(m[1]),Number(m[2])];if(Math.abs(point[0])<=85&&Math.abs(point[1])<=180)return point;} } catch {}
 return null;
}
export default function ProjectLocationPicker({ link, location, onSelect, onClose }) {
 const initial = useRef(fromLink(link));
 const [point,setPoint]=useState(initial.current),[ready,setReady]=useState(false),[error,setError]=useState(''),[locating,setLocating]=useState(false);
 const [coordinates,setCoordinates]=useState(initial.current ? initial.current.map(n=>n.toFixed(6)) : ['','']);
 const container=useRef(null),map=useRef(null),marker=useRef(null),api=useRef(null),alive=useRef(true);
 const choose = (lat,lng) => { const p=[Number(lat),Number(lng)];if(!p.every(Number.isFinite)||Math.abs(p[0])>85||Math.abs(p[1])>180)return;setPoint(p);setCoordinates(p.map(n=>n.toFixed(6))); };
 useEffect(()=>{
  alive.current=true;let disposed=false;
  import('leaflet').then(module=>{
   if(disposed)return;const L=module.default;api.current=L;
   const city=Object.keys(cities).find(c=>(location||'').includes(c));
   map.current=L.map(container.current,{worldCopyJump:true}).setView(initial.current || cities[city] || cities['الرياض'],initial.current?16:12);
   const tiles=L.tileLayer(process.env.NEXT_PUBLIC_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(map.current);
   tiles.on('tileerror',()=>{if(!disposed)setError('تعذّر تحميل بعض أجزاء الخريطة. تحقق من الاتصال أو أدخل الإحداثيات أدناه.');});
   map.current.on('click',e=>choose(e.latlng.lat,e.latlng.lng));
   map.current.invalidateSize();setReady(true);
  }).catch(()=>{if(!disposed)setError('تعذّر فتح الخريطة. أغلق النافذة وأعد المحاولة.');});
  return ()=>{disposed=true;alive.current=false;map.current?.remove();map.current=null;marker.current=null;};
 },[]);
 useEffect(()=>{
  if(!ready||!point||!map.current)return;
  const L=api.current;
  if(marker.current)marker.current.setLatLng(point);
  else { marker.current=L.marker(point,{draggable:true,icon:L.divIcon({className:'plp-marker',html:'<span></span>',iconSize:[28,36],iconAnchor:[14,36]})}).addTo(map.current);marker.current.on('dragend',()=>{const p=marker.current.getLatLng();choose(p.lat,p.lng);}); }
 },[point,ready]);
 const locate=()=>{
  if(!navigator.geolocation){setError('متصفحك لا يدعم تحديد الموقع. اختر النقطة من الخريطة.');return;}
  setLocating(true);setError('');navigator.geolocation.getCurrentPosition(p=>{if(!alive.current)return;setLocating(false);choose(p.coords.latitude,p.coords.longitude);map.current?.setView([p.coords.latitude,p.coords.longitude],16);},()=>{if(!alive.current)return;setLocating(false);setError('تعذّر تحديد موقعك. اسمح بالوصول للموقع أو اختر النقطة يدويًا.');},{timeout:12000,maximumAge:60000,enableHighAccuracy:true});
 };
 return <NavigationDialog title="اختيار موقع المشروع" className="plp-dialog" onClose={onClose}>
  <header><span><MapPin size={17}/>موقع المشروع</span><h2>حدّد مكان المشروع.</h2><p>انتقل إلى المدينة، ثم اضغط على مكان المشروع. يمكنك سحب الدبوس لتدقيق الموقع.</p></header>
  <div className="plp-toolbar"><label><span className="sr-only">الانتقال إلى مدينة</span><select defaultValue="" disabled={!ready} onChange={e=>{if(cities[e.target.value])map.current?.setView(cities[e.target.value],12);}}><option value="" disabled>انتقل إلى مدينة…</option>{Object.keys(cities).map(c=><option key={c}>{c}</option>)}</select></label><button type="button" disabled={!ready||locating} onClick={locate}>{locating?<Loader2 size={16} className="ad-spin"/>:<LocateFixed size={16}/>}موقعي الحالي</button></div>
  {error&&<p className="plp-error" role="alert">{error}</p>}
  <div ref={container} className="plp-map" aria-label="خريطة اختيار الموقع. حرّك الخريطة بالأسهم، ثم استخدم زر اختيار منتصف الخريطة."/>
  <div className="plp-center"><button type="button" disabled={!ready} onClick={()=>{const p=map.current.getCenter();choose(p.lat,p.lng);}}>اختيار منتصف الخريطة</button><span role="status">{point?'تم تحديد نقطة. اضغط «اعتماد الموقع» لتأكيدها.':'لم تحدد موقعًا بعد.'}</span></div>
  <details className="plp-coordinates"><summary>تحديد بالإحداثيات</summary><div>{['خط العرض','خط الطول'].map((label,i)=><label key={label}>{label}<input type="number" step="any" dir="ltr" value={coordinates[i]} onChange={e=>setCoordinates(old=>old.map((v,j)=>i===j?e.target.value:v))}/></label>)}<button type="button" onClick={()=>{const p=coordinates.map(Number);if(coordinates.some(v=>!v.trim())||!p.every(Number.isFinite)||Math.abs(p[0])>85||Math.abs(p[1])>180){setError('أدخل إحداثيات صحيحة: العرض بين ‎-85 و85، والطول بين ‎-180 و180.');return;}choose(...p);map.current?.setView(p,16);setError('');}}>عرض النقطة</button></div></details>
  <footer><p>سيُضاف رابط خرائط Google للبيانات. اضغط «حفظ ومتابعة» لحفظه مع المشروع.</p><div><button type="button" onClick={onClose}>إلغاء</button><button type="button" className="plp-confirm" disabled={!point} onClick={()=>onSelect(`https://www.google.com/maps/search/?api=1&query=${point[0].toFixed(6)},${point[1].toFixed(6)}`)}>اعتماد الموقع</button></div></footer>
 </NavigationDialog>;
}
