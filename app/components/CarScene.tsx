"use client";

import { Canvas, useFrame } from "@react-three/fiber";

import {
  ContactShadows,
  Environment,
  Html,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";

import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  BODY_COLORS,
  CALIPER_COLORS,
  DEFAULT_CONFIG,
  INTERIOR_COLORS,
  WHEEL_FINISHES,
  type VehicleConfig,
} from "../data/vehicle";

/* =========================================================
   TYPES
========================================================= */

export type PartKind =
  | "Body"
  | "Wheel"
  | "Brake"
  | "Headlight"
  | "Engine"
  | "Interior";

export type CameraMode =
  | "FULL"
  | "FRONT"
  | "REAR"
  | "WHEEL"
  | "BRAKE"
  | "INTERIOR"
  | "ENGINE";

export type CarSceneProps = {
  selectedPart: string | null;

  onSelectPart: (
    part: string | null
  ) => void;

  config?: VehicleConfig;

  cameraMode?: CameraMode;

  exploded?: boolean;

  cinematic?: boolean;

  lightsOn?: boolean;
};

/* =========================================================
   MODEL
========================================================= */

const MODEL =
  "/models/ferrari/ferrari_laferrari.glb";

/* =========================================================
   PART CLASSIFICATION
========================================================= */

const PART_RULES: Array<{
  kind: PartKind;
  patterns: RegExp[];
}> = [
  /*
   * IMPORTANT:
   * These rules are intentionally explicit for the
   * LaFerrari GLB. Brake components are checked before
   * wheel components so a disc can never become a wheel.
   */
  {
    kind: "Brake",
    patterns: [
      /^Brake/i,
      /caliper/i,
      /brake/i,
      /rotor/i,
      /^disc(?:[._ -]|\d|$)/i,
      /disk/i,
      /braking/i,
    ],
  },

  {
    kind: "Wheel",
    patterns: [
      /^tire(?:[._ -]|\d|$)/i,
      /^tyre(?:[._ -]|\d|$)/i,
      /^rim(?:[._ -]|\d|$)/i,
      /^tread(?:[._ -]|\d|$)/i,
      /LaFerrari_Rim/i,
      /wheel/i,
    ],
  },

  {
    kind: "Headlight",
    patterns: [
      /head.?light/i,
      /front headlights/i,
      /tail.?light/i,
      /rear.?light/i,
      /lamp/i,
      /light/i,
      /led/i,
    ],
  },

  {
    kind: "Engine",
    patterns: [
      /engine/i,
      /powertrain/i,
      /motor/i,
      /gearbox/i,
      /transmission/i,
      /v12/i,
      /hybrid/i,
    ],
  },

  {
    kind: "Interior",
    patterns: [
      /interior/i,
      /seat/i,
      /dashboard/i,
      /dash/i,
      /steering/i,
      /cockpit/i,
      /console/i,
      /cluster/i,
      /screen/i,
      /display/i,
      /carpet/i,
    ],
  },

  {
    kind: "Body",
    patterns: [
      /LaFerrari_Body/i,
      /body/i,
      /hood/i,
      /bonnet/i,
      /bumper/i,
      /fender/i,
      /mirror/i,
      /spoiler/i,
      /wing/i,
      /skirt/i,
      /diffuser/i,
      /chassis/i,
      /carbon/i,
      /door/i,
      /roof/i,
      /side/i,
      /front/i,
      /rear/i,
      /panel/i,
      /shell/i,
    ],
  },
];

/* =========================================================
   CLASSIFY OBJECT
========================================================= */

function classify(
  name: string
): PartKind | null {
  for (const rule of PART_RULES) {
    if (
      rule.patterns.some((pattern) =>
        pattern.test(name)
      )
    ) {
      return rule.kind;
    }
  }

  return null;
}

/* =========================================================
   MATERIAL HELPERS
========================================================= */

function cloneMaterials(
  root: THREE.Object3D
) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;

    if (!mesh.isMesh) return;

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    /*
     * Store original position.
     * Used later by exploded view.
     */
    object.userData.originalPosition =
      object.position.clone();

    /*
     * Store detected part type.
     */
    object.userData.partKind =
      classify(object.name);

    /*
     * Clone materials so changing the
     * configuration does not mutate the
     * original GLB scene.
     */
    if (Array.isArray(mesh.material)) {
      mesh.material =
        mesh.material.map((material) =>
          material.clone()
        );
    } else if (mesh.material) {
      mesh.material =
        mesh.material.clone();
    }
  });
}

