import React, { useState, useEffect, useRef } from 'react';
import { Instagram, ZoomIn, ZoomOut, MoveRight, Info, MousePointer2 } from 'lucide-react';

export const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

export function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-stone-900 text-stone-300 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] z-50 border-t-4 border-indigo-500">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="font-bold text-xl text-white tracking-wide flex items-center gap-2">
          <span className="bg-indigo-500 text-white px-2 py-1 rounded-md text-sm">Profe</span>
          la_transformada_de_naomi
        </div>
        <div className="flex gap-4">
          <a href="https://instagram.com/la_transformada_de_naomi" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white hover:bg-pink-600 transition bg-stone-800 px-5 py-2.5 rounded-full font-semibold">
            <Instagram size={20} />
            <span className="hidden sm:inline">Instagram</span>
          </a>
          <a href="https://tiktok.com/@la_transformada_de_naomi" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white hover:bg-black transition bg-stone-800 px-5 py-2.5 rounded-full font-semibold border border-stone-700 hover:border-stone-500">
            <TikTokIcon className="w-5 h-5" />
            <span className="hidden sm:inline">TikTok</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

const FUNCTIONS = [
  { id: 'quad', name: 'Estándar (Cuadrática)', f: (x: number) => 0.2 * x * x + 1, df: (x: number) => 0.4 * x, str: '0.2x² + 1' },
  { id: 'cubic', name: 'Cúbica', f: (x: number) => 0.1 * x * x * x - 0.5 * x * x + 2, df: (x: number) => 0.3 * x * x - x, str: '0.1x³ - 0.5x² + 2' },
  { id: 'exp', name: 'Exponencial', f: (x: number) => Math.exp(0.5 * x), df: (x: number) => 0.5 * Math.exp(0.5 * x), str: 'e^(0.5x)' },
  { id: 'trig', name: 'Trigonométrica', f: (x: number) => Math.sin(x) + 2, df: (x: number) => Math.cos(x), str: 'sin(x) + 2' },
  { id: 'log', name: 'Logarítmica', f: (x: number) => Math.log(Math.max(0.001, x)) + 2, df: (x: number) => 1 / Math.max(0.001, x), str: 'ln(x) + 2' },
];

