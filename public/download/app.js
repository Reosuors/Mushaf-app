(function(){
  var html=document.documentElement, btn=document.getElementById('langBtn');
  var nodes=[].slice.call(document.querySelectorAll('[data-en]'));
  nodes.forEach(function(n){n.setAttribute('data-ar',n.innerHTML)});
  var imgs=[].slice.call(document.querySelectorAll('[data-en-alt]'));
  imgs.forEach(function(n){n.setAttribute('data-ar-alt',n.getAttribute('alt'))});
  var arTitle=document.title, enTitle='Mushaf — Download for every device';
  function setLang(l){
    var en=l==='en';
    html.lang=en?'en':'ar'; html.dir=en?'ltr':'rtl';
    nodes.forEach(function(n){n.innerHTML=en?n.getAttribute('data-en'):n.getAttribute('data-ar')});
    imgs.forEach(function(n){n.alt=en?n.getAttribute('data-en-alt'):n.getAttribute('data-ar-alt')});
    btn.textContent=en?'العربية':'English';
    document.title=en?enTitle:arTitle;
    try{localStorage.setItem('mushaf-dl-lang',l)}catch(e){}
  }
  btn.addEventListener('click',function(){setLang(html.lang==='en'?'ar':'en')});
  var q=(location.search.match(/[?&]lang=(en|ar)/)||[])[1], saved=null;
  try{saved=localStorage.getItem('mushaf-dl-lang')}catch(e){}
  if((q||saved)==='en') setLang('en');

  // Highlight the visitor's own device
  var ua=navigator.userAgent||'', id='c-web';
  var iPadOS=/Macintosh/.test(ua)&&navigator.maxTouchPoints>1;
  if(/Android/i.test(ua)) id='c-android';
  else if(/iPhone|iPad|iPod/.test(ua)||iPadOS) id='c-ios';
  else if(/Windows/.test(ua)) id='c-win';
  else if(/Macintosh|Mac OS X/.test(ua)) id='c-mac';
  var mine=document.getElementById(id);
  if(mine){mine.classList.add('mine'); if(mine.parentNode.firstElementChild!==mine) mine.parentNode.insertBefore(mine,mine.parentNode.firstElementChild);}

  // Newest version number and file sizes from the GitHub Release
  fetch('https://api.github.com/repos/Reosuors/Mushaf-app/releases/latest',{headers:{Accept:'application/vnd.github+json'}})
    .then(function(r){return r.ok?r.json():null}).then(function(rel){
      if(!rel) return;
      var v=String(rel.tag_name||'').replace(/^v/,'');
      if(v){['ver','ver2'].forEach(function(i){var e=document.getElementById(i); if(e) e.textContent=v})}
      (rel.assets||[]).forEach(function(a){
        var el=document.querySelector('[data-size="'+a.name+'"]');
        var w=document.querySelector('[data-size-wrap="'+a.name+'"]');
        if(el&&w&&a.size){ el.textContent=Math.round(a.size/1048576)+' MB'; w.hidden=false; }
      });
    }).catch(function(){});

  // On the app's own domain: an older app service worker may have stored this page as the
  // offline app shell. Put the real app shell back so the app still opens offline.
  if(location.hostname==='mishafapp32.vercel.app' && window.caches){
    caches.keys().then(function(keys){
      keys.filter(function(k){return k.indexOf('mushaf-static-')===0}).forEach(function(k){
        caches.open(k).then(function(c){
          c.match('/index.html').then(function(res){
            if(!res) return;
            return res.clone().text().then(function(t){
              if(t.indexOf('id="langBtn"')!==-1){
                return fetch('/index.html',{cache:'reload'}).then(function(r){ if(r.ok) return c.put('/index.html',r); });
              }
            });
          });
        });
      });
    }).catch(function(){});
  }
})();
