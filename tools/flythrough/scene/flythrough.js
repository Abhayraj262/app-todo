import * as THREE from "three";

const OUT_W = 1440;
const OUT_H = 1152;
const PX = 0.01; // 1 CSS px → world units
const DURATION = 14.5;

const canvas = document.getElementById("c");
const titleOverlay = document.getElementById("titleOverlay");
const logoTiles = document.getElementById("logoTiles");

let layout;
let pageWidth;
let pageHeight;
let renderer;
let scene;
let camera;
let pageMesh;
let floaterMeshes = [];
let shadowPlane;
let currentTime = 0;

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpVec3(a, b, t) {
  return new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

/** Soft ease only in the first/last 12% — middle is constant forward speed. */
function easeEndsOnly(t) {
  const e = 0.12;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  if (t < e) return e * easeInOutCubic(t / e);
  if (t > 1 - e) return 1 - e + e * easeInOutCubic((t - (1 - e)) / e);
  return t;
}

/** Camera path keyed to absolute seconds (plan timeline). */
function cameraAt(t) {
  const h = pageHeight * PX;
  // Page on XZ floor: top of strip at -h/2, bottom at +h/2.
  const topZ = -h / 2;
  const bottomZ = h / 2;

  // Glide progress 0..1 over 0–8.2s (constant mid, ease at ends)
  const glideT = easeEndsOnly(Math.min(1, Math.max(0, t / 8.2)));
  const glideZ = lerp(topZ + 1.2, bottomZ - 1.2, glideT);

  // Elevated tracking cam — always looks at the page surface ahead
  let pos = new THREE.Vector3(0, 7.2, glideZ - 2.4);
  let look = new THREE.Vector3(0, 0.05, glideZ + 3.2);
  let fov = 40;

  // Rise to overhead 7.75–9.25
  const rise = smoothstep(7.75, 9.25, t);
  if (rise > 0) {
    const overheadPos = new THREE.Vector3(0, Math.max(h * 1.05, 22), 0.01);
    const overheadLook = new THREE.Vector3(0, 0, 0);
    pos = lerpVec3(pos, overheadPos, rise);
    look = lerpVec3(look, overheadLook, rise);
    fov = lerp(40, 46, rise);
  }

  // Dive into hero 9.47–9.97
  const dive = smoothstep(9.47, 9.97, t);
  if (dive > 0) {
    const startPos = new THREE.Vector3(0, Math.max(h * 1.05, 22), 0.01);
    const startLook = new THREE.Vector3(0, 0, 0);
    const heroPos = new THREE.Vector3(0, 6.2, topZ - 0.4);
    const heroLook = new THREE.Vector3(0, 0.1, topZ + 3.5);
    pos = lerpVec3(startPos, heroPos, dive);
    look = lerpVec3(startLook, heroLook, dive);
    fov = lerp(46, 38, dive);
  }

  // Final title card hold 9.97–14.5
  if (t >= 9.97) {
    const settle = smoothstep(9.97, 10.4, t);
    const cardPos = new THREE.Vector3(0, 5.8, topZ - 0.2);
    const cardLook = new THREE.Vector3(0, 0.4, topZ + 2.8);
    pos = lerpVec3(pos, cardPos, settle);
    look = lerpVec3(look, cardLook, settle);
    fov = lerp(fov, 36, settle);
  }

  return { pos, look, fov };
}

function floaterLiftScale(t) {
  // Lift floaters during glide; settle a bit during overhead
  if (t < 8.5) return 1;
  if (t < 9.5) return lerp(1, 0.35, smoothstep(8.5, 9.5, t));
  if (t < 9.97) return lerp(0.35, 0.8, smoothstep(9.5, 9.97, t));
  return 0.15;
}

function updateTitleUI(t) {
  const show = smoothstep(9.97, 10.35, t);
  titleOverlay.style.opacity = String(show);
  logoTiles.style.opacity = String(show * 0.95);
  // subtle float on tiles
  const tiles = logoTiles.querySelectorAll(".tile");
  tiles.forEach((el, i) => {
    const bob = Math.sin((t + i) * 1.4) * 6;
    el.style.transform = `translateY(${bob}px)`;
  });
}

function updatePageCard(t) {
  // After dive, lift hero portion as floating card: raise whole page slightly + scale
  if (!pageMesh) return;
  const floatCard = smoothstep(9.97, 10.5, t);
  pageMesh.position.y = lerp(0.02, 0.55, floatCard);
  pageMesh.rotation.x = lerp(-Math.PI / 2, -Math.PI / 2 + 0.08, floatCard);
  pageMesh.rotation.z = Math.PI;
  pageMesh.scale.setScalar(lerp(1, 0.92, floatCard));
}

async function loadTexture(url) {
  const loader = new THREE.TextureLoader();
  const tex = await loader.loadAsync(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function makeFloor() {
  const geo = new THREE.PlaneGeometry(80, 80);
  const canvas2 = document.createElement("canvas");
  canvas2.width = 512;
  canvas2.height = 512;
  const ctx = canvas2.getContext("2d");
  const g = ctx.createRadialGradient(256, 256, 40, 256, 256, 256);
  g.addColorStop(0, "#f9fbfb");
  g.addColorStop(1, "#f2f3f6");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas2);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.92, metalness: 0 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.02;
  mesh.receiveShadow = true;
  return mesh;
}

function makeRoundedPage(tex, w, h) {
  // Page strip as a lit plane on the studio floor (rounded look via soft shadow + framing).
  const plane = new THREE.PlaneGeometry(w, h);
  const page = new THREE.Mesh(
    plane,
    new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.5,
      metalness: 0.0,
    }),
  );
  // Flat on floor; rotate so screenshot top points toward -Z and reads upright from the camera.
  page.rotation.x = -Math.PI / 2;
  page.rotation.z = Math.PI;
  page.position.y = 0.02;
  page.castShadow = true;
  page.receiveShadow = true;

  // Soft contact shadow
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(w * 1.02, h * 1.02),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.rotation.z = Math.PI;
  shadow.position.y = 0.005;
  scene.add(shadow);
  shadowPlane = shadow;

  return page;
}