/* =========================================================
   APPLY MATERIAL
========================================================= */

function applyMaterial(
  object: THREE.Object3D,
  color: string,
  metalness: number,
  roughness: number
) {
  const mesh = object as THREE.Mesh;

  if (!mesh.isMesh) return;

  const materials = Array.isArray(mesh.material)
    ? mesh.material
    : [mesh.material];

  materials.forEach((material) => {
    if (
      material instanceof
      THREE.MeshStandardMaterial
    ) {
      material.color.set(color);

      material.metalness =
        metalness;

      material.roughness =
        roughness;

      material.needsUpdate = true;
    }
  });
}

/* =========================================================
   GET PART OBJECTS
========================================================= */

function getObjectsForKind(
  root: THREE.Object3D,
  kind: PartKind
) {
  const objects: THREE.Object3D[] = [];

  root.traverse((object) => {
    if (
      object.userData.partKind ===
      kind
    ) {
      objects.push(object);
    }
  });

  return objects;
}

/* =========================================================
   GET PART BOUNDS
========================================================= */

function boundsForKind(
  root: THREE.Object3D,
  kind: PartKind
) {
  const objects =
    getObjectsForKind(root, kind);

  if (!objects.length) {
    return null;
  }

  const box = new THREE.Box3();

  objects.forEach((object) => {
    box.expandByObject(object);
  });

  if (box.isEmpty()) {
    return null;
  }

  return box;
}

/* =========================================================
   PART CENTER HELPER
========================================================= */

function getPartCenter(
  root: THREE.Object3D,
  kind: PartKind
) {
  const objects = getObjectsForKind(
    root,
    kind
  );

  if (!objects.length) {
    return null;
  }

  const box = new THREE.Box3();

  objects.forEach((object) => {
    box.expandByObject(object);
  });

  if (box.isEmpty()) {
    return null;
  }

  return box.getCenter(
    new THREE.Vector3()
  );
}

/* =========================================================
   INSPECTION HELPERS
========================================================= */

/*
 * The model contains multiple wheels/brakes. We always
 * inspect the SAME physical front-right assembly so the
 * WHEEL and BRAKE buttons cannot jump to different areas.
 *
 * The current model orientation uses positive X / positive Z
 * for the front-right area in the normalized scene.
 */

const INSPECTION_ANCHOR = new THREE.Vector3(
  1.35,
  0.35,
  1.05
);

function worldCenter(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);

  if (box.isEmpty()) {
    return null;
  }

  return box.getCenter(
    new THREE.Vector3()
  );
}

function inspectionObjects(
  root: THREE.Object3D,
  kind: PartKind
) {
  const objects = getObjectsForKind(
    root,
    kind
  );

  return objects
    .map((object) => {
      const center = worldCenter(object);

      return center
        ? { object, center }
        : null;
    })
    .filter(
      (
        item
      ): item is {
        object: THREE.Object3D;
        center: THREE.Vector3;
      } => Boolean(item)
    );
}

/*
 * Find the wheel closest to the known front-right
 * inspection anchor.
 */
function findInspectionWheel(
  root: THREE.Object3D
) {
  const items = inspectionObjects(
    root,
    "Wheel"
  );

  if (!items.length) {
    return null;
  }

  let nearest = items[0];

  let nearestDistance =
    nearest.center.distanceTo(
      INSPECTION_ANCHOR
    );

  for (let i = 1; i < items.length; i += 1) {
    const distance =
      items[i].center.distanceTo(
        INSPECTION_ANCHOR
      );

    if (
      distance <
      nearestDistance
    ) {
      nearest = items[i];
      nearestDistance = distance;
    }
  }

  return nearest.center.clone();
}

/*
 * Find the brake/disc assembly nearest to the
 * selected inspection wheel.
 */
