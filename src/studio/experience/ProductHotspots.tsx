import { Html } from '@react-three/drei';
import type { ProductHotspot } from './experience.types';
export function ProductHotspots({points=[]}:{points?:ProductHotspot[]}){
  return <group>{points.map(p=><Html key={p.id} position={p.position} center distanceFactor={7} zIndexRange={[25,10]}>
    <div className="cs-hotspot" title={`${p.label}: ${p.description}`}>
      <span className="cs-hotspot-dot" aria-hidden="true"/><span className="cs-hotspot-copy"><strong>{p.label}</strong><small>{p.description}</small></span>
    </div>
  </Html>)}</group>;
}
