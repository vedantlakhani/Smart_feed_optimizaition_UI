// AxNano Smart-Feed v9 — TypeScript types mirroring Python dataclasses
// No logic here — types only. See smart_feed_v9/models.py for the Python originals.

export interface WasteStream {
  stream_id: string;
  quantity_L: number;
  btu_per_lb: number;
  pH: number;
  f_ppm: number;
  solid_pct: number;
  salt_ppm: number;
  moisture_pct: number;
}

export interface SystemConfig {
  F_total: number;
  P_system: number;
  BTU_diesel: number;
  eta: number;
  BTU_target: number;
  solid_max_pct: number;
  pH_min: number;
  pH_max: number;
  salt_max_ppm: number;
  K_F_TO_ACID: number;
  K_PH_TO_BASE: number;
  K_ACID_TO_NAOH_VOL: number;
  cost_diesel_per_L: number;
  cost_naoh_per_L: number;
  cost_water_per_L: number;
  cost_electricity_per_kWh: number;
  cost_labor_per_hr: number;
  ratio_sum_max: number;
  W_min: number;
}

export const DEFAULT_CONFIG: SystemConfig = {
  F_total: 11.0,
  P_system: 400.0,
  BTU_diesel: 18300.0,
  eta: 0.89,
  BTU_target: 2200.0,
  solid_max_pct: 15.0,
  pH_min: 6.0,
  pH_max: 9.0,
  salt_max_ppm: 5000.0,
  K_F_TO_ACID: 0.053,
  K_PH_TO_BASE: 50.0,
  K_ACID_TO_NAOH_VOL: 8.28e-5,
  cost_diesel_per_L: 1.0,
  cost_naoh_per_L: 1.51,
  cost_water_per_L: 0.00199,
  cost_electricity_per_kWh: 0.12,
  cost_labor_per_hr: 100.0,
  ratio_sum_max: 11,
  W_min: 0.5,
};

export interface BlendProperties {
  btu_per_lb: number;
  pH: number;
  f_ppm: number;
  solid_pct: number;
  salt_ppm: number;
}

export interface PhaseResult {
  streams: Record<string, number>;      // { stream_id: ratio_part }
  blend_props: BlendProperties;
  r_water: number;
  r_diesel: number;
  r_naoh: number;
  r_ext: number;
  W: number;
  runtime_min: number;
  Q_phase: number;
  cost_diesel: number;
  cost_naoh: number;
  cost_water: number;
  cost_electricity: number;
  cost_labor: number;
  cost_total: number;
}

export interface Schedule {
  phases: PhaseResult[];
  total_cost: number;
  total_runtime_min: number;
  total_runtime_hr: number;
}

export interface OptimizationResult {
  baseline: Schedule;
  optimized: Schedule | null;
  savings_pct: number;
  stats: Record<string, string | number | boolean>;
  streams: WasteStream[];
  config: SystemConfig;
}

export interface InputFile {
  streams: WasteStream[];
  config?: Partial<SystemConfig>;
}
