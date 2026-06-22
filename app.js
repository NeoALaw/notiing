import * as THREE from 'three';

const canvas = document.querySelector('#webgl');
const loader = document.querySelector('[data-loader]');
const loaderBar = document.querySelector('[data-loader-bar]');
const loaderCount = document.querySelector('[data-loader-count]');
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  dpr: Math.min(window.devicePixelRatio || 1, 1.8),
  mouse: new THREE.Vector2(0, 0),
  mouseTarget: new THREE.Vector2(0, 0),
  scroll: 0,
  targetScroll: 0,
  accent: new THREE.Color('#D7FF37'),
  accentTarget: new THREE.Color('#D7FF37'),
  clock: new THREE.Clock()
};

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2('#060606', 0.055);

const camera = new THREE.PerspectiveCamera(38, state.width / state.height, 0.1, 100);
camera.position.set(0, 0.75, 8.6);

const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setSize(state.width, state.height);
renderer.setPixelRatio(state.dpr);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const root = new THREE.Group();
const objectRig = new THREE.Group();
scene.add(root);
root.add(objectRig);

const ambient = new THREE.AmbientLight('#ffffff', 0.55);
scene.add(ambient);

const keyLight = new THREE.PointLight('#d7ff37', 4.2, 26);
keyLight.position.set(-3, 4, 5);
scene.add(keyLight);

const rimLight = new THREE.PointLight('#26f3ff', 2.4, 22);
rimLight.position.set(4, -2, -3);
scene.add(rimLight);

const whiteMat = new THREE.MeshPhysicalMaterial({
  color: '#f7f2ea',
  roughness: 0.26,
  metalness: 0.18,
  clearcoat: 0.7,
  clearcoatRoughness: 0.2
});
const darkMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.55, metalness: 0.6 });
const accentMat = new THREE.MeshPhysicalMaterial({
  color: '#d7ff37',
  emissive: '#182200',
  roughness: 0.2,
  metalness: 0.2,
  clearcoat: 1
});
const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#26f3ff',
  roughness: 0.04,
  transmission: 0.45,
  transparent: true,
  opacity: 0.42,
  thickness: 1.2,
  metalness: 0
});
const lineMat = new THREE.LineBasicMaterial({ color: '#f5f1ea', transparent: true, opacity: 0.45 });

function roundedBox(width, height, depth, radius = 0.18, smoothness = 4) {
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelSegments: smoothness, bevelSize: radius * 0.45, bevelThickness: radius * 0.45 });
}

function addRacket() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 16, 72), accentMat);
  ring.scale.y = 1.34;
  ring.rotation.z = Math.PI / 2;
  const strings = new THREE.Group();
  for (let i = -4; i <= 4; i++) {
    const x = i * 0.12;
    const vertical = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, -0.7, 0), new THREE.Vector3(x, 0.7, 0)]);
    strings.add(new THREE.Line(vertical, lineMat));
    const y = i * 0.12;
    const horizontal = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-0.48, y, 0), new THREE.Vector3(0.48, y, 0)]);
    strings.add(new THREE.Line(horizontal, lineMat));
  }
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 1.25, 18), darkMat);
  handle.position.y = -1.25;
  handle.rotation.z = 0;
  g.add(ring, strings, handle);
  g.position.set(-1.75, 0.58, 0.25);
  g.rotation.set(0.45, -0.42, -0.26);
  return g;
}

function addBottle() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.33, 1.45, 48, 1, true), glassMat);
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.27, 1.22, 48), new THREE.MeshStandardMaterial({ color: '#0b0b0b', roughness: 0.4, metalness: 0.2 }));
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.18, 40), accentMat);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.08, 40), whiteMat);
  cap.position.y = 0.84;
  base.position.y = -0.76;
  g.add(inner, body, cap, base);
  g.position.set(1.45, -0.2, -0.2);
  g.rotation.set(-0.16, 0.58, 0.22);
  return g;
}

function addDumbbell() {
  const g = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.5, 18), whiteMat);
  bar.rotation.z = Math.PI / 2;
  for (const x of [-0.82, -0.64, 0.64, 0.82]) {
    const weight = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.18, 28), darkMat);
    weight.rotation.z = Math.PI / 2;
    weight.position.x = x;
    g.add(weight);
  }
  g.add(bar);
  g.position.set(0.2, -1.25, 0.5);
  g.rotation.set(0.8, -0.3, 0.15);
  return g;
}

function addBall() {
  const g = new THREE.Group();
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.46, 48, 32), whiteMat);
  const seam1 = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.012, 8, 88), accentMat);
  const seam2 = seam1.clone();
  seam1.rotation.x = Math.PI / 2;
  seam2.rotation.y = Math.PI / 2;
  g.add(ball, seam1, seam2);
  g.position.set(-0.08, 0.12, 0.85);
  g.rotation.set(0.1, 0.3, 0.4);
  return g;
}

