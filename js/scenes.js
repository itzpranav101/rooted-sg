// ROOTED SG — live 3D scenes. Real RootStake CAD (v14 probe, full module) + procedural scenes.
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const V3 = THREE.Vector3;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { x = clamp((x - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a, b, t) => a + (b - a) * t;
const isDark = () => document.documentElement.dataset.mode === 'dark';
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


// HOUSE module: gable roof, two solar panels, ESP32 body. Stands on its own; probes connect by wire and tube.
function solarTex() { const c = document.createElement('canvas'); c.width = 256; c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#16264a'; x.fillRect(0, 0, 256, 128); x.strokeStyle = 'rgba(190,210,255,.55)'; x.lineWidth = 2; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32, 128); x.stroke(); } for (let j = 0; j <= 4; j++) { x.beginPath(); x.moveTo(0, j * 32); x.lineTo(256, j * 32); x.stroke(); } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function makeHouse(M) {
  const g = new THREE.Group(), W = 1.7, D = 1.15, H = .8, R = .55;
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, D), M.white); body.position.y = H / 2; g.add(body);
  const slant = Math.hypot(D / 2 + .08, R), ang = Math.atan2(R, D / 2 + .08);
  const solar = new THREE.MeshStandardMaterial({ map: solarTex(), roughness: .25, metalness: .5 });
  [-1, 1].forEach(sd => {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(W + .16, .05, slant), M.white); slab.position.set(0, H + R / 2, sd * (D / 4 + .04)); slab.rotation.x = sd * ang; g.add(slab);
    const pan = new THREE.Mesh(new THREE.BoxGeometry(W - .14, .02, slant - .22), solar); pan.position.copy(slab.position); pan.rotation.copy(slab.rotation); pan.translateY(.035); g.add(pan);
  });
  const gable = new THREE.Shape(); gable.moveTo(-D / 2, 0); gable.lineTo(D / 2, 0); gable.lineTo(0, R); gable.closePath();
  [-1, 1].forEach(sd => { const f = new THREE.Mesh(new THREE.ShapeGeometry(gable), M.white); f.rotation.y = sd * Math.PI / 2; f.position.set(sd * (W / 2 + .001), H, 0); g.add(f); });
  const ridge = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, W + .2, 10), M.dark); ridge.rotation.z = Math.PI / 2; ridge.position.y = H + R + .02; g.add(ridge);
  for (let i = 0; i < 4; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(.34, .03, .02), M.dark); v.position.set(-.5 + i * .33, H - .16, D / 2 + .011); g.add(v); }
  const win = new THREE.Mesh(new THREE.BoxGeometry(.32, .22, .02), M.glass); win.position.set(.45, H * .48, D / 2 + .011); g.add(win);
  const led = new THREE.Mesh(new THREE.SphereGeometry(.03, 10, 10), new THREE.MeshBasicMaterial({ color: 0x44ff88 })); led.position.set(-.55, H * .48, D / 2 + .02); g.add(led); g.userData.led = led;
  [[.5, -.0], [.2, .0], [-.15, 0]].forEach(([x]) => { const port = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .06, 12), M.dark); port.rotation.x = Math.PI / 2; port.position.set(x * 0 + (x > .3 ? .3 : x > 0 ? 0 : -.3), .12, -D / 2 - .02); g.add(port); });
  g.userData.ports = [new V3(.3, .12, -D / 2 - .05), new V3(0, .12, -D / 2 - .05), new V3(-.3, .12, -D / 2 - .05)];
  g.userData.top = new V3(0, H + R + .05, 0);
  return g;
}
function cable(curve, mat, r = .02, seg = 60) { return new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 8), mat); }

const builders = {};

