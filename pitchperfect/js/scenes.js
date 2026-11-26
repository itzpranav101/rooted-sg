// ROOTED SG — live 3D scenes. Real RootStake CAD (v14 probe, full module) + procedural scenes.
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const isDark = () => false;
const cvar = (n, fb) => { const v = getComputedStyle(document.documentElement).getPropertyValue(n).trim(); return v || fb; };
const hx = (n, fb) => new THREE.Color(cvar(n, fb)).getHex();

const stlCache = {};
const loader = new STLLoader();
const loadSTL = url => stlCache[url] ||= new Promise((res, rej) => loader.load(url, res, undefined, rej));

function palette() {
  const d = isDark();
  return {
    white: hx('--white3d', '#eee'), leaf: hx('--leaf3d', '#4a9'), soil: hx('--soil3d', '#654'),
    glass: d ? 0xcfeedd : 0xdfeee4, steel: 0xcfd6d2, dark: d ? 0x2a3a31 : 0x25302a,
    ground: hx('--ground3d', '#ddd'), building: hx('--bld3d', '#ccc'), win: hx('--win3d', '#aaa'),
    node: hx('--accent3d', '#3a6'), accent: hx('--warm3d', '#e96'), env: d ? .8 : 1.0,
  };
}
function mats() {
  const P = palette();
  return {
    white: new THREE.MeshPhysicalMaterial({ color: P.white, roughness: .38, clearcoat: .55, clearcoatRoughness: .3 }),
    green: new THREE.MeshPhysicalMaterial({ color: P.leaf, roughness: .34, clearcoat: .65, clearcoatRoughness: .28 }),
    dark: new THREE.MeshStandardMaterial({ color: P.dark, roughness: .5 }),
    steel: new THREE.MeshStandardMaterial({ color: P.steel, roughness: .22, metalness: .95 }),
    glass: new THREE.MeshPhysicalMaterial({ color: P.glass, roughness: .08, transparent: true, opacity: .26, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
    soil: new THREE.MeshStandardMaterial({ color: P.soil, roughness: 1 }),
    water: new THREE.MeshPhysicalMaterial({ color: 0x7fd0ff, roughness: .05, transparent: true, opacity: .9, clearcoat: 1 }),
    refresh(scene) { const Q = palette(); this.white.color.setHex(Q.white); this.green.color.setHex(Q.leaf); this.soil.color.setHex(Q.soil); this.glass.color.setHex(Q.glass); this.dark.color.setHex(Q.dark); scene.environmentIntensity = Q.env; },
  };
}
function lights(scene, renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = palette().env;
  const key = new THREE.DirectionalLight(0xfff1de, 2.1); key.position.set(3, 5, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xbfe6ff, 1.2); rim.position.set(-4, 2, -3); scene.add(rim);
  const sweep = new THREE.PointLight(0xffffff, 0, 14); sweep.position.set(-5, 1, 3); scene.add(sweep);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe8dcc8, .45));
  return { key, rim, sweep };
}
function contactShadow(r = 1.6, y = 0, o = .28) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 62);
  gr.addColorStop(0, `rgba(0,0,0,${o})`); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.y = y; return m;
}
// Orient CAD: longest axis -> Y, narrower (pointed) end down, scale to `size`.
function prepCAD(geoms, size = 3.6) {
  const box = new THREE.Box3(); geoms.forEach(g => { g.computeBoundingBox(); box.union(g.boundingBox); });
  const sz = box.getSize(new V3()), ctr = box.getCenter(new V3());
  const d = [sz.x, sz.y, sz.z], l = d.indexOf(Math.max(...d)), t = d.indexOf(Math.min(...d)), m = 3 - l - t;
  const ax = ['x', 'y', 'z'], lo = box.min[ax[l]], hi = box.max[ax[l]], band = (hi - lo) * .12;
  let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9;
  const big = geoms.reduce((a, b) => a.attributes.position.count > b.attributes.position.count ? a : b);
  const P = big.attributes.position, gc = (i, a) => a === 0 ? P.getX(i) : a === 1 ? P.getY(i) : P.getZ(i);
  for (let i = 0; i < P.count; i++) { const v = gc(i, l), w = gc(i, m); if (v < lo + band) { a0 = Math.min(a0, w); a1 = Math.max(a1, w); } if (v > hi - band) { b0 = Math.min(b0, w); b1 = Math.max(b1, w); } }
  const s = (a1 - a0) < (b1 - b0) ? 1 : -1, row = (a, sg) => { const r = [0, 0, 0]; r[a] = sg; return r; };
  let rx = row(m, 1); const ry = row(l, s), rz = row(t, 1);
  const M = new THREE.Matrix4().set(...rx, 0, ...ry, 0, ...rz, 0, 0, 0, 0, 1);
  if (M.determinant() < 0) { rx = row(m, -1); M.set(...rx, 0, ...ry, 0, ...rz, 0, 0, 0, 0, 1); }
  const k = size / Math.max(...d);
  return geoms.map(g => { const n = g.clone(); n.translate(-ctr.x, -ctr.y, -ctr.z); n.applyMatrix4(M); n.scale(k, k, k); n.deleteAttribute('normal'); return toCreasedNormals(n, Math.PI / 6); });
}
class Drops {
  constructor(scene, mat, n = 40) { this.items = []; this.g = new THREE.SphereGeometry(.035, 10, 10); this.t = 0;
    for (let i = 0; i < n; i++) { const m = new THREE.Mesh(this.g, mat); m.visible = false; scene.add(m); this.items.push({ m, life: 0, v: new V3() }); } }
  update(dt, on, origin, floorY = -9) {
    this.t += dt;
    if (on && this.t > .03) { this.t = 0; const it = this.items.find(i => i.life <= 0); if (it) { it.life = 1; it.m.position.copy(origin).add(new V3((Math.random() - .5) * .05, 0, (Math.random() - .5) * .05)); it.v.set((Math.random() - .5) * .3, -.2, (Math.random() - .5) * .3); it.m.visible = true; } }
    this.items.forEach(it => { if (it.life <= 0) return; it.life -= dt * 1.1; it.v.y -= 2.2 * dt; it.m.position.addScaledVector(it.v, dt); it.m.scale.setScalar(clamp(it.life * 2)); if (it.life <= 0 || it.m.position.y < floorY) { it.life = 0; it.m.visible = false; } });
  }
}
function glassPot(M, r = 1.15, h = 1.5) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r * .86, h, 64, 1, true), M.glass));
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(r * .97, r * .84, h * .82, 64), M.soil); soil.position.y = -h * .09; g.add(soil);
  const top = new THREE.Mesh(new THREE.CircleGeometry(r * .97, 64), M.soil); top.rotation.x = -Math.PI / 2; top.position.y = h * .32; g.add(top);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r, .03, 12, 64), M.white); rim.rotation.x = Math.PI / 2; rim.position.y = h / 2; g.add(rim);
  return g;
}



const glbLoader = new GLTFLoader(), glbCache = {};
const loadGLB = url => glbCache[url] ||= new Promise((res, rej) => glbLoader.load(url, g => { g.scene.traverse(o => { if (o.isMesh) { o.geometry.deleteAttribute('color'); o.geometry = toCreasedNormals(o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, Math.PI / 5); } }); res(g.scene); }, undefined, rej));
// ---- REAL CAD: the RootStake v4 house module (exported from the CAD pickles) ----
async function makeHouse(M) {
  const src = (await loadGLB('assets/models/module.glb')).clone(true), k = 2.25 / 91.2;
  const inner = new THREE.Group(); inner.scale.setScalar(k); inner.rotation.x = -Math.PI / 2; inner.position.y = -55 * k; inner.add(src);
  const navy = new THREE.MeshPhysicalMaterial({ color: 0x14244d, roughness: .25, metalness: .5, clearcoat: .6 }), dark = new THREE.MeshStandardMaterial({ color: 0x15191b, roughness: .4 });
  src.traverse(o => { if (!o.isMesh) return; const n = (o.name || o.parent?.name || '').toLowerCase(); o.material = n.includes('panel') ? navy : n.includes('dht') ? dark : (n.includes('gasket') || n.includes('roof')) ? M.green : M.white; });
  const g = new THREE.Group(); g.add(inner); inner.rotation.z = Math.PI; // front faces the camera
  g.userData = { exit: new V3(1.12, -.25, 0), top: new V3(0, 1.4, 0) }; return g;
}
function wire(points, r, color) { return new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 60, r, 8), new THREE.MeshStandardMaterial({ color, roughness: .5 })); }

// ---- REAL CAD: probe v14 + YL-69 fork board, header, pins, plugs, wires, copper EC turns, seated 4.5 mm tube ----
async function makeProbe(M, halfM, height = 3.7) {
  const src = (await loadGLB('assets/models/probe-assembly.glb')).clone(true), k = height / 131;
  const G = new THREE.Group(); G.scale.setScalar(k); G.rotation.x = -Math.PI / 2; G.position.y = 35.5 * k; G.add(src);
  const gold = new THREE.MeshStandardMaterial({ color: 0xd9b24a, metalness: 1, roughness: .25 }), copper = new THREE.MeshStandardMaterial({ color: 0xd9824b, metalness: .9, roughness: .3 }),
    board = new THREE.MeshStandardMaterial({ color: 0xd6d3c4, roughness: .5, metalness: .3 }), blk = new THREE.MeshStandardMaterial({ color: 0x15191b, roughness: .45 }), wireM = new THREE.MeshStandardMaterial({ color: 0xc0392b, roughness: .5 }),
    tubeM = new THREE.MeshPhysicalMaterial({ color: 0x4aa8e0, transparent: true, opacity: .62, roughness: .1, clearcoat: 1 });
  const parts = { copper: [] };
  src.traverse(o => { if (!o.isMesh) return; const n = (o.name || '').toLowerCase().replace(/_\d+$/, ''), nm = o.name || o.parent?.name || ''; const key = ['front', 'back', 'leaf', 'board', 'header', 'pins', 'plugs', 'wires', 'tube'].find(t => nm.toLowerCase().startsWith(t)) || (nm.toLowerCase().startsWith('copper') ? 'copper' : nm);
    o.material = key === 'front' || key === 'back' ? halfM : key === 'leaf' ? M.green : key === 'board' ? board : key === 'header' || key === 'plugs' ? blk : key === 'pins' ? gold : key === 'wires' ? wireM : key === 'copper' ? copper : key === 'tube' ? tubeM : M.white;
    if (key === 'copper') parts.copper.push(o); else parts[key] = o; });
  const A = (x, y, z) => new V3(x * k, (z + 35.5) * k, -y * k);
  return { G, parts, k, A, board: [parts.board, parts.header, parts.pins, parts.plugs, parts.wires].filter(Boolean) };
}
function makePH() {
  const g = new THREE.Group();
  const glassM = new THREE.MeshPhysicalMaterial({ color: 0xcfe7ee, transparent: true, opacity: .65, roughness: .08, clearcoat: 1 });
  const body = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, 2.1, 20), glassM); body.position.y = .2; g.add(body);
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.9, 12), new THREE.MeshBasicMaterial({ color: 0x9fe3c8, transparent: true, opacity: .6 })); fill.position.y = .2; g.add(fill);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.082, 20, 16), new THREE.MeshPhysicalMaterial({ color: 0xbfe9ff, transparent: true, opacity: .8, roughness: .05, clearcoat: 1, emissive: 0x2a7a6a, emissiveIntensity: .35 })); bulb.position.y = -.86; g.add(bulb);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.085, .085, .3, 20), new THREE.MeshStandardMaterial({ color: 0x1b2a6b, roughness: .4 })); cap.position.y = 1.38; g.add(cap);
  g.add(wire([new V3(0, 1.5, 0), new V3(.1, 2.0, .1), new V3(-.1, 2.6, .2), new V3(.15, 3.1, .1)], .022, 0x2a2e33));
  return g;
}