function findInspectionBrake(
  root: THREE.Object3D,
  wheelCenter?: THREE.Vector3 | null
) {
  const items = inspectionObjects(
    root,
    "Brake"
  );

  if (!items.length) {
    return null;
  }

  const anchor =
    wheelCenter ??
    INSPECTION_ANCHOR;

  let nearest = items[0];

  let nearestDistance =
    nearest.center.distanceTo(
      anchor
    );

  for (let i = 1; i < items.length; i += 1) {
    const distance =
      items[i].center.distanceTo(
        anchor
      );

    if (
      distance <
      nearestDistance
    ) {
      nearest = items[i];
      nearestDistance = distance;
    }
  }

  return nearest.center.clone();
}

/*
 * Return the closest useful inspection center.
 */
function inspectionCenter(
  root: THREE.Object3D,
  kind: PartKind
) {
  if (kind === "Wheel") {
    return findInspectionWheel(root);
  }

  if (kind === "Brake") {
    const wheel =
      findInspectionWheel(root);

    return findInspectionBrake(
      root,
      wheel
    );
  }

  return getPartCenter(
    root,
    kind
  );
}

/* =========================================================
   VEHICLE
========================================================= */

function Vehicle({
  selectedPart,
  onSelectPart,
  config,
  cameraMode = "FULL",
  exploded = false,
  cinematic = false,
  lightsOn = true,
}: CarSceneProps) {
  const safeConfig =
    config ?? DEFAULT_CONFIG;

  const { scene } = useGLTF(MODEL);

  const root =
    useRef<THREE.Group>(null);

  const [hoveredPart, setHoveredPart] =
    useState<PartKind | null>(null);

  /*
   * Camera state
   */
  const cameraTarget =
    useRef(
      new THREE.Vector3(
        0,
        0.35,
        0
      )
    );

  const desiredCamera =
    useRef(
      new THREE.Vector3(
        6.2,
        2.5,
        7.2
      )
    );

  /* =======================================================
     PREPARE MODEL
  ======================================================= */

  const prepared = useMemo(() => {
    const clone =
      scene.clone(true);

    /*
     * Calculate model bounds.
     */
    const box =
      new THREE.Box3()
        .setFromObject(clone);

    const center =
      box.getCenter(
        new THREE.Vector3()
      );

    const size =
      box.getSize(
        new THREE.Vector3()
      );

    const maxAxis =
      Math.max(
        size.x,
        size.y,
        size.z
      ) || 1;

    /*
     * Center model.
     */
    clone.position.sub(center);

    /*
     * Normalize model size.
     */
    clone.scale.setScalar(
      4.8 / maxAxis
    );

    /*
     * Prepare materials and
     * part classification.
     */
    cloneMaterials(clone);

    return clone;
  }, [scene]);

  /* =======================================================
     BODY COLOR
  ======================================================= */

  useEffect(() => {
    const paint =
      BODY_COLORS[
        safeConfig.bodyColor
      ] ??
      BODY_COLORS[
        DEFAULT_CONFIG.bodyColor
      ];

    prepared.traverse(
      (object) => {
        if (
          object.userData.partKind ===
          "Body"
        ) {
          applyMaterial(
            object,
            paint.hex,
            0.72,
            0.18
          );
        }
      }
    );
  }, [
    prepared,
    safeConfig.bodyColor,
  ]);

  /* =======================================================
     WHEEL FINISH
  ======================================================= */

  useEffect(() => {
    const finish =
      WHEEL_FINISHES[
        safeConfig.wheelFinish
      ] ??
      WHEEL_FINISHES[
        DEFAULT_CONFIG.wheelFinish
      ];

    prepared.traverse(
      (object) => {
        if (
          object.userData.partKind ===
          "Wheel"
        ) {
          applyMaterial(
            object,
            finish.hex,
            finish.metalness,
            finish.roughness
          );
        }
      }
    );
  }, [
    prepared,
    safeConfig.wheelFinish,
  ]);

  /* =======================================================
     BRAKE COLOR
  ======================================================= */

  useEffect(() => {
    const brake =
      CALIPER_COLORS[
        safeConfig.caliperColor
      ] ??
      CALIPER_COLORS[
        DEFAULT_CONFIG.caliperColor
      ];

    prepared.traverse(
      (object) => {
        if (
          object.userData.partKind ===
          "Brake"
        ) {
          applyMaterial(
            object,
            brake.hex,
            0.48,
            0.25
          );
        }
      }
    );
  }, [
    prepared,
    safeConfig.caliperColor,
  ]);

  /* =======================================================
     INTERIOR COLOR
  ======================================================= */

  useEffect(() => {
    const interior =
      INTERIOR_COLORS[
        safeConfig.interiorColor
      ] ??
      INTERIOR_COLORS[
        DEFAULT_CONFIG.interiorColor
      ];

    prepared.traverse(
      (object) => {
        if (
          object.userData.partKind ===
          "Interior"
        ) {
          applyMaterial(
            object,
            interior.hex,
            0.08,
            0.62
          );
        }
      }
    );
  }, [
    prepared,
    safeConfig.interiorColor,
  ]);

  /* =======================================================
     CARBON PACKAGE
  ======================================================= */

  useEffect(() => {
    prepared.traverse(
      (object) => {
        if (
          /carbon/i.test(
            object.name
          )
        ) {
          object.visible =
            safeConfig.carbonPackage;
        }
      }
    );
  }, [
    prepared,
    safeConfig.carbonPackage,
  ]);

  /* =======================================================
     HOVER EFFECT
  ======================================================= */

  useEffect(() => {
    prepared.traverse(
      (object) => {
        const mesh =
          object as THREE.Mesh;

        if (!mesh.isMesh) return;

        const materials =
          Array.isArray(
            mesh.material
          )
            ? mesh.material
            : [mesh.material];

        materials.forEach(
          (material) => {
            if (
              material instanceof
              THREE.MeshStandardMaterial
            ) {
              const active =
                hoveredPart !== null &&
                mesh.userData
                  .partKind ===
                  hoveredPart;

              material.emissive.set(
                active
                  ? "#252525"
                  : "#000000"
              );

              material.emissiveIntensity =
                active ? 0.65 : 0;
            }
          }
        );
      }
    );
  }, [
    prepared,
    hoveredPart,
  ]);

  /* =======================================================
     CAMERA VIEWS
  ======================================================= */

  const views =
    useMemo<
      Record<
        CameraMode,
        {
          camera: THREE.Vector3;
          target: THREE.Vector3;
        }
      >
    >(
      () => ({
        FULL: {
          camera:
            new THREE.Vector3(
              6.2,
              2.5,
              7.2
            ),

          target:
            new THREE.Vector3(
              0,
              0.35,
              0
            ),
        },

        FRONT: {
          camera:
            new THREE.Vector3(
              0,
              1.15,
              5.4
            ),

          target:
            new THREE.Vector3(
              0,
              0.45,
              0
            ),
        },

        REAR: {
          camera:
            new THREE.Vector3(
              0,
              1.15,
              -5.4
            ),

          target:
            new THREE.Vector3(
              0,
              0.45,
              0
            ),
        },

        /*
         * Wheel camera is intentionally
         * different from BRAKE camera.
         */
        WHEEL: {
          camera:
            new THREE.Vector3(
              4.5,
              1.35,
              4.1
            ),

          target:
            new THREE.Vector3(
              1.35,
              0.35,
              1.05
            ),
        },

        BRAKE: {
          camera:
            new THREE.Vector3(
              3.7,
              0.95,
              3.25
            ),

          target:
            new THREE.Vector3(
              1.35,
              0.38,
              1.05
            ),
        },

        INTERIOR: {
          camera:
            new THREE.Vector3(
              0.55,
              0.9,
              0.65
            ),

          target:
            new THREE.Vector3(
              0,
              0.75,
              -0.65
            ),
        },

        ENGINE: {
          camera:
            new THREE.Vector3(
              2.65,
              1.45,
              -2.5
            ),

          target:
            new THREE.Vector3(
              0,
              0.72,
              -0.7
            ),
        },
      }),
      []
    );

  /* =======================================================
     UNIFIED CAMERA CONTROLLER

     There is intentionally ONE camera effect.
     selectedPart never fights cameraMode.
  ======================================================= */

  useEffect(() => {
    const mode = cameraMode;

    /*
     * FULL VIEW
     */
    if (mode === "FULL") {
      desiredCamera.current.set(
        6.2,
        2.5,
        7.2
      );

      cameraTarget.current.set(
        0,
        0.35,
        0
      );

      return;
    }

    /*
     * FRONT VIEW
     */
    if (mode === "FRONT") {
      const headlight =
        inspectionCenter(
          prepared,
          "Headlight"
        );

      if (headlight) {
        cameraTarget.current.copy(
          headlight
        );

        desiredCamera.current
          .copy(headlight)
          .add(
            new THREE.Vector3(
              0.8,
              0.28,
              2.5
            )
          );

        return;
      }

      cameraTarget.current.set(
        0,
        0.45,
        1.0
      );

      desiredCamera.current.set(
        3.0,
        1.2,
        4.2
      );

      return;
    }

    /*
     * REAR VIEW
     */
    if (mode === "REAR") {
      cameraTarget.current.set(
        0,
        0.45,
        -1.0
      );

      desiredCamera.current.set(
        3.0,
        1.2,
        -4.2
      );

      return;
    }

    /*
     * WHEEL VIEW
     *
     * Uses one specific physical wheel.
     */
    if (mode === "WHEEL") {
      const wheel =
        findInspectionWheel(
          prepared
        );

      if (wheel) {
        cameraTarget.current.copy(
          wheel
        );

        desiredCamera.current
          .copy(wheel)
          .add(
            new THREE.Vector3(
              1.0,
              0.35,
              1.0
            )
              .normalize()
              .multiplyScalar(
                1.05
              )
          );

        return;
      }

      /*
       * Safe fallback.
       */
      cameraTarget.current.set(
        1.35,
        0.35,
        1.05
      );

      desiredCamera.current.set(
        2.15,
        0.7,
        2.15
      );

      return;
    }

    /*
     * BRAKE VIEW
     *
     * Finds the brake nearest to the SAME
     * wheel used above.
     */
    if (mode === "BRAKE") {
      const wheel =
        findInspectionWheel(
          prepared
        );

      const brake =
        findInspectionBrake(
          prepared,
          wheel
        );

      const target =
        brake ??
        wheel;

      if (target) {
        cameraTarget.current.copy(
          target
        );

        desiredCamera.current
          .copy(target)
          .add(
            new THREE.Vector3(
              0.9,
              0.2,
              0.9
            )
              .normalize()
              .multiplyScalar(
                0.62
              )
          );

        return;
      }

      cameraTarget.current.set(
        1.35,
        0.35,
        1.05
      );

      desiredCamera.current.set(
        1.85,
        0.55,
        1.85
      );

      return;
    }

    /*
     * INTERIOR
     */
    if (mode === "INTERIOR") {
      const center =
        inspectionCenter(
          prepared,
          "Interior"
        );

      if (center) {
        cameraTarget.current.set(
          center.x,
          center.y + 0.15,
          center.z
        );

        desiredCamera.current.set(
          center.x + 0.4,
          center.y + 0.38,
          center.z + 0.55
        );

        return;
      }

      cameraTarget.current.set(
        0,
        0.7,
        -0.55
      );

      desiredCamera.current.set(
        0.5,
        1.0,
        0.5
      );

      return;
    }

    /*
     * ENGINE
     */
    if (mode === "ENGINE") {
      const center =
        inspectionCenter(
          prepared,
          "Engine"
        );

      if (center) {
        cameraTarget.current.copy(
          center
        );

        desiredCamera.current
          .copy(center)
          .add(
            new THREE.Vector3(
              1.0,
              0.45,
              -1.0
            )
              .normalize()
              .multiplyScalar(
                1.7
              )
          );

        return;
      }

      cameraTarget.current.set(
        0,
        0.72,
        -0.7
      );

      desiredCamera.current.set(
        2.65,
        1.45,
        -2.5
      );
    }
  }, [
    cameraMode,
    prepared,
  ]);

  /* =======================================================
     ANIMATION
  ======================================================= */

  useFrame(
    (state, delta) => {
      if (!root.current) {
        return;
      }

      const smooth =
        1 -
        Math.pow(
          0.0005,
          delta
        );

      /* ===================================================
         EXPLODED VIEW
      =================================================== */

      prepared.traverse(
        (object) => {
          const original =
            object.userData
              .originalPosition as
              | THREE.Vector3
              | undefined;

          if (!original) return;

          const kind =
            object.userData
              .partKind as
              | PartKind
              | null;

          const target =
            original.clone();

          if (exploded) {
            /*
             * Wheels move outward.
             */
            if (
              kind === "Wheel"
            ) {
              target.x +=
                object.position.x >=
                0
                  ? 0.95
                  : -0.95;

              target.y += 0.08;
            }

            /*
             * Brakes move farther
             * outward than wheels.
             */
            if (
              kind === "Brake"
            ) {
              target.x +=
                object.position.x >=
                0
                  ? 1.3
                  : -1.3;

              target.y +=
                0.18;
            }

            /*
             * Engine moves upward.
             */
            if (
              kind === "Engine"
            ) {
              target.y += 1.0;
            }

            /*
             * Interior moves upward.
             */
            if (
              kind === "Interior"
            ) {
              target.y += 0.65;
            }

            /*
             * Body moves slightly downward.
             */
            if (
              kind === "Body"
            ) {
              target.y -= 0.18;
            }
          }

          object.position.lerp(
            target,
            smooth
          );
        }
      );

      /* ===================================================
         CAMERA ANIMATION
      =================================================== */

      if (
        cameraMode !== "FULL" ||
        selectedPart
      ) {
        state.camera.position.lerp(
          desiredCamera.current,
          smooth
        );

        state.camera.lookAt(
          cameraTarget.current
        );
      }
    }
  );

  /* =======================================================
     VEHICLE JSX
  ======================================================= */

  return (
    <group ref={root}>
      <primitive
        object={prepared}
        onPointerOver={(
          event: any
        ) => {
          event.stopPropagation();

          const kind =
            event.object?.userData
              ?.partKind as
              | PartKind
              | null;

          if (kind) {
            setHoveredPart(kind);
          }
        }}
        onPointerOut={(
          event: any
        ) => {
          event.stopPropagation();

          setHoveredPart(
            null
          );
        }}
        onClick={(
          event: any
        ) => {
          event.stopPropagation();

          const kind =
            event.object?.userData
              ?.partKind as
              | PartKind
              | null;

          if (!kind) return;

          /*
           * Selection is informational. Camera positioning
           * is controlled by cameraMode so two effects can
           * never fight over the camera.
           */
          if (
            kind === selectedPart
          ) {
            onSelectPart(null);
          } else {
            onSelectPart(kind);
          }
        }}
      />

      {/* =================================================
          PART TOOLTIP
      ================================================= */}

      {hoveredPart && (
        <Html
          center
          position={[
            0,
            -2.1,
            0,
          ]}
          pointerEvents="none"
        >
          <div className="part-tooltip">
            <span className="tooltip-dot" />

            <span>
              {hoveredPart.toUpperCase()}
            </span>

            <small>
              CLICK TO INSPECT
            </small>
          </div>
        </Html>
      )}

      {/* =================================================
          VEHICLE LIGHTS
      ================================================= */}

      {lightsOn && (
        <>
          <pointLight
            position={[
              0,
              1,
              3,
            ]}
            intensity={2.2}
            distance={5}
          />

          <pointLight
            position={[
              0,
              1,
              -3,
            ]}
            intensity={1.6}
            distance={5}
          />
        </>
      )}
    </group>
  );
}