export default function App() {
  const [funcId, setFuncId] = useState(FUNCTIONS[0].id);
  const [x, setX] = useState(3);
  const [h, setH] = useState(3);
  const [scale, setScale] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const activeFunc = FUNCTIONS.find(f => f.id === funcId) || FUNCTIONS[0];
  const f = activeFunc.f;
  const df = activeFunc.df;

  useEffect(() => {
    if (!isAnimating) return;
    
    let animationFrame: number;
    const animate = () => {
      setH(prev => {
        const step = prev * 0.04;
        const next = prev - step;
        if (Math.abs(next) < 0.0001) {
          setIsAnimating(false);
          return 0;
        }
        return next;
      });
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isAnimating]);

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 1.1;
      if (e.deltaY < 0) {
        setScale(prev => Math.min(prev * zoomFactor, 100000));
      } else {
        setScale(prev => Math.max(prev / zoomFactor, 0.1));
      }
    };

    svgElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => svgElement.removeEventListener('wheel', handleWheel);
  }, []);

  const width = 800;
  const height = 500;

  // Base domain
  const baseSpanX = 10;
  const baseSpanY = 12;

  // Zoomed domain
  const spanX = baseSpanX / scale;
  const spanY = baseSpanY / scale;
  
  // Center is always P(x, f(x))
  const centerX = x;
  const centerY = f(x);

  const xMin = centerX - spanX / 2;
  const xMax = centerX + spanX / 2;
  const yMin = centerY - spanY / 2;
  const yMax = centerY + spanY / 2;

  const toSvgX = (val: number) => ((val - xMin) / (xMax - xMin)) * width;
  const toSvgY = (val: number) => height - ((val - yMin) / (yMax - yMin)) * height;

  // Generate path for the function
  const pathPoints = [];
  const numPoints = 300;
  for (let i = 0; i <= numPoints; i++) {
    const valX = xMin + (i / numPoints) * (xMax - xMin);
    const valY = f(valX);
    // Avoid drawing points way outside the view to prevent SVG rendering issues
    if (valY > yMin - spanY * 2 && valY < yMax + spanY * 2) {
      pathPoints.push(`${toSvgX(valX)},${toSvgY(valY)}`);
    }
  }
  const pathD = pathPoints.length > 0 ? `M ${pathPoints.join(' L ')}` : '';

  const px = x;
  const py = f(x);
  const qx = x + h;
  const qy = f(x + h);

  const mSecant = h === 0 ? df(x) : (qy - py) / h;
  const mTangent = df(x);
  
  const secantY1 = py + mSecant * (xMin - px);
  const secantY2 = py + mSecant * (xMax - px);
  
  const tangentY1 = py + mTangent * (xMin - px);
  const tangentY2 = py + mTangent * (xMax - px);

  const getGridStep = (span: number) => {
    const log = Math.log10(span);
    const order = Math.floor(log);
    const step = Math.pow(10, order - 1);
    if (span / step > 50) return step * 10;
    if (span / step > 20) return step * 5;
    if (span / step > 10) return step * 2;
    return step;
  };

  const gridStepX = getGridStep(spanX);
  const gridStepY = getGridStep(spanY);

  const gridLinesX = [];
  for (let i = Math.floor(xMin / gridStepX) * gridStepX; i <= xMax; i += gridStepX) {
    gridLinesX.push(i);
  }

  const gridLinesY = [];
  for (let i = Math.floor(yMin / gridStepY) * gridStepY; i <= yMax; i += gridStepY) {
    gridLinesY.push(i);
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-32 font-sans text-stone-800 selection:bg-indigo-200">
      <header className="bg-white shadow-sm border-b border-stone-200 py-6 px-4 sm:px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              El Concepto de <span className="text-indigo-600">Derivada</span>
            </h1>
            <p className="text-stone-500 mt-1 text-sm sm:text-base">
              Descubre cómo la recta secante se transforma en la recta tangente.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium border border-indigo-100">
            <Info size={16} />
            <span>Interactúa con los controles</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Graph Section */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-stone-100 bg-stone-50 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-stone-700">Función:</h2>
                <select 
                  value={funcId}
                  onChange={(e) => {
                    setFuncId(e.target.value);
                    if (e.target.value === 'log' && x <= 0) setX(1);
                  }}
                  className="bg-white border border-stone-300 text-stone-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 font-medium shadow-sm"
                >
                  {FUNCTIONS.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 text-sm text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div> Secante
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-stone-400 shadow-sm"></div> Tangente
                </span>
              </div>
            </div>
            
            <div className="relative w-full aspect-square sm:aspect-video bg-white overflow-hidden group">
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-stone-200 text-xs font-medium text-stone-600 flex items-center gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <MousePointer2 size={14} /> Usa la rueda del mouse para hacer zoom
              </div>
              <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-full cursor-crosshair">
                <defs>
                  <pattern id="grid" width={toSvgX(xMin + gridStepX) - toSvgX(xMin)} height={toSvgY(yMin) - toSvgY(yMin + gridStepY)} patternUnits="userSpaceOnUse">
                    <path d={`M ${toSvgX(xMin + gridStepX) - toSvgX(xMin)} 0 L 0 0 0 ${toSvgY(yMin) - toSvgY(yMin + gridStepY)}`} fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                  </pattern>
                </defs>
                
                {/* Grid */}
                {gridLinesX.map(gx => (
                  <line key={`gx-${gx}`} x1={toSvgX(gx)} y1={0} x2={toSvgX(gx)} y2={height} stroke="#f3f4f6" strokeWidth="1" />
                ))}
                {gridLinesY.map(gy => (
                  <line key={`gy-${gy}`} x1={0} y1={toSvgY(gy)} x2={width} y2={toSvgY(gy)} stroke="#f3f4f6" strokeWidth="1" />
                ))}

                {/* Axes */}
                <line x1={0} y1={toSvgY(0)} x2={width} y2={toSvgY(0)} stroke="#d1d5db" strokeWidth="2" />
                <line x1={toSvgX(0)} y1={0} x2={toSvgX(0)} y2={height} stroke="#d1d5db" strokeWidth="2" />

                {/* Axis Labels */}
                {toSvgX(0) > 0 && toSvgX(0) < width && toSvgY(0) > 0 && toSvgY(0) < height && (
                  <text x={toSvgX(0) - 15} y={toSvgY(0) + 20} fill="#9ca3af" fontSize="14">0</text>
                )}
                {toSvgY(0) > 0 && toSvgY(0) < height && (
                  <text x={width - 20} y={toSvgY(0) - 10} fill="#9ca3af" fontSize="14" fontStyle="italic">x</text>
                )}
                {toSvgX(0) > 0 && toSvgX(0) < width && (
                  <text x={toSvgX(0) + 10} y={20} fill="#9ca3af" fontSize="14" fontStyle="italic">y</text>
                )}

                {/* Function Curve */}
                {pathD && <path d={pathD} fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Tangent Line */}
                <line 
                  x1={toSvgX(xMin)} y1={toSvgY(tangentY1)} 
                  x2={toSvgX(xMax)} y2={toSvgY(tangentY2)} 
                  stroke="#9ca3af" strokeWidth="2" strokeDasharray="6,6"
                />

                {/* Secant Line */}
                <line 
                  x1={toSvgX(xMin)} y1={toSvgY(secantY1)} 
                  x2={toSvgX(xMax)} y2={toSvgY(secantY2)} 
                  stroke="#3b82f6" strokeWidth="2.5" 
                />

                {/* Delta x and Delta y */}
                {h !== 0 && (
                  <g opacity={Math.max(0, 1 - Math.log10(scale) * 0.5)}>
                    <line 
                      x1={toSvgX(px)} y1={toSvgY(py)} 
                      x2={toSvgX(qx)} y2={toSvgY(py)} 
                      stroke="#f59e0b" strokeWidth="2" strokeDasharray="4,4" 
                    />
                    <line 
                      x1={toSvgX(qx)} y1={toSvgY(py)} 
                      x2={toSvgX(qx)} y2={toSvgY(qy)} 
                      stroke="#10b981" strokeWidth="2" strokeDasharray="4,4" 
                    />
                    
                    {Math.abs(toSvgX(qx) - toSvgX(px)) > 40 && (
                      <text x={toSvgX(px + h/2)} y={toSvgY(py) + (scale > 1 ? 20 : 20)} fill="#f59e0b" fontSize="14" textAnchor="middle" fontWeight="600">
                        Δx = {h.toFixed(2)}
                      </text>
                    )}
                    {Math.abs(toSvgY(qy) - toSvgY(py)) > 40 && (
                      <text x={toSvgX(qx) + 10} y={toSvgY(py + (qy-py)/2)} fill="#10b981" fontSize="14" alignmentBaseline="middle" fontWeight="600">
                        Δy
                      </text>
                    )}
                  </g>
                )}

                {/* Point P */}
                <circle cx={toSvgX(px)} cy={toSvgY(py)} r="6" fill="#ef4444" className="drop-shadow-md" />
                <text x={toSvgX(px) - 12} y={toSvgY(py) - 12} fill="#ef4444" fontSize="16" fontWeight="bold" textAnchor="end">P</text>

                {/* Point Q */}
                {h !== 0 && (
                  <>
                    <circle cx={toSvgX(qx)} cy={toSvgY(qy)} r="6" fill="#8b5cf6" className="drop-shadow-md" />
                    <text x={toSvgX(qx) + 12} y={toSvgY(qy) - 12} fill="#8b5cf6" fontSize="16" fontWeight="bold">Q</text>
                  </>
                )}

                {/* Function Label */}
                <text x="20" y="40" fill="#1f2937" fontSize="18" fontStyle="italic" fontWeight="600">
                  f(x) = {activeFunc.str}
                </text>
              </svg>
            </div>

            {/* Didactic Explanation */}
            <div className="p-5 sm:p-6 bg-indigo-50/50 border-t border-indigo-100">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <MoveRight size={18} className="text-indigo-500" />
                ¿Qué estamos observando?
              </h4>
              <p className="text-indigo-800 text-sm leading-relaxed">
                La <strong>derivada</strong> de una función se puede interpretar como la pendiente de la recta tangente a la curva en un punto dado <span className="text-red-600 font-semibold">P</span>. 
                Para calcularla, tomamos un segundo punto <span className="text-purple-600 font-semibold">Q</span> a una distancia <span className="text-amber-600 font-semibold">h</span> y trazamos una recta secante. 
                A medida que hacemos <span className="text-amber-600 font-semibold">h</span> más pequeño (acercando Q a P), la recta secante se aproxima a la recta tangente. 
                ¡Haz zoom con la rueda del mouse para ver que, por más pequeño que sea h, la secante y la tangente solo son iguales cuando h = 0!
              </p>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Control Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h3 className="text-lg font-bold text-stone-800 mb-6">Controles</h3>
            
            <div className="space-y-6">
              {/* h Slider */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
                    Distancia h
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setIsAnimating(!isAnimating)}
                      className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-2 py-1 rounded-md transition font-medium border border-indigo-200"
                    >
                      {isAnimating ? 'Detener' : 'Animar h → 0'}
                    </button>
                    <span className="font-mono text-sm px-2 py-1 rounded-md font-medium bg-amber-100 text-amber-800 border border-amber-200">
                      h = {h.toFixed(4)}
                    </span>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="-4" max="4" step="0.0001" 
                  value={h} 
                  onChange={(e) => { setH(parseFloat(e.target.value)); setIsAnimating(false); }}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-stone-400 mt-2 font-medium">
                  <span>-4</span>
                  <span>0</span>
                  <span>4</span>
                </div>
              </div>

              {/* x Slider */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
                    Punto base x
                  </label>
                  <span className="font-mono text-sm px-2 py-1 rounded-md font-medium bg-red-100 text-red-800 border border-red-200">
                    x = {x.toFixed(2)}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={funcId === 'log' ? "0.1" : "-8"} max="8" step="0.01" 
                  value={x} 
                  onChange={(e) => setX(parseFloat(e.target.value))}
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              {/* Zoom Controls */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-stone-700 flex items-center gap-2 text-sm">
                    Nivel de Zoom
                  </label>
                  <span className="font-mono text-sm px-2 py-1 rounded-md font-medium bg-stone-100 text-stone-800 border border-stone-200">
                    {scale < 10 ? scale.toFixed(1) : Math.round(scale)}x
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setScale(prev => Math.max(prev / 1.5, 0.1))}
                    className="flex-1 flex justify-center items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-lg font-medium transition"
                  >
                    <ZoomOut size={18} /> Alejar
                  </button>
                  <button 
                    onClick={() => setScale(1)}
                    className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-lg font-medium transition text-sm"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={() => setScale(prev => Math.min(prev * 1.5, 100000))}
                    className="flex-1 flex justify-center items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-lg font-medium transition"
                  >
                    <ZoomIn size={18} /> Acercar
                  </button>
                </div>
                <p className="text-xs text-stone-500 mt-2 text-center">
                  También puedes usar la rueda del mouse sobre la gráfica
                </p>
              </div>
            </div>
          </div>

          {/* Math Panel */}
          <div className="bg-stone-900 rounded-2xl shadow-xl border border-stone-800 p-6 text-white relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <h3 className="text-lg font-bold text-stone-100 mb-6 relative z-10">Análisis Matemático</h3>
            
            <div className="space-y-5 relative z-10 font-mono text-sm">
              {/* Secant */}
              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700 overflow-x-auto">
                <div className="text-stone-400 mb-3 text-xs uppercase tracking-wider font-sans font-semibold">Pendiente Secante (m)</div>
                <div className="flex items-center gap-3 text-blue-400 text-sm whitespace-nowrap">
                  <span>m =</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-blue-400/50 pb-1 px-2">y₂ - y₁</span>
                    <span className="pt-1">x₂ - x₁</span>
                  </div>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-blue-400/50 pb-1 px-2">f(x+h) - f(x)</span>
                    <span className="pt-1">(x+h) - x</span>
                  </div>
                  <span>=</span>
                  <div className="flex flex-col items-center">
                    <span className="border-b border-blue-400/50 pb-1 px-2">f(x+h) - f(x)</span>
                    <span className="pt-1">h</span>
                  </div>
                  <span>=</span>
                  <span className="font-bold text-white bg-blue-500/20 px-2 py-1 rounded">{mSecant.toFixed(5)}</span>
                </div>
              </div>

              {/* Tangent */}
              <div className="bg-stone-800/80 p-4 rounded-xl border border-stone-700">
                <div className="text-stone-400 mb-3 text-xs uppercase tracking-wider font-sans font-semibold">Pendiente Tangente (f'(x))</div>
                <div className="flex items-center gap-3 text-stone-300 text-base">
                  <span>f'({x.toFixed(2)}) =</span>
                  <span className="font-bold text-white bg-stone-700 px-2 py-1 rounded">{mTangent.toFixed(5)}</span>
                </div>
              </div>

              {/* Difference */}
              <div className={`p-4 rounded-xl border transition-colors duration-300 ${Math.abs(mSecant - mTangent) < 0.0001 ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-stone-800/80 border-stone-700'}`}>
                <div className="text-stone-400 mb-2 text-xs uppercase tracking-wider font-sans font-semibold">Error (Diferencia)</div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-300">|m - f'(x)|</span>
                  <span className={`font-bold text-lg ${Math.abs(mSecant - mTangent) < 0.0001 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {Math.abs(mSecant - mTangent).toFixed(6)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
