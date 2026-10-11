/* XploreEase - behaviour only. All page markup lives in the HTML files.
   Data is kept in localStorage (replace the get/set helpers with API calls when a backend exists). */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const get=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch{return d}};
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const inr=n=>'₹'+Math.round(n).toLocaleString('en-IN');
const Q=new URLSearchParams(location.search),page=document.body.dataset.page;
const user=()=>get('xe_user',null),K=k=>k+'_'+(user()?.id||'guest'),go=u=>{location.href=u};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=(o=0)=>new Date(Date.now()+o*864e5).toISOString().slice(0,10);
const LBL={flights:'Flights',hotels:'Hotels',packages:'Tour Packages',trains:'Trains',cabs:'Cabs',foods:'Foods',forex:'Forex'};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),4000)}
function notify(title,text){const n=get(K('xe_notes'),[]);n.unshift({id:Date.now(),title,text,t:new Date().toLocaleString('en-IN'),read:false});set(K('xe_notes'),n)}
function need(){sessionStorage.setItem('xe_next',location.pathname.split('/').pop()||'index.html');go('login.html')}
function nextUrl(){const n=sessionStorage.getItem('xe_next');sessionStorage.removeItem('xe_next');return n||'index.html'}
function signIn(id,extra){const all=get('xe_users',{});if(all[id]?.name){set('xe_user',all[id]);return go(nextUrl())}set('xe_user',{id,...extra});go('profile.html')}
function toCheckout(cart){set('xe_cart',cart);if(!user()){sessionStorage.setItem('xe_next','payments.html');return go('login.html')}go('payments.html')}

/* header: show the user's name and unread count */
(function(){const u=user();if(!u)return;$('#acct').textContent=(u.name||'Profile').split(' ')[0];$('#acct').href='profile.html';
 const n=get(K('xe_notes'),[]).filter(x=>!x.read).length;if(n){const b=$('#nbadge');b.textContent=n;b.hidden=false}})();

/* Shared UI: mega menu, full menu, search bar, cookie bar (runs on every page) */
(function(){
 const mega=$('#mega'),dd=$$('.dd'),panels=$$('.panel'),menu=$('#menu'),body=$('#mbody'),cats=$$('.cats button'),sb=$('#sbar');
 const close=()=>{mega.hidden=true;panels.forEach(p=>p.hidden=true);dd.forEach(b=>{b.classList.remove('open');b.setAttribute('aria-expanded','false')})};
 const open=b=>{close();mega.hidden=false;$('#m-'+b.dataset.m).hidden=false;b.classList.add('open');b.setAttribute('aria-expanded','true')};
 const hover=()=>matchMedia('(hover:hover) and (min-width:901px)').matches;
 dd.forEach(b=>{b.onclick=e=>{e.stopPropagation();b.classList.contains('open')?close():open(b)};b.onmouseenter=()=>{if(hover())open(b)}});
 $('.top').onmouseleave=()=>{if(hover())close()};
 document.addEventListener('click',e=>{if(!e.target.closest('.top'))close()});
 const closeMenu=()=>{menu.hidden=true;document.body.style.overflow=''};
 const show=id=>{cats.forEach(c=>c.classList.toggle('on',c.dataset.m==id));body.innerHTML=$('#m-'+id).innerHTML};
 $('#dots').onclick=()=>{close();menu.hidden=false;document.body.style.overflow='hidden';show(cats[0].dataset.m)};
 $('#mclose').onclick=closeMenu;cats.forEach(c=>{c.onmouseenter=()=>show(c.dataset.m);c.onclick=()=>show(c.dataset.m)});
 $('#sbtn').onclick=e=>{e.stopPropagation();sb.hidden=!sb.hidden;if(!sb.hidden)$('#sq').focus()};
 sb.onsubmit=e=>{e.preventDefault();go(`${$('#sc').value}.html?q=${encodeURIComponent($('#sq').value.trim())}`)};
 addEventListener('keydown',e=>{if(e.key=='Escape'){close();closeMenu();sb.hidden=true}});
 const ck=$('#cookie');ck.hidden=!!localStorage.getItem('xe_cookie');
 $$('[data-ck]',ck).forEach(b=>b.onclick=()=>{localStorage.setItem('xe_cookie',b.dataset.ck);ck.hidden=true});
})();