const builders = {};

// PROBE — real CAD. Modes: hero (pinned, off-centre) · story (9 chapters: halves open, fork board, tube, pH slide in, x-ray close, insert, dose) · loose
builders.probe = async (ctx) => {
  const { scene, camera, el, L } = ctx, M = mats(), mode = el.dataset.mode || 'loose', story = mode === 'story';
  ctx.onTheme(() => M.refresh(scene));
  const halfM = M.white.clone(); ctx.onTheme(() => halfM.color.copy(M.white.color));
  const pr = await makeProbe(M, halfM, 3.7), k = pr.k, P = pr.parts;
  const inner = new THREE.Group(); inner.add(pr.G);
  const outer = new THREE.Group(); outer.add(inner); scene.add(outer);
  const ph = story ? makePH() : null; if (ph) { ph.visible = false; ph.scale.setScalar(1); inner.add(ph); }
  const pot = glassPot(M, 1.25, 1.7); scene.add(pot); pot.visible = false;
  const shadow = contactShadow(2.3, -3.1, .32); scene.add(shadow);
  const drops = new Drops(scene, M.water, 70);
  const A = pr.A, anchors = { tip: A(0, -6.9, -100), teeth: A(0, 7.7, -90), ec: A(0, 7.9, -9), window: A(0, 7.7, -34), mark: A(13, 7.7, 6), bore: A(0, -6.9, -92), top: A(0, 0, 30), fork: A(0, 0, -30), tube: A(-7.7, -6.9, 0), ph: A(7.7, -4, 0) };
  const base = { fork: P.board && P.board.position.clone(), tube: P.tube.position.clone(), front: P.front.position.clone(), back: P.back.position.clone(), leaf: P.leaf.position.clone() };
  camera.position.set(0, .2, 8.6); const look = new V3(0, -.7, 0), tipL = A(0, -6.9, -100);
  let spin = .6, ang = .6; const keysA = [.5, .9, 1.0, .95, 1.2, 1.25, .25, .6, .9];
  const setZ = (o, b, dz, dy, dx) => o.position.set(b.x + (dx || 0), b.y + (dy || 0), b.z + (dz || 0));
  return { anchors, group: outer, update(t, p, ptr, dt) {
    let ex = 0, y = 0, cz = 8.6, ly = -.4, dose = false, x = 0, ins = 0, target = 0, fy = 0, ty = 0, py = 0, xr = 0;
    if (mode === 'loose') { y = Math.sin(t) * .08; spin += dt * .5; target = spin + ptr.x * .5; }
    else if (story) {
      const S = (a, b) => sstep(a, b, p), N = 1 / 9;
      ex = S(N, N + .07) * (1 - S(6 * N, 6 * N + .06));
      const zTip = S(2 * N, 2 * N + .05) * (1 - S(3 * N, 3 * N + .05)), zMid = S(3 * N, 3 * N + .05) * (1 - S(4 * N, 4 * N + .05)), zIn = S(4 * N, 4 * N + .05) * (1 - S(6 * N, 6 * N + .05));
      cz = 8.6 - 3.1 * zTip - 2.8 * zMid - 1.6 * zIn; ly = -.4 + (-1.1) * zTip + (-.1) * zMid + 1.0 * zIn;
      ins = S(7 * N, 7 * N + .07); y = lerp(0, -1.2, ins) + Math.sin(t * 1.1) * .04 * (1 - ins);
      pot.visible = ins > .01; pot.position.y = -2.4; shadow.position.y = lerp(-3.1, -3.25, ins);
      if (ins > 0) { cz = lerp(cz, 9.8, ins); ly = lerp(ly, -.9, ins); } dose = p > 8 * N + .02;
      fy = lerp(3.8, 0, S(4 * N, 5 * N - .01)); ty = lerp(4.2, 0, S(5 * N, 5.55 * N)); py = lerp(4.6, 0, S(5.5 * N, 6 * N - .01));
      xr = S(6 * N, 6 * N + .03) * (1 - S(7 * N - .01, 7 * N + .04));
      if (!dose) spin += dt * .12; const seg = p * 9, i0 = Math.min(8, Math.floor(seg)), i1 = Math.min(8, i0 + 1), f = sstep(0, 1, seg - i0);
      target = lerp(keysA[i0], keysA[i1], f) + Math.sin(t * .4) * .05 + ptr.x * .25;
    } else {
      ex = sstep(.14, .3, p) * (1 - sstep(.52, .64, p));
      const zoom = sstep(.34, .44, p) * (1 - sstep(.5, .6, p));
      cz = lerp(8.6, 5.8, zoom); ly = lerp(-.4, -1.4, zoom);
      ins = sstep(.64, .82, p); y = lerp(0, -1.2, ins) + Math.sin(t * 1.1) * .05 * (1 - ins);
      pot.visible = ins > .01; pot.position.y = -2.4; shadow.position.y = lerp(-3.1, -3.25, ins);
      if (ins > 0) { cz = lerp(cz, 9.6, ins); ly = lerp(ly, -.9, ins); }
      dose = p > .86; spin += dt * .26; if (mode === 'hero') x = lerp(1.9, 0, sstep(0, .2, p));
      target = spin + sstep(0, .5, p) * 1.1 + sstep(.55, .8, p) * .9 + ptr.x * .35;
    }
    L.sweep.intensity = mode === 'loose' ? 0 : 60 * Math.sin(clamp((p * 5) % 1) * Math.PI); L.sweep.position.set(lerp(-6, 6, (p * 5) % 1), 1.5, 4);
    if (camera.aspect < .9) cz *= 1.3;
    ang += (target - ang) * Math.min(1, dt * 4);
    camera.position.z += (cz - camera.position.z) * Math.min(1, dt * 5); look.y += (ly - look.y) * Math.min(1, dt * 5); camera.lookAt(look);
    outer.position.set(x, y, 0); outer.rotation.y = ang; outer.rotation.z = .08 + ptr.y * .05;
    // explode in the probe's own mm frame: front half +y(mm), back half -y(mm); fork board slides between; tube seats in the back half's channel
    const e = ex * 1.5 / k;
    P.front.position.set(base.front.x, base.front.y + e, base.front.z); P.back.position.set(base.back.x, base.back.y - e, base.back.z);
    P.leaf.position.set(base.leaf.x, base.leaf.y + e * .35, base.leaf.z + e * .7);
    pr.board.forEach(o => o.position.set(0, 0, fy / k)); P.tube.position.set(0, -e, ty / k);
    P.tube.visible = !story || ty < 4; pr.board.forEach(o => o.visible = !story || fy < 3.6);
    P.copper.forEach(c => { c.position.y = -e; c.visible = ex < .15; });
    if (ph) { ph.position.set(7.7 * k, py + .2, 4 * k + 0); ph.rotation.y = 0; ph.visible = py < 4.4; anchors.ph.set(7.7 * k, -.5 + py, 0); }
    anchors.fork.copy(A(0, 0, -30)).add(new V3(0, fy, e * k * .0)); anchors.tube.copy(A(-7.7, -6.9, 0)).add(new V3(0, ty, e * k)); 
    halfM.opacity = 1 - .78 * xr; halfM.transparent = xr > .01; halfM.depthWrite = xr < .5; halfM.needsUpdate = true;
    outer.updateMatrixWorld(true);
    drops.update(dt, dose, tipL.clone().applyMatrix4(outer.matrixWorld), -4.2);
  } };
};

// HOUSE — the module on its own: gable roof, solar, vents, a side exit for the wire and the tube
builders.pod = async (ctx) => {
  const { scene, camera } = ctx, M = mats(); ctx.onTheme(() => M.refresh(scene));
  const house = await makeHouse(M), g = new THREE.Group(); g.add(house); g.position.y = .2; g.scale.setScalar(1.15); scene.add(g); scene.add(contactShadow(2.4, -1.05, .28));
  const cable = wire([new V3(1.16, -.35, 0), new V3(1.8, -.7, .2), new V3(2.4, -.4, .5), new V3(3.2, -.9, .3)], .035, 0xff9a1f), tubeW = wire([new V3(1.16, -.45, 0), new V3(1.7, -.9, -.2), new V3(2.3, -.7, -.3), new V3(3.2, -1.0, -.1)], .05, 0x4aa8e0);
  tubeW.material = new THREE.MeshPhysicalMaterial({ color: 0x4aa8e0, transparent: true, opacity: .6, roughness: .1 }); g.add(cable, tubeW);
  camera.position.set(1.0, 1.0, 8.2);
  return { update(t, p, ptr) { g.rotation.y = -.5 + Math.sin(t * .35) * .5 + ptr.x * .4 + p * 1.6; g.rotation.x = ptr.y * .12; g.position.y = .2 + Math.sin(t) * .05; camera.lookAt(.8, .1, 0); } };
};

