import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createNetwork } from "./networkModel";

export type SceneControls = {
  progress: number;
  pointerX: number;
  pointerY: number;
};
type Props = {
  controls: RefObject<SceneControls>;
  compact: boolean;
  active: boolean;
  onFailure: () => void;
};

// Soft point glow is drawn inside each tiny sprite, not with an expensive full-screen effect.
const vertexShader = `
  attribute float accent;
  varying float vAccent;
  uniform float pixelRatio;
  void main() {
    vAccent = accent;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = min(60.0, (accent > 0.5 ? 210.0 : 130.0) * pixelRatio / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }`;
const fragmentShader = `
  varying float vAccent;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float core = 1.0 - smoothstep(0.015, 0.09, d);
    float halo = pow(max(0.0, 1.0 - d * 2.0), 3.0) * 0.32;
    vec3 color = mix(vec3(0.82, 0.88, 0.87), vec3(0.59, 0.95, 0.64), vAccent);
    gl_FragColor = vec4(color, core + halo);
  }`;

function Network({ controls, compact }: Omit<Props, "active" | "onFailure">) {
  const group = useRef<THREE.Group>(null);
  const lastTelemetry = useRef(0);
  const count = compact ? 40 : 84;
  const model = useMemo(() => createNetwork(count), [count]);
  const resources = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const linePositions = new Float32Array(model.pairs.length * 6);
    const dots = new THREE.BufferGeometry();
    dots.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    dots.setAttribute(
      "accent",
      new THREE.BufferAttribute(
        Float32Array.from({ length: count }, (_, i) => (i % 7 === 0 ? 1 : 0)),
        1,
      ),
    );
    const lines = new THREE.BufferGeometry();
    lines.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const glow = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: { pixelRatio: { value: compact ? 1 : 1.5 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const wire = new THREE.LineBasicMaterial({
      color: "#86baa6",
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    return { positions, linePositions, dots, lines, glow, wire };
  }, [model, count, compact]);
  useEffect(
    () => () => {
      resources.dots.dispose();
      resources.lines.dispose();
      resources.glow.dispose();
      resources.wire.dispose();
    },
    [resources],
  );
  useFrame(({ clock, camera, gl }, delta) => {
    if (!group.current) return;
    const p = controls.current.progress;
    const t = clock.elapsedTime;
    const gather = THREE.MathUtils.smoothstep(p, 0, 0.42);
    const open = THREE.MathUtils.smoothstep(p, 0.72, 1);
    const scale = THREE.MathUtils.lerp(1.35, 0.82, gather) + open * 0.5;
    for (let i = 0; i < count; i++) {
      const node = model.nodes[i];
      for (let axis = 0; axis < 3; axis++)
        resources.positions[i * 3 + axis] =
          node[axis] * scale + Math.sin(t * 0.15 + i * 1.7 + axis) * 0.055;
    }
    model.pairs.forEach(([a, b], index) => {
      for (let axis = 0; axis < 3; axis++) {
        resources.linePositions[index * 6 + axis] =
          resources.positions[a * 3 + axis];
        resources.linePositions[index * 6 + 3 + axis] =
          resources.positions[b * 3 + axis];
      }
    });
    resources.dots.attributes.position.needsUpdate = true;
    resources.lines.attributes.position.needsUpdate = true;
    const connections = Math.floor(
      model.pairs.length * THREE.MathUtils.smoothstep(p, 0.05, 0.6),
    );
    resources.lines.setDrawRange(0, connections * 2);
    resources.wire.opacity = 0.14 + gather * 0.13 - open * 0.09;
    const damping = 1 - Math.exp(-delta * 3);
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      controls.current.pointerX * 0.18 + p * 0.65,
      damping,
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      controls.current.pointerY * 0.1 + p * 0.13,
      damping,
    );
    group.current.position.x = THREE.MathUtils.lerp(
      compact ? 0 : 2.1,
      0,
      gather,
    );
    camera.position.z =
      11 - THREE.MathUtils.smoothstep(p, 0.35, 0.75) * 2 + open * 1.5;
    if (t - lastTelemetry.current > 0.25) {
      gl.domElement.dataset.nodes = String(count);
      gl.domElement.dataset.connections = String(connections);
      gl.domElement.dataset.rotation = group.current.rotation.y.toFixed(3);
      gl.domElement.dataset.frameTime = t.toFixed(2);
      lastTelemetry.current = t;
    }
  });
  return (
    <group ref={group}>
      <points
        geometry={resources.dots}
        material={resources.glow}
        frustumCulled={false}
      />
      <lineSegments
        geometry={resources.lines}
        material={resources.wire}
        frustumCulled={false}
      />
      <mesh rotation={[Math.PI / 2.5, 0.2, 0.3]}>
        <torusGeometry args={[4.8, 0.004, 4, 120]} />
        <meshBasicMaterial color="#507a6a" transparent opacity={0.14} />
      </mesh>
      <mesh rotation={[0.5, 0.7, 0]}>
        <torusGeometry args={[4.5, 0.003, 4, 120]} />
        <meshBasicMaterial color="#7b8e86" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

class SceneBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function NetworkScene(props: Props) {
  const [visible, setVisible] = useState(!document.hidden);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  return (
    <SceneBoundary onFailure={props.onFailure}>
      <Canvas
        camera={{ position: [0, 0, 11], fov: 48 }}
        dpr={props.compact ? 1 : [1, 1.5]}
        frameloop={props.active && visible ? "always" : "never"}
        gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", props.onFailure, {
            once: true,
          });
        }}
      >
        <Network controls={props.controls} compact={props.compact} />
      </Canvas>
    </SceneBoundary>
  );
}
