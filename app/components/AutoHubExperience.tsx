"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import {
  Armchair,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Gauge,
  Info,
  Layers3,
  Lightbulb,
  Maximize2,
  Palette,
  Rotate3D,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import Configurator from "./Configurator";

import {
  DEFAULT_CONFIG,
  type VehicleConfig,
} from "../data/vehicle";

import type {
  CameraMode,
  PartKind,
} from "./CarScene";


/* =========================================================
   CAR SCENE
========================================================= */

const CarScene = dynamic(
  () => import("./CarScene"),
  {
    ssr: false,

    loading: () => (
      <div className="scene-loading">
        <div className="loader-ring" />

        <span>
          INITIALIZING DIGITAL TWIN
        </span>
      </div>
    ),
  }
);


/* =========================================================
   TYPES
========================================================= */

type Section =
  | "overview"
  | "performance"
  | "powertrain"
  | "design"
  | "interior"
  | "configure";


type Part = Extract<
  PartKind,
  | "Body"
  | "Wheel"
  | "Brake"
  | "Headlight"
  | "Engine"
  | "Interior"
>;


type PartInfo = {
  title: string;
  eyebrow: string;
  description: string;
  stat: string;
  camera: CameraMode;
};


/* =========================================================
   PART INFORMATION
========================================================= */

const PARTS: Record<
  Part,
  PartInfo
> = {
  Body: {
    title:
      "Carbon-Fiber Silhouette",

    eyebrow:
      "AERODYNAMIC DESIGN",

    description:
      "Explore the sculpted bodywork, aerodynamic surfaces and lightweight architecture of the vehicle.",

    stat:
      "LIGHTWEIGHT",

    camera:
      "FULL",
  },

  Wheel: {
    title:
      "Forged Performance Wheel",

    eyebrow:
      "CHASSIS / WHEEL",

    description:
      "Move into a close technical view of the wheel, tyre and surrounding suspension assembly.",

    stat:
      "FORGED ALLOY",

    camera:
      "WHEEL",
  },

  Brake: {
    title:
      "Carbon-Ceramic Braking",

    eyebrow:
      "BRAKING SYSTEM",

    description:
      "Inspect the brake hardware and caliper assembly in a dedicated close-up camera.",

    stat:
      "CARBON CERAMIC",

    camera:
      "BRAKE",
  },

  Headlight: {
    title:
      "Signature Lighting",

    eyebrow:
      "LIGHTING SYSTEM",

    description:
      "Inspect the front lighting architecture and optical signature.",

    stat:
      "LED SYSTEM",

    camera:
      "FRONT",
  },

  Engine: {
    title:
      "V12 Hybrid Powertrain",

    eyebrow:
      "POWERTRAIN",

    description:
      "Explore the V12 hybrid powertrain, electric assistance and rear-mounted drivetrain.",

    stat:
      "V12 HYBRID",

    camera:
      "ENGINE",
  },

  Interior: {
    title:
      "Driver-Focused Cockpit",

    eyebrow:
      "INTERIOR",

    description:
      "Enter the cockpit and inspect the seats, steering wheel, dashboard and digital interfaces.",

    stat:
      "DIGITAL COCKPIT",

    camera:
      "INTERIOR",
  },
};


/* =========================================================
   PERFORMANCE DATA
========================================================= */

const PERFORMANCE_DATA = [
  [
    "POWERTRAIN",
    "V12 HYBRID",
  ],

  [
    "COMBINED OUTPUT",
    "963 HP",
  ],

  [
    "0–100 KM/H",
    "2.6 SEC",
  ],

  [
    "TRANSMISSION",
    "7-SPEED DCT",
  ],

  [
    "DRIVE",
    "REAR-WHEEL DRIVE",
  ],

  [
    "AERODYNAMICS",
    "ACTIVE",
  ],
];


/* =========================================================
   NAVIGATION
========================================================= */

const NAV: Array<
  [Section, string]
> = [
  [
    "overview",
    "Overview",
  ],

  [
    "performance",
    "Performance",
  ],

  [
    "powertrain",
    "Powertrain",
  ],

  [
    "design",
    "Design",
  ],

  [
    "interior",
    "Interior",
  ],

  [
    "configure",
    "Configure",
  ],
];


/* =========================================================
   INSPECTION SEQUENCE
========================================================= */