builders.field = async (ctx) => {
  const { scene, camera, el } = ctx, items = [];
  const base = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: palette().ground, roughness: 1 })); base.rotation.x = -Math.PI / 2; base.position.y = -.01; scene.add(base);
  const stemG = new THREE.CylinderGeometry(.03, .045, .5, 8); stemG.translate(0, .25, 0);
  const lg = new THREE.SphereGeometry(.2, 14, 10); lg.scale(1, .22, .55); lg.translate(.2, 0, 0);
  const green = new THREE.Color(), brown = new THREE.Color();
  const setCols = () => { const P = palette(); green.setHex(P.leaf); base.material.color.setHex(P.ground); brown.setHex(isDark() ? 0x8d7a5a : 0xb59a78); };
  ctx.onTheme(setCols); setCols();
  const cols = 15, rows = 9;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const g = new THREE.Group(); g.position.set((i - cols / 2 + .5) * .9 + (Math.random() - .5) * .25, 0, (j - rows / 2 + .5) * .9 + (Math.random() - .5) * .25);
    const mat = new THREE.MeshStandardMaterial({ color: green.clone(), roughness: .55 });
    g.add(new THREE.Mesh(stemG, mat)); for (let k = 0; k < 2; k++) { const l = new THREE.Mesh(lg, mat); l.position.y = .46; l.rotation.y = k * Math.PI + Math.random(); g.add(l); }
    scene.add(g); items.push({ g, mat, die: Math.random(), delay: Math.random() });
  }
  camera.position.set(0, 8.4, 11.6);
  return { update(t, p, ptr) {
    const prog = sstep(.12, .85, p); let alive = 0;
    items.forEach(it => { const dies = it.die < .7, k = dies ? sstep(it.die * .8, it.die * .8 + .22, prog) : 0;
      it.mat.color.copy(green).lerp(brown, k); it.g.rotation.z = k * .7 * (it.delay > .5 ? 1 : -1); it.g.scale.set(1, 1 - k * .55, 1); it.g.rotation.x = Math.sin(t + it.delay * 6) * .03 * (1 - k); if (k < .5) alive++; });
    const out = el.dataset.readout && document.getElementById(el.dataset.readout); if (out) out.textContent = Math.round(alive / items.length * 100);
    camera.position.x = Math.sin(t * .12 + ptr.x) * 2.4; camera.lookAt(0, -.4, 0);
  } };
};

builders.mesh = async (ctx) => {
  const { scene, camera } = ctx, M = mats(); ctx.onTheme(() => M.refresh(scene));
  const ground = new THREE.Mesh(new THREE.CircleGeometry(30, 64), new THREE.MeshStandardMaterial({ color: palette().ground, roughness: 1 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const mkTex = () => { const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d'), P = palette(); x.fillStyle = '#' + new THREE.Color(P.building).getHexString(); x.fillRect(0, 0, 64, 128); x.fillStyle = '#' + new THREE.Color(P.win).getHexString(); for (let y = 6; y < 128; y += 14) for (let xx = 6; xx < 64; xx += 14) x.fillRect(xx, y, 8, 8); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; };
  const blocks = [[-3.2, -1, 1.2, 3.4], [-.6, -2.4, 1.1, 2.6], [2.4, -.6, 1.3, 3.8], [.2, 2.2, 1.2, 2.9]], nodes = [], bmats = [];
  blocks.forEach(([x, z, w, h], i) => {
    const t = mkTex(); t.repeat.set(w, h * .6); const mat = new THREE.MeshStandardMaterial({ map: t, roughness: .85 }); bmats.push({ mat, w, h });
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1), mat); b.position.set(x, h / 2, z); b.rotation.y = i * .35; scene.add(b);
    const cnt = 2 + (i % 2);
    for (let k = 0; k < cnt; k++) {
      const n = new THREE.Mesh(new THREE.SphereGeometry(.13, 20, 20), M.green); const loc = new V3((k - (cnt - 1) / 2) * w * .5, h * (.3 + .22 * k), .56); loc.applyAxisAngle(new V3(0, 1, 0), b.rotation.y); n.position.set(x, 0, z).add(loc); scene.add(n);
      const ring = new THREE.Mesh(new THREE.RingGeometry(.14, .17, 40), new THREE.MeshBasicMaterial({ color: palette().node, transparent: true, opacity: .6, side: THREE.DoubleSide })); ring.position.copy(n.position); scene.add(ring);
      nodes.push({ n, ring, ph: Math.random() * 6 });
    }
  });
  const links = [], lm = new THREE.LineBasicMaterial({ color: palette().node, transparent: true, opacity: .5 });
  ctx.onTheme(() => { ground.material.color.setHex(palette().ground); bmats.forEach(b => { b.mat.map = mkTex(); b.mat.map.repeat.set(b.w, b.h * .6); b.mat.needsUpdate = true; }); nodes.forEach(n => n.ring.material.color.setHex(palette().node)); lm.color.setHex(palette().node); });
  for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
    const a = nodes[i].n.position, b = nodes[j].n.position; if (a.distanceTo(b) > 3.6) continue;
    const mid = a.clone().add(b).multiplyScalar(.5); mid.y += .5; const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), lm));
    const pk = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 10), new THREE.MeshBasicMaterial({ color: palette().accent })); scene.add(pk); links.push({ curve, pk, off: Math.random() });
  }
  camera.position.set(0, 5, 13);
  return { update(t, p, ptr) {
    nodes.forEach(o => { const k = (t * .7 + o.ph) % 2; o.ring.scale.setScalar(1 + k * 3); o.ring.material.opacity = Math.max(0, .6 - k * .32); o.ring.lookAt(camera.position); });
    links.forEach(l => l.pk.position.copy(l.curve.getPoint((t * .22 + l.off) % 1)));
    const a = t * .1 + ptr.x * .6 + p * 1.2; camera.position.set(Math.sin(a) * 13.5, 6.2 + ptr.y * .8, Math.cos(a) * 13.5); camera.lookAt(0, 1.3, 0);
  } };
};

builders.stem = async (ctx) => {
  const { scene, camera } = ctx, M = mats(); ctx.onTheme(() => M.refresh(scene));
  const g = new THREE.Group(); scene.add(g);
  const stemMat = new THREE.MeshPhysicalMaterial({ color: palette().leaf, roughness: .35, transparent: true, opacity: .5, clearcoat: .8 });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, 5, 48, 1), stemMat));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, 5.02, 24), new THREE.MeshStandardMaterial({ color: 0xc8f0d4, roughness: .6, emissive: 0x9be3b4, emissiveIntensity: .25 })));
  ctx.onTheme(() => stemMat.color.setHex(palette().leaf));
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; const s = new THREE.Mesh(new THREE.TorusGeometry(.07, .012, 6, 14), new THREE.MeshBasicMaterial({ color: 0x1d6b3f, transparent: true, opacity: .4 })); s.position.set(Math.cos(a) * .4, 0, Math.sin(a) * .4); s.lookAt(0, 0, 0); g.add(s); }
  [-1, 1].forEach(s => { const j = new THREE.Mesh(new THREE.BoxGeometry(.4, .36, .62), M.dark); j.position.set(s * 1.15, 0, 0); g.add(j); const n = new THREE.Mesh(new THREE.ConeGeometry(.04, .9, 12), M.steel); n.rotation.z = -s * Math.PI / 2; n.position.set(s * .72, 0, 0); g.add(n); });
  const arm = new THREE.Mesh(new THREE.TorusGeometry(1.35, .09, 10, 48, Math.PI), M.dark); arm.rotation.z = Math.PI; g.add(arm);
  const N = 46, NA = 3, beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.03, 10, 10), new THREE.MeshBasicMaterial({ color: palette().accent, depthTest: false, transparent: true }), N * NA); beads.renderOrder = 10; g.add(beads);
  const tmp = new THREE.Object3D(); camera.position.set(3.4, 1.6, 9.2);
  return { update(t, p, ptr) {
    const f = sstep(.12, .88, p), bow = lerp(.62, 0, f), freq = lerp(2, 20, f);
    for (let i = 0; i < NA; i++) { const side = i - 1;
      for (let k = 0; k < N; k++) { const u = k / (N - 1), x = lerp(-.4, .4, u) * 1.9, around = Math.sin(u * Math.PI) * bow * (side === 0 ? 1 : 1 + side * .45), wob = Math.sin(u * freq * 2 - t * (3 + i)) * .03, sz = side * .06 * (1 - f * .5);
        tmp.position.set(x, wob + sz, f > .85 ? sz * .4 + wob : around * .9 * (i === 1 ? -1 : 1));
        tmp.scale.setScalar((.6 + .5 * Math.sin(u * 14 - t * 6 * (1 + f * 3))) * 1.3); tmp.updateMatrix(); beads.setMatrixAt(i * N + k, tmp.matrix); } }
    beads.instanceMatrix.needsUpdate = true;
    g.rotation.y = -.55 + ptr.x * .6 + Math.sin(t * .3) * .15; g.rotation.x = .12 + ptr.y * .2; camera.lookAt(0, 0, 0);
  } };
};

builders.loop = async (ctx) => {
  const { scene, camera } = ctx;
  const g = new THREE.Group(); scene.add(g); g.rotation.x = -.95;
  const ringM = new THREE.MeshPhysicalMaterial({ color: isDark() ? 0xf3efe6 : 0x121a15, roughness: .3, clearcoat: 1 }); ctx.onTheme(() => ringM.color.setHex(isDark() ? 0xf3efe6 : 0x121a15));
  g.add(new THREE.Mesh(new THREE.TorusGeometry(2.2, .05, 16, 128), ringM));
  const cols = [0x74d68f, palette().accent, 0x7fd0ff, 0xc9b6f2], pads = [];
  cols.forEach((c, i) => { const a = i / 4 * Math.PI * 2 + Math.PI / 4; const m = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .24, 48), new THREE.MeshPhysicalMaterial({ color: c, roughness: .35, clearcoat: .8 })); m.rotation.x = Math.PI / 2; m.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, 0); g.add(m); pads.push(m); });
  const pulse = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 20), new THREE.MeshBasicMaterial({ color: palette().accent })); g.add(pulse);
  const trail = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.12 * (1 - i / 18), 12, 12), new THREE.MeshBasicMaterial({ color: palette().accent, transparent: true, opacity: .5 * (1 - i / 16) })); g.add(m); return m; });
  scene.add(contactShadow(3.2, -1.8, .22)); camera.position.set(0, 2.2, 10.2);
  return { update(t, p, ptr) {
    const s = (t * .22) % 1, a = s * Math.PI * 2 + Math.PI / 4; pulse.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, .1);
    trail.forEach((m, i) => { const aa = a - i * .07; m.position.set(Math.cos(aa) * 2.2, Math.sin(aa) * 2.2, .1); });
    pads.forEach((m, i) => { const d = Math.abs((s * 4 - i - .25 + 6) % 4), k = Math.max(0, 1 - Math.min(d, 4 - d)); m.scale.setScalar(1 + k * .25); m.position.z = k * .3; });
    g.rotation.z = t * .05; g.rotation.y = ptr.x * .35; g.rotation.x = -.95 + ptr.y * .2; camera.lookAt(0, 0, 0);
  } };
};