/* =========================================================
   STAGE
========================================================= */

function Stage(
  props: CarSceneProps
) {
  const {
    lightsOn = true,
    cameraMode = "FULL",
    cinematic = false,
    selectedPart,
  } = props;

  /*
   * IMPORTANT:
   *
   * This ref must exist inside Stage,
   * because OrbitControls is rendered here.
   */
  const controlsRef =
    useRef<any>(null);

  /*
   * Sync controls after changing
   * camera mode.
   */
  useEffect(() => {
    if (!controlsRef.current) {
      return;
    }

    controlsRef.current.enabled =
      cameraMode === "FULL" &&
      !selectedPart;

    controlsRef.current.update();
  }, [
    cameraMode,
    selectedPart,
  ]);

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{
        position: [
          6.2,
          2.5,
          7.2,
        ],
        fov: 32,
        near: 0.1,
        far: 100,
      }}
      gl={{
        antialias: true,
        powerPreference:
          "high-performance",
      }}
      shadows
      onCreated={({ gl }) => {
        gl.outputColorSpace =
          THREE.SRGBColorSpace;

        gl.toneMapping =
          THREE.ACESFilmicToneMapping;

        gl.toneMappingExposure =
          lightsOn
            ? 1.1
            : 0.72;
      }}
      onPointerMissed={() => {
        props.onSelectPart(
          null
        );
      }}
    >
      {/* =================================================
          BACKGROUND
      ================================================= */}

      <color
        attach="background"
        args={[
          "#030303",
        ]}
      />

      <fog
        attach="fog"
        args={[
          "#030303",
          10,
          28,
        ]}
      />