const INSPECTION_SEQUENCE: Part[] = [
  "Body",
  "Headlight",
  "Wheel",
  "Brake",
  "Engine",
  "Interior",
];


/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AutoHubExperience() {

  /* =======================================================
     STATE
  ======================================================= */

  const [
    activeSection,
    setActiveSection,
  ] =
    useState<Section>(
      "overview"
    );


  const [
    selectedPart,
    setSelectedPart,
  ] =
    useState<Part | null>(
      null
    );


  const [
    cameraMode,
    setCameraMode,
  ] =
    useState<CameraMode>(
      "FULL"
    );


  const [
    vehicleMode,
    setVehicleMode,
  ] =
    useState(
      "FULL VEHICLE"
    );


  const [
    panelOpen,
    setPanelOpen,
  ] =
    useState(false);


  const [
    exploded,
    setExploded,
  ] =
    useState(false);


  const [
    cinematic,
    setCinematic,
  ] =
    useState(false);


  const [
    lightsOn,
    setLightsOn,
  ] =
    useState(true);


  const [
    config,
    setConfig,
  ] =
    useState<VehicleConfig>(
      {
        ...DEFAULT_CONFIG,
      }
    );


  const [
    showConfigurator,
    setShowConfigurator,
  ] =
    useState(false);


  const [
    previousSection,
    setPreviousSection,
  ] =
    useState<Section>(
      "overview"
    );


  /* =======================================================
     INSPECT PART
  ======================================================= */

  const inspect = (
    part: Part
  ) => {

    const info =
      PARTS[part];

    if (!info) {
      return;
    }

    setSelectedPart(
      part
    );

    setCameraMode(
      info.camera
    );

    setVehicleMode(
      part === "Headlight"
        ? "FRONT LIGHTING"
        : part === "Wheel"
          ? "WHEEL SYSTEM"
          : part === "Brake"
            ? "BRAKING SYSTEM"
            : part === "Engine"
              ? "POWERTRAIN"
              : part === "Interior"
                ? "COCKPIT"
                : "BODY DESIGN"
    );

    setPanelOpen(
      true
    );


    if (
      part === "Engine"
    ) {
      setActiveSection(
        "powertrain"
      );
    }

    else if (
      part === "Interior"
    ) {
      setActiveSection(
        "interior"
      );
    }

    else if (
      part === "Wheel" ||
      part === "Brake" ||
      part === "Headlight" ||
      part === "Body"
    ) {
      setActiveSection(
        "design"
      );
    }
  };


  /* =======================================================
     OPEN REAR VIEW
  ======================================================= */

  const inspectRear =
    () => {

      setSelectedPart(
        null
      );

      setCameraMode(
        "REAR"
      );

      setVehicleMode(
        "REAR VIEW"
      );

      setPanelOpen(
        true
      );

      setActiveSection(
        "design"
      );
    };


  /* =======================================================
     CHANGE SECTION
  ======================================================= */

  const changeSection = (
    section: Section
  ) => {

    /* -----------------------------------------------------
       CONFIGURATOR
    ----------------------------------------------------- */

    if (
      section === "configure"
    ) {

      setPreviousSection(
        activeSection ===
          "configure"
          ? "overview"
          : activeSection
      );

      setShowConfigurator(
        true
      );

      setPanelOpen(
        false
      );

      setActiveSection(
        "configure"
      );

      return;
    }


    /* -----------------------------------------------------
       CLOSE CONFIGURATOR
    ----------------------------------------------------- */

    setShowConfigurator(
      false
    );

    setActiveSection(
      section
    );


    /* -----------------------------------------------------
       OVERVIEW
    ----------------------------------------------------- */

    if (
      section === "overview"
    ) {

      setSelectedPart(
        null
      );

      setCameraMode(
        "FULL"
      );

      setVehicleMode(
        "FULL VEHICLE"
      );

      setPanelOpen(
        false
      );

      return;
    }


    /* -----------------------------------------------------
       PERFORMANCE
    ----------------------------------------------------- */

    if (
      section === "performance"
    ) {

      setSelectedPart(
        null
      );

      setCameraMode(
        "FULL"
      );

      setVehicleMode(
        "PERFORMANCE"
      );

      setPanelOpen(
        true
      );

      return;
    }


    /* -----------------------------------------------------
       POWERTRAIN
    ----------------------------------------------------- */

    if (
      section === "powertrain"
    ) {

      setSelectedPart(
        "Engine"
      );

      setCameraMode(
        "ENGINE"
      );

      setVehicleMode(
        "POWERTRAIN"
      );

      setPanelOpen(
        true
      );

      return;
    }


    /* -----------------------------------------------------
       DESIGN
    ----------------------------------------------------- */

    if (
      section === "design"
    ) {

      setSelectedPart(
        "Body"
      );

      setCameraMode(
        "FULL"
      );

      setVehicleMode(
        "DESIGN"
      );

      setPanelOpen(
        true
      );

      return;
    }


    /* -----------------------------------------------------
       INTERIOR
    ----------------------------------------------------- */

    if (
      section === "interior"
    ) {

      setSelectedPart(
        "Interior"
      );

      setCameraMode(
        "INTERIOR"
      );

      setVehicleMode(
        "INTERIOR"
      );

      setPanelOpen(
        true
      );
    }
  };


  /* =======================================================
     RESET VIEW
  ======================================================= */

  const resetView =
    () => {

      setSelectedPart(
        null
      );

      setCameraMode(
        "FULL"
      );

      setVehicleMode(
        "FULL VEHICLE"
      );

      setPanelOpen(
        false
      );

      setExploded(
        false
      );

      setCinematic(
        false
      );

      setActiveSection(
        "overview"
      );
    };


  /* =======================================================
     CLOSE CONFIGURATOR
  ======================================================= */

  const closeConfigurator =
    () => {

      setShowConfigurator(
        false
      );

      setActiveSection(
        previousSection
      );

      setSelectedPart(
        null
      );

      setCameraMode(
        "FULL"
      );

      setVehicleMode(
        "FULL VEHICLE"
      );

      setPanelOpen(
        false
      );
    };


  /* =======================================================
     BACK
  ======================================================= */

  const backFromCurrentView =
    () => {

      if (
        showConfigurator
      ) {
        closeConfigurator();
        return;
      }


      if (
        selectedPart
      ) {

        setSelectedPart(
          null
        );

        setCameraMode(
          "FULL"
        );

        setVehicleMode(
          "FULL VEHICLE"
        );

        setPanelOpen(
          false
        );

        setActiveSection(
          "overview"
        );

        return;
      }


      resetView();
    };


  /* =======================================================
     PREVIOUS INSPECTION
  ======================================================= */

  const previousView =
    () => {

      const currentIndex =
        selectedPart
          ? INSPECTION_SEQUENCE.indexOf(
              selectedPart
            )
          : 0;


      const nextIndex =
        currentIndex <= 0
          ? INSPECTION_SEQUENCE.length -
            1
          : currentIndex - 1;


      inspect(
        INSPECTION_SEQUENCE[
          nextIndex
        ]
      );
    };


  /* =======================================================
     NEXT INSPECTION
  ======================================================= */

  const nextView =
    () => {

      const currentIndex =
        selectedPart
          ? INSPECTION_SEQUENCE.indexOf(
              selectedPart
            )
          : -1;


      const nextIndex =
        currentIndex >=
        INSPECTION_SEQUENCE.length -
          1
          ? 0
          : currentIndex + 1;


      inspect(
        INSPECTION_SEQUENCE[
          nextIndex
        ]
      );
    };


  /* =======================================================
     SELECTED INFORMATION
  ======================================================= */

  const selectedInfo =
    selectedPart
      ? PARTS[selectedPart]
      : null;


  /* =======================================================
     FOOTER PAGE NUMBER
  ======================================================= */

  const sectionNumber =
    activeSection ===
      "overview"
      ? "01"
      : activeSection ===
          "performance"
        ? "02"
        : activeSection ===
            "powertrain"
          ? "03"
          : activeSection ===
              "design"
            ? "04"
            : activeSection ===
                "interior"
              ? "05"
              : "06";


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="autohub">

      {/* ===================================================
         GRAIN
      =================================================== */}

      <div
        className="grain"
        aria-hidden="true"
      />


      {/* ===================================================
         TOP BAR
      =================================================== */}

      <header className="topbar">

        {/* BRAND */}

        <button
          type="button"
          className="brand brand-button"
          onClick={resetView}
          aria-label="Reset to overview"
        >

          <span className="brand-mark">
            A
          </span>

          <span>
            <span className="brand-name">
              ALVANTIX
            </span>

            <span className="brand-sub">
              AUTOHUB / DIGITAL TWIN
            </span>
          </span>

        </button>


        {/* NAVIGATION */}

        <nav
          className="nav"
          aria-label="Primary navigation"
        >

          {NAV.map(
            ([
              key,
              label,
            ]) => (

              <button
                type="button"
                key={key}
                className={
                  activeSection ===
                  key
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  changeSection(
                    key
                  )
                }
              >
                {label}
              </button>

            )
          )}

        </nav>


        {/* INFO */}

        <button
          type="button"
          className="icon-button"
          aria-label="Vehicle information"
          onClick={() => {

            setSelectedPart(
              null
            );

            setCameraMode(
              "FULL"
            );

            setVehicleMode(
              "SPECIFICATIONS"
            );

            setPanelOpen(
              true
            );

          }}
        >
          <Info
            size={17}
          />
        </button>

      </header>


      {/* ===================================================
         HERO
      =================================================== */}

      <section className="hero">

        <div className="hero-copy">

          <div className="eyebrow">

            <span className="status-dot" />

            ALVANTIX DIGITAL VEHICLE EXPERIENCE

          </div>


          <h1>
            LA
            <span>
              FERRARI
            </span>
          </h1>


          <p>
            Explore the machine from
            every angle. Rotate the
            vehicle, inspect individual
            systems and enter the cockpit
            through an interactive
            automotive digital twin.
          </p>


          {/* =================================================
             HERO ACTIONS
          ================================================= */}

          <div className="hero-actions">

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                inspect("Body")
              }
            >

              <Sparkles
                size={16}
              />

              <span>
                EXPLORE VEHICLE
              </span>

            </button>


            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                changeSection(
                  "configure"
                )
              }
            >

              <Palette
                size={16}
              />

              <span>
                CONFIGURE
              </span>

            </button>


            <button
              type="button"
              className={
                exploded
                  ? "secondary-button active"
                  : "secondary-button"
              }
              onClick={() =>
                setExploded(
                  (value) =>
                    !value
                )
              }
            >

              <Layers3
                size={16}
              />

              <span>
                {exploded
                  ? "NORMAL VIEW"
                  : "EXPLODED VIEW"}
              </span>

            </button>

          </div>

        </div>


        {/* =================================================
           SCENE
        ================================================= */}

        <div className="scene-shell">

          <CarScene
            selectedPart={
              selectedPart
            }

            onSelectPart={(
              part
            ) => {

              if (
                part &&
                Object.prototype.hasOwnProperty.call(
                  PARTS,
                  part
                )
              ) {

                inspect(
                  part as Part
                );

              } else {

                resetView();

              }

            }}

            config={
              config
            }

            cameraMode={
              cameraMode
            }

            exploded={
              exploded
            }

            cinematic={
              cinematic
            }

            lightsOn={
              lightsOn
            }
          />


          {/* =================================================
             SCENE HUD
          ================================================= */}

          <div className="scene-hud">

            <div>

              <span>
                DIGITAL TWIN
              </span>

              <strong>
                {vehicleMode}
              </strong>

            </div>


            <div>

              <span>
                STATUS
              </span>

              <strong>
                ONLINE
              </strong>

            </div>

          </div>


          {/* =================================================
             SCENE CONTROLS
          ================================================= */}

          <div className="scene-controls">

            <button
              type="button"
              aria-label="Previous inspection"
              onClick={
                previousView
              }
            >
              <ChevronLeft
                size={18}
              />
            </button>


            <button
              type="button"
              className="view-label"
              onClick={
                resetView
              }
            >

              <span>
                INTERACTIVE VIEW
              </span>

              <strong>
                {selectedPart
                  ? selectedPart.toUpperCase()
                  : vehicleMode}
              </strong>

            </button>


            <button
              type="button"
              aria-label="Next inspection"
              onClick={
                nextView
              }
            >
              <ChevronRight
                size={18}
              />
            </button>

          </div>


          {/* =================================================
             CAMERA DOCK
          ================================================= */}

          <div className="camera-dock">

            <button
              type="button"
              className={
                cameraMode ===
                "FULL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                changeSection(
                  "overview"
                )
              }
            >
              FULL
            </button>


            <button
              type="button"
              className={
                cameraMode ===
                "FRONT"
                  ? "active"
                  : ""
              }
              onClick={() =>
                inspect(
                  "Headlight"
                )
              }
            >
              FRONT
            </button>


            <button
              type="button"
              className={
                cameraMode ===
                "REAR"
                  ? "active"
                  : ""
              }
              onClick={
                inspectRear
              }
            >
              REAR
            </button>


            {/* IMPORTANT:
                WHEEL maps to WHEEL */}
            <button
              type="button"
              className={
                cameraMode ===
                "WHEEL"
                  ? "active"
                  : ""
              }
              onClick={() =>
                inspect(
                  "Wheel"
                )
              }
            >
              WHEEL
            </button>

          <button
  type="button"
  className={cameraMode === "ENGINE" ? "active" : ""}
  onClick={() => inspect("Engine")}