// SYSTEM — the whole rig: electrode → probe → pod → BLE → phone → relay → pumps → bore → roots → verify
builders.system = async (ctx) => {
  const { scene, camera, el } = ctx, M = mats(), PP = palette, tex = new THREE.TextureLoader();
  const root = new THREE.Group(); scene.add(root);
  const hud = el.closest('[data-pin]'), H = id => hud && hud.querySelector('#' + id);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(44, 64), new THREE.MeshStandardMaterial({ color: PP().ground, roughness: 1 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.96; root.add(ground);
  root.add(contactShadow(2.6, -.95, .3));
  const pot = glassPot(M, 1.3, 1.9); root.add(pot);
  const soilTop = pot.children[2];
  // plant
  const plant = new THREE.Group(); plant.position.set(0, .608, 0); root.add(plant);
  const stemCurve = new THREE.CatmullRomCurve3([new V3(0, 0, 0), new V3(.03, 1, .02), new V3(-.02, 1.9, -.02), new V3(.04, 2.9, .02)]);
  const stemMat = new THREE.MeshStandardMaterial({ color: PP().leaf, roughness: .55 });
  plant.add(new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 48, .115, 12), stemMat));
  const lg = new THREE.SphereGeometry(1, 28, 16); lg.scale(.8, .07, .34); lg.translate(.8, 0, 0);
  const leafMat = new THREE.MeshPhysicalMaterial({ color: PP().leaf, roughness: .45, clearcoat: .3, side: THREE.DoubleSide });
  const leaves = []; for (let i = 0; i < 10; i++) { const u = .22 + i / 10 * .74, m = new THREE.Mesh(lg, leafMat); m.position.copy(stemCurve.getPoint(u)); m.rotation.y = i * 2.4; m.rotation.z = .55 - u * .5; m.scale.setScalar(1.15 - u * .5); m.userData = { u, i, z: m.rotation.z }; plant.add(m); leaves.push(m); }
  // roots
  const roots = new THREE.Group(); root.add(roots); const rootMat = new THREE.LineBasicMaterial({ color: 0xfff3d6, transparent: true, opacity: .5 });
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, pts = [new V3(0, .55, 0)]; let x = 0, y = .55, z = 0; for (let k = 1; k < 7; k++) { x += Math.cos(a) * .15 + (Math.random() - .5) * .09; z += Math.sin(a) * .15 + (Math.random() - .5) * .09; y -= .15 + Math.random() * .06; pts.push(new V3(x, y, z)); } roots.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(pts).getPoints(26)), rootMat)); }
  const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 24), new THREE.MeshBasicMaterial({ color: PP().accent, transparent: true, opacity: 0, depthWrite: false })); glow.position.set(.7, -.45, .3); glow.scale.set(.7, .55, .7); root.add(glow);
  // probe (real CAD)
  const pr = await makeProbe(M, M.white, 2.5), probe = pr.G; probe.position.set(.72, .61, .32); probe.rotation.y = .5; root.add(probe);
  const probeTop = new V3(.72, 1.86, .32), nose = new V3(.72, -.64, .32), ecPt = new V3(.72, -.2, .5), winPt = new V3(.72, .62, .5);
  // pod (real CAD) + antenna rings
  const house = await makeHouse(M); house.scale.setScalar(1.05); house.position.set(3.2, .1, 0); house.rotation.y = -.45; root.add(house); house.updateMatrixWorld(true);
  const podTop = house.localToWorld(new V3(0, 2.15, 0)), exit = house.localToWorld(new V3(1.15, -.35, 0));
  // the probes connect to the house by wire (and the tube), not by an arm
  const clipC = stemCurve.getPoint(.64).add(plant.position);
  const wClip = wire([exit, exit.clone().add(new V3(-.4, -.5, .35)), new V3(1.8, -.6, 1.0), new V3(1.0, .5, .8), new V3(.55, 1.8, .4), new V3(clipC.x + .32, clipC.y, clipC.z + .05)], .018, 0x1d2420), wProbe = wire([exit, exit.clone().add(new V3(-.5, -.6, .1)), new V3(1.9, -.5, .55), new V3(1.2, .6, .6), new V3(.95, 1.6, .45), probeTop0()], .02, 0xff9a1f);
  function probeTop0() { return new V3(.72, 1.88, .32); }
  root.add(wClip, wProbe);
  const clip = new THREE.Group(); clip.position.copy(clipC); root.add(clip);
  [-1, 1].forEach(sg => { const j = new THREE.Mesh(new THREE.BoxGeometry(.22, .2, .3), M.dark); j.position.set(sg * .3, 0, 0); clip.add(j); const n = new THREE.Mesh(new THREE.ConeGeometry(.018, .3, 10), M.steel); n.rotation.z = -sg * Math.PI / 2; n.position.set(sg * .17, 0, 0); clip.add(n); });
  const NB = 30, NA = 3, arcM = new THREE.MeshBasicMaterial({ color: PP().accent, depthTest: false, transparent: true });
  const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(.011, 8, 8), arcM, NB * NA); beads.renderOrder = 10; clip.add(beads);
  // reservoir + feed bottle + pumps + relay
  const tankMat = M.glass, tank = new THREE.Mesh(new THREE.CylinderGeometry(.85, .85, 2.2, 40, 1, true), tankMat); tank.position.set(-3.5, .15, .45); root.add(tank);
  const waterMat = new THREE.MeshPhysicalMaterial({ color: 0x7fd0ff, transparent: true, opacity: .6, roughness: .1 }); const water = new THREE.Mesh(new THREE.CylinderGeometry(.8, .8, 2.1, 40), waterMat); water.position.set(-3.5, .15, .45); root.add(water);
  const bot = new THREE.Mesh(new THREE.CylinderGeometry(.36, .36, 1.1, 32, 1, true), tankMat); bot.position.set(-3.5, -.4, -.95); root.add(bot);
  const feedMat = new THREE.MeshPhysicalMaterial({ color: PP().accent, transparent: true, opacity: .7, roughness: .15 }); const feed = new THREE.Mesh(new THREE.CylinderGeometry(.32, .32, 1.0, 32), feedMat); feed.position.set(-3.5, -.4, -.95); root.add(feed);
  const pumpG = new THREE.CylinderGeometry(.24, .24, .55, 28), pumps = [[-2.1, -.55, .5, 0x7fd0ff], [-2.1, -.55, -.7, PP().accent]].map(([x, y, z, c]) => { const g = new THREE.Group(); g.position.set(x, y, z); const b = new THREE.Mesh(pumpG, M.dark); b.rotation.x = Math.PI / 2; g.add(b); const imp = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .05, 6), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .25 })); imp.rotation.x = Math.PI / 2; imp.position.z = .3; g.add(imp); root.add(g); return { g, imp, c }; });
  const relay = new THREE.Group(); relay.position.set(-1.65, .1, .0); root.add(relay);
  relay.add(new THREE.Mesh(new THREE.BoxGeometry(.7, .12, .5), new THREE.MeshStandardMaterial({ color: 0x1f6d49, roughness: .5 })));
  const rcoil = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .3, 18), new THREE.MeshStandardMaterial({ color: 0x2c5fa8, roughness: .5 })); rcoil.position.set(-.1, .2, 0); relay.add(rcoil);
  const rled = new THREE.Mesh(new THREE.SphereGeometry(.05, 12, 12), new THREE.MeshBasicMaterial({ color: 0x444444 })); rled.position.set(.25, .1, .15); relay.add(rled);
  // tubing
  const brA = new THREE.CatmullRomCurve3([new V3(-2.62, -.55, .5), new V3(-2.1, -.55, .5), new V3(-1.7, -.55, .32), new V3(-1.3, -.55, -.05)]);
  const brB = new THREE.CatmullRomCurve3([new V3(-3.16, -.55, -.9), new V3(-2.1, -.55, -.7), new V3(-1.7, -.55, -.4), new V3(-1.3, -.55, -.05)]);
  const main = new THREE.CatmullRomCurve3([new V3(-1.3, -.55, -.05), new V3(-.95, .3, -.08), new V3(-.4, 1.7, -.05), new V3(.15, 2.65, .25), new V3(.72, 2.45, .32), probeTop, new V3(.72, .6, .32), nose]);
  const tubeM = new THREE.MeshPhysicalMaterial({ color: PP().glass, transparent: true, opacity: .4, roughness: .1, clearcoat: 1 });
  [[brA, 30], [brB, 30], [new THREE.CatmullRomCurve3(main.getPoints(40).slice(0, 29)), 60]].forEach(([c, n]) => root.add(new THREE.Mesh(new THREE.TubeGeometry(c, n, .035, 8), tubeM)));
  const yj = new THREE.Mesh(new THREE.SphereGeometry(.09, 14, 14), M.dark); yj.position.set(-1.3, -.55, -.05); root.add(yj);
  // flow beads
  const NF = 64, flowW = new THREE.InstancedMesh(new THREE.SphereGeometry(.04, 10, 10), new THREE.MeshBasicMaterial({ color: 0x7fd0ff, depthTest: false, transparent: true }), NF), flowF = new THREE.InstancedMesh(new THREE.SphereGeometry(.04, 10, 10), new THREE.MeshBasicMaterial({ color: PP().accent, depthTest: false, transparent: true }), NF);
  flowW.renderOrder = flowF.renderOrder = 8; root.add(flowW, flowF);
  const drops = new Drops(scene, M.water, 50);
  // phone
  const phone = new THREE.Group(); phone.position.set(4.7, 2.2, .3); phone.rotation.y = -.5; root.add(phone);
  phone.add(new THREE.Mesh(new THREE.BoxGeometry(1.25, 2.6, .09), new THREE.MeshStandardMaterial({ color: 0x0b0f0c, roughness: .35, metalness: .4 })));
  const imgs = ['pandan', 'market', 'profile'].map(n => { const t = tex.load(`media/app-${n}.jpg`); t.colorSpace = THREE.SRGBColorSpace; return t; });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.17, 2.54), new THREE.MeshBasicMaterial({ map: imgs[0] })); scr.position.z = .05; phone.add(scr);
  // BLE
  const cells = new THREE.InstancedMesh(new THREE.BoxGeometry(.05, .05, .05), new THREE.MeshBasicMaterial({ color: PP().node }), 46); root.add(cells);
  const crcM = new THREE.MeshBasicMaterial({ color: PP().accent }); const cmd = new THREE.Mesh(new THREE.SphereGeometry(.07, 12, 12), crcM); cmd.visible = false; root.add(cmd);
  const bleC = new THREE.CatmullRomCurve3([podTop.clone().add(new V3(0, .1, 0)), new V3(3.6, 3.0, .3), new V3(4.2, 2.8, .3), new V3(4.55, 2.5, .4)]);
  const rings = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(.1, .115, 48), new THREE.MeshBasicMaterial({ color: PP().node, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false })); r.position.copy(podTop); r.renderOrder = 9; root.add(r); return r; });
  // sensor pulses on the probe
  const pulses = [ecPt, winPt].map(p => { const r = new THREE.Mesh(new THREE.RingGeometry(.08, .1, 32), new THREE.MeshBasicMaterial({ color: PP().accent, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false })); r.position.copy(p); r.renderOrder = 9; root.add(r); return r; });
  // recolor on theme
  const recolor = () => { const Q = PP(); ground.material.color.setHex(Q.ground); stemMat.color.setHex(Q.leaf); leafMat.color.setHex(Q.leaf); arcM.color.setHex(Q.accent); feedMat.color.setHex(Q.accent); flowF.material.color.setHex(Q.accent); crcM.color.setHex(Q.accent); cells.material.color.setHex(Q.node); rings.forEach(r => r.material.color.setHex(Q.node)); pulses.forEach(r => r.material.color.setHex(Q.accent)); glow.material.color.setHex(Q.accent); tubeM.color.setHex(Q.glass); pumps[1].imp.material.color.setHex(Q.accent); pumps[1].imp.material.emissive.setHex(Q.accent); M.refresh(scene); };
  ctx.onTheme(recolor);
  // camera path
  const K = [[[.6, 2.6, 20], [.6, .9, 0]], [[1.9, 3.0, 5.4], [0, 2.4, 0]], [[3.6, 1.4, 7.8], [.7, .35, .3]], [[4.8, 1.6, 8.6], [3.1, .7, 0]], [[3.9, 2.6, 11.5], [3.9, 1.9, 0]], [[5.6, 2.4, 6.2], [4.6, 2.2, .3]], [[-.9, .9, 6.4], [-2.2, -.2, 0]], [[1.0, 1.4, 6.0], [.4, .9, .3]], [[.6, 2.6, 20], [.6, .9, 0]]];
  const cpos = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[0])), false, 'centripetal'), clook = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[1])), false, 'centripetal');
  const cp = new V3(), cl = new V3(), curLook = new V3(0, .9, 0); camera.position.set(.6, 2.4, 15.5);
  const tmpM = new THREE.Object3D(), tmpE = {}; let tw = 0, last = {};
  const set = (id, v, hot) => { const e = H(id); if (e && last[id] !== v) { e.textContent = v; last[id] = v; } if (e) e.classList.toggle('hot', !!hot); };
  return { anchors: {}, group: root, update(t, p, ptr, dt) {
    const camT = clamp((p - .055) / .89); cpos.getPoint(camT, cp); clook.getPoint(camT, cl);
    cp.x += ptr.x * .35; cp.y -= ptr.y * .2; camera.position.lerp(cp, Math.min(1, dt * 6)); curLook.lerp(cl, Math.min(1, dt * 6)); camera.lookAt(curLook);
    root.rotation.y = 0;
    // plant breath
    leaves.forEach(l => { l.rotation.z = l.userData.z + Math.sin(t * 1.3 + l.userData.i) * .03; });
    // electrode sweep (chapter 1-2): 1 kHz → 100 kHz
    const f = sstep(.12, .22, p), bow = lerp(.14, 0, f), fq = lerp(2, 18, f), on = sstep(.07, .11, p);
    for (let i = 0; i < NA; i++) { const sd = i - 1; for (let k = 0; k < NB; k++) { const u = k / (NB - 1), x = lerp(-.12, .12, u), ar = Math.sin(u * Math.PI) * bow * (sd === 0 ? 1 : 1 + sd * .4), wob = Math.sin(u * fq * 2 - t * (3 + i)) * .008;
      tmpM.position.set(x, wob + sd * .015, f > .9 ? sd * .01 : ar * (i === 1 ? -1 : 1)); tmpM.scale.setScalar(on * (.6 + .5 * Math.sin(u * 12 - t * 6 * (1 + f * 3))) * 1.4); tmpM.updateMatrix(); beads.setMatrixAt(i * NB + k, tmpM.matrix); } }
    beads.instanceMatrix.needsUpdate = true;
    // probe pulses (chapter 2)
    pulses.forEach((r, i) => { const a = sstep(.21, .24, p) * (1 - sstep(.33, .36, p)), k = (t * .8 + i * .5) % 1; r.scale.setScalar(1 + k * 5); r.material.opacity = a * (1 - k) * .8; r.lookAt(camera.position); });
    // BLE rings + packet (chapter 3-4)
    rings.forEach((r, i) => { const a = sstep(.33, .36, p) * (1 - sstep(.54, .58, p)), k = (t * .6 + i / 3) % 1; r.scale.setScalar(1 + k * 6); r.material.opacity = a * (1 - k) * .7; r.lookAt(camera.position); });
    const form = sstep(.33, .42, p), travel = sstep(.44, .54, p);
    for (let i = 0; i < 46; i++) { const u = lerp(0, 1.1, travel) - i * .013; if (travel < .001) { const a = i / 46 * Math.PI * 2; tmpM.position.set(podTop.x + Math.cos(a) * .3 * form, podTop.y + .35 + Math.sin(a) * .3 * form, podTop.z); tmpM.scale.setScalar(form); } else if (u > 0 && u < 1) { tmpM.position.copy(bleC.getPoint(u)); tmpM.scale.setScalar(1); } else tmpM.scale.setScalar(0); tmpM.updateMatrix(); cells.setMatrixAt(i, tmpM.matrix); }
    cells.instanceMatrix.needsUpdate = true;
    // phone screen
    scr.material.map = p > .86 ? imgs[2] : p > .54 ? imgs[0] : imgs[0]; phone.position.y = 2.2 + Math.sin(t * .9) * .05;
    // command back (chapter 5-6)
    const cu = sstep(.6, .67, p); cmd.visible = cu > .001 && cu < .999; if (cmd.visible) cmd.position.copy(bleC.getPoint(1 - cu));
    // relay + pumps (chapter 6-7)
    const pw = sstep(.66, .69, p) * (1 - sstep(.88, .9, p)), fd = sstep(.76, .79, p) * (1 - sstep(.88, .9, p));
    rled.material.color.setHex(pw > .5 ? 0x44ff88 : 0x444444); rcoil.material.emissive = new THREE.Color(pw > .5 ? 0x2255ff : 0); rcoil.material.emissiveIntensity = .4;
    pumps.forEach((pu, i) => { pu.imp.rotation.y += dt * 14 * (i ? fd : pw); }); tw += dt;
    const lvl = 1 - .18 * sstep(.66, .9, p); water.scale.y = lvl; water.position.y = .15 - (1 - lvl) * 1.05;
    const flow = (inst, br, amt, off) => { for (let i = 0; i < NF; i++) { const s = ((tw * .16 * Math.max(amt, .0) + i / NF + off) % 1); const pt = s < .28 ? br.getPoint(s / .28) : main.getPoint((s - .28) / .72); tmpM.position.copy(pt); tmpM.scale.setScalar(amt > .02 ? amt : 0); tmpM.updateMatrix(); inst.setMatrixAt(i, tmpM.matrix); } inst.instanceMatrix.needsUpdate = true; };
    flow(flowW, brA, pw, 0); flow(flowF, brB, fd, .5 / NF);
    drops.update(dt, pw > .6, nose.clone(), -.9);
    // soil + roots (chapter 7-8)
    const wet = sstep(.78, .9, p); soilTop.material.color.setHex(PP().soil).lerp(new THREE.Color(0x2a1a10), wet * .6); rootMat.opacity = .45 + .5 * wet + Math.sin(t * 3) * .05 * wet; glow.material.opacity = .22 * fd + .1 * wet * (1 - fd);
    // HUD
    const moist = Math.round(lerp(31, 58, sstep(.78, .9, p))), ec = (lerp(1.4, 1.9, sstep(.8, .9, p))).toFixed(1);
    set('hud-moist', moist + '%', moist < 40); set('hud-ec', ec + ' mS', false);
    set('hud-frame', p < .33 ? '—' : p < .44 ? '46 B · CRC ok' : p < .58 ? 'sending' : 'received', false);
    set('hud-pump', pw > .5 ? (fd > .5 ? 'A + B on' : 'A on') : 'off', pw > .5);
  } };
};


