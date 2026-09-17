"use client";

import {
  Armchair,
  Check,
  CircleDot,
  Disc3,
  Layers3,
  Palette,
  RotateCcw,
  Save,
} from "lucide-react";

import type { VehicleConfig } from "../data/vehicle";

import {
  BODY_COLORS,
  CALIPER_COLORS,
  DEFAULT_CONFIG,
  INTERIOR_COLORS,
  WHEEL_FINISHES,
} from "../data/vehicle";

type Props = {
  config: VehicleConfig;
  setConfig: React.Dispatch<
    React.SetStateAction<VehicleConfig>
  >;
};

export default function Configurator({
  config,
  setConfig,
}: Props) {
  const update = (
    changes: Partial<VehicleConfig>
  ) => {
    setConfig((current) => ({
      ...current,
      ...changes,
    }));
  };

  const reset = () => {
    setConfig({
      ...DEFAULT_CONFIG,
    });
  };

  const save = () => {
    try {
      localStorage.setItem(
        "alvantix-autohub-config",
        JSON.stringify(config)
      );

      window.alert(
        "Configuration saved successfully."
      );
    } catch {
      window.alert(
        "Unable to save configuration."
      );
    }
  };

  return (
    <aside className="configurator">
      {/* HEADER */}

      <div className="configurator-header">
        <div className="configurator-heading">
          <div className="config-kicker">
            ALVANTIX CONFIGURATOR
          </div>

          <h2>
            BUILD YOUR
            <span>LaFerrari</span>
          </h2>
        </div>

        <div className="config-icon">
          <Palette size={18} />
        </div>
      </div>

      {/* EXTERIOR PAINT */}

      <section className="config-section">
        <div className="config-title">
          <div>
            <Palette size={15} />
            <span>EXTERIOR PAINT</span>
          </div>

          <small>
            {
              BODY_COLORS[
                config.bodyColor
              ]?.name
            }
          </small>
        </div>

        <div className="swatches">
          {Object.entries(BODY_COLORS).map(
            ([key, color]) => {
              const selected =
                config.bodyColor === key;

              return (
                <button
                  key={key}
                  type="button"
                  className={
                    selected
                      ? "swatch selected"
                      : "swatch"
                  }
                  style={{
                    backgroundColor:
                      color.hex,
                  }}
                  title={color.name}
                  aria-label={`Select ${color.name}`}
                  aria-pressed={selected}
                  onClick={() =>
                    update({
                      bodyColor:
                        key as VehicleConfig["bodyColor"],
                    })
                  }
                >
                  {selected && (
                    <Check size={14} />
                  )}
                </button>
              );
            }
          )}
        </div>
      </section>

      {/* WHEEL FINISH */}

      <section className="config-section">
        <div className="config-title">
          <div>
            <CircleDot size={15} />
            <span>WHEEL FINISH</span>
          </div>

          <small>
            {
              WHEEL_FINISHES[
                config.wheelFinish
              ]?.name
            }
          </small>
        </div>

        <div className="config-options">
          {Object.entries(
            WHEEL_FINISHES
          ).map(([key, finish]) => {
            const selected =
              config.wheelFinish === key;

            return (
              <button
                key={key}
                type="button"
                className={
                  selected
                    ? "config-option selected"
                    : "config-option"
                }
                aria-pressed={selected}
                onClick={() =>
                  update({
                    wheelFinish:
                      key as VehicleConfig["wheelFinish"],
                  })
                }
              >
                <span
                  className="option-dot"
                  style={{
                    backgroundColor:
                      finish.hex,
                  }}
                />

                <span>
                  {finish.name}
                </span>

                {selected && (
                  <Check size={13} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* BRAKE CALIPERS */}

      <section className="config-section">
        <div className="config-title">
          <div>
            <Disc3 size={15} />
            <span>BRAKE CALIPERS</span>
          </div>

          <small>
            {
              CALIPER_COLORS[
                config.caliperColor
              ]?.name
            }
          </small>
        </div>

        <div className="swatches">
          {Object.entries(
            CALIPER_COLORS
          ).map(([key, color]) => {
            const selected =
              config.caliperColor === key;

            return (
              <button
                key={key}
                type="button"
                className={
                  selected
                    ? "swatch selected"
                    : "swatch"
                }
                style={{
                  backgroundColor:
                    color.hex,
                }}
                title={color.name}
                aria-label={`Select ${color.name} calipers`}
                aria-pressed={selected}
                onClick={() =>
                  update({
                    caliperColor:
                      key as VehicleConfig["caliperColor"],
                  })
                }
              >
                {selected && (
                  <Check size={14} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* INTERIOR */}

      <section className="config-section">
        <div className="config-title">
          <div>
            <Armchair size={15} />
            <span>INTERIOR</span>
          </div>

          <small>
            {
              INTERIOR_COLORS[
                config.interiorColor
              ]?.name
            }
          </small>
        </div>

        <div className="config-options">
          {Object.entries(
            INTERIOR_COLORS
          ).map(([key, color]) => {
            const selected =
              config.interiorColor === key;

            return (
              <button
                key={key}
                type="button"
                className={
                  selected
                    ? "config-option selected"
                    : "config-option"
                }
                aria-pressed={selected}
                onClick={() =>
                  update({
                    interiorColor:
                      key as VehicleConfig["interiorColor"],
                  })
                }
              >
                <span
                  className="option-dot"
                  style={{
                    backgroundColor:
                      color.hex,
                  }}
                />

                <span>
                  {color.name}
                </span>

                {selected && (
                  <Check size={13} />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* CARBON PACKAGE */}

      <section className="config-section">
        <div className="config-title">
          <div>
            <Layers3 size={15} />
            <span>CARBON PACKAGE</span>
          </div>

          <small>
            {config.carbonPackage
              ? "ACTIVE"
              : "OFF"}
          </small>
        </div>

        <button
          type="button"
          className={
            config.carbonPackage
              ? "toggle active"
              : "toggle"
          }
          onClick={() =>
            update({
              carbonPackage:
                !config.carbonPackage,
            })
          }
          aria-pressed={
            config.carbonPackage
          }
        >
          <span className="toggle-track">
            <span className="toggle-thumb" />
          </span>

          <span className="toggle-label">
            {config.carbonPackage
              ? "CARBON PACKAGE ENABLED"
              : "STANDARD TRIM"}
          </span>
        </button>
      </section>

      {/* FOOTER */}

      <div className="config-footer">
        <button
          type="button"
          className="reset-button"
          onClick={reset}
        >
          <RotateCcw size={14} />
          <span>RESET</span>
        </button>

        <button
          type="button"
          className="save-button"
          onClick={save}
        >
          <Save size={14} />
          <span>SAVE BUILD</span>
        </button>
      </div>
    </aside>
  );
}