function addTrainingBand() {
  const g = new THREE.Group();
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.04, 18, 96), accentMat);
  band.scale.set(1.4, 0.52, 0.12);
  const band2 = band.clone();
  band2.scale.set(1.08, 0.36, 0.1);
  band2.rotation.z = 0.4;
  g.add(band, band2);
  g.position.set(0.15, 1.34, -0.25);
  g.rotation.set(0.9, 0.2, 0.2);
  return g;
}

function addGripPad() {
  const geometry = roundedBox(0.55, 0.85, 0.12, 0.12, 5);
  const pad = new THREE.Mesh(geometry, new THREE.MeshPhysicalMaterial({ color: '#171717', roughness: 0.32, metalness: 0.1, clearcoat: 0.8 }));
  pad.position.set(1.9, 0.85, 0.38);
  pad.rotation.set(0.5, -0.65, 0.35);
  const dotGeometry = new THREE.SphereGeometry(0.025, 10, 8);
  for (let y = -2; y <= 2; y++) {
    for (let x = -1; x <= 1; x++) {
      const dot = new THREE.Mesh(dotGeometry, accentMat);
      dot.position.set(pad.position.x + x * 0.14, pad.position.y + y * 0.12, pad.position.z + 0.08);
      dot.rotation.copy(pad.rotation);
      objectRig.add(dot);
    }
  }
  return pad;
}

objectRig.add(addRacket(), addBottle(), addDumbbell(), addBall(), addTrainingBand(), addGripPad());

const halo = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.92, 0.008, 260, 12, 2, 5),
  new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.22 })
);
halo.scale.set(1.1, 1.1, 1.1);
root.add(halo);

const ringGroup = new THREE.Group();
for (let i = 0; i < 4; i++) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.05 + i * 0.34, 0.0035, 8, 160),
    new THREE.MeshBasicMaterial({ color: i % 2 ? '#26f3ff' : '#d7ff37', transparent: true, opacity: 0.18 - i * 0.025 })
  );
  ring.rotation.set(Math.PI / 2 + i * 0.18, i * 0.42, i * 0.25);
  ringGroup.add(ring);
}
root.add(ringGroup);

function createParticles() {
  const count = state.width < 680 ? 700 : 1500;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 4 + Math.random() * 9;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
    positions[i * 3 + 2] = r * Math.cos(phi);
    scales[i] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: state.accent.clone() }
    },
    vertexShader: `
      attribute float aScale;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * .35 + position.y * 1.2) * .08;
        p.y += cos(uTime * .28 + position.x * .8) * .06;
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (2.0 + aScale * 4.0) * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
        vAlpha = .18 + aScale * .5;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = distance(gl_PointCoord, vec2(.5));
        float alpha = smoothstep(.5, .0, d) * vAlpha;
        gl_FragColor = vec4(uColor, alpha);
      }
    `
  });
  return new THREE.Points(geometry, material);
}
const particles = createParticles();
scene.add(particles);

const uniforms = {
  uTime: { value: 0 },
  uMouse: { value: new THREE.Vector2() },
  uAccent: { value: state.accent.clone() }
};
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(40, 24, 1, 1),
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec3 uAccent;
      float circle(vec2 uv, vec2 p, float r){
        float d = length(uv - p);
        return smoothstep(r, r - .35, d);
      }
      void main(){
        vec2 uv = vUv;
        vec2 m = uMouse * .12;
        float grid = abs(sin((uv.x + uTime * .018 + m.x) * 38.0)) * abs(sin((uv.y - uTime * .013 + m.y) * 26.0));
        float orb = circle(uv, vec2(.48 + m.x, .55 + m.y), .44);
        vec3 col = mix(vec3(.0), uAccent, grid * .055 + orb * .085);
        float vignette = smoothstep(.9, .15, distance(uv, vec2(.5)));
        gl_FragColor = vec4(col * vignette, .72);
      }
    `
  })
);
plane.position.z = -8;
scene.add(plane);

function updateLoader() {
  let value = 0;
  const timer = setInterval(() => {
    value += Math.ceil(Math.random() * 12);
    value = Math.min(value, 100);
    loaderBar.style.width = `${value}%`;
    loaderCount.textContent = String(value).padStart(3, '0');
    if (value >= 100) {
      clearInterval(timer);
      setTimeout(() => loader.classList.add('is-hidden'), 320);
      document.querySelectorAll('.hero .reveal').forEach((el, i) => setTimeout(() => el.classList.add('is-visible'), i * 120));
    }
  }, 60);
}
updateLoader();

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const hoverables = document.querySelectorAll('a, button, .drop-card, .gear-card, input');
hoverables.forEach((el) => {
  el.addEventListener('mouseenter', () => cursor?.classList.add('is-hover'));
  el.addEventListener('mouseleave', () => cursor?.classList.remove('is-hover'));
});

document.querySelectorAll('[data-color]').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    const color = el.getAttribute('data-color') || '#D7FF37';
    state.accentTarget.set(color);
    document.documentElement.style.setProperty('--accent', color);
  });
  el.addEventListener('mouseleave', () => {
    state.accentTarget.set('#D7FF37');
    document.documentElement.style.setProperty('--accent', '#D7FF37');
  });
});

const magneticItems = document.querySelectorAll('.magnetic');
magneticItems.forEach((item) => {
  item.addEventListener('mousemove', (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translate(0, 0)';
  });
});

window.addEventListener('mousemove', (event) => {
  const x = event.clientX / state.width;
  const y = event.clientY / state.height;
  state.mouseTarget.set((x - 0.5) * 2, -(y - 0.5) * 2);
  if (cursor && cursorDot) {
    cursor.animate({ transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)` }, { duration: 450, fill: 'forwards', easing: 'cubic-bezier(.2,.8,.2,1)' });
    cursorDot.animate({ transform: `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)` }, { duration: 110, fill: 'forwards' });
  }
});