// TISSUE — a slice through a stem: cells, needles, current paths, a fungal hypha, a leaking cell, and the impedance curve it changes
builders.tissue = async (ctx) => {
  const { scene, camera, el } = ctx, M = mats(); ctx.onTheme(() => M.refresh(scene));
  const root = new THREE.Group(); scene.add(root);
  const R = .42, W = Math.sqrt(3) * R, cols = 13, rows = 9, cells = [], PP = palette;
  for (let r = 1; r < rows; r++) for (let c = 0; c < cols; c++) cells.push({ x: (c - (cols - 1) / 2) * W + (r % 2 ? W / 2 : 0), y: -(r - 4.5) * 1.5 * R + .55, r, c });
  const N = cells.length;
  const wallGeo = new THREE.CylinderGeometry(R * .95, R * .95, .5, 6, 1); wallGeo.rotateX(Math.PI / 2);
  const wallM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: .42, roughness: .25, clearcoat: .6, depthWrite: false });
  const walls = new THREE.InstancedMesh(wallGeo, wallM, N), vac = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshPhysicalMaterial({ color: 0xdff3ea, transparent: true, opacity: .55, roughness: .15, clearcoat: 1 }), N);
  const nuc = new THREE.InstancedMesh(new THREE.SphereGeometry(.085, 14, 12), new THREE.MeshStandardMaterial({ color: 0x6a5acd, roughness: .5 }), N);
  const chl = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: PP().leaf, roughness: .45 }), N * 4);
  const mem = new THREE.InstancedMesh(new THREE.TorusGeometry(R * .83, .012, 6, 36), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .55 }), N);
  [walls, vac, nuc, chl, mem].forEach(m => { m.frustumCulled = false; root.add(m); });
  const tmp = new THREE.Object3D(), col = new THREE.Color(), rnd = (a, b) => a + Math.random() * (b - a);
  const cellOff = cells.map(() => ({ nx: rnd(-.12, .12), ny: rnd(-.12, .12), ch: [0, 1, 2, 3].map(() => ({ a: rnd(0, 6.28), d: rnd(.2, .31) })) }));
  const ic = cells.reduce((b, c, i) => (Math.hypot(c.x, c.y - .15) < Math.hypot(cells[b].x, cells[b].y - .15) ? i : b), 0), icc = cells[ic];
  function setCell(i, leak) {
    const c = cells[i], o = cellOff[i], k = i === ic ? leak : 0;
    tmp.position.set(c.x, c.y, 0); tmp.rotation.set(0, 0, 0); tmp.scale.setScalar(1); tmp.updateMatrix(); walls.setMatrixAt(i, tmp.matrix); mem.setMatrixAt(i, tmp.matrix);
    tmp.position.set(c.x, c.y, .02); tmp.scale.set(R * .6 * (1 - .55 * k), R * .6 * (1 - .55 * k), .14); tmp.updateMatrix(); vac.setMatrixAt(i, tmp.matrix);
    tmp.position.set(c.x + o.nx, c.y + o.ny, .05); tmp.scale.setScalar(1 - .3 * k); tmp.updateMatrix(); nuc.setMatrixAt(i, tmp.matrix);
    o.ch.forEach((h, j) => { tmp.position.set(c.x + Math.cos(h.a) * h.d * R * 2, c.y + Math.sin(h.a) * h.d * R * 2, .04); tmp.rotation.z = h.a; tmp.scale.set(.06, .03, .03); tmp.updateMatrix(); chl.setMatrixAt(i * 4 + j, tmp.matrix); });
    tmp.rotation.z = 0;
  }
  const baseWall = new THREE.Color(), brownC = new THREE.Color(0x7a4a22), memC = new THREE.Color();
  const tint = (leak) => { const Q = PP(); baseWall.setHex(Q.leaf).lerp(new THREE.Color(isDark() ? 0xffffff : 0xffffff), .72); for (let i = 0; i < N; i++) { col.copy(baseWall); if (i === ic) col.lerp(brownC, leak * .85); walls.setColorAt(i, col); memC.setHex(Q.accent).lerp(new THREE.Color(0xffffff), .2); if (i === ic) memC.lerp(new THREE.Color(0xff5a3c), leak); else memC.setHex(Q.node); mem.setColorAt(i, memC); } walls.instanceColor.needsUpdate = true; mem.instanceColor.needsUpdate = true; chl.material.color.setHex(Q.leaf); };
  for (let i = 0; i < N; i++) setCell(i, 0); tint(0); ctx.onTheme(() => tint(0));
  // apoplast backdrop (the fluid in the gaps)
  const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 26), new THREE.MeshBasicMaterial({ color: 0x57b4ff, transparent: true, opacity: .32 })); back.position.z = -.28; root.add(back);
  // epidermis strip with a stoma, xylem vessels
  const epi = new THREE.InstancedMesh(new THREE.BoxGeometry(W * .96, .24, .45), new THREE.MeshStandardMaterial({ color: PP().leaf, roughness: .5 }), cols * 2); let ei = 0; const topY = cells.reduce((m, c) => Math.max(m, c.y), -9) + R * 1.18;
  for (let c = -cols; c < cols; c++) { const x = c * W * 1.0 + W / 2; if (Math.abs(x - (-2.7)) < W * .6) continue; if (Math.abs(x) > 6.4) continue; tmp.position.set(x, topY, 0); tmp.scale.setScalar(1); tmp.updateMatrix(); if (ei < cols * 2) epi.setMatrixAt(ei++, tmp.matrix); }
  epi.count = ei; root.add(epi); ctx.onTheme(() => epi.material.color.setHex(PP().leaf));
  const cut = new THREE.Mesh(new THREE.PlaneGeometry(14, .05), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); cut.position.set(0, topY + .16, .2); root.add(cut);
  // graph of the gaps between cells
  const vid = new Map(), verts = [], adj = []; const vkey = (x, y) => Math.round(x * 50) + ',' + Math.round(y * 50);
  const addV = (x, y) => { const k = vkey(x, y); if (!vid.has(k)) { vid.set(k, verts.length); verts.push(new V3(x, y, .02)); adj.push([]); } return vid.get(k); };
  cells.forEach(c => { const ring = []; for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; ring.push(addV(c.x + Math.cos(a) * R * 1.0, c.y + Math.sin(a) * R * 1.0)); } for (let k = 0; k < 6; k++) { const a = ring[k], b = ring[(k + 1) % 6]; if (!adj[a].includes(b)) { adj[a].push(b); adj[b].push(a); } } });
  const nearV = (x, y) => verts.reduce((b, v, i) => (Math.hypot(v.x - x, v.y - y) < Math.hypot(verts[b].x - x, verts[b].y - y) ? i : b), 0);
  function route(a, b) { const dist = new Array(verts.length).fill(1e9), prev = new Array(verts.length).fill(-1), q = [a]; dist[a] = 0; while (q.length) { q.sort((u, v) => dist[u] - dist[v]); const u = q.shift(); if (u === b) break; adj[u].forEach(v => { const d = dist[u] + verts[u].distanceTo(verts[v]); if (d < dist[v]) { dist[v] = d; prev[v] = u; q.push(v); } }); } const out = []; for (let v = b; v !== -1; v = prev[v]) out.unshift(verts[v].clone()); return out; }
  const tipA = nearV(-1.05, .95), tipB = nearV(1.05, .95), lowPath = route(tipA, tipB), highPath = [verts[tipA].clone(), verts[tipB].clone()].flatMap((v, i, a) => i ? [] : [v, a[1]]);
  const poly = pts => { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1])); return { pts, cum, len: cum[cum.length - 1], at(u) { const d = u * this.len; let i = 1; while (i < this.cum.length - 1 && this.cum[i] < d) i++; const k = (d - this.cum[i - 1]) / Math.max(1e-6, this.cum[i] - this.cum[i - 1]); return this.pts[i - 1].clone().lerp(this.pts[i], clamp(k)); } }; };
  const lowP = poly(lowPath), highP = poly([verts[tipA].clone(), verts[tipB].clone()]);
  // needles
  const needM = new THREE.MeshStandardMaterial({ color: 0xdfe5e2, metalness: 1, roughness: .18 }), needles = [tipA, tipB].map(v => { const m = new THREE.Mesh(new THREE.ConeGeometry(.045, 4.2, 12), needM); m.geometry.translate(0, 2.1, 0); m.rotation.z = Math.PI; m.position.copy(verts[v]); m.userData.t = verts[v].clone(); root.add(m); return m; });
  const clipBox = new THREE.Mesh(new THREE.BoxGeometry(3.2, .36, .5), M.dark); clipBox.position.set(0, 4.8, 0); root.add(clipBox);
  const nb = (pp, count, color) => { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(.04, 8, 8), new THREE.MeshBasicMaterial({ color, depthTest: false, transparent: true }), count); im.renderOrder = 6; im.frustumCulled = false; root.add(im); return im; };
  const bLow = nb(lowP, 36, PP().accent), bHigh = nb(highP, 36, PP().node); ctx.onTheme(() => { bLow.material.color.setHex(PP().accent); bHigh.material.color.setHex(PP().node); });
  // hypha
  const stoma = nearV(-2.7, topY - R * .5), target = (() => { let best = 0, bd = 1e9; verts.forEach((v, i) => { const d = Math.hypot(v.x - icc.x, v.y - icc.y); if (Math.abs(d - R) < .06 && v.x < icc.x - .05 && v.y > icc.y - .1 && adj[i].length) { const dd = Math.hypot(v.x + 2.2, v.y - 1); if (dd < bd) { bd = dd; best = i; } } }); return best; })();
  const hp = route(stoma, target); const hCurve = new THREE.CatmullRomCurve3(hp.map((v, i) => v.clone().add(new V3(0, 0, .06 + (i % 2) * .03))), false, 'catmullrom', .2);
  const radial = 8, tub = Math.max(30, hp.length * 6); const hyphaM = new THREE.MeshStandardMaterial({ color: 0xf2e6b0, roughness: .5, emissive: 0x5a4a10, emissiveIntensity: .25 });
  const hypha = new THREE.Mesh(new THREE.TubeGeometry(hCurve, tub, .03, radial, false), hyphaM); hypha.frustumCulled = false; root.add(hypha);
  const branches = [.45, .72].map((u, bi) => { const base = hCurve.getPoint(u); let v = nearV(base.x, base.y); const pts = [verts[v].clone()]; let prevV = -1; for (let s = 0; s < 4; s++) { const opts = adj[v].filter(n => n !== prevV); if (!opts.length) break; const n = opts[(bi * 2 + s) % opts.length]; prevV = v; v = n; pts.push(verts[v].clone()); } if (pts.length < 3) pts.push(pts[0].clone().add(new V3(.2, -.2, 0))); const cu = new THREE.CatmullRomCurve3(pts.map(p => p.clone().add(new V3(0, 0, .07)))); const m = new THREE.Mesh(new THREE.TubeGeometry(cu, 24, .02, 6), hyphaM); m.frustumCulled = false; root.add(m); return m; });
  const app = new THREE.Mesh(new THREE.SphereGeometry(.085, 16, 12), new THREE.MeshStandardMaterial({ color: 0xe8d38a, roughness: .4 })); app.scale.set(1.3, 1, .7); app.position.copy(verts[target]).add(new V3(0, 0, .08)); app.visible = false; root.add(app);
  const pegDir = new V3(icc.x - verts[target].x, icc.y - verts[target].y, 0).normalize(), peg = new THREE.Mesh(new THREE.ConeGeometry(.026, .3, 8), hyphaM); peg.geometry.translate(0, .15, 0); peg.position.copy(verts[target]).add(new V3(0, 0, .08)); peg.quaternion.setFromUnitVectors(new V3(0, 1, 0), pegDir); peg.visible = false; root.add(peg);
  // ions
  const ions = Array.from({ length: 46 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x4fd1ff, transparent: true })); m.visible = false; root.add(m); return { m, life: 0, v: new V3() }; });
  let ionT = 0;
  // vessels
  const vessels = [-3, -.3, 2.4].map(x => { const g = new THREE.Group(); g.position.set(x, -3.1, 0); const o = new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .5, 28), new THREE.MeshPhysicalMaterial({ color: 0x8fd8ff, transparent: true, opacity: .4, roughness: .1, clearcoat: 1 })); o.rotation.x = Math.PI / 2; g.add(o); for (let k = 0; k < 5; k++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(.47 - k * .02, .012, 6, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .5 })); rg.position.z = .26 - k * .1; g.add(rg); } root.add(g); return g; });
  // callout anchors
  const anchors = { needle: verts[tipA].clone().add(new V3(0, .1, .1)), vac: new V3(icc.x - .1, icc.y, .1), chl: new V3(icc.x + cellOff[ic].ch[0].d * R * 2 * Math.cos(cellOff[ic].ch[0].a), icc.y + cellOff[ic].ch[0].d * R * 2 * Math.sin(cellOff[ic].ch[0].a), .1), nuc: new V3(icc.x + cellOff[ic].nx, icc.y + cellOff[ic].ny, .1), wall: new V3(icc.x + R * .94, icc.y, .1), mem: new V3(icc.x - R * .6, icc.y + R * .55, .1), gap: verts[adj.length > 5 ? nearV(1.5, -.6) : 0].clone(), xyl: new V3(-.3, -3.1, .2), hyph: verts[stoma].clone(), app: verts[target].clone(), epi: new V3(1.5, topY, .2) };
  // impedance plot
  const plot = el.closest('[data-pin]')?.querySelector('#eis'), pc = plot && plot.getContext('2d');
  const Z = (f, R0, Ri, fc) => Ri + (R0 - Ri) / (1 + Math.pow(f / fc, .85));
  function draw(t, f, leak) {
    if (!pc) return; const w = plot.width = plot.clientWidth * 2, h = plot.height = plot.clientHeight * 2; pc.clearRect(0, 0, w, h);
    const fg = cvar('--text', '#fff'), ac = cvar('--green', '#6c6'), wm = cvar('--warm', '#e96'); pc.lineWidth = 2; pc.font = '20px monospace'; pc.fillStyle = fg; pc.globalAlpha = .45;
    pc.beginPath(); pc.moveTo(60, 20); pc.lineTo(60, h - 44); pc.lineTo(w - 20, h - 44); pc.stroke(); pc.fillText('|Z|', 10, 34); pc.fillText('1 kHz', 60, h - 14); pc.fillText('100 kHz', w - 120, h - 14); pc.globalAlpha = 1;
    const X = f2 => 60 + (Math.log10(f2) / 2) * (w - 90), Y = z => h - 44 - (z / 115) * (h - 80);
    const curve = (R0, Ri, fc, color, wd, dash) => { pc.strokeStyle = color; pc.lineWidth = wd; pc.setLineDash(dash || []); pc.beginPath(); for (let k = 0; k <= 80; k++) { const ff = Math.pow(10, k / 40), x = X(ff), y = Y(Z(ff, R0, Ri, fc)); k ? pc.lineTo(x, y) : pc.moveTo(x, y); } pc.stroke(); pc.setLineDash([]); };
    curve(100, 28, 18, fg, 2, [8, 8]); const R0 = 100 - 52 * leak, Ri = 28 - 3 * leak, fc = 18 + 20 * leak; curve(R0, Ri, fc, leak > .05 ? wm : ac, 4);
    const ff = Math.pow(10, 2 * f), mx = X(ff), my = Y(Z(ff, R0, Ri, fc)); pc.fillStyle = leak > .05 ? wm : ac; pc.beginPath(); pc.arc(mx, my, 9, 0, 7); pc.fill();
  }
  // camera
  const K = [[[0, .4, 12.5], [0, .4, 0]], [[-.2, .3, 4.0], [icc.x, icc.y, 0]], [[0, 1.8, 7.2], [0, 2.2, 0]], [[0, 1.2, 6.4], [0, .8, 0]], [[0, 1.2, 6.4], [0, .8, 0]], [[-1.2, .8, 5.2], [-.9, .6, 0]], [[0, .7, 7.2], [0, .5, 0]]];
  const cpos = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[0])), false, 'centripetal'), clook = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[1])), false, 'centripetal');
  const cp = new V3(), cl = new V3(), cur = new V3(0, .4, 0); camera.position.set(0, .4, 12.5);
  const place = (inst, P, amt, t, off) => { for (let i = 0; i < 36; i++) { const u = (t * .12 + i / 36 + off) % 1; tmp.position.copy(P.at(u)); tmp.scale.setScalar(amt); tmp.updateMatrix(); inst.setMatrixAt(i, tmp.matrix); } inst.instanceMatrix.needsUpdate = true; };
  let leakV = 0;
  return { anchors, group: root, update(t, p, ptr, dt) {
    const camT = clamp((p - .05) / .9); cpos.getPoint(camT, cp); clook.getPoint(camT, cl); cp.x += ptr.x * .3; cp.y -= ptr.y * .2; camera.position.lerp(cp, Math.min(1, dt * 5)); cur.lerp(cl, Math.min(1, dt * 5)); camera.lookAt(cur);
    root.rotation.y = ptr.x * .06; root.rotation.x = -ptr.y * .04;
    const N7 = 1 / 7, S = (a, b) => sstep(a, b, p);
    const nd = S(2 * N7, 2 * N7 + .06); needles.forEach(n => { n.position.copy(n.userData.t).add(new V3(0, (1 - nd) * 4.2, 0)); }); clipBox.position.y = 4.9 + (1 - nd) * 4.2;
    const lowAmt = S(3 * N7, 3 * N7 + .03) * (1 - S(4 * N7, 4 * N7 + .03)), highAmt = S(4 * N7, 4 * N7 + .03) * (1 - S(5 * N7, 5 * N7 + .03));
    place(bLow, lowP, lowAmt, t, 0); place(bHigh, highP, highAmt, t, .0);
    const hg = S(5 * N7, 5 * N7 + .09); const dr = k => Math.floor(clamp(k) * tub) * radial * 6; hypha.geometry.setDrawRange(0, dr(hg)); branches.forEach((b, i) => b.geometry.setDrawRange(0, Math.floor(clamp((hg - .45 - i * .2) * 3) * 24) * 6 * 6));
    app.visible = hg > .98; app.scale.set(1.3 * clamp((hg - .98) * 50), clamp((hg - .98) * 50), .7); const pg = S(5 * N7 + .09, 6 * N7 - .01); peg.visible = pg > .01; peg.scale.set(1, pg, 1);
    const lk = S(6 * N7 - .005, 6 * N7 + .06); if (Math.abs(lk - leakV) > .002) { leakV = lk; setCell(ic, lk); walls.instanceMatrix.needsUpdate = true; vac.instanceMatrix.needsUpdate = true; nuc.instanceMatrix.needsUpdate = true; tint(lk); }
    ionT += dt; if (lk > .1 && ionT > .09) { ionT = 0; const io = ions.find(i => i.life <= 0); if (io) { io.life = 1; io.m.position.set(icc.x, icc.y, .1); const a = Math.random() * 6.28; io.v.set(Math.cos(a), Math.sin(a), 0).multiplyScalar(.5 + Math.random() * .4); io.m.visible = true; } }
    ions.forEach(io => { if (io.life <= 0) return; io.life -= dt * .5; io.m.position.addScaledVector(io.v, dt); io.m.scale.setScalar(clamp(io.life * 2)); io.m.material.opacity = clamp(io.life * 2); if (io.life <= 0) io.m.visible = false; });
    const fsw = p < 4 * N7 ? lerp(0, .3, S(3 * N7, 4 * N7)) : lerp(.3, 1, S(4 * N7, 5 * N7)); const fm = p > 5 * N7 ? (t * .2) % 1 : fsw; draw(t, fm, lk);
    const set = (id, v) => { const e = el.closest('[data-pin]')?.querySelector('#' + id); if (e && e.textContent !== v) e.textContent = v; };
    set('t-low', lk > .05 ? 'falling' : 'steady'); set('t-state', lk > .5 ? 'membrane leaking' : hg > .1 ? 'hypha in the gaps' : 'intact');
  } };
};