function home(){
 $('#hf').onsubmit=e=>{e.preventDefault();go(`${$('#hc').value}.html?q=${encodeURIComponent($('#hq').value.trim())}`)};
 /* hero slideshow with pause button */
 const sl=$$('.slides img');let i=0,t,playing=!matchMedia('(prefers-reduced-motion: reduce)').matches;
 const step=()=>{sl[i].classList.remove('on');i=(i+1)%sl.length;sl[i].classList.add('on')};
 const play=()=>{clearInterval(t);if(playing)t=setInterval(step,5000);const b=$('#hp');b.textContent=playing?'❚❚':'▶';b.setAttribute('aria-label',playing?'Pause slideshow':'Play slideshow')};
 $('#hp').onclick=()=>{playing=!playing;play()};play();
 /* did-you-know carousel */
 const ds=$$('.ds');let d=0;const go2=n=>{d=(d+n+ds.length)%ds.length;ds.forEach((x,k)=>x.hidden=k!=d)};
 $('#dprev').onclick=()=>go2(-1);$('#dnext').onclick=()=>go2(1);
 /* stay updated */
 const em=$('#sub input'),sbt=$('#sub button');em.oninput=()=>{sbt.disabled=!/^\S+@\S+\.\S+$/.test(em.value)};
 $$('.chip').forEach(c=>c.onclick=()=>c.classList.toggle('on'));
 $('#sub').onsubmit=e=>{e.preventDefault();toast('Thanks for subscribing. We will keep you posted.');em.value='';sbt.disabled=true};
 $$('.applink').forEach(a=>a.onclick=()=>toast('Mobile apps are coming soon'))}

function search(){const f=$('#sf'),cards=$$('#res .res'),tf=$$('input[type=text]',f);
 if(Q.get('q')&&tf[0])tf[0].value=Q.get('q');
 $$('input[type=date]',f).forEach(d=>{d.min=today();d.value=today(1)});
 const qty=()=>Math.max(1,Math.min(9,+f.elements.n?.value||1));
 const run=()=>{const m=qty(),s=$('#sort').value;let c=0;
  cards.forEach(el=>{const ok=tf.every(i=>!i.value||el.dataset.kw.includes(i.value.toLowerCase().trim()));
   el.hidden=!ok;c+=ok;el.style.order=s=='asc'?el.dataset.price:-el.dataset.price;
   $('.tot',el).textContent=inr(el.dataset.price*m);$('.mult',el).textContent=m>1?' × '+m:''});
  $('#cnt').textContent=c+' result'+(c==1?'':'s');$('#none').hidden=c>0};
 f.onsubmit=e=>{e.preventDefault();run()};f.oninput=run;$('#sort').onchange=run;
 cards.forEach(el=>$('.book',el).onclick=()=>toCheckout({cat:page,title:el.dataset.title,sub:el.dataset.sub,date:f.elements.date?.value,qty:qty(),price:el.dataset.price*qty()}));
 run()}

function login(){const nx=Q.get('next');if(nx)sessionStorage.setItem('xe_next',nx);
 $('#lf').onsubmit=e=>{e.preventDefault();const p=$('#ph').value.trim();if(!/^\d{10}$/.test(p))return toast('Enter a valid 10-digit phone number');set('xe_pending',{phone:p});go('otp.html')};
 $$('.soc').forEach(b=>b.onclick=()=>signIn(b.dataset.s.toLowerCase()+'_demo',{via:b.dataset.s}))}