<Suspense
        fallback={
          <Html center>
            <div className="canvas-loading">
              <div className="loader-ring" />

              <span>
                LOADING DIGITAL TWIN
              </span>
            </div>
          </Html>
        }
      >
        {/* =================================================
            BASE LIGHT
        ================================================= */}

        <ambientLight
          intensity={
            lightsOn
              ? 0.3
              : 0.12
          }
        />

        {/* =================================================
            KEY LIGHT
        ================================================= */}

        <directionalLight
          position={[
            5,
            8,
            5,
          ]}
          intensity={
            lightsOn
              ? 3.5
              : 1.2
          }
          castShadow
          shadow-mapSize={[
            1024,
            1024,
          ]}
        />

        {/* =================================================
            FRONT LIGHT
        ================================================= */}

        <spotLight
          position={[
            -6,
            5,
            2,
          ]}
          intensity={
            lightsOn
              ? 8
              : 2
          }
          angle={0.42}
          penumbra={1}
          castShadow
        />

        {/* =================================================
            REAR / RIM LIGHT
        ================================================= */}

        <spotLight
          position={[
            5,
            4,
            -5,
          ]}
          intensity={
            lightsOn
              ? 7
              : 2
          }
          angle={0.4}
          penumbra={1}
        />

        {/* =================================================
            STUDIO ENVIRONMENT
        ================================================= */}

        <Environment
          preset="studio"
          environmentIntensity={
            lightsOn
              ? 0.8
              : 0.35
          }
        />

        {/* =================================================
            VEHICLE
        ================================================= */}

        <Vehicle
          {...props}
          cameraMode={
            cameraMode
          }
        />

        {/* =================================================
            CONTACT SHADOW
        ================================================= */}

        <ContactShadows
          position={[
            0,
            -2.3,
            0,
          ]}
          opacity={
            lightsOn
              ? 0.58
              : 0.3
          }
          scale={12}
          blur={2.5}
          far={5}
          resolution={512}
        />

        {/* =================================================
            ORBIT CONTROLS
        ================================================= */}

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          enableDamping
          dampingFactor={0.06}

          /*
           * FULL VIEW:
           * user can manually rotate.
           *
           * INSPECTION:
           * camera is controlled by
           * Vehicle camera animation.
           */
          enabled={
            cameraMode === "FULL"
          }

          /*
           * Cinematic 360 rotation only in FULL view.
           */
          autoRotate={
            cinematic &&
            cameraMode === "FULL"
          }

          autoRotateSpeed={1.15}

          /*
           * Allow close zoom while inspecting.
           */
          minDistance={
            cameraMode === "WHEEL" ||
            cameraMode === "BRAKE"
              ? 0.45
              : cameraMode ===
                "INTERIOR"
              ? 0.35
              : 3.5
          }

          maxDistance={14}

          minPolarAngle={
            Math.PI / 3.3
          }

          maxPolarAngle={
            Math.PI / 1.95
          }

          rotateSpeed={0.85}

          zoomSpeed={0.75}

          /*
           * Mobile touch support.
           */
          enableRotate

          enableZoom

          touches={{
            ONE:
              THREE.TOUCH.ROTATE,
            TWO:
              THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Suspense>
    </Canvas>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CarScene(
  props: CarSceneProps
) {
  return (
    <div className="car-canvas">
      <Stage {...props} />
    </div>
  );
}

/* =========================================================
   PRELOAD MODEL
========================================================= */

useGLTF.preload(MODEL);