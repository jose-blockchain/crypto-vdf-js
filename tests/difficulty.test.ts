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

import {
  CALIBRATED_ITERATIONS_PER_SECOND,
  estimateDifficulty,
  estimateSolveSeconds,
  getCalibratedIterationsPerSecond,
} from '../src/difficulty';

describe('estimateDifficulty', () => {
  test('scales roughly with targetSeconds for wesolowski', () => {
    const one = estimateDifficulty({ bits: 256, targetSeconds: 1 });
    const two = estimateDifficulty({ bits: 256, targetSeconds: 2 });
    expect(one).toBe(CALIBRATED_ITERATIONS_PER_SECOND[256]);
    expect(two).toBe(one * 2);
  });

  test('uses smaller difficulty for larger bit lengths at same delay', () => {
    const d256 = estimateDifficulty({ bits: 256, targetSeconds: 5 });
    const d512 = estimateDifficulty({ bits: 512, targetSeconds: 5 });
    const d1024 = estimateDifficulty({ bits: 1024, targetSeconds: 5 });
    const d2048 = estimateDifficulty({ bits: 2048, targetSeconds: 5 });
    expect(d256).toBeGreaterThan(d512);
    expect(d512).toBeGreaterThan(d1024);
    expect(d1024).toBeGreaterThan(d2048);
  });

  test('honors iterationsPerSecond override', () => {
    expect(
      estimateDifficulty({
        bits: 256,
        targetSeconds: 2,
        iterationsPerSecond: 1000,
      })
    ).toBe(2000);
  });

  test('pietrzak returns even difficulty in [66, 7000]', () => {
    const low = estimateDifficulty({
      bits: 256,
      targetSeconds: 0.001,
      scheme: 'pietrzak',
    });
    expect(low).toBe(66);
    expect(low % 2).toBe(0);

    const high = estimateDifficulty({
      bits: 256,
      targetSeconds: 1000,
      scheme: 'pietrzak',
    });
    expect(high).toBe(7000);
    expect(high % 2).toBe(0);

    const mid = estimateDifficulty({
      bits: 512,
      targetSeconds: 0.5,
      scheme: 'pietrzak',
      iterationsPerSecond: 1001,
    });
    expect(mid % 2).toBe(0);
    expect(mid).toBeGreaterThanOrEqual(66);
    expect(mid).toBeLessThanOrEqual(7000);
  });

  test('wesolowski minimum is 1', () => {
    expect(
      estimateDifficulty({
        bits: 2048,
        targetSeconds: 0.0001,
        iterationsPerSecond: 100,
      })
    ).toBe(1);
  });

  test('rejects invalid inputs', () => {
    expect(() => estimateDifficulty({ bits: 128, targetSeconds: 1 })).toThrow(RangeError);
    expect(() => estimateDifficulty({ bits: 256, targetSeconds: 0 })).toThrow(RangeError);
    expect(() => estimateDifficulty({ bits: 256, targetSeconds: -1 })).toThrow(RangeError);
    expect(() =>
      estimateDifficulty({ bits: 256, targetSeconds: 1, iterationsPerSecond: 0 })
    ).toThrow(RangeError);
  });
});

describe('estimateSolveSeconds / calibration helpers', () => {
  test('round-trips with estimateDifficulty under override', () => {
    const ips = 2500;
    const difficulty = estimateDifficulty({
      bits: 256,
      targetSeconds: 4,
      iterationsPerSecond: ips,
    });
    expect(estimateSolveSeconds({ bits: 256, difficulty, iterationsPerSecond: ips })).toBe(4);
  });

  test('getCalibratedIterationsPerSecond returns table values', () => {
    expect(getCalibratedIterationsPerSecond(512)).toBe(
      CALIBRATED_ITERATIONS_PER_SECOND[512]
    );
    expect(() => getCalibratedIterationsPerSecond(999)).toThrow(RangeError);
  });
});
