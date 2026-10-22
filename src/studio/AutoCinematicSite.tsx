import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, ArrowUpRight, Box, Check, ChevronLeft, ChevronRight, MoveUpRight, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import raw from './generated.site.json';
import allExperiencePresets from '../../experience-presets.json';
import type { ExperiencePreset, ProductHotspot } from './experience';
import { ExperienceModules } from './modules/ExperienceModules';
import './studio.css';
import './premium.css';

gsap.registerPlugin(ScrollTrigger);
const ModelViewport=lazy(()=>import('./ModelViewport'));
type Product={
  id:string;name:string;description?:string;modelPath?:string|null;imagePath?:string|null;
  price?:number|null;currency?:string;purchaseUrl?:string|null;concept?:string;hotspots?:ProductHotspot[];
};
type Config={
  schemaVersion:number;template:string;brand:string;category:string;eyebrow:string;
  headline:string;emphasis:string;summary:string;accent:string;secondary:string;
  background:string;foreground:string;concept:string;layout:string;
  chapters:string[];products:Product[];recipe?:string[];supportEmail?:string|null;
};
const site=raw as Config;
const experience=(allExperiencePresets as Record<string,ExperiencePreset>)[site.template];
function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const m=window.matchMedia('(prefers-reduced-motion: reduce)');
    const update=()=>setReduced(m.matches);update();m.addEventListener('change',update);
    return()=>m.removeEventListener('change',update);
  },[]);
  return reduced;
}
function cost(p:Product){
  if(typeof p.price!=='number')return 'Price on request';
  try{return new Intl.NumberFormat('en-IN',{style:'currency',currency:p.currency||'INR'}).format(p.price);}
  catch{return `${p.price}`;}
}
function AnimIn({children,className='',delay=0}:{children:React.ReactNode;className?:string;delay?:number}){
  const reduced=useReducedMotion();
  return <motion.div className={className} initial={reduced?false:{opacity:0,y:26}} whileInView={{opacity:1,y:0}}
    viewport={{once:true,amount:.12}} transition={{duration:reduced?0:.85,delay:reduced?0:delay,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}
function ProductDialog({item,close,next,prev,reduced}:{item:Product;close:()=>void;next:()=>void;prev:()=>void;reduced:boolean}){
  const closeRef=useRef<HTMLButtonElement>(null);
  const dialogRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const previouslyFocused=document.activeElement as HTMLElement|null;
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape')close();
      if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')prev();
      if(e.key==='Tab'&&dialogRef.current){
        const items=Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])'));
        if(!items.length)return;const first=items[0],last=items[items.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',key);closeRef.current?.focus();
    const old=document.body.style.overflow;document.body.style.overflow='hidden';
    return()=>{document.removeEventListener('keydown',key);document.body.style.overflow=old;previouslyFocused?.focus();};
  },[close,next,prev]);
  return <div className="cs-dialog-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
    <section ref={dialogRef} role="dialog" aria-modal="true" aria-label={`3D preview of ${item.name}`} className="cs-dialog">
      <div className="cs-dialog-head"><div><span className="cs-eyebrow">EXPLORE IN THREE DIMENSIONS</span><h3>{item.name}</h3></div><button ref={closeRef} aria-label="Close 3D preview" onClick={close} className="cs-circle"><X size={21}/></button></div>
      <div className="cs-dialog-view"><Suspense fallback={<div className="cs-model-fallback"/>}>
        <ModelViewport key={item.id} modelPath={item.modelPath} concept={item.concept||site.concept} accent={site.accent}
          interactive reducedMotion={reduced} stage="detail" label={item.name} experience={experience} hotspots={item.hotspots||[]}/>
      </Suspense></div>
      <div className="cs-dialog-foot"><p>Drag to rotate · wheel to zoom · arrows to change product. {item.modelPath?'3D file supplied by store owner.':'Concept art only; an accurate product GLB is needed for a true likeness.'}</p><div className="cs-dialog-arrows"><button className="cs-circle" aria-label="Previous product" onClick={prev}><ChevronLeft/></button><button className="cs-circle" aria-label="Next product" onClick={next}><ChevronRight/></button></div></div>
    </section>
  </div>;
}
export default function AutoCinematicSite(){
  const reduced=useReducedMotion();
  const storyRef=useRef<HTMLElement>(null);
  const [selected,setSelected]=useState<number|null>(null);
  const showDialog=selected!==null&&site.products[selected];
  useEffect(()=>{
    if(reduced||!storyRef.current)return;
    const ctx=gsap.context(()=>{
      gsap.utils.toArray<HTMLElement>('[data-story-chapter]').forEach((el)=>{
        gsap.fromTo(el,{y:55,opacity:.3},{y:0,opacity:1,ease:'none',scrollTrigger:{trigger:el,start:'top 88%',end:'top 42%',scrub:.65}});
      });
    },storyRef);
    return()=>ctx.revert();
  },[reduced]);
  const handleNext=()=>setSelected(n=>n===null?0:(n+1)%site.products.length);
  const handlePrev=()=>setSelected(n=>n===null?0:(n-1+site.products.length)%site.products.length);
  const isDemo=site.brand.includes('DEMO');
  return <main className={`cs-site cs-layout-${site.layout} cs-template-${site.template}`} style={{
    '--cs-bg':site.background,'--cs-text':site.foreground,'--cs-accent':site.accent,'--cs-secondary':site.secondary
  } as React.CSSProperties}>
    <a href="#cs-collection" className="cs-skip">Skip animation, go to products</a>
    <header className="cs-header" id="cs-top">
      <a href="#cs-top" className="cs-brand">{site.brand}</a>
      <nav aria-label="Main navigation"><a href="#cs-story">Our story</a><a href="#cs-collection">Collection</a><a href="#cs-finale">Explore</a></nav>
      <a className="cs-header-link" href="#cs-collection">Discover <ArrowUpRight size={16}/></a>
    </header>
    <section className="cs-hero" aria-label={site.headline+' '+site.emphasis}>
      <div className="cs-hero-noise" aria-hidden="true"/>
      <div className="cs-orbit-outline" aria-hidden="true"/>
      <div className="cs-hero-content">
        <AnimIn><div className="cs-eyebrow"><span className="cs-glow-dot"/>{site.eyebrow}</div></AnimIn>
        <motion.h1 initial={reduced?false:{opacity:0,y:35}} animate={{opacity:1,y:0}} transition={{duration:reduced?0:1.2,ease:[.22,1,.36,1]}}>
          {site.headline}<br/><em>{site.emphasis}</em>
        </motion.h1>
        <AnimIn delay={.18}><p className="cs-hero-summary">{site.summary}</p><a href="#cs-story" className="cs-primary">Enter the experience <ArrowRight size={17}/></a></AnimIn>
      </div>
      <div className="cs-hero-model" aria-hidden="true">
        <Suspense fallback={<div className="cs-model-fallback"/>}>
          <ModelViewport concept={site.products[0]?.concept||site.concept} modelPath={site.products[0]?.modelPath}
            accent={site.accent} reducedMotion={reduced} label="Hero conceptual object" experience={experience}/>
        </Suspense>
      </div>
      <div className="cs-vertical-label">{site.category.toUpperCase()} / AN IMMERSIVE DIGITAL EXPERIENCE</div>
      <a href="#cs-story" className="cs-scroll">SCROLL TO DISCOVER <ArrowDown size={17}/></a>
    </section>
    <section ref={storyRef} id="cs-story" className="cs-story" aria-label="Brand story">
      <div className="cs-story-intro"><AnimIn><div className="cs-eyebrow">A STORY IN THREE ACTS</div><h2>Beyond what <em>you expect.</em></h2></AnimIn></div>
      <div className="cs-story-chapters">
        {site.chapters.map((title,i)=><div key={title} className="cs-story-chapter" data-story-chapter>
          <div className="cs-story-count">0{i+1} <span>/ 03</span></div>
          <div><h3>{title}</h3><p>{i===0?site.summary:i===1?'Every movement is intentional. Every surface and interaction deserves consideration.':'A responsive, accessible journey that brings the story to life.'}</p></div>
          <div className="cs-story-line"/>
        </div>)}
      </div>
    </section>
    <ExperienceModules slot="pre-collection" modules={site.recipe} brand={site.brand} category={site.category} summary={site.summary} chapters={site.chapters} products={site.products} onOpen={setSelected} reducedMotion={reduced}/>
    <section id="cs-collection" className="cs-collection">
      <AnimIn className="cs-collection-head"><div><div className="cs-eyebrow">THE COLLECTION / EXPLORE IN 3D</div><h2>Every angle, <em>a new story.</em></h2></div><p>Each product can have its own licensed 3D GLB model. The included abstract previews are explicitly conceptual until you add those assets.</p></AnimIn>
      <div className="cs-products">
        {site.products.map((product,i)=><AnimIn key={product.id} className="cs-product" delay={Math.min(i*.07,.3)}>
          <button className="cs-product-visual" aria-label={`Open 3D view of ${product.name}`} onClick={()=>setSelected(i)}>
            {product.imagePath?<img src={product.imagePath} alt={`${product.name} product photography`} loading="lazy"/>:
              <div className="cs-product-art" aria-hidden="true"><div className="cs-product-art-ring"/><Box size={56} strokeWidth={.8}/></div>}
            <span className="cs-product-mode">{product.modelPath?'3D MODEL':'CONCEPT MODEL'}</span><span className="cs-product-action">VIEW IN 3D <MoveUpRight size={17}/></span>
          </button>
          <div className="cs-product-meta"><div><span className="cs-product-id">0{i+1} / {product.id}</span><h3>{product.name}</h3><p>{product.description||'Explore the details in 3D.'}</p></div><div className="cs-product-price">{cost(product)}{product.purchaseUrl&&<a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer sponsored" aria-label={`View purchase options for ${product.name}`}>Purchase <ArrowUpRight size={13}/></a>}</div></div>
        </AnimIn>)}
      </div>
      {isDemo&&<div className="cs-demo-notice">DEMO COLLECTION — replace placeholder products, prices and affiliate or checkout URLs with your verified data before publishing.</div>}
    </section>
    <ExperienceModules slot="post-collection" modules={site.recipe} brand={site.brand} category={site.category} summary={site.summary} chapters={site.chapters} products={site.products} onOpen={setSelected} reducedMotion={reduced}/>
    <section className="cs-statement" aria-label="Design philosophy"><AnimIn><span className="cs-eyebrow">DIGITAL CRAFT / IN MOTION</span><blockquote>Not more effects.<br/><em>More feeling.</em></blockquote><div className="cs-statement-rule"/></AnimIn></section>
    <section className="cs-finale" id="cs-finale"><div className="cs-finale-ambient"/><AnimIn><div className="cs-eyebrow">A DIFFERENT PERSPECTIVE</div><h2>Explore what’s <em>possible.</em></h2><p>See how every detail comes together in a spatial product story.</p><a href="#cs-collection" className="cs-primary">Explore the collection <ArrowRight size={17}/></a></AnimIn></section>
    <footer className="cs-footer"><a href="#cs-top">{site.brand}</a><span>{isDemo?'DEMONSTRATION — NOT A LIVE STORE':'An original immersive digital storefront'} · {new Date().getFullYear()}</span><a href="?view=toolkit">Component catalog ↗</a></footer>
    {showDialog&&<ProductDialog item={showDialog} close={()=>setSelected(null)} next={handleNext} prev={handlePrev} reduced={reduced}/>}
  </main>;
}
