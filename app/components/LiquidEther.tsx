"use client";

import * as React from "react";
import * as THREE from "three";

type Props = {
  className?: string;
  style?: React.CSSProperties;
  intensity?: number;
};

export default function LiquidEther({ className, style, intensity = 1 }: Props) {
  const hostRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 2.2);

    const geometry = new THREE.PlaneGeometry(2.2, 2.2, 1, 1);

    const uniforms: Record<string, THREE.IUniform> = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(1, 1) },
      u_intensity: { value: intensity },
    };

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main(){
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float u_time;
        uniform vec2 u_res;
        uniform float u_intensity;

        float hash(vec2 p){
          p = fract(p * vec2(123.34, 456.21));
          p += dot(p, p + 45.32);
          return fract(p.x * p.y);
        }

        float noise(vec2 p){
          vec2 i = floor(p);
          vec2 f = fract(p);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float fbm(vec2 p){
          float v = 0.0;
          float a = 0.5;
          mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
          for(int i=0;i<5;i++){
            v += a * noise(p);
            p = m * p;
            a *= 0.5;
          }
          return v;
        }

        void main(){
          vec2 uv = vUv;
          vec2 p = (uv - 0.5);
          p.x *= u_res.x / u_res.y;

          float t = u_time * 0.12;
          float n1 = fbm(p * 2.2 + vec2(t, -t));
          float n2 = fbm(p * 3.3 + vec2(-t * 1.2, t * 0.9));

          float flow = n1 * 0.75 + n2 * 0.45;
          float vignette = smoothstep(0.95, 0.25, length(p));

          vec3 green = vec3(0.10, 0.65, 0.38);
          vec3 emerald = vec3(0.04, 0.45, 0.28);
          vec3 gold = vec3(0.98, 0.78, 0.20);

          float w = smoothstep(0.30, 0.80, flow);
          vec3 base = mix(emerald, green, w);

          float shimmer = pow(smoothstep(0.55, 0.95, flow), 2.0);
          base = mix(base, gold, shimmer * 0.25);

          float alpha = (0.65 + 0.25 * flow) * vignette;
          alpha *= clamp(u_intensity, 0.0, 2.0);

          gl_FragColor = vec4(base, alpha);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    let raf = 0;
    const clock = new THREE.Clock();

    function resize(target: HTMLDivElement) {
      const rect = target.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      (uniforms.u_res.value as THREE.Vector2).set(w, h);
    }

    const ro = new ResizeObserver(() => resize(host));
    ro.observe(host);
    resize(host);

    function tick() {
      uniforms.u_time.value += clock.getDelta();
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(tick);
    }

    raf = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    };
  }, [intensity]);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{ width: "100%", height: "100%", pointerEvents: "none", ...style }}
      aria-hidden
    />
  );
}
