// Copyright 2025 VDF-JS Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * Approximate sequential iterations per second for Wesolowski `solve()` with
 * precomputed discriminants on a typical modern Node.js CPU (Apple Silicon /
 * recent x86). Browser and low-power devices are often 2–10× slower.
 *
 * These are **not security parameters** — only rough delay heuristics.
 * Measure on your target hardware and pass `iterationsPerSecond` when accuracy matters.
 */
export const CALIBRATED_ITERATIONS_PER_SECOND: Readonly<Record<number, number>> = {
  256: 12_000,
  512: 5_000,
  1024: 1_800,
  2048: 600,
};

/** Supported VDF schemes for difficulty shaping. */
export type DifficultyScheme = 'wesolowski' | 'pietrzak';

export interface EstimateDifficultyOptions {
  /** Discriminant bit length (256, 512, 1024, or 2048). */
  bits: number;
  /** Desired wall-clock solve delay in seconds (must be > 0). */
  targetSeconds: number;
  /**
   * VDF scheme. Pietrzak results are even and clamped to [66, 7000].
   * Default: `'wesolowski'`.
   */
  scheme?: DifficultyScheme;
  /**
   * Override calibrated iterations/second for this machine.
   * Prefer measuring a short `solve()` on the target device.
   */
  iterationsPerSecond?: number;
}

export interface EstimateSolveSecondsOptions {
  /** Discriminant bit length (256, 512, 1024, or 2048). */
  bits: number;
  /** Difficulty (iteration count). */
  difficulty: number;
  /** Optional override of calibrated iterations/second. */
  iterationsPerSecond?: number;
}

/**
 * Return the library's calibrated iterations/second for a bit length.
 *
 * @throws {RangeError} If `bits` is not a supported discriminant size
 */
export function getCalibratedIterationsPerSecond(bits: number): number {
  const ips = CALIBRATED_ITERATIONS_PER_SECOND[bits];
  if (ips == null) {
    throw new RangeError(
      `Unsupported bit length ${bits}. Use 256, 512, 1024, or 2048.`
    );
  }
  return ips;
}

function resolveIps(bits: number, override?: number): number {
  if (override != null) {
    if (!(override > 0) || !Number.isFinite(override)) {
      throw new RangeError('iterationsPerSecond must be a positive finite number');
    }
    return override;
  }
  return getCalibratedIterationsPerSecond(bits);
}

function shapeForScheme(raw: number, scheme: DifficultyScheme): number {
  if (scheme === 'pietrzak') {
    // Even, within this JS port's supported range.
    let d = Math.round(raw);
    if (d % 2 !== 0) d += 1;
    if (d < 66) d = 66;
    if (d > 7000) d = 7000;
    return d;
  }
  const d = Math.max(1, Math.round(raw));
  return d;
}

/**
 * Estimate a VDF `difficulty` (iteration count) for a target wall-clock delay.
 *
 * Results are **approximate**. Hardware, JS engine, and thermal throttling vary.
 * For Pietrzak, the value is forced even and clamped to [66, 7000].
 *
 * @example
 * ```ts
 * import { estimateDifficulty, WesolowskiVDFParams, DISCRIMINANT_256 } from 'crypto-vdf';
 *
 * const difficulty = estimateDifficulty({ bits: 256, targetSeconds: 2 });
 * const vdf = new WesolowskiVDFParams(256).new();
 * const proof = await vdf.solve(challenge, difficulty, DISCRIMINANT_256);
 * ```
 */
export function estimateDifficulty(options: EstimateDifficultyOptions): number {
  const { bits, targetSeconds, scheme = 'wesolowski', iterationsPerSecond } = options;

  if (!(targetSeconds > 0) || !Number.isFinite(targetSeconds)) {
    throw new RangeError('targetSeconds must be a positive finite number');
  }
  if (scheme !== 'wesolowski' && scheme !== 'pietrzak') {
    throw new RangeError(`Unsupported scheme "${scheme}". Use "wesolowski" or "pietrzak".`);
  }

  const ips = resolveIps(bits, iterationsPerSecond);
  const raw = ips * targetSeconds;
  return shapeForScheme(raw, scheme);
}

/**
 * Inverse of {@link estimateDifficulty}: approximate solve time for a difficulty.
 *
 * Does not apply Pietrzak clamps — use the same `iterationsPerSecond` you used
 * when estimating difficulty for consistent round-trips.
 */
export function estimateSolveSeconds(options: EstimateSolveSecondsOptions): number {
  const { bits, difficulty, iterationsPerSecond } = options;
  if (!(difficulty > 0) || !Number.isFinite(difficulty)) {
    throw new RangeError('difficulty must be a positive finite number');
  }
  const ips = resolveIps(bits, iterationsPerSecond);
  return difficulty / ips;
}