function otp(){const p=get('xe_pending',null);if(!p)return go('login.html');
 $('#pn').textContent=p.phone.slice(0,2)+'••••••'+p.phone.slice(-2);
 const ins=$$('.otp input');ins[0].focus();toast('Demo OTP: 1234 (no real SMS is sent)');
 const check=()=>{const c=ins.map(i=>i.value).join('');if(c.length<4)return toast('Enter the 4-digit code');
  if(c!='1234'){const o=$('.otp');o.classList.add('shake');setTimeout(()=>o.classList.remove('shake'),400);return toast('Incorrect code. The demo OTP is 1234')}
  localStorage.removeItem('xe_pending');signIn('p'+p.phone,{phone:p.phone})};
 ins.forEach((el,i)=>{el.oninput=()=>{el.value=el.value.replace(/\D/g,'');if(el.value&&ins[i+1])ins[i+1].focus();if(ins.every(x=>x.value))check()};
  el.onkeydown=e=>{if(e.key=='Backspace'&&!el.value&&ins[i-1])ins[i-1].focus()};
  el.onpaste=e=>{const d=(e.clipboardData.getData('text')||'').replace(/\D/g,'').slice(0,4);if(!d)return;e.preventDefault();[...d].forEach((ch,j)=>ins[j].value=ch);ins[Math.min(d.length,3)].focus();if(d.length==4)check()}});
 $('#of').onsubmit=e=>{e.preventDefault();check()};
 let s=30;const tm=setInterval(()=>{s--;$('#rs').innerHTML=s>0?`Resend code in ${s}s`:'<a href="#" id="re">Resend code</a>';
  if(s<=0){clearInterval(tm);$('#re').onclick=e=>{e.preventDefault();toast('Demo OTP: 1234')}}},1000)}

function profile(){const u=user();if(!u)return need();const f=$('#pf'),el=n=>f.elements[n];
 el('name').value=u.name||'';el('dob').value=u.dob||'';el('email').value=u.email||'';el('dob').max=today();
 f.onsubmit=e=>{e.preventDefault();const name=el('name').value.trim(),dob=el('dob').value,email=el('email').value.trim();
  if(name.length<2)return toast('Enter your name');if(!dob)return toast('Enter your date of birth');if(!/^\S+@\S+\.\S+$/.test(email))return toast('Enter a valid email address');
  const first=!u.name,n={...u,name,dob,email},all=get('xe_users',{});all[n.id]=n;set('xe_users',all);set('xe_user',n);
  if(first)notify('Welcome to XploreEase','Your profile is ready. Start planning your next trip.');
  toast('Profile saved');setTimeout(()=>go(nextUrl()),600)};
 $('#lo').onclick=()=>{localStorage.removeItem('xe_user');go('index.html')}}

function notifications(){if(!user())return need();const n=get(K('xe_notes'),[]);
 $('#list').hidden=!n.length;$('#empty').hidden=!!n.length;
 $('#items').innerHTML=n.map(x=>`<div class="note ${x.read?'':'u'}" data-id="${x.id}"><i></i><div><b>${esc(x.title)}</b><p>${esc(x.text)}</p><small>${esc(x.t)}</small></div></div>`).join('');
 const mark=ids=>{const a=get(K('xe_notes'),[]);a.forEach(x=>{if(!ids||ids.includes(x.id))x.read=true});set(K('xe_notes'),a);location.reload()};
 $('#ma').onclick=()=>mark();$$('.note').forEach(el=>el.onclick=()=>mark([+el.dataset.id]))}

function trips(){if(!user())return need();const t=get(K('xe_trips'),[]);$('#te').hidden=!!t.length;
 $('#tl').innerHTML=t.map(x=>`<article class="card res" style="margin-bottom:1rem"><div><small>${esc(x.id)} · ${LBL[x.cat]||x.cat}</small><h3>${esc(x.title)}</h3><p>${esc(x.sub)}${x.date?' · '+esc(x.date):''}</p><p>Paid ${inr(x.paid)} via ${esc(x.method)}</p></div><div class="buy"><span class="pill ${x.status}">${x.status}</span>${x.status=='Confirmed'?`<button class="btn ghost" data-c="${esc(x.id)}">Cancel</button>`:''}</div></article>`).join('');
 $$('[data-c]').forEach(b=>b.onclick=()=>{if(!confirm('Cancel this booking? The refund goes back to your original payment method.'))return;
  const a=get(K('xe_trips'),[]),x=a.find(y=>y.id==b.dataset.c);x.status='Cancelled';set(K('xe_trips'),a);
  notify('Booking cancelled',`${x.title} (${x.id}). Refund of ${inr(x.paid)} initiated.`);location.reload()})}

function forex(){const R={USD:84,EUR:91,GBP:107,AED:22.9,SGD:62,JPY:.56},f=$('#ff');
 const calc=()=>{const x=(+f.elements.a.value||0)*R[f.elements.c.value];$('#fo').textContent=inr(x);return x};
 f.oninput=calc;calc();
 f.onsubmit=e=>{e.preventDefault();const a=+f.elements.a.value,c=f.elements.c.value;if(!(a>=1))return toast('Enter an amount');
  toCheckout({cat:'forex',title:`${a} ${c}`,sub:`Rate ${inr(R[c])} per ${c}`,qty:1,price:calc()})}}