// PROBE — modes: hero (pinned, off-centre start) · story (pinned) · loose (floating)
builders.probe = async (ctx) => {
  const { scene, camera, el, L } = ctx, M = mats(), mode = el.dataset.mode || 'loose';
  ctx.onTheme(() => M.refresh(scene));
  const [back, front, leaf] = await Promise.all(['back', 'front', 'leaf'].map(n => loadSTL(`assets/models/probe-${n}.stl`)));
  const g = prepCAD([back, front, leaf], 3.7);
  const meshes = [new THREE.Mesh(g[0], M.white), new THREE.Mesh(g[1], M.white), new THREE.Mesh(g[2], M.green)];
  const inner = new THREE.Group(); meshes.forEach(m => inner.add(m));
  const outer = new THREE.Group(); outer.add(inner); scene.add(outer);
  const pot = glassPot(M, 1.25, 1.7); scene.add(pot); pot.visible = false;
  const shadow = contactShadow(2.3, -3.1, .32); scene.add(shadow);
  const drops = new Drops(scene, M.water, 70);
  // ---- assembly parts (story mode): tube, resistive moisture board, pH electrode ----
  const asm = new THREE.Group(); inner.add(asm); const PA = { tube: new THREE.Group(), board: new THREE.Group(), ph: new THREE.Group() }; Object.values(PA).forEach(g => asm.add(g));
  const tubeMat = new THREE.MeshPhysicalMaterial({ color: 0xbfe3f2, transparent: true, opacity: .62, roughness: .08, clearcoat: 1 });
  const tubeMesh = new THREE.Mesh(new THREE.CylinderGeometry(.055, .055, 5.6, 20), tubeMat); tubeMesh.position.set(0, .8, -.1); PA.tube.add(tubeMesh);
  const core = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 5.6, 14), new THREE.MeshBasicMaterial({ color: 0x7fd0ff, transparent: true, opacity: .75 })); core.position.copy(tubeMesh.position); PA.tube.add(core);
  const pcb = new THREE.MeshStandardMaterial({ color: 0x1b5e3f, roughness: .45 }), gold = new THREE.MeshStandardMaterial({ color: 0xd9b04a, roughness: .25, metalness: .9 }), blk = new THREE.MeshStandardMaterial({ color: 0x1b1f1d, roughness: .6 });
  const board = new THREE.Mesh(new THREE.BoxGeometry(.3, 1.5, .022), pcb); board.position.set(.02, .65, .1); PA.board.add(board);
  [-.085, .085].forEach(x => { const t = new THREE.Mesh(new THREE.BoxGeometry(.085, .8, .022), pcb); t.position.set(.02 + x, -.45, .1); PA.board.add(t); const tr = new THREE.Mesh(new THREE.BoxGeometry(.05, .74, .026), gold); tr.position.set(.02 + x, -.46, .1); PA.board.add(tr); });
  const hdr = new THREE.Mesh(new THREE.BoxGeometry(.2, .1, .08), blk); hdr.position.set(.02, 1.3, .1); PA.board.add(hdr);
  const chipM = new THREE.Mesh(new THREE.BoxGeometry(.12, .14, .03), blk); chipM.position.set(.02, .8, .115); PA.board.add(chipM);
  const phBody = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.3, 20), new THREE.MeshStandardMaterial({ color: 0xe9e9e4, roughness: .3 })); phBody.position.set(-.2, .45, 0); PA.ph.add(phBody);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 16), new THREE.MeshPhysicalMaterial({ color: 0xcfe9ff, transparent: true, opacity: .75, roughness: .05, clearcoat: 1 })); bulb.position.set(-.2, -.72, 0); bulb.scale.y = 1.35; PA.ph.add(bulb);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.064, .064, .12, 20), new THREE.MeshStandardMaterial({ color: 0x2a8a5e })); band.position.set(-.2, .95, 0); PA.ph.add(band);
  const wireM2 = new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: .5 });
  const wBoard = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(.02, 1.35, .1), new V3(.02, 1.9, .1), new V3(.3, 2.3, .1), new V3(.9, 2.5, .1)]), 30, .014, 6), wireM2); PA.board.add(wBoard);
  const wPh = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(-.2, 1.6, 0), new V3(-.2, 2.1, 0), new V3(.1, 2.5, 0), new V3(.9, 2.65, 0)]), 30, .014, 6), wireM2); PA.ph.add(wPh);
  const tubeBend = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(0, 3.55, -.1), new V3(0, 3.9, -.1), new V3(.5, 4.3, -.1), new V3(1.2, 4.4, -.1)]), 30, .055, 12), tubeMat); PA.tube.add(tubeBend);
  const lockRing = k => { const r = new THREE.Mesh(new THREE.RingGeometry(.1, .125, 40), new THREE.MeshBasicMaterial({ color: palette().accent, transparent: true, opacity: 0, side: THREE.DoubleSide, depthTest: false })); r.renderOrder = 9; asm.add(r); return r; };
  const rings = { tube: lockRing(), board: lockRing(), ph: lockRing() }; rings.tube.position.set(0, -1.55, -.1); rings.board.position.set(.02, .65, .13); rings.ph.position.set(-.2, -.7, .06);
  ctx.onTheme(() => Object.values(rings).forEach(r => r.material.color.setHex(palette().accent)));
  Object.values(PA).forEach(g => g.visible = false);
  const anchors = { tip: new V3(0, -1.84, 0), teeth: new V3(0, -1.35, .2), ec: new V3(0, -.85, .22), window: new V3(0, -.15, .24), ph: new V3(-.2, .1, .08), mark: new V3(0, .75, .2), bore: new V3(0, -1.6, -.15), top: new V3(0, 1.8, .1) };
  camera.position.set(0, .2, 8.6); const look = new V3(0, -.7, 0), tipL = new V3(0, -1.85, 0);
  let spin = .6, asmRot = 0;
  return { anchors, group: outer, update(t, p, ptr, dt) {
    let ex = 0, y = 0, cz = 8.6, ly = -.4, dose = false, x = 0, ins = 0;
    if (mode === 'loose') { y = Math.sin(t) * .08; spin += dt * .5; }
    else if (mode === 'story') {
      const asmK = sstep(.43, .5, p) * (1 - sstep(.78, .84, p));
      ex = sstep(.11, .2, p) * (1 - sstep(.74, .8, p)) * lerp(1, .24, sstep(.43, .5, p)); 
      const zoom = sstep(.24, .3, p) * (1 - sstep(.44, .5, p));
      cz = lerp(8.6, 5.8, zoom); ly = lerp(-.4, -1.4, zoom);
      cz = lerp(cz, 8.2, asmK); ly = lerp(ly, .55, asmK);
      ins = sstep(.82, .9, p); y = lerp(0, -1.2, ins) + Math.sin(t * 1.1) * .05 * (1 - ins);
      pot.visible = ins > .01; pot.position.y = -2.4; shadow.position.y = lerp(-3.1, -3.25, ins);
      if (ins > 0) { cz = lerp(cz, 9.6, ins); ly = lerp(ly, -.9, ins); }
      dose = p > .92; spin += dt * .12 * (1 - asmK);
      const seg = (a, b, k) => { const u = sstep(a, b, p); const g = PA[k]; g.visible = p > a - .015 && true; g.position.y = (1 - u) * 4.4; g.position.z = (1 - u) * .5; g.userData.u = u; const pulse = clamp((p - b) / .03); rings[k].material.opacity = pulse > 0 && pulse < 1 ? (1 - pulse) * .9 : 0; rings[k].scale.setScalar(1 + pulse * 4); rings[k].lookAt(camera.position); };
      seg(.455, .53, 'tube'); seg(.565, .64, 'board'); seg(.675, .75, 'ph');
      tubeMat.opacity = .62;
      asmRot = asmK;
    } else {
      ex = sstep(.14, .3, p) * (1 - sstep(.52, .64, p));
      const zoom = sstep(.34, .44, p) * (1 - sstep(.5, .6, p));
      cz = lerp(8.6, 5.8, zoom); ly = lerp(-.4, -1.4, zoom);
      ins = sstep(.64, .82, p); y = lerp(0, -1.2, ins) + Math.sin(t * 1.1) * .05 * (1 - ins);
      pot.visible = ins > .01; pot.position.y = -2.4; shadow.position.y = lerp(-3.1, -3.25, ins);
      if (ins > 0) { cz = lerp(cz, 9.6, ins); ly = lerp(ly, -.9, ins); }
      dose = p > .86; spin += dt * .26;
      if (mode === 'hero') x = lerp(1.9, 0, sstep(0, .2, p));
    }
    // specular sweep: a light travels across the part as you scroll (Apple-style highlight pass)
    L.sweep.intensity = mode === 'loose' ? 0 : 60 * Math.sin(clamp(p * 5 % 1) * Math.PI);
    L.sweep.position.set(lerp(-6, 6, (p * 5) % 1), 1.5, 4);
    let base = mode === 'loose' ? spin + ptr.x * .5 : spin + sstep(0, .5, p) * 1.1 + sstep(.55, .8, p) * .9 + ptr.x * .35;
    if (mode === 'story') { base = lerp(spin + sstep(0, .4, p) * 1.1, 1.15 + ptr.x * .15, asmRot) + sstep(.8, .95, p) * 1.0; }
    if (camera.aspect < .9) cz *= 1.3;
    camera.position.z += (cz - camera.position.z) * Math.min(1, dt * 5);
    look.y += (ly - look.y) * Math.min(1, dt * 5); camera.lookAt(look);
    outer.position.set(x, y, 0); outer.rotation.y = base; outer.rotation.z = .08 + ptr.y * .05;
    const e = ex * 1.5;
    meshes[1].position.z = -e; meshes[0].position.z = e; meshes[2].position.y = e * .7; meshes[2].position.z = -e * .35;
    outer.updateMatrixWorld(true);
    drops.update(dt, dose, tipL.clone().applyMatrix4(outer.matrixWorld), -4.2);
  } };
};

