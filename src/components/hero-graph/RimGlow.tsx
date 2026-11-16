import { useMemo, type Ref } from "react";
import { AdditiveBlending, Color, NormalBlending, type Mesh } from "three";

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uPower;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = pow(1.0 - max(dot(normalize(vNormal), normalize(vView)), 0.0), uPower);
    gl_FragColor = vec4(uColor, rim * uIntensity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

interface RimGlowProps {
  radius: number;
  color: string;
  intensity?: number;
  /** Higher = thinner, sharper outline. */
  power?: number;
  /** Additive looks right on dark backgrounds; normal blending keeps it visible on light ones. */
  additive?: boolean;
  ref?: Ref<Mesh>;
}

/**
 * A transparent shell whose opacity rises towards the silhouette (Fresnel rim) —
 * gives spheres a soft glowing outline without post-processing.
 * Animate it via `(mesh.material as ShaderMaterial).uniforms.uIntensity`.
 */
export function RimGlow({ radius, color, intensity = 1, power = 2.5, additive = true, ref }: RimGlowProps) {
  const uniforms = useMemo(
    () => ({ uColor: { value: new Color(color) }, uIntensity: { value: intensity }, uPower: { value: power } }),
    [color, intensity, power],
  );
  return (
    <mesh ref={ref} raycast={() => null}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={additive ? AdditiveBlending : NormalBlending}
      />
    </mesh>
  );
}
