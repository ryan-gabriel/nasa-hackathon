import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import * as echarts from 'echarts'

type FeatureProps = Record<string, any>

const TARGETS = [
  {
    id: 'mars_jezero',
    name: 'Jezero Crater (Mars)',
    body: 'Mars',
    preview: 'Ancient crater lake/delta system; astrobiology and sedimentary context.',
    stats: ['Lat 18.38, Lon 77.58', 'Interest: delta deposits, mafic/carbonate signals, rover-scale terrain'],
    file: 'data/scores_mars_jezero.geojson',
  },
  {
    id: 'moon_shackleton_rim',
    name: 'Shackleton Crater Rim (Moon)',
    body: 'Moon',
    preview: 'South-pole rim environment near persistently shadowed regions; illumination/volatile interest.',
    stats: ['Lat -89.9, Lon 0.0', 'Interest: polar thermal extremes, rough rim terrain, partial volatile proxies'],
    file: 'data/scores_moon_shackleton_rim.geojson',
  },
]

const DIMS = [
  { key: 'terrain', label: 'Terrain', sim: 'sim_terrain' },
  { key: 'thermal', label: 'Thermal', sim: 'sim_thermal' },
  { key: 'materials', label: 'Materials', sim: 'sim_materials' },
  { key: 'volatiles', label: 'Volatiles', sim: 'sim_volatiles' },
  { key: 'aeolian', label: 'Aeolian', sim: 'sim_aeolian' },
] as const

const NOT_ANALOGUABLE = [
  { id: 'gravity', title: 'Gravity', text: 'Earth 1.0 g vs Moon 0.17 g / Mars 0.38 g. Affects traction, excavation, plume-surface interaction, and physiology. Never scored.' },
  { id: 'atmosphere', title: 'Atmosphere / Vacuum', text: 'Earth ~101,325 Pa vs Moon ~0 Pa (vacuum) vs Mars ~600 Pa. Alters thermal behavior, dust, aerobraking, ECLSS. Never scored.' },
  { id: 'radiation', title: 'Radiation', text: 'Earth is shielded by magnetosphere and thick atmosphere; Moon/Mars have higher surface radiation. Never scored.' },
]

// Color-blind-safer sequential (cividis-like stops)
const SCORE_COLORS = ['#00224e','#123570','#3b496c','#575d6d','#707173','#8a8678','#a59c74','#c3b369','#e1cc55']

function getWeightedTotal(p: FeatureProps, weights: Record<string, number>, enabled: Record<string, boolean>) {
  let total = 0, wacc = 0
  for (const d of DIMS) {
    if (!enabled[d.key]) continue
    const v = p[d.sim]
    const w = weights[d.key] ?? 1
    if (v === null || v === undefined || Number.isNaN(Number(v))) continue
    total += Number(v) * w
    wacc += w
  }
  return wacc > 0 ? total / wacc : 0
}

function colorForScore(s: number) {
  const i = Math.max(0, Math.min(SCORE_COLORS.length - 1, Math.floor(s * (SCORE_COLORS.length - 1))))
  return SCORE_COLORS[i]
}