builders.pod = async (ctx) => {
  const { scene, camera } = ctx, M = mats(); ctx.onTheme(() => M.refresh(scene));
  const g = new THREE.Group(); scene.add(g); scene.add(contactShadow(3.2, -1.62, .22));
  const house = makeHouse(M); house.position.set(-1.55, -.4, 0); house.scale.setScalar(1.15); g.add(house); house.updateMatrixWorld(true);
  const P = house.userData.ports.map(p => p.clone().multiplyScalar(1.15).add(house.position));
  // soil probe in a block of soil, tube + wire back to the house
  const soil = new THREE.Mesh(new THREE.CylinderGeometry(1, .86, .6, 40), M.soil); soil.position.set(1.55, -1.3, .2); g.add(soil);
  const probe = new THREE.Mesh(new THREE.BoxGeometry(.2, 1.7, .11), M.white); probe.position.set(1.55, -.45, .2); g.add(probe);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.1, .3, 4), M.white); nose.rotation.y = Math.PI / 4; nose.scale.set(1, 1, .55); nose.position.set(1.55, -1.45, .2); g.add(nose);
  const leaf = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 10), M.green); leaf.scale.set(.5, 1.1, .3); leaf.position.set(1.55, .42, .2); g.add(leaf);
  // plant stem with the electrode clip
  const stemM = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, 2.6, 16), M.green); stemM.position.set(2.5, -.1, -.3); g.add(stemM);
  const clip = new THREE.Group(); clip.position.set(2.5, .3, -.3); g.add(clip);
  [-1, 1].forEach(sg => { const j = new THREE.Mesh(new THREE.BoxGeometry(.2, .2, .26), M.dark); j.position.x = sg * .17; clip.add(j); const n = new THREE.Mesh(new THREE.ConeGeometry(.012, .2, 8), M.steel); n.rotation.z = -sg * Math.PI / 2; n.position.x = sg * .05; clip.add(n); });
  const leafL = new THREE.Mesh(new THREE.SphereGeometry(.5, 20, 10), M.green); leafL.scale.set(1, .08, .45); leafL.position.set(2.95, 1.0, -.3); leafL.rotation.z = .5; g.add(leafL);
  const wireM = new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: .5 }), tubeM = new THREE.MeshPhysicalMaterial({ color: palette().glass, transparent: true, opacity: .45, roughness: .1, clearcoat: 1 });
  const wireClip = new THREE.CatmullRomCurve3([P[2], P[2].clone().add(new V3(0, -.05, -.5)), new V3(.6, -.2, -.9), new V3(2.0, .55, -.7), new V3(2.34, .3, -.3)]);
  const wireProbe = new THREE.CatmullRomCurve3([P[1], P[1].clone().add(new V3(0, -.1, -.5)), new V3(-.2, -.1, -.4), new V3(.6, 1.05, .1), new V3(1.5, .55, .2)]);
  const tubeProbe = new THREE.CatmullRomCurve3([P[0], P[0].clone().add(new V3(.1, -.08, -.55)), new V3(.7, -.5, -.4), new V3(1.1, 1.1, .1), new V3(1.6, .9, .22), new V3(1.55, .45, .2)]);
  g.add(cable(wireClip, wireM, .022), cable(wireProbe, wireM, .022), cable(tubeProbe, tubeM, .045));
  const flow = new THREE.InstancedMesh(new THREE.SphereGeometry(.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x7fd0ff }), 30), tm = new THREE.Object3D();
  g.add(flow); ctx.onTheme(() => { tubeM.color.setHex(palette().glass); });
  camera.position.set(0, .8, 12.5);
  return { update(t, p, ptr) {
    g.rotation.y = Math.sin(t * .35) * .35 + ptr.x * .35; g.rotation.x = ptr.y * .12; g.position.y = Math.sin(t) * .04;
    house.userData.led.material.color.setHex(Math.sin(t * 5) > 0 ? 0x44ff88 : 0x1d6b3f);
    for (let i = 0; i < 30; i++) { tm.position.copy(tubeProbe.getPoint((i / 30 + t * .12) % 1)); tm.updateMatrix(); flow.setMatrixAt(i, tm.matrix); } flow.instanceMatrix.needsUpdate = true;
    camera.lookAt(.3, -.2, 0);
  } };
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
  [-1, 1].forEach(s => { const j = new THREE.Mesh(new THREE.BoxGeometry(.4, .36, .62), M.dark); j.position.set(s * 1.15, 0, 0); g.add(j); const n = new THREE.Mesh(new THREE.ConeGeometry(.018, 1.0, 12), M.steel); n.rotation.z = -s * Math.PI / 2; n.position.set(s * .68, 0, 0); g.add(n); });
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(1.15, .06, 8, 40, Math.PI), M.dark); bridge.rotation.z = Math.PI; bridge.position.y = .05; bridge.scale.set(1, .55, 1); g.add(bridge);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new V3(1.3, 0, 0), new V3(2.1, -.4, .3), new V3(2.8, -1.4, .2), new V3(3.4, -2.4, 0)]), 40, .035, 8), new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: .5 })));
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
  const [pb, pf, pl] = await Promise.all(['back', 'front', 'leaf'].map(n => loadSTL(`assets/models/probe-${n}.stl`)));
  const pg = prepCAD([pb, pf, pl], 2.5), probe = new THREE.Group();
  [new THREE.Mesh(pg[0], M.white), new THREE.Mesh(pg[1], M.white), new THREE.Mesh(pg[2], M.green)].forEach(m => probe.add(m));
  probe.position.set(.72, .61, .32); probe.rotation.y = .5; root.add(probe);
  const probeTop = new V3(.72, 1.86, .32), nose = new V3(.72, -.64, .32), ecPt = new V3(.72, -.2, .5), winPt = new V3(.72, .62, .5);
  // house module (separate from the probes) + antenna rings
  const house = makeHouse(M); house.position.set(3.1, -.1, 0); house.scale.setScalar(1.05); house.rotation.y = -.5; root.add(house); house.updateMatrixWorld(true);
  const podTop = new V3(3.1, 1.55, 0), podMat = M.white;
  // thin wires from the house to the stem clip and to the probe (no arm, no gooseneck)
  const clipC = stemCurve.getPoint(.64).add(plant.position);
  const wMat = new THREE.MeshStandardMaterial({ color: 0x23282a, roughness: .5 });
  const neck = new THREE.CatmullRomCurve3([new V3(2.55, .12, -.45), new V3(2.2, .2, -.6), new V3(1.2, 1.2, -.5), new V3(.55, 2.1, -.15), new V3(clipC.x + .32, clipC.y, clipC.z + .05)]);
  root.add(cable(neck, wMat, .022));
  root.add(cable(new THREE.CatmullRomCurve3([new V3(2.55, .0, -.35), new V3(2.0, -.3, -.5), new V3(1.2, .6, -.45), new V3(.72, 1.6, .2), new V3(.72, 1.9, .32)]), wMat, .022));
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
  const recolor = () => { const Q = PP(); ground.material.color.setHex(Q.ground); stemMat.color.setHex(Q.leaf); leafMat.color.setHex(Q.leaf); podMat.color.setHex(Q.white); arcM.color.setHex(Q.accent); feedMat.color.setHex(Q.accent); flowF.material.color.setHex(Q.accent); crcM.color.setHex(Q.accent); cells.material.color.setHex(Q.node); rings.forEach(r => r.material.color.setHex(Q.node)); pulses.forEach(r => r.material.color.setHex(Q.accent)); glow.material.color.setHex(Q.accent); tubeM.color.setHex(Q.glass); pumps[1].imp.material.color.setHex(Q.accent); pumps[1].imp.material.emissive.setHex(Q.accent); M.refresh(scene); };
  ctx.onTheme(recolor);
  // camera path
  const K = [[[.6, 2.4, 15.5], [.4, .9, 0]], [[1.5, 2.9, 3.7], [0, 2.4, 0]], [[3.3, 1.3, 5.2], [.7, .35, .3]], [[3.7, 1.5, 5.8], [3.1, .7, 0]], [[3.6, 2.6, 9.5], [3.9, 1.9, 0]], [[5.1, 2.4, 4.5], [4.6, 2.2, .3]], [[-.9, .9, 6.4], [-2.2, -.2, 0]], [[1.0, 1.4, 6.0], [.4, .9, .3]], [[.6, 2.4, 15.5], [.4, .9, 0]]];
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
    const x = (tmpV.x * .5 + .5) * cr.width + (cr.left - rr.left), y = (-tmpV.y * .5 + .5) * cr.height + (cr.top - rr.top);
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
    if (!o.vis) continue;
    const p = o.pinned ? parseFloat(o.canvas.dataset.p || 0) : ownProgress(o.canvas);
    o.api.update((now / 1000) * (reduced ? 0 : 1) + o.t0, p, ptr, dt);
    o.renderer.render(o.scene, o.camera); callouts(o, p);
  }
  requestAnimationFrame(tick);
}
// mount each scene only when it is about to be seen, one at a time (keeps first load and page changes light)
let chain = Promise.resolve();
const lazy = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; lazy.unobserve(e.target); chain = chain.then(() => mount(e.target)).catch(() => {}); }), { rootMargin: '400px' });
document.querySelectorAll('canvas[data-scene]').forEach(c => lazy.observe(c));
requestAnimationFrame(tick);
window.__scenes = live;
