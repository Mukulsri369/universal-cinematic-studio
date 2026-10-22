import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import AutoCinematicSite from './studio/AutoCinematicSite';
import './styles.css';
const ComponentCatalog=lazy(()=>import('./App'));
const ClassicCinematic=lazy(()=>import('./cinematic/CinematicStorefront'));
const view=new URLSearchParams(window.location.search).get('view');
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<div style={{minHeight:'100vh',background:'#111'}}/>}>
      {view==='toolkit'?<ComponentCatalog/>:view==='classic'?<ClassicCinematic/>:<AutoCinematicSite/>}
    </Suspense>
  </React.StrictMode>
);