const luhn=n=>/^\d{13,19}$/.test(n)&&[...n].reverse().reduce((s,d,i)=>{d=+d;if(i%2){d*=2;if(d>9)d-=9}return s+d},0)%10==0;
function payments(){const c=get('xe_cart',null);if(!c)return go('index.html');
 if(!user()){sessionStorage.setItem('xe_next','payments.html');return go('login.html')}
 let disc=0,m='upi';const tot=()=>{const tax=Math.round((c.price-disc)*.05);return{tax,total:Math.round(c.price-disc)+tax}};
 const sub=c.sub+(c.date?' · '+c.date:'');$('#pt').textContent=c.title;$('#ps').textContent=sub;
 const sum=()=>{const{tax,total}=tot();
  $('#sum').innerHTML=`<div class="row"><span>Fare${c.qty>1?' × '+c.qty:''}</span><span>${inr(c.price)}</span></div>${disc?`<div class="row"><span>Discount</span><span>−${inr(disc)}</span></div>`:''}<div class="row"><span>Taxes &amp; fees (5%)</span><span>${inr(tax)}</span></div><div class="row t"><span>Total</span><span>${inr(total)}</span></div>`;
  $('#pay').textContent='Pay '+inr(total)};sum();
 $$('[data-m]').forEach(b=>b.onclick=()=>{m=b.dataset.m;$$('[data-m]').forEach(x=>x.classList.toggle('on',x==b));$$('.mp').forEach(p=>p.classList.toggle('on',p.id=='p-'+m))});
 $('#cn').oninput=e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,19).replace(/(.{4})/g,'$1 ').trim()};
 $('#ce').oninput=e=>{const d=e.target.value.replace(/\D/g,'').slice(0,4);e.target.value=d.length>2?d.slice(0,2)+'/'+d.slice(2):d};
 $('#ca').onclick=()=>{if($('#cc').value.trim().toUpperCase()=='XPLORE10'){disc=Math.min(Math.round(c.price*.1),1500);toast('Coupon applied');sum()}else toast('Invalid coupon code')};
 const bad=()=>{if(m=='upi')return /^[\w.\-]{2,}@[a-z]{2,}$/i.test($('#upi').value.trim())?'':'Enter a valid UPI ID, e.g. name@bank';
  if(m=='bank')return $('#bank').value?'':'Select your bank';
  const n=$('#cn').value.replace(/\s/g,''),[mm,yy]=$('#ce').value.split('/').map(Number);
  if(!luhn(n))return'Enter a valid card number';if(!$('#cname').value.trim())return'Enter the name on card';
  if(!(mm>=1&&mm<=12&&yy>=0)||new Date(2000+yy,mm)<=new Date())return'Card expiry is invalid';
  return /^\d{3,4}$/.test($('#cv').value)?'':'Enter a valid CVV'};
 $('#pay').onclick=()=>{const e=bad();if(e)return toast(e);const btn=$('#pay');btn.disabled=true;btn.textContent='Processing payment…';
  setTimeout(()=>{const{total}=tot(),id='XE'+Date.now().toString().slice(-8),
   label=m=='upi'?'UPI':m=='card'?'Card ••'+$('#cn').value.replace(/\s/g,'').slice(-4):'Netbanking · '+$('#bank').value,t=get(K('xe_trips'),[]);
   t.unshift({id,cat:c.cat,title:c.title,sub:c.sub,date:c.date,qty:c.qty,paid:total,method:label,status:'Confirmed'});set(K('xe_trips'),t);
   localStorage.removeItem('xe_cart');notify('Booking confirmed',`${c.title} · Booking ID ${id}`);
   $('#rid').textContent=id;$('#rt').textContent=c.title;$('#rsub').textContent=sub;$('#rm').textContent='Paid via '+label;$('#ra').textContent=inr(total);
   $('#checkout').hidden=true;$('#done').hidden=false},1800)}}

const PAGES={index:home,login,otp,profile,notifications,trips,forex,payments};
(PAGES[page]||(LBL[page]?search:()=>{}))();