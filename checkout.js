/* LoanSocial on-page checkout (30 Oct 2026, owner: "why not just open a checkout window on the site
   instead like we were doing with the FVK thing?"). Same pattern as FVK: Whop Elements in a popup.
   Any link to https://whop.com/checkout/plan_... opens Whop's checkout on this page instead of
   leaving the site. If Elements fails to load or draw within 12 s, the buyer goes to the same
   plan's hosted Whop checkout (nothing is lost). Purchase/StartTrial fire in the browser with
   eventID = the Whop payment/membership id. */
(function(){
  var PRICE={ /* USD charged today, per plan */
    plan_DacZTAzCU8mz7:{v:37,trial:true,name:'Create monthly'},
    plan_MexNpYQp44EKR:{v:370,name:'Create yearly'},
    plan_yXm9cH7nG8c97:{v:79,name:'Branded AI monthly',branded:true},
    plan_yzmDgvoQUboJ8:{v:790,name:'Branded AI yearly',branded:true},
    plan_E3DnxP1Yxvev9:{v:106,name:'Branded AI monthly + Profile kit',branded:true},
    plan_eQUbofECXIzCe:{v:817,name:'Branded AI yearly + Profile kit',branded:true},
    plan_szA0N8llEI00v:{v:299,name:'Team (5 LOs)',branded:true},
    plan_uAyDTqqNwTYib:{v:29,name:'Realtor co-branded pack',addon:true},
    plan_FquTphD5tUmMX:{v:29,name:'Past-client newsletter',addon:true},
    plan_2txn4VhmFFAUQ:{v:27,name:'Profile kit',addon:true}
  };
  var RX=/whop\.com\/checkout\/(plan_[A-Za-z0-9]{6,30})/;
  var css='.lsco{position:fixed;inset:0;z-index:200;background:rgba(9,16,32,.72);display:grid;place-items:center;padding:16px}'+
    '.lsco[hidden]{display:none}.lsco-box{box-sizing:border-box;width:min(520px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border-radius:18px;padding:18px;display:grid;gap:12px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6)}'+
    '.lsco-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.lsco-top b{font-family:"Playfair Display",serif;font-size:21px;color:#0e1b33}'+
    '.lsco-x{background:none;border:1px solid #e7dccb;border-radius:999px;width:36px;height:36px;font-size:18px;cursor:pointer;color:#1d2433}'+
    '.lsco-wait{color:#5d6678;font-size:14px;text-align:center;padding:40px 0}.lsco-wait[hidden]{display:none}#lsco-mount{min-height:380px}'+
    '.lsco-foot{font-size:12px;color:#5d6678;text-align:center;margin:0}.lsco-done{text-align:center;padding:10px 4px}.lsco-done h3{font-family:"Playfair Display",serif;font-size:24px;margin:0 0 6px;color:#0e1b33}'+
    '.lsco-done p{color:#5d6678;margin:0 0 14px}html.lsco-open,html.lsco-open body{overflow:hidden}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var co=document.createElement('div');co.className='lsco';co.hidden=true;co.setAttribute('role','dialog');co.setAttribute('aria-modal','true');co.setAttribute('aria-label','Checkout');
  co.innerHTML='<div class="lsco-box"><div class="lsco-top"><b id="lsco-t">Start your free trial</b><button class="lsco-x" type="button" aria-label="Close checkout">×</button></div>'+
    '<p class="lsco-wait" id="lsco-wait">Loading secure checkout…</p><div id="lsco-mount"></div>'+
    '<p class="lsco-foot" id="lsco-foot">Secure checkout by Whop · Cancel anytime</p></div>';
  document.body.appendChild(co);
  var mountEl=co.querySelector('#lsco-mount'),wait=co.querySelector('#lsco-wait'),title=co.querySelector('#lsco-t'),foot=co.querySelector('#lsco-foot');
  var sdk=null,sdkWait=[],handle=null,timer=0,plan='',lastFocus=null;
  function fb(){try{if(window.fbq&&typeof PIXEL_ID!=='undefined'&&PIXEL_ID!=='PIXEL_ID')fbq.apply(null,arguments)}catch(e){}}
  function hosted(){return 'https://whop.com/checkout/'+plan+'/'}
  function bail(){location.href=hosted()}
  function loadSdk(cb){if(sdk){cb(sdk);return}sdkWait.push(cb);if(sdkWait.length>1)return;
    var s=document.createElement('script');s.src='https://cdn.whop.com/elements/amber/elements.js';s.async=true;s.setAttribute('data-whop-elements','');
    s.onload=function(){try{sdk=window.WhopElements({locale:'en'})}catch(e){sdk=null}if(!sdk){bail();return}var w=sdkWait;sdkWait=[];w.forEach(function(f){f(sdk)})};
    s.onerror=bail;document.head.appendChild(s)}
  function unmount(){clearTimeout(timer);if(handle){try{handle.destroy()}catch(e){}}handle=null;mountEl.innerHTML=''}
  function done(r){var P=PRICE[plan]||{v:0,name:plan},id=(r&&(r.paymentId||r.membershipId||r.receiptId))||'';
    var opt=id?{eventID:id}:undefined;
    if(P.trial){fb('track','StartTrial',{value:P.v,currency:'USD',predicted_ltv:P.v*3,content_name:'LoanSocial '+P.name},opt);
      fb('track','Purchase',{value:0,currency:'USD',content_name:'LoanSocial '+P.name+' (trial)',content_ids:[plan],content_type:'product'},opt);}
    else fb('track','Purchase',{value:P.v,currency:'USD',content_name:'LoanSocial '+P.name,content_ids:[plan],content_type:'product'},opt);
    setTimeout(function(){
      if(P.branded){location.href='/welcome.html';return}
      unmount();wait.hidden=true;foot.hidden=true;title.textContent="You're in";
      mountEl.innerHTML='<div class="lsco-done"><h3>'+(P.trial?'Your free trial has started':'Payment received')+'</h3>'+
        (P.addon?'<p>'+P.name+' is now part of your plan. We’ve emailed you the details.</p><a class="btn dark" href="'+location.pathname+location.search+'">Done</a></div>'
        :'<p>This month’s posts, captions and prompts are waiting in your Whop account. We’ve also emailed you the link.</p>'+
        '<a class="btn dark" href="https://whop.com/hub/">Open my posts →</a></div>');},450)}
  function mount(){unmount();wait.hidden=false;
    loadSdk(function(w){
      try{handle=w.checkout.create({plan:plan,returnUrl:location.origin+'/?checkout=done&plan='+plan,
          appearance:{theme:{appearance:'light',accentColor:'blue',grayColor:'auto'}},onComplete:done});
        handle.create('checkout',{onReady:function(){clearTimeout(timer);wait.hidden=true},onError:bail}).mount(mountEl);}catch(e){bail();return}
      timer=setTimeout(function(){if(!wait.hidden)bail()},12000);});}
  function open(p,fromPricing){plan=p;var P=PRICE[p]||{};lastFocus=document.activeElement;
    title.textContent=P.trial?'Start your 7-day free trial':'Checkout';foot.hidden=false;
    foot.textContent=P.trial?'Secure checkout by Whop · $0 today, then $37/month · Cancel anytime':'Secure checkout by Whop · Cancel anytime';
    co.hidden=false;document.documentElement.classList.add('lsco-open');
    if(!fromPricing)fb('track','InitiateCheckout',{value:P.v||0,currency:'USD',content_name:'LoanSocial '+(P.name||p),content_ids:[p]});
    mount();co.querySelector('.lsco-x').focus()}
  function close(){unmount();co.hidden=true;document.documentElement.classList.remove('lsco-open');if(lastFocus)lastFocus.focus()}
  co.querySelector('.lsco-x').addEventListener('click',close);
  co.addEventListener('click',function(e){if(e.target===co)close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!co.hidden)close()});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;
    var m=a.href.match(RX);if(!m)return;e.preventDefault();open(m[1],!!(a.closest('#pricing')||a.dataset.plan))});
  /* back from a 3DS / bank page: Elements returns here with status=succeeded */
  var q=new URLSearchParams(location.search);
  if(q.get('checkout')==='done'){plan=q.get('plan')||'';var ok=/succeeded|success/.test(q.get('status')||'');
    history.replaceState(null,'',location.pathname);
    if(ok&&PRICE[plan]){co.hidden=false;document.documentElement.classList.add('lsco-open');done({paymentId:q.get('payment')||''})}}
})();