>
  ENGINE
</button>
          

            {/* IMPORTANT:
                BRAKE maps to BRAKE */}
            <button
              type="button"
              className={
                cameraMode ===
                "BRAKE"
                  ? "active"
                  : ""
              }
              onClick={() =>
                inspect(
                  "Brake"
                )
              }
            >
              BRAKE
            </button>


            <button
              type="button"
              className={
                cameraMode ===
                "INTERIOR"
                  ? "active"
                  : ""
              }
              onClick={() =>
                inspect(
                  "Interior"
                )
              }
            >
              COCKPIT
            </button>

          </div>


          {/* =================================================
             SCENE TOOLBAR
          ================================================= */}

          <div className="scene-toolbar">

            <button
              type="button"
              className={
                cinematic
                  ? "tool-active"
                  : ""
              }
              title="Toggle cinematic rotation"
              aria-label="Toggle cinematic rotation"
              onClick={() =>
                setCinematic(
                  (value) =>
                    !value
                )
              }
            >
              <Rotate3D
                size={15}
              />
            </button>


            <button
              type="button"
              className={
                exploded
                  ? "tool-active"
                  : ""
              }
              title="Toggle exploded view"
              aria-label="Toggle exploded view"
              onClick={() =>
                setExploded(
                  (value) =>
                    !value
                )
              }
            >
              <Layers3
                size={15}
              />
            </button>


            <button
              type="button"
              className={
                lightsOn
                  ? "tool-active"
                  : ""
              }
              title="Toggle lights"
              aria-label="Toggle lights"
              onClick={() =>
                setLightsOn(
                  (value) =>
                    !value
                )
              }
            >
              <Lightbulb
                size={15}
              />
            </button>


            <button
              type="button"
              title="Reset view"
              aria-label="Reset view"
              onClick={
                resetView
              }
            >
              <Maximize2
                size={15}
              />
            </button>

          </div>


          {/* =================================================
             BACK BUTTON
          ================================================= */}

          <button
            type="button"
            className="back-button"
            onClick={
              backFromCurrentView
            }
          >

            <ChevronLeft
              size={16}
            />

            BACK

          </button>


          {/* =================================================
             SCENE HINT
          ================================================= */}

          <div className="scene-hint">

            <Rotate3D
              size={15}
            />

            <span>
              DRAG TO ROTATE
            </span>

            <span className="hint-divider" />

            <span>
              CLICK PARTS
            </span>

          </div>


          {/* =================================================
             CORNER LABELS
          ================================================= */}

          <div className="corner-label top-left">
            DIGITAL TWIN / 01
          </div>

          <div className="corner-label bottom-right">
            ALVANTIX / AUTOMOTIVE AI
          </div>

        </div>


        {/* =================================================
           INFORMATION PANEL
        ================================================= */}

        <aside
          className={
            panelOpen
              ? "info-panel open"
              : "info-panel"
          }
          aria-hidden={
            !panelOpen
          }
        >

          <button
            type="button"
            className="panel-close-icon"
            aria-label="Close information panel"
            onClick={() =>
              setPanelOpen(
                false
              )
            }
          >
            <X
              size={18}
            />
          </button>


          {/* =================================================
             PERFORMANCE PANEL
          ================================================= */}

          {activeSection ===
          "performance" ? (

            <>

              <div className="panel-kicker">
                VEHICLE PERFORMANCE
              </div>

              <h2>
                Performance
              </h2>

              <p>
                A technical overview
                of the vehicle's core
                performance architecture.
              </p>


              <div className="performance-grid">

                {PERFORMANCE_DATA.map(
                  ([
                    label,
                    value,
                  ]) => (

                    <div
                      className="performance-card"
                      key={label}
                    >

                      <span>
                        {label}
                      </span>

                      <strong>
                        {value}
                      </strong>

                    </div>

                  )
                )}

              </div>

            </>

          ) : (

            /* =================================================
               PART PANEL
            ================================================= */

            <>

              <div className="panel-kicker">
                {
                  selectedInfo?.eyebrow ??
                  "VEHICLE INTELLIGENCE"
                }
              </div>


              <h2>
                {
                  selectedInfo?.title ??
                  "LaFerrari"
                }
              </h2>


              <p>
                {
                  selectedInfo?.description ??
                  "Explore the vehicle through the Alvantix interactive digital twin."
                }
              </p>


              <div className="panel-stat">

                <span>
                  MODE
                </span>

                <strong>
                  {
                    selectedInfo?.stat ??
                    "DIGITAL EXPLORATION"
                  }
                </strong>

              </div>


              {/* =================================================
                 PANEL NAVIGATION
              ================================================= */}

              <div className="panel-grid">

                <button
                  type="button"
                  onClick={() =>
                    changeSection(
                      "performance"
                    )
                  }
                >

                  <Gauge
                    size={15}
                  />

                  <span>
                    PERFORMANCE
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    changeSection(
                      "powertrain"
                    )
                  }
                >

                  <Zap
                    size={15}
                  />

                  <span>
                    POWERTRAIN
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    inspect(
                      "Wheel"
                    )
                  }
                >

                  <CircleDot
                    size={15}
                  />

                  <span>
                    WHEEL / CHASSIS
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    inspect(
                      "Brake"
                    )
                  }
                >

                  <Gauge
                    size={15}
                  />

                  <span>
                    BRAKES
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    inspect(
                      "Interior"
                    )
                  }
                >

                  <Armchair
                    size={15}
                  />

                  <span>
                    INTERIOR
                  </span>

                </button>


                <button
                  type="button"
                  onClick={() =>
                    inspect(
                      "Headlight"
                    )
                  }
                >

                  <Lightbulb
                    size={15}
                  />

                  <span>
                    LIGHTING
                  </span>

                </button>

              </div>

            </>

          )}


          {/* =================================================
             CLOSE PANEL
          ================================================= */}

          <button
            type="button"
            className="close-panel"
            onClick={() =>
              setPanelOpen(
                false
              )
            }
          >
            CLOSE PANEL
          </button>

        </aside>

      </section>


      {/* ===================================================
         BOTTOM BAR
      =================================================== */}

      <footer className="bottombar">

        <div className="footer-left">

          <span>
            ALVANTIX AI
          </span>

          <span className="muted">
            AUTOMOTIVE DIGITAL TWIN
          </span>

        </div>


        <div className="footer-center">

          <span className="line" />

          <span>
            {sectionNumber} — 06
          </span>

          <span className="line" />

        </div>


        <button
          type="button"
          className="footer-right footer-scroll-button"
          onClick={() =>
            changeSection(
              "configure"
            )
          }
        >

          BUILD YOUR VEHICLE

          <span className="scroll-wheel" />

        </button>

      </footer>


      {/* ===================================================
         CONFIGURATOR
      =================================================== */}

      {showConfigurator && (

        <div
          className="configurator-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle configurator"
        >

          {/* BACKDROP */}

          <button
            type="button"
            className="configurator-backdrop"
            aria-label="Close configurator"
            onClick={
              closeConfigurator
            }
          />


          <div className="configurator-shell">

            {/* =================================================
               CONFIG TOP ACTIONS
            ================================================= */}

            <div className="configurator-top-actions">

              <button
                type="button"
                className="config-back-button"
                onClick={
                  closeConfigurator
                }
              >

                <ChevronLeft
                  size={16}
                />

                BACK

              </button>


              <span>
                CONFIGURATION / 01
              </span>


              <button
                type="button"
                className="config-close-button"
                onClick={
                  closeConfigurator
                }
                aria-label="Close configurator"
              >

                <X
                  size={18}
                />

              </button>

            </div>


            {/* =================================================
               CONFIGURATOR
            ================================================= */}

            <Configurator
              config={
                config
              }
              setConfig={
                setConfig
              }
            />

          </div>
        </div>

      )}

    </main>
  );
}