// FARM — one module on one sentinel plant in a whole field; shared weather, then fungus, then a dive into the stem
builders.farm = async (ctx) => {
  const { scene, camera, el } = ctx, M = mats(), PP = palette; ctx.onTheme(() => M.refresh(scene));
  const root = new THREE.Group(); scene.add(root);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 70), new THREE.MeshStandardMaterial({ color: PP().ground, roughness: 1 })); ground.rotation.x = -Math.PI / 2; root.add(ground);
  const cols = 28, rows = 15, sp = 1.05, plants = [];
  const stemG = new THREE.CylinderGeometry(.03, .05, .5, 6); stemG.translate(0, .25, 0); const leafG = new THREE.SphereGeometry(.26, 10, 8);
  const stems = new THREE.InstancedMesh(stemG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .6 }), cols * rows), leafs = new THREE.InstancedMesh(leafG, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .55 }), cols * rows), spots = new THREE.InstancedMesh(new THREE.CircleGeometry(.07, 8), new THREE.MeshBasicMaterial({ color: 0x241a10 }), cols * rows * 3);
  [stems, leafs, spots].forEach(m => { m.frustumCulled = false; root.add(m); });
  const epi = new V3(-9, 0, -4), tmp = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const x = (i - cols / 2 + .5) * sp, z = (j - rows / 2 + .5) * sp * 1.15, d = Math.hypot(x - epi.x, z - epi.z); plants.push({ x, z, th: clamp(d / 18 + Math.random() * .12), h: .8 + Math.random() * .3 }); }
  const sent = plants.reduce((b, pl, i) => Math.hypot(pl.x - 1, pl.z) < Math.hypot(plants[b].x - 1, plants[b].z) ? i : b, 0), sp0 = plants[sent]; sp0.th = 1.2;
  const green = new THREE.Color(), sick = new THREE.Color(0x8a7a3a), dead = new THREE.Color(0x4a3a22);
  const paint = (inf) => { green.setHex(PP().leaf); plants.forEach((pl, i) => { const k = clamp((inf - pl.th) * 4); tmp.position.set(pl.x, 0, pl.z); tmp.scale.set(1, pl.h * (1 - .2 * k), 1); tmp.updateMatrix(); stems.setMatrixAt(i, tmp.matrix); col.copy(green).lerp(new THREE.Color(0x2c2c20), 0); stems.setColorAt(i, col);
    tmp.position.set(pl.x, .55 * pl.h, pl.z); tmp.scale.setScalar(pl.h * (1 - .25 * k)); tmp.updateMatrix(); leafs.setMatrixAt(i, tmp.matrix); col.copy(green).lerp(sick, clamp(k * 1.2)).lerp(dead, clamp(k - .6)); leafs.setColorAt(i, col);
    for (let s = 0; s < 3; s++) { tmp.position.set(pl.x + (s - 1) * .12, .55 * pl.h + .18 + s * .03, pl.z + .21); tmp.scale.setScalar(k > .15 ? k * 1.3 : 0); tmp.updateMatrix(); spots.setMatrixAt(i * 3 + s, tmp.matrix); } }); [stems, leafs, spots].forEach(m => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; }); };
  paint(0); ctx.onTheme(() => paint(0));
  // module on the sentinel plant
  const house = await makeHouse(M); house.scale.setScalar(.34); house.position.set(sp0.x + .9, .38, sp0.z + .3); house.rotation.y = -.5; root.add(house);
  const stake = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1, 8), M.green); stake.position.set(sp0.x + .2, .5, sp0.z); root.add(stake);
  root.add(wire([new V3(sp0.x + .9, .15, sp0.z + .3), new V3(sp0.x + .6, .06, sp0.z + .2), new V3(sp0.x + .25, .25, sp0.z + .05)], .01, 0xff9a1f));
  const ring = new THREE.Mesh(new THREE.RingGeometry(.5, .56, 48), new THREE.MeshBasicMaterial({ color: PP().node, transparent: true, opacity: .9, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.set(sp0.x, .03, sp0.z); root.add(ring);
  const pulse = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(.9, .95, 64), new THREE.MeshBasicMaterial({ color: PP().node, transparent: true, opacity: 0, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(sp0.x, .05, sp0.z); root.add(r); return r; });
  // weather layer + risk
  const hc = document.createElement('canvas'); hc.width = hc.height = 128; const hx2 = hc.getContext('2d'), gr = hx2.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(160,215,255,.9)'); gr.addColorStop(1, 'rgba(160,215,255,0)'); hx2.fillStyle = gr; hx2.fillRect(0, 0, 128, 128);
  const hum = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(hc), transparent: true, opacity: 0, depthWrite: false })); hum.rotation.x = -Math.PI / 2; hum.position.y = .95; root.add(hum);
  const mist = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 900 }, (_, i) => i % 3 === 0 ? rnd2(-15, 15) : i % 3 === 1 ? rnd2(.15, 1.0) : rnd2(-9, 9)), 3)), new THREE.PointsMaterial({ size: .06, color: 0xbfe6ff, transparent: true, opacity: 0, depthWrite: false })); root.add(mist);
  function rnd2(a, b) { return a + Math.random() * (b - a); }
  const sp2 = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(Array.from({ length: 300 }, (_, i) => i % 3 === 0 ? rnd2(-14, -4) : i % 3 === 1 ? rnd2(.2, 1.2) : rnd2(-8, 0)), 3)), new THREE.PointsMaterial({ size: .08, color: 0x5a4a2a, transparent: true, opacity: 0, depthWrite: false })); root.add(sp2);
  const heat = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 2, 64, 64, 62); g.addColorStop(0, 'rgba(255,120,60,.55)'); g.addColorStop(1, 'rgba(255,120,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return c; })()), transparent: true, opacity: 0, depthWrite: false })); heat.rotation.x = -Math.PI / 2; heat.position.y = .06; root.add(heat);
  const K = [[[0, 15, 17], [0, 0, 0]], [[3.2, 2.6, 3.8], [sp0.x + .4, .5, sp0.z]], [[0, 7.5, 12.5], [0, 0, 0]], [[-5, 6, 9.5], [-6, 0, -2]], [[sp0.x + .15, 1.0, sp0.z + .9], [sp0.x, .75, sp0.z]]];
  const cpos = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[0])), false, 'centripetal'), clook = new THREE.CatmullRomCurve3(K.map(k => new V3(...k[1])), false, 'centripetal'), cp = new V3(), cl = new V3(), cur = new V3(); camera.position.set(0, 15, 17);
  const H = id => el.closest('[data-pin]')?.querySelector('#' + id), setT = (id, v) => { const e = H(id); if (e && e.textContent !== v) e.textContent = v; }; let lastInf = -1;
  return { anchors: {}, group: root, update(t, p, ptr, dt) {
    const camT = clamp((p - .08) / .84); cpos.getPoint(camT, cp); clook.getPoint(camT, cl); camera.position.lerp(cp, Math.min(1, dt * 4)); cur.lerp(cl, Math.min(1, dt * 4)); camera.lookAt(cur);
    const S = (a, b) => sstep(a, b, p), humA = S(.4, .55), inf = S(.5, .92) * 1.2;
    hum.material.opacity = .35 * humA; mist.material.opacity = .6 * humA; heat.material.opacity = .5 * S(.45, .7) * (1 - .3 * S(.9, 1)); heat.scale.setScalar(.6 + S(.45, .85) * .9);
    const mp = mist.geometry.attributes.position; for (let i = 0; i < mp.count; i++) { mp.setX(i, mp.getX(i) + dt * .15); if (mp.getX(i) > 15) mp.setX(i, -15); } mp.needsUpdate = true;
    sp2.material.opacity = .7 * S(.6, .7) * (1 - S(.95, 1)); const sp3 = sp2.geometry.attributes.position; for (let i = 0; i < sp3.count; i++) { sp3.setX(i, sp3.getX(i) + dt * .6); sp3.setY(i, sp3.getY(i) + Math.sin(t + i) * .002); if (sp3.getX(i) > 12) sp3.setX(i, -14); } sp3.needsUpdate = true;
    if (Math.abs(inf - lastInf) > .004) { lastInf = inf; paint(inf); }
    ring.scale.setScalar(1 + Math.sin(t * 3) * .06); ring.material.color.setHex(inf > 1.05 ? 0xff5a3c : PP().node);
    pulse.forEach((r, i) => { const k = (t * .35 + i / 3) % 1, a = S(.12, .2) * (1 - S(.4, .45)) + S(.4, .5) * .6; r.scale.setScalar(1 + k * 9 * (1 + humA)); r.material.opacity = a * (1 - k) * .7; });
    house.rotation.y = -.5 + Math.sin(t * .3) * .05;
    const rh = Math.round(lerp(62, 91, humA)); setT('f-rh', rh + '%'); setT('f-risk', p < .45 ? 'low' : p < .62 ? 'rising' : 'high'); setT('f-sent', inf > 1.0 ? 'tissue changing' : 'normal');
  } };
};