function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  state.targetScroll = max > 0 ? window.scrollY / max : 0;
}
window.addEventListener('scroll', updateScroll, { passive: true });
updateScroll();

const menuToggle = document.querySelector('[data-menu-toggle]');
const menuClose = document.querySelector('[data-menu-close]');
const menuPanel = document.querySelector('[data-menu-panel]');
const menuLinks = document.querySelectorAll('[data-menu-link]');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuPanel.classList.toggle('is-open', open);
  menuPanel.setAttribute('aria-hidden', open ? 'false' : 'true');
}
menuToggle?.addEventListener('click', () => setMenu(true));
menuClose?.addEventListener('click', () => setMenu(false));
menuLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));

function resize() {
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  state.dpr = Math.min(window.devicePixelRatio || 1, 1.8);
  camera.aspect = state.width / state.height;
  camera.updateProjectionMatrix();
  renderer.setSize(state.width, state.height);
  renderer.setPixelRatio(state.dpr);
}
window.addEventListener('resize', resize);

function animate() {
  requestAnimationFrame(animate);
  const elapsed = state.clock.getElapsedTime();
  state.scroll += (state.targetScroll - state.scroll) * 0.075;
  state.mouse.lerp(state.mouseTarget, 0.08);
  state.accent.lerp(state.accentTarget, 0.08);

  uniforms.uTime.value = elapsed;
  uniforms.uMouse.value.copy(state.mouse);
  uniforms.uAccent.value.copy(state.accent);
  particles.material.uniforms.uTime.value = elapsed;
  particles.material.uniforms.uColor.value.copy(state.accent);

  accentMat.color.copy(state.accent);
  accentMat.emissive.copy(state.accent).multiplyScalar(0.18);
  keyLight.color.copy(state.accent);

  const s = state.scroll;
  const stage = Math.floor(s * 5);
  const orbit = s * Math.PI * 2.1;

  root.rotation.y = orbit * 0.42 + state.mouse.x * 0.16;
  root.rotation.x = -0.12 + state.mouse.y * 0.1;
  objectRig.rotation.y = elapsed * 0.18 + s * 2.4;
  objectRig.rotation.z = Math.sin(elapsed * 0.35) * 0.06;
  halo.rotation.x = elapsed * 0.08 + s;
  halo.rotation.y = elapsed * 0.12;
  ringGroup.rotation.y = -elapsed * 0.07 + s * 2.1;
  ringGroup.rotation.x = elapsed * 0.035;
  particles.rotation.y = elapsed * 0.018;
  particles.rotation.x = state.mouse.y * 0.08;

  const cameraDistance = THREE.MathUtils.lerp(8.6, 5.2, Math.min(s * 1.2, 1));
  camera.position.x += ((Math.sin(orbit) * 1.25 + state.mouse.x * 0.45) - camera.position.x) * 0.055;
  camera.position.y += ((0.75 + Math.cos(s * Math.PI * 2) * 0.45 + state.mouse.y * 0.26) - camera.position.y) * 0.055;
  camera.position.z += ((cameraDistance + Math.cos(orbit) * 0.65) - camera.position.z) * 0.055;
  camera.lookAt(0, stage > 2 ? 0.3 : 0, 0);

  const scale = state.width < 680 ? 0.76 : 1;
  root.scale.setScalar(scale + Math.sin(elapsed * 0.7) * 0.012);

  renderer.render(scene, camera);
}
animate();