export default function App() {
  const [targetId, setTargetId] = useState(TARGETS[0].id)
  const [data, setData] = useState<any>(null)
  const [weights, setWeights] = useState<Record<string, number>>({ terrain:1, thermal:1, materials:1, volatiles:1, aeolian:1 })
  const [enabledDims, setEnabledDims] = useState<Record<string, boolean>>({ terrain:true, thermal:true, materials:true, volatiles:true, aeolian:true })
  const [hideKnown, setHideKnown] = useState(true)
  const [showGibs, setShowGibs] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)
  const mapDiv = useRef<HTMLDivElement | null>(null)
  const radarRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  const target = TARGETS.find(t => t.id === targetId)!

  useEffect(() => {
    let alive = true
    setSelectedId(null)
    fetch(target.file).then(r => r.json()).then(j => { if (alive) setData(j) })
    return () => { alive = false }
  }, [target.file])

  // compute dynamic totals
  const enriched = useMemo(() => {
    if (!data) return null
    const features = data.features.map((f: any) => {
      const p = { ...f.properties }
      p._dynTotal = getWeightedTotal(p, weights, enabledDims)
      return { ...f, properties: p }
    })
    return { ...data, features }
  }, [data, weights, enabledDims])

  const visible = useMemo(() => {
    if (!enriched) return null
    const features = enriched.features.filter((f: any) => hideKnown ? f.properties.is_novel : true)
    return { ...enriched, features }
  }, [enriched, hideKnown])

  const selected = useMemo(() => {
    if (!visible || !selectedId) return null
    return visible.features.find((f: any) => f.properties.hex_id === selectedId)?.properties || null
  }, [visible, selectedId])

  const ranked = useMemo(() => {
    if (!visible) return []
    return [...visible.features]
      .map((f: any) => f.properties)
      .sort((a: any,b: any) => (b._dynTotal - a._dynTotal))
      .slice(0, 20)
  }, [visible])

  // init map
  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: mapDiv.current,
      style: {
        version: 8,
        sources: {
          osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors' },
          gibs: {
            type: 'raster',
            tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'],
            tileSize: 256,
            attribution: 'Imagery: NASA GIBS / EOSDIS (verified NASA.gov source)'
          }
        },
        layers: [
          { id: 'osm', type: 'raster', source: 'osm' },
          { id: 'gibs', type: 'raster', source: 'gibs', layout: { visibility: 'visible' }, paint: { 'raster-opacity': 0.55 } }
        ]
      },
      center: [20, 20],
      zoom: 1.2
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map
    return () => { map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const setVis = () => {
      if (map.getLayer('gibs')) map.setLayoutProperty('gibs', 'visibility', showGibs ? 'visible' : 'none')
    }
    if (map.isStyleLoaded()) setVis(); else map.once('load', setVis)
  }, [showGibs])

  // update source/layers
  useEffect(() => {
    const map = mapRef.current
    if (!map || !visible) return
    const setDataOnMap = () => {
      const src = map.getSource('hexes') as GeoJSONSource | undefined
      if (!src) {
        map.addSource('hexes', { type: 'geojson', data: visible })
        map.addLayer({
          id: 'hex-fill', type: 'fill', source: 'hexes',
          paint: {
            'fill-color': ['step', ['get','_dynTotal'],
              SCORE_COLORS[0], 0.11, SCORE_COLORS[1], 0.22, SCORE_COLORS[2], 0.33, SCORE_COLORS[3], 0.44, SCORE_COLORS[4], 0.55, SCORE_COLORS[5], 0.66, SCORE_COLORS[6], 0.77, SCORE_COLORS[7], 0.88, SCORE_COLORS[8]
            ],
            'fill-opacity': 0.75
          }
        })
        map.addLayer({ id: 'hex-line', type: 'line', source: 'hexes', paint: { 'line-color': '#ffffff', 'line-width': 0.3, 'line-opacity': 0.5 } })
        map.on('click', 'hex-fill', (e) => {
          const p = e.features?.[0]?.properties as any
          if (p?.hex_id) setSelectedId(String(p.hex_id))
        })
        map.on('mouseenter', 'hex-fill', () => { map.getCanvas().style.cursor = 'pointer' })
        map.on('mouseleave', 'hex-fill', () => { map.getCanvas().style.cursor = '' })
      } else {
        src.setData(visible)
      }
      // fit bounds on target change when first loaded
      if (visible.features.length) {
        const b = new maplibregl.LngLatBounds()
        for (const f of visible.features.slice(0, 1500)) {
          const coords = f.geometry.coordinates[0]
          for (const c of coords) b.extend(c as [number,number])
        }
        if (!b.isEmpty()) map.fitBounds(b, { padding: 20, maxZoom: 5, duration: 0 })
      }
    }
    if (map.isStyleLoaded()) setDataOnMap(); else map.once('load', setDataOnMap)
  }, [visible, targetId])

  // radar chart
  useEffect(() => {
    if (!radarRef.current) return
    if (!chartRef.current) chartRef.current = echarts.init(radarRef.current)
    const p = selected
    const vals = DIMS.map(d => (p && p[d.sim] != null && !Number.isNaN(Number(p[d.sim]))) ? Number(p[d.sim]) : 0)
    chartRef.current.setOption({
      title: { text: 'Similarity by dimension', left: 'center', textStyle: { fontSize: 12 } },
      radar: { indicator: DIMS.map(d => ({ name: d.label, max: 1 })), radius: 70 },
      series: [{ type: 'radar', data: [{ value: vals, name: 'Similarity', areaStyle: { color: 'rgba(11,110,153,0.35)' }, lineStyle: { color: '#0b6e99' }, itemStyle: { color: '#0b6e99' } }] }],
      tooltip: {}
    })
  }, [selected])

  const breakdowns: string[] = selected?.breakdown_reasons ? JSON.parse(selected.breakdown_reasons) : []
  const tags: string[] = selected?.mission_tags ? JSON.parse(selected.mission_tags) : []
  const worldview = selected ? `https://worldview.earthdata.nasa.gov/?v=${selected.lon-1},${selected.lat-1},${selected.lon+1},${selected.lat+1}&l=Reference_Labels_15m,Reference_Features_15m,Coastlines_15m,MODIS_Terra_CorrectedReflectance_TrueColor` : '#'
  const earthdata = selected ? `https://search.earthdata.nasa.gov/search?m=${selected.lat}!${selected.lon}!5!0!0!0%2C2` : '#'

  return (
    <div className="app">
      <header>
        <h1>AnalogAtlas</h1>
        <span className="sub">Multi-dimensional planetary analog search (precomputed scores only)</span>
        <span className="badge badge-synth" title="This build uses synthetic/estimated fallback data">SYNTHETIC DATA BUILD</span>
      </header>
      <div className="main">
        <div className="left">
          <section className="panel" aria-label="Target picker">
            <h2>Target picker</h2>
            <div className="row">
              <label htmlFor="target">Moon/Mars target site</label>
              <select id="target" value={targetId} onChange={e => setTargetId(e.target.value)}>
                {TARGETS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="notice">
              <div><strong>{target.name}</strong></div>
              <div className="small">{target.preview}</div>
              {target.stats.map(s => <div key={s} className="kv">• {s}</div>)}
              <div className="kv"><span className="badge badge-synth">synthetic target profile</span> fallback/estimated, not measured.</div>
            </div>
          </section>

          <section className="panel" aria-label="Parameters and weights">
            <h2>Parameters: include/exclude & weights</h2>
            <div className="small" style={{marginBottom:8}}>Include parameters to use in ranking, or exclude them. Excluded parameters are omitted from the live total score.</div>
            {DIMS.map(d => (
              <div key={d.key} className="row" style={{opacity: enabledDims[d.key] ? 1 : 0.6}}>
                <label htmlFor={`inc-${d.key}`}>
                  <input id={`inc-${d.key}`} type="checkbox" checked={enabledDims[d.key]}
                    onChange={e => setEnabledDims(s => ({ ...s, [d.key]: e.target.checked }))} /> Include <strong>{d.label}</strong>
                </label>
                <div className="slider-row">
                  <input id={`w-${d.key}`} type="range" min={0} max={3} step={0.25} value={weights[d.key]} disabled={!enabledDims[d.key]}
                    onChange={e => setWeights(w => ({ ...w, [d.key]: Number(e.target.value) }))} />
                  <span className="small">{enabledDims[d.key] ? weights[d.key].toFixed(2) : 'off'}</span>
                </div>
              </div>
            ))}
            <div className="row">
              <label htmlFor="novel"><input id="novel" type="checkbox" checked={hideKnown} onChange={e => setHideKnown(e.target.checked)} /> Hide known analogs (novelty mode)</label>
            </div>
            <div className="small">Total score is a user-weighted mean over <strong>included</strong> available scored parameters. Missing dimension data is never filled.</div>
          </section>

          <section className="panel" aria-label="Earth limits">
            <h2>Earth-limits (NOT ANALOGUABLE)</h2>
            {NOT_ANALOGUABLE.map(n => (
              <div key={n.id} className="na"><strong>{n.title}: NOT ANALOGUABLE.</strong> <span className="small">{n.text}</span></div>
            ))}
          </section>
        </div>

        <div className="map-wrap panel" aria-label="Map">
          <div id="map" ref={mapDiv} role="application" aria-label="Analog score map" />
          <div style={{position:'absolute', top:8, left:8, zIndex:2, background:'rgba(255,255,255,0.92)', padding:'6px 8px', borderRadius:6, fontSize:12, border:'1px solid #d9e2ec'}}>
            <label htmlFor="gibs"><input id="gibs" type="checkbox" checked={showGibs} onChange={e=>setShowGibs(e.target.checked)} /> NASA GIBS imagery (verified)</label>
          </div>
        </div>

        <div className="right">
          <section className="panel" aria-label="Selected hex details">
            <h2>Selected hex</h2>
            {!selected && <div className="small">Click a hex on the map or choose from the ranked list.</div>}
            {selected && (
              <div>
                <div>
                  <span className="badge badge-synth">synthetic</span>
                  {selected.is_novel && <span className="badge badge-novel">novel</span>}
                  {selected.pareto_front && <span className="badge badge-pareto">Pareto front</span>}
                  {selected.breaks_down && <span className="badge badge-break">breakdowns</span>}
                </div>
                <div className="kv"><strong>Region:</strong> {selected.seed_region} ({selected.profile})</div>
                <div className="kv"><strong>Hex:</strong> {selected.hex_id}</div>
                <div className="kv"><strong>Lat/Lon:</strong> {Number(selected.lat).toFixed(4)}, {Number(selected.lon).toFixed(4)}</div>
                <div className="kv"><strong>Weighted total:</strong> {Number(selected._dynTotal).toFixed(3)}</div>
                <div ref={radarRef} className="radar" aria-label="Radar chart of similarity by dimension" />
                <h3>What matches</h3>
                <div className="small">{DIMS.filter(d => enabledDims[d.key] && selected[d.sim] != null && Number(selected[d.sim]) >= 0.5).map(d => d.label).join(', ') || 'No strong matches (>=0.5) among included parameters.'}</div>
                {DIMS.some(d => !enabledDims[d.key]) && <div className="small" style={{marginTop:4}}><strong>Excluded parameters:</strong> {DIMS.filter(d => !enabledDims[d.key]).map(d => d.label).join(', ')}</div>}
                <h3>What doesn't match / breaks down</h3>
                {breakdowns.length ? <ul className="small">{breakdowns.map((b,i)=><li key={i}>{b}</li>)}</ul> : <div className="small">No dimension below threshold; still not an exact analog.</div>}
                <h3>Mission-use tags</h3>
                <div className="tags">{tags.map(t => <span key={t} className="tag">{t}</span>)}</div>
                <h3>Data provenance</h3>
                <div className="small">Provenance: <strong>{String(selected.provenance)}</strong>; quality: {String(selected.data_quality)}. Features and scores are synthetic/estimated fallbacks for this build — not real observations. For lunar PSR, no true Earth analog exists (partial only).</div>
                <div className="links small" style={{marginTop:6}}>
                  <a href={worldview} target="_blank" rel="noreferrer">Open in NASA Worldview</a> · <a href={earthdata} target="_blank" rel="noreferrer">Open in Earthdata Search</a>
                </div>
              </div>
            )}
          </section>

          <section className="panel" aria-label="Ranked list">
            <h2>Ranked list (top 20 shown)</h2>
            <ul className="list">
              {ranked.map((p: any, i: number) => (
                <li key={p.hex_id} aria-selected={selectedId === p.hex_id} tabIndex={0}
                  onClick={() => setSelectedId(p.hex_id)} onKeyDown={e => (e.key==='Enter'||e.key===' ') && setSelectedId(p.hex_id)}>
                  <div><strong>#{i+1}</strong> {p.seed_region} — {Number(p._dynTotal).toFixed(3)}</div>
                  <div>
                    {p.pareto_front && <span className="badge badge-pareto">Pareto</span>}
                    {p.is_novel && <span className="badge badge-novel">novel</span>}
                    {p.breaks_down && <span className="badge badge-break">breakdown</span>}
                    <span className="badge badge-synth">synthetic</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="small">Pareto-front highlights indicate non-dominated profiles across scored dimensions (computed in preprocessing).</div>
          </section>
        </div>
      </div>
    </div>
  )
}