// ---------- manager ----------
const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener('pointermove', e => { ptr.tx = e.clientX / innerWidth * 2 - 1; ptr.ty = e.clientY / innerHeight * 2 - 1; });
const live = [], themeCbs = [];
addEventListener('themechange', () => themeCbs.forEach(f => f()));

async function mount(canvas) {
  const kind = canvas.dataset.scene; if (!builders[kind]) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { canvas.parentElement.classList.add('nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  const L = lights(scene, renderer);
  const ctx = { scene, camera, el: canvas, renderer, L, onTheme: f => themeCbs.push(f) };
  const api = await builders[kind](ctx);
  const root = canvas.closest('[data-pin]') || canvas.parentElement;
  const o = { canvas, renderer, scene, camera, api, vis: false, pinned: !!canvas.closest('[data-pin]'), t0: Math.random() * 4,
    calls: [...root.querySelectorAll('.call')], lines: [...root.querySelectorAll('.callouts line')], dots: [...root.querySelectorAll('.callouts circle')], root, op: new Map() };
  const fit = () => { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = (w / h < .9 ? 40 : 30); camera.updateProjectionMatrix(); };
  new ResizeObserver(fit).observe(canvas); fit();
  new IntersectionObserver(es => { o.vis = es[0].isIntersecting; }, { rootMargin: '150px' }).observe(canvas);
  live.push(o); canvas.classList.add('ready'); canvas.dispatchEvent(new Event('ready'));
}
function ownProgress(el) { const r = el.getBoundingClientRect(); return clamp(1 - r.bottom / (innerHeight + r.height)); }
const tmpV = new V3();
function callouts(o, p) {
  if (!o.api.anchors || !o.calls.length) return;
  const cr = o.canvas.getBoundingClientRect(), rr = o.root.getBoundingClientRect();
  o.calls.forEach((c, i) => {
    const [a, b] = (c.dataset.show || '0-1').split('-').map(parseFloat), anchor = o.api.anchors[c.dataset.anchor]; if (!anchor) return;
    const want = (p > a && p < b) ? 1 : 0, cur = o.op.get(c) ?? 0, nv = cur + (want - cur) * .12; o.op.set(c, nv);
    c.style.opacity = nv; const line = o.lines[i], dot = o.dots[i];
    if (line) line.style.opacity = nv; if (dot) dot.style.opacity = nv;
    if (nv < .02) return;
    tmpV.copy(anchor).applyMatrix4(o.api.group.matrixWorld).project(o.camera);
    const x = (tmpV.x * .5 + .5) * o.canvas.offsetWidth, y = (-tmpV.y * .5 + .5) * o.canvas.offsetHeight;
    const dx = parseFloat(c.dataset.dx || 120), dy = parseFloat(c.dataset.dy || 0), lx = x + dx, ly = y + dy;
    c.style.transform = `translate(${dx < 0 ? lx - c.offsetWidth - 16 : lx + 16}px,${ly - 22}px)`;
    if (line) { line.setAttribute('x1', x); line.setAttribute('y1', y); line.setAttribute('x2', lx); line.setAttribute('y2', ly); }
    if (dot) { dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
  });
}
let last = performance.now();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
function tick(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  ptr.x += (ptr.tx - ptr.x) * .06; ptr.y += (ptr.ty - ptr.y) * .06;
  for (const o of live) {
    if (!o.vis || !o.canvas.closest('.scene.on')) continue;
    const p = o.pinned ? parseFloat(o.canvas.dataset.p || 0) : ownProgress(o.canvas);
    o.api.update((now / 1000) * (reduced ? 0 : 1) + o.t0, p, ptr, dt);
    o.renderer.render(o.scene, o.camera); callouts(o, p);
  }
  requestAnimationFrame(tick);
}
const lazy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { lazy.unobserve(e.target); mount(e.target); } }), { rootMargin: '1400px 0px' });
document.querySelectorAll('canvas[data-scene]').forEach(c => lazy.observe(c));
requestAnimationFrame(tick);
window.__scenes = live;