async function buildFloaters() {
  const w = pageWidth * PX;
  const h = pageHeight * PX;
  const topZ = -h / 2;
  const leftX = -w / 2;

  for (const f of layout.floaters || []) {
    try {
      const tex = await loadTexture(`../assets/${f.file}`);
      const fw = f.w * PX;
      const fh = f.h * PX;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(fw, fh),
        new THREE.MeshStandardMaterial({
          map: tex,
          transparent: true,
          roughness: 0.45,
          metalness: 0,
        }),
      );
      mesh.rotation.x = -Math.PI / 2;
      mesh.rotation.z = Math.PI;
      // After 180° Z on the page, X is mirrored relative to image coords.
      const cx = -(leftX + (f.x + f.w / 2) * PX);
      const cz = topZ + (f.y + f.h / 2) * PX;
      mesh.userData.baseY = (f.zLift || 24) * PX;
      mesh.userData.cx = cx;
      mesh.userData.cz = cz;
      mesh.position.set(cx, mesh.userData.baseY, cz);
      mesh.castShadow = true;
      scene.add(mesh);
      floaterMeshes.push(mesh);
    } catch (e) {
      console.warn("floater skip", f.id, e);
    }
  }
}

function updateFloaters(t) {
  const scale = floaterLiftScale(t);
  const pass = smoothstep(0.3, 7.5, t);
  for (const mesh of floaterMeshes) {
    const lift = mesh.userData.baseY * scale * (0.55 + 0.45 * pass);
    // Extra lift when camera near this Z during glide
    const camZ = camera.position.z;
    const dist = Math.abs(camZ - mesh.userData.cz);
    const near = Math.max(0, 1 - dist / 4);
    mesh.position.y = lift + near * 0.12 * scale;
    mesh.position.x = mesh.userData.cx;
    mesh.position.z = mesh.userData.cz;
  }
}

export function setTime(t) {
  currentTime = Math.min(DURATION, Math.max(0, t));
  const { pos, look, fov } = cameraAt(currentTime);
  camera.position.copy(pos);
  camera.lookAt(look);
  camera.fov = fov;
  camera.updateProjectionMatrix();
  updateFloaters(currentTime);
  updatePageCard(currentTime);
  updateTitleUI(currentTime);
  if (shadowPlane && pageMesh) {
    shadowPlane.position.y = 0.004;
    shadowPlane.material.opacity = lerp(0.16, 0.28, smoothstep(9.97, 10.5, currentTime));
  }
  renderFrame();
}

function renderFrame() {
  renderer.render(scene, camera);
}

async function init() {
  layout = await fetch("../assets/layout.json").then((r) => r.json());
  document.getElementById("brandName").textContent = layout.brand;
  document.getElementById("headline").textContent = layout.headline;
  document.getElementById("italicTail").textContent = layout.italicTail;

  pageWidth = layout.page.width;
  pageHeight = layout.page.height;

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(OUT_W, OUT_H, false);
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene = new THREE.Scene();
  scene.background = new THREE.Color("#f2f3f6");

  camera = new THREE.PerspectiveCamera(42, OUT_W / OUT_H, 0.1, 200);

  scene.add(makeFloor());

  const amb = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(amb);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(6, 18, -4);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -20;
  key.shadow.camera.right = 20;
  key.shadow.camera.top = 20;
  key.shadow.camera.bottom = -20;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe8eefc, 0.35);
  fill.position.set(-8, 10, 6);
  scene.add(fill);

  const pageTex = await loadTexture(`../assets/${layout.page.file}`);
  pageMesh = makeRoundedPage(pageTex, pageWidth * PX, pageHeight * PX);
  scene.add(pageMesh);

  await buildFloaters();

  // Expose for Playwright
  window.__fly = {
    setTime,
    duration: DURATION,
    ready: true,
    async captureDataURL() {
      renderFrame();
      return canvas.toDataURL("image/png");
    },
  };

  await document.fonts.ready;
  setTime(0);
  console.log("flythrough ready");
}

init().catch((err) => {
  console.error(err);
  window.__fly = { ready: false, error: String(err) };
});
