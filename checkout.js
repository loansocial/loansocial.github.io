/* LoanSocial on-page checkout. 30 Oct 2026: Whop Elements in a popup (owner: "why not just open a checkout
   window on the site instead like we were doing with the FVK thing?"). 3 Nov 2026: two steps, ported from MedSpa Reels.
   Any link to https://whop.com/checkout/plan_... opens this popup instead of leaving the site.
   Step 1 (Create and Branded AI plans): the plan plus its add-ons as checkboxes, each with a one-line benefit,
     and the running total. Step 2: Whop Elements for the whole cart in one charge, one membership per product,
     so the worker sees each add-on as its own membership. The Profile kit rides on the plan's "+ Profile kit"
     bundle plan (as the pricing bump always did), so the worker records it with the plan itself.
   Team and add-on links (pricing add-on cards, my.html) skip step 1 and go straight to payment, as before.
   ?buy=1 (DM / prospect sample pages): opens on Branded AI monthly with FIRSTMONTH37, $37 the first month
     then $79/month. utm_content rides along to the return URL and the welcome page.
   If Elements fails to load or draw within 12 s, the buyer goes to Whop's hosted checkout for the core
   plan (nothing is lost). Purchase/StartTrial fire in the browser with eventID = the Whop payment id. */
(function(){
  var q0=new URLSearchParams(location.search);
  var PROMO_CODE='FIRSTMONTH37',PROMO_OFF=42,PROMO_PLAN='plan_yXm9cH7nG8c97',UTM=q0.get('utm_content')||'';
  var CORE={ /* plan ids: branded/plan_map.json */
    plan_DacZTAzCU8mz7:{tier:'create',iv:'month',v:37,trial:true,name:'Create monthly'},
    plan_MexNpYQp44EKR:{tier:'create',iv:'year',v:370,name:'Create yearly'},
    plan_yXm9cH7nG8c97:{tier:'branded',iv:'month',v:79,name:'Branded AI monthly',kit:'plan_E3DnxP1Yxvev9'},
    plan_yzmDgvoQUboJ8:{tier:'branded',iv:'year',v:790,name:'Branded AI yearly',kit:'plan_eQUbofECXIzCe'}};
  var BUNDLE={plan_E3DnxP1Yxvev9:'plan_yXm9cH7nG8c97',plan_eQUbofECXIzCe:'plan_yzmDgvoQUboJ8'}; /* "+ Profile kit" plans */
  var SINGLE={ /* straight to payment, no step 1 */
    plan_szA0N8llEI00v:{v:299,name:'Team (5 LOs)',branded:true},
    plan_uAyDTqqNwTYib:{v:29,name:'Realtor co-branded pack',addon:true},
    plan_FquTphD5tUmMX:{v:29,name:'Past-client newsletter',addon:true},
    plan_2txn4VhmFFAUQ:{v:27,name:'Profile kit',addon:true}};
  var ADDONS=[ /* benefit lines: branded/fragments/pricing.html */
    {k:'cobrand',plan:'plan_uAyDTqqNwTYib',name:'Realtor co-branded pack',v:29,tiers:['create','branded'],line:'Your partner agent on every post too. Split the cost with them.'},
    {k:'newsletter',plan:'plan_FquTphD5tUmMX',name:'Past-client newsletter',v:29,tiers:['branded'],line:'One ready-to-send email a month for clients you’ve already closed.'},
    {k:'kit',plan:'plan_2txn4VhmFFAUQ',name:'Profile kit',v:27,once:true,tiers:['branded'],line:'Make your Instagram profile match your new posts.'}];
  var PLANLINE={branded:'About 30 posts a month in your logo, colors and headshot, NMLS footer filled in. 3 free previews first.',
    create:'30 Canva templates, captions and reel scripts every month. You brand and post.'};
  var RX=/whop\.com\/checkout\/(plan_[A-Za-z0-9]{6,30})/;
  var css='.lsco{position:fixed;inset:0;z-index:200;background:rgba(9,16,32,.72);display:grid;place-items:center;padding:16px}'+
    '.lsco[hidden]{display:none}.lsco-box{box-sizing:border-box;width:min(520px,100%);max-height:calc(100dvh - 32px);overflow:auto;background:#fff;border-radius:18px;padding:18px;display:grid;gap:12px;box-shadow:0 30px 80px -20px rgba(0,0,0,.6);font-family:Inter,system-ui,sans-serif;color:#1d2433}'+
    '.lsco-top{display:flex;justify-content:space-between;align-items:center;gap:12px}.lsco-top b{font-family:"Playfair Display",serif;font-size:21px;color:#0e1b33}'+
    '.lsco-x{background:none;border:1px solid #e7dccb;border-radius:999px;width:36px;height:36px;font-size:18px;cursor:pointer;color:#1d2433;flex:none}'+
    '.lsco-plan{background:#faf6ef;border:1px solid #e7dccb;border-radius:14px;padding:14px 16px}.lsco-plan h4{font-size:16px;margin:0 0 4px;color:#0e1b33}.lsco-plan p{font-size:13px;color:#5d6678;margin:0}.lsco-plan p.lsco-deal{color:#0e1b33;font-weight:600;font-size:14px;margin-bottom:4px}'+
    '.lsco-h{font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b07a2a;margin:2px 0 -4px}'+
    '.lsco-add{display:flex;gap:12px;align-items:flex-start;border:1px solid #e7dccb;border-radius:14px;padding:12px 14px;cursor:pointer;transition:border-color .15s,background .15s}'+
    '.lsco-add[hidden]{display:none}.lsco-add:has(input:checked){border-color:#0e1b33;background:#f7f8fb}.lsco-add input{margin-top:3px;width:18px;height:18px;accent-color:#0e1b33;flex:none}'+
    '.lsco-add span{display:grid;gap:2px;font-size:14px}.lsco-add small{color:#5d6678;font-size:13px}.lsco-add em{font-style:normal;color:#0e1b33;font-weight:600;margin-left:auto;white-space:nowrap;font-size:14px}'+
    '.lsco-bar{position:sticky;bottom:-18px;margin:0 -18px -18px;padding:0 18px 18px;background:#fff;display:grid;gap:12px;box-shadow:0 -14px 18px -12px rgba(0,0,0,.12);z-index:1}.lsco-tot{display:flex;justify-content:space-between;align-items:baseline;gap:12px;border-top:1px solid #e7dccb;padding-top:12px;font-size:14px}.lsco-tot b{font-size:20px;color:#0e1b33}.lsco-tot small{display:block;color:#5d6678;font-size:12px;text-align:right}'+
    '.lsco-go{background:#0e1b33;color:#fff;border:0;border-radius:999px;padding:15px 18px;font:600 16px Inter,system-ui,sans-serif;cursor:pointer;width:100%}'+
    '.lsco-back{background:none;border:0;color:#b07a2a;font:500 14px Inter,system-ui,sans-serif;cursor:pointer;justify-self:start;padding:0}.lsco-back[hidden]{display:none}'+
    '.lsco-step{display:grid;gap:12px}.lsco-step[hidden]{display:none}'+
    '.lsco-wait{color:#5d6678;font-size:14px;text-align:center;padding:40px 0}.lsco-wait[hidden]{display:none}#lsco-mount{min-height:380px}'+
    '.lsco-foot{font-size:12px;color:#5d6678;text-align:center;margin:0}.lsco-foot[hidden]{display:none}.lsco-done{text-align:center;padding:10px 4px}.lsco-done h3{font-family:"Playfair Display",serif;font-size:24px;margin:0 0 6px;color:#0e1b33}'+
    '.lsco-done p{color:#5d6678;margin:0 0 14px}html.lsco-open,html.lsco-open body{overflow:hidden}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var adds=ADDONS.map(function(a){return '<label class="lsco-add" data-k="'+a.k+'"><input type="checkbox" value="'+a.k+'"><span><b>'+a.name+'</b><small>'+a.line+'</small></span><em>+$'+a.v+(a.once?' once':'/mo')+'</em></label>'}).join('');
  var co=document.createElement('div');co.className='lsco';co.hidden=true;co.setAttribute('role','dialog');co.setAttribute('aria-modal','true');co.setAttribute('aria-label','Checkout');
  co.innerHTML='<div class="lsco-box"><div class="lsco-top"><b id="lsco-t">Your plan</b><button class="lsco-x" type="button" aria-label="Close checkout">×</button></div>'+
    '<div class="lsco-step" id="lsco-s1"><div class="lsco-plan"><h4 id="lsco-pn"></h4><p class="lsco-deal" id="lsco-deal"></p><p id="lsco-pl"></p></div>'+
      '<p class="lsco-h">Add more, if you want it</p>'+adds+
      '<div class="lsco-bar"><div class="lsco-tot"><span>Today</span><span><b id="lsco-today"></b><small id="lsco-then"></small></span></div>'+
      '<button class="lsco-go" id="lsco-go" type="button">Continue to payment</button>'+
      '<p class="lsco-foot" id="lsco-f1">Secure checkout by Whop · Cancel anytime</p></div></div>'+
    '<div class="lsco-step" id="lsco-s2" hidden><button class="lsco-back" id="lsco-back" type="button">← Change add-ons</button>'+
      '<p class="lsco-wait" id="lsco-wait">Loading secure checkout…</p><div id="lsco-mount"></div>'+
      '<p class="lsco-foot" id="lsco-foot">Secure checkout by Whop · Cancel anytime</p></div></div>';
  document.body.appendChild(co);
  function $(id){return co.querySelector('#'+id)}
  var s1=$('lsco-s1'),s2=$('lsco-s2'),mountEl=$('lsco-mount'),wait=$('lsco-wait'),title=$('lsco-t'),foot=$('lsco-foot'),back=$('lsco-back');
  var boxes=[].slice.call(co.querySelectorAll('.lsco-add input'));
  var sdk=null,sdkWait=[],handle=null,timer=0,lastFocus=null;
  var cur={plan:'',core:null,single:null,promo:false}; /* plan = core (non-bundle) plan id, or the single plan id */
  function fb(){try{if(window.fbq&&typeof PIXEL_ID!=='undefined'&&PIXEL_ID!=='PIXEL_ID')fbq.apply(null,arguments)}catch(e){}}
  function fit(a){return cur.core&&a.tiers.indexOf(cur.core.tier)>=0}
  function picked(){return cur.core?ADDONS.filter(function(a){return fit(a)&&boxes.some(function(b){return b.checked&&b.value===a.k})}):[]}
  function has(k){return picked().some(function(a){return a.k===k})}
  /* the plan Whop charges: the "+ Profile kit" bundle when the kit is ticked (outside the promo, which is limited to the plain monthly plan) */
  function corePlan(){return cur.core&&has('kit')&&!cur.promo?cur.core.kit:cur.plan}
  function cart(){if(cur.single)return [{plan:cur.plan}];
    var items=[{plan:corePlan()}];
    picked().forEach(function(a){if(a.k==='kit'&&!cur.promo)return;items.push({plan:a.plan})});return items}
  function totals(){if(cur.single)return {today:cur.single.v,rec:0};
    var c=cur.core,p=picked(),add=p.reduce(function(s,a){return s+a.v},0),rec=p.filter(function(a){return !a.once}).reduce(function(s,a){return s+a.v},0);
    return {today:(c.trial?0:c.v-(cur.promo?PROMO_OFF:0))+add,rec:rec}}
  function thenText(t){var c=cur.core,r=t.rec;
    if(c.trial)return 'then $'+(c.v+r)+'/month after the 7-day trial';
    if(c.iv==='year')return 'then $'+c.v+'/year'+(r?' + $'+r+'/month':'');
    return 'then $'+(c.v+r)+'/month'}
  function paint(){var t=totals();$('lsco-today').textContent='$'+t.today;$('lsco-then').textContent=thenText(t)}
  boxes.forEach(function(b){b.addEventListener('change',paint)});
  function hosted(){var p=corePlan();return 'https://whop.com/checkout/'+p+'/'+(cur.promo&&p===PROMO_PLAN?'?promoCode='+PROMO_CODE:'')}
  function bail(){location.href=hosted()}
  function loadSdk(cb){if(sdk){cb(sdk);return}sdkWait.push(cb);if(sdkWait.length>1)return;
    var s=document.createElement('script');s.src='https://cdn.whop.com/elements/amber/elements.js';s.async=true;s.setAttribute('data-whop-elements','');
    s.onload=function(){try{sdk=window.WhopElements({locale:'en'})}catch(e){sdk=null}if(!sdk){bail();return}var w=sdkWait;sdkWait=[];w.forEach(function(f){f(sdk)})};
    s.onerror=bail;document.head.appendChild(s)}
  function unmount(){clearTimeout(timer);if(handle){try{handle.destroy()}catch(e){}}handle=null;mountEl.innerHTML=''}
  function label(){var p=picked();return cur.single?cur.single.name:cur.core.name+(p.length?' + '+p.map(function(a){return a.name}).join(' + '):'')}
  function done(r){var t=totals(),id=(r&&(r.paymentId||r.membershipId||r.receiptId))||'',opt=id?{eventID:id}:undefined,ids=cart().map(function(i){return i.plan});
    var trial=cur.core&&cur.core.trial,branded=cur.single?cur.single.branded:cur.core.tier==='branded';
    if(trial){fb('track','StartTrial',{value:cur.core.v,currency:'USD',predicted_ltv:cur.core.v*3,content_name:'LoanSocial '+label()},opt);
      fb('track','Purchase',{value:t.today,currency:'USD',content_name:'LoanSocial '+label()+' (trial)',content_ids:ids,content_type:'product',num_items:ids.length},opt);}
    else fb('track','Purchase',{value:t.today,currency:'USD',content_name:'LoanSocial '+label(),content_ids:ids,content_type:'product',num_items:ids.length},opt);
    setTimeout(function(){
      /* Branded/Team: welcome.html; the worker emails the private setup link (start.html?t=...) to the checkout email */
      if(branded){location.href='/welcome.html'+(UTM?'?utm_content='+encodeURIComponent(UTM):'');return}
      unmount();wait.hidden=true;foot.hidden=true;back.hidden=true;s1.hidden=true;s2.hidden=false;title.textContent="You're in";
      var isAdd=cur.single&&cur.single.addon;
      mountEl.innerHTML='<div class="lsco-done"><h3>'+(trial?'Your free trial has started':'Payment received')+'</h3>'+
        (isAdd?'<p>'+cur.single.name+' is now part of your plan. We’ve emailed you the details.</p><a class="btn dark" href="'+location.pathname+location.search+'">Done</a></div>'
        :'<p>This month’s posts, captions and prompts are waiting in your Whop account. We’ve also emailed you the link.'+(has('cobrand')?' Check your email for the link to add your partner agent.':'')+'</p>'+
        '<a class="btn dark" href="https://whop.com/hub/">Open my posts →</a></div>');},450)}
  function returnUrl(){var u=new URLSearchParams(),t=q0.get('t');if(t)u.set('t',t);
    u.set('checkout','done');u.set('plan',cur.plan);var p=picked();if(p.length)u.set('add',p.map(function(a){return a.k}).join(','));
    if(cur.promo)u.set('promo','1');if(UTM)u.set('utm_content',UTM);return location.origin+location.pathname+'?'+u}
  function pay(){s1.hidden=true;s2.hidden=false;back.hidden=!!cur.single;foot.hidden=false;title.textContent=cur.core&&cur.core.trial?'Start your 7-day free trial':'Checkout';
    foot.textContent=cur.single?'Secure checkout by Whop · Cancel anytime':s1.querySelector('#lsco-f1').textContent;
    unmount();wait.hidden=false;
    loadSdk(function(w){
      try{var opt={items:cart(),returnUrl:returnUrl(),appearance:{theme:{appearance:'light',accentColor:'blue',grayColor:'auto'}},onComplete:done};
        if(cur.promo)opt.promoCode=PROMO_CODE;
        handle=w.checkout.create(opt);
        handle.create('checkout',{onReady:function(){clearTimeout(timer);wait.hidden=true},onError:bail}).mount(mountEl);}catch(e){bail();return}
      timer=setTimeout(function(){if(!wait.hidden)bail()},12000);});}
  $('lsco-go').addEventListener('click',pay);
  back.addEventListener('click',function(){unmount();s2.hidden=true;s1.hidden=false;title.textContent='Your plan'});
  function setup(p,o){o=o||{};var base=BUNDLE[p]||p;
    cur={plan:base,core:CORE[base]||null,single:CORE[base]?null:(SINGLE[base]||{v:0,name:base}),promo:!!o.promo&&base===PROMO_PLAN};
    var pre=(o.add||[]).slice();if(BUNDLE[p])pre.push('kit');
    boxes.forEach(function(b){var a=ADDONS.filter(function(x){return x.k===b.value})[0];b.closest('label').hidden=!fit(a);b.checked=fit(a)&&pre.indexOf(b.value)>=0});
    if(cur.core){var c=cur.core;
      $('lsco-pn').textContent='LoanSocial '+(c.tier==='branded'?'Branded AI':'Create')+(c.iv==='year'?' (yearly)':'');
      $('lsco-deal').textContent=cur.promo?'First month $37, then $79/month, cancel anytime':c.trial?'7 days free, then $37/month, cancel anytime':c.iv==='year'?'$'+c.v+' a year: two months free':'$'+c.v+'/month, cancel anytime';
      $('lsco-pl').textContent=PLANLINE[c.tier];
      $('lsco-f1').textContent=c.tier==='branded'?'Secure checkout by Whop · Full refund within 7 days if you haven’t started your first month':
        c.trial?'Secure checkout by Whop · $0 today for Create · Cancel anytime':'Secure checkout by Whop · Cancel anytime';
      paint()}}
  function open(p,o){o=o||{};setup(p,o);lastFocus=document.activeElement;
    co.hidden=false;document.documentElement.classList.add('lsco-open');
    if(!o.fromPricing){var t=totals();fb('track','InitiateCheckout',{value:t.today,currency:'USD',content_name:'LoanSocial '+label(),content_ids:cart().map(function(i){return i.plan})})}
    if(cur.single)pay();else{s1.hidden=false;s2.hidden=true;title.textContent='Your plan'}
    co.querySelector('.lsco-x').focus()}
  function close(){unmount();co.hidden=true;document.documentElement.classList.remove('lsco-open');if(lastFocus)lastFocus.focus()}
  window.lsCheckout=open;
  co.querySelector('.lsco-x').addEventListener('click',close);
  co.addEventListener('click',function(e){if(e.target===co)close()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!co.hidden)close()});
  document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey)return;
    var m=a.href.match(RX);if(!m)return;e.preventDefault();open(m[1],{fromPricing:!!(a.closest('#pricing')||a.dataset.plan)})});
  /* back from a 3DS / bank page: Elements returns here with status=succeeded */
  if(q0.get('checkout')==='done'){var plan=q0.get('plan')||'',ok=/succeeded|success/.test(q0.get('status')||'');
    var keep=new URLSearchParams();if(q0.get('t'))keep.set('t',q0.get('t'));
    history.replaceState(null,'',location.pathname+(keep.toString()?'?'+keep:''));
    if(ok&&(CORE[plan]||SINGLE[plan])){setup(plan,{promo:q0.get('promo')==='1',add:(q0.get('add')||'').split(',')});
      co.hidden=false;document.documentElement.classList.add('lsco-open');s1.hidden=true;s2.hidden=false;back.hidden=true;done({paymentId:q0.get('payment')||''})}}
  /* DM funnel: ?buy=1 opens Branded AI monthly with the first-month promo */
  else if(q0.get('buy')){q0.delete('buy');history.replaceState(null,'',location.pathname+(q0.toString()?'?'+q0:''));open(PROMO_PLAN,{promo:true})}
})();
