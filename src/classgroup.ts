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

import { bytesToBigInt, bigIntToBytes, bitLength } from './utils';

/**
 * Extended GCD that returns [gcd, x, y] where gcd = a*x + b*y
 * Ensures gcd is always non-negative
 */
function extendedGCD(a: bigint, b: bigint): [bigint, bigint, bigint] {
  if (b === 0n) {
    // Ensure gcd is positive
    if (a < 0n) {
      return [-a, -1n, 0n];
    }
    return [a, 1n, 0n];
  }
  
  let oldR = a, r = b;
  let oldS = 1n, s = 0n;
  let oldT = 0n, t = 1n;
  
  while (r !== 0n) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
    [oldT, t] = [t, oldT - quotient * t];
  }
  
  // Ensure gcd is positive
  if (oldR < 0n) {
    return [-oldR, -oldS, -oldT];
  }
  
  return [oldR, oldS, oldT];
}

/**
 * Three-way GCD: gcd(a, b, c)
 */
function threeGCD(a: bigint, b: bigint, c: bigint): bigint {
  const [g1, _, __] = extendedGCD(a, b);
  const [g2, ___, ____] = extendedGCD(g1, c);
  return g2;
}

/**
 * Solve linear congruence a*x ≡ b (mod m)
 * Returns [x, m/gcd] where x is the solution
 * Port of Rust GMP solve_linear_congruence with exact division
 */
function solveLinearCongruence(a: bigint, b: bigint, m: bigint): [bigint, bigint] {
  // Handle negative modulus
  const mAbs = m < 0n ? -m : m;
  
  // Extended GCD to get g = gcd(a, m) and Bezout coefficients
  // g = a*d + m*e (we need d)
  const [g, d, _e] = extendedGCD(a, mAbs);
  
  // CRITICAL: Check exact division - Rust uses divexact which requires this
  // In debug mode, Rust asserts b % g == 0
  const bModG = b % g;
  if (bModG !== 0n) {
    // This should never happen with correct discriminants
    // If it does, something is wrong upstream
    throw new Error(
      `Linear congruence requires exact division: b=${b} not divisible by gcd=${g} (remainder=${bModG})`
    );
  }
  
  // Exact division: q = b / g (guaranteed no remainder)
  const q = b / g;
  
  // Also verify m is exactly divisible by g
  const mModG = mAbs % g;
  if (mModG !== 0n) {
    throw new Error(
      `Linear congruence requires exact division: m=${mAbs} not divisible by gcd=${g} (remainder=${mModG})`
    );
  }
  
  // Exact division: v = m / g
  const v = mAbs / g;
  
  // Compute mu = (q * d) mod v
  // Note: Rust uses mpz_tdiv_r which is truncated division (towards zero)
  // JavaScript % operator is remainder (same as truncated for positive numbers)
  const r = q * d;
  
  // Truncated division remainder (towards zero, matching Rust's mpz_tdiv_r)
  let mu = r % v;
  
  // Normalize to [0, v) range
  if (mu < 0n) mu += v;
  
  return [mu, v];
}


/**
 * Class group element represented as a binary quadratic form (a, b, c)
 * with discriminant d = b^2 - 4ac
 */
export class ClassGroup {
  constructor(
    public a: bigint,
    public b: bigint,
    public c: bigint,
    public discriminant: bigint
  ) {}

  /**
   * Create a ClassGroup from a, b, and discriminant
   */
  static fromAbDiscriminant(a: bigint, b: bigint, discriminant: bigint): ClassGroup {
    const c = (b * b - discriminant) / (4n * a);
    return new ClassGroup(a, b, c, discriminant).reduce();
  }

  /**
   * Create identity element for this discriminant
   */
  identity(): ClassGroup {
    return ClassGroup.fromAbDiscriminant(1n, 1n, this.discriminant);
  }

  /**
   * Clone this ClassGroup
   */
  clone(): ClassGroup {
    return new ClassGroup(this.a, this.b, this.c, this.discriminant);
  }

  /**
   * Normalize the form using reduction (port from Rust inner_normalize)
   */
  private normalize(debug = false): void {
    const initialDisc = this.b * this.b - 4n * this.a * this.c;
    
    // Reduce b modulo 2a to be in range (-a, a]
    const twoA = 2n * this.a;
    let r = this.b % twoA;
    if (r < 0n) r += twoA;
    if (r > this.a) r -= twoA;
    
    if (debug && r !== this.b) {
      console.log('  normalize: adjusting b from', this.b, 'to', r);
    }
    
    // Update c to maintain discriminant
    // discriminant = b² - 4ac, so c = (b² - discriminant) / 4a
    // When we change b to r: new_c = (r² - discriminant) / 4a
    //                              = (r² - (b² - 4ac)) / 4a
    //                              = (r² - b² + 4ac) / 4a
    //                              = c + (r² - b²) / 4a
    //                              = c + (r-b)(r+b) / 4a
    this.c = this.c + (r - this.b) * (r + this.b) / (4n * this.a);
    this.b = r;
    
    const finalDisc = this.b * this.b - 4n * this.a * this.c;
    if (debug && initialDisc !== finalDisc) {
      console.log('  WARNING: normalize changed discriminant from', initialDisc, 'to', finalDisc);
    }
  }

  /**
   * Reduce the quadratic form (port from Rust inner_reduce)
   */
  reduce(debug = false): ClassGroup {
    const initialDisc = this.b * this.b - 4n * this.a * this.c;
    if (debug) {
      console.log('reduce() input: a=', this.a, 'b=', this.b, 'c=', this.c, 'disc=', initialDisc);
    }
    
    this.normalize(debug);
    
    let iterations = 0;
    while (this.a > this.c || (this.a === this.c && this.b < 0n)) {
      if (debug) {
        console.log('  iteration', iterations++, ': a=', this.a, 'b=', this.b, 'c=', this.c);
      }
      
      // s = (c + b) / (2c)
      const s = (this.c + this.b) / (2n * this.c);
      
      // Swap a and c
      const oldA = this.a;
      const oldB = this.b;
      this.a = this.c;
      this.c = oldA;
      
      // b = 2sc - old_b
      this.b = 2n * s * this.a - oldB;
      
      // c = c - s*old_b + s²*a
      this.c = this.c - s * oldB + s * s * this.a;
      
      const discAfterStep = this.b * this.b - 4n * this.a * this.c;
      if (debug && initialDisc !== discAfterStep) {
        console.log('  WARNING: reduce step changed discriminant from', initialDisc, 'to', discAfterStep);
      }
      
      this.normalize(debug);
      
      if (iterations > 100) {
        if (debug) console.log('  WARNING: Too many iterations in reduce');
        break;
      }
    }
    
    const finalDisc = this.b * this.b - 4n * this.a * this.c;
    if (debug) {
      console.log('reduce() output: a=', this.a, 'b=', this.b, 'c=', this.c, 'disc=', finalDisc);
      if (initialDisc !== finalDisc) {
        console.log('ERROR: Discriminant changed from', initialDisc, 'to', finalDisc);
      }
    }
    
    return this;
  }

  /**
   * Multiply two class group elements
   * Direct port of the Rust GMP implementation algorithm
   */
  multiply(other: ClassGroup, debug = false): ClassGroup {
    // g = (b1 + b2) / 2
    const g = (this.b + other.b) / 2n;
    
    // h = (b2 - b1) / 2
    const h = (other.b - this.b) / 2n;
    
    // w = gcd(a1, a2, g)
    const w = threeGCD(this.a, other.a, g);
    
    // j = w
    const j = w;
    
    // s = a1/w
    const s = this.a / w;
    
    // t = a2/w
    const t = other.a / w;
    
    // u = g/w
    const u = g / w;
    
    if (debug) {
      console.log('After initial computations:');
      console.log('  g=', g, 'h=', h, 'w=', w);
      console.log('  j=', j, 's=', s, 't=', t, 'u=', u);
    }
    
    // Solve first linear congruence: (t*u)*mu ≡ (h*u + s*c1) (mod s*t)
    const lhs1 = t * u;
    const rhs1 = h * u + s * this.c;
    const mod1 = s * t;
    
    if (debug) {
      console.log('\nFirst linear congruence:');
      console.log('  ', lhs1, '* mu ≡', rhs1, '(mod', mod1, ')');
    }
    
    const [mu, v] = solveLinearCongruence(lhs1, rhs1, mod1);
    
    if (debug) {
      console.log('  Solution: mu=', mu, ', v=', v);
      console.log('  Verify:', (lhs1 * mu) % mod1, '≡', rhs1 % mod1, '(mod', mod1, ')');
    }
    
    // Solve second linear congruence: (t*v)*lambda ≡ (h - t*mu) (mod s)
    const lhs2 = t * v;
    const rhs2 = h - t * mu;
    const mod2 = s;
    
    if (debug) {
      console.log('\nSecond linear congruence:');
      console.log('  ', lhs2, '* lambda ≡', rhs2, '(mod', mod2, ')');
    }
    
    const [lambda, _sigma] = solveLinearCongruence(lhs2, rhs2, mod2);
    
    if (debug) {
      console.log('  Solution: lambda=', lambda, ', sigma=', _sigma);
    }
    
    // k = mu + v*lambda
    const k = mu + v * lambda;
    
    // l = (k*t - h)/s
    const l = (k * t - h) / s;
    
    // m = (t*u*k - h*u - c1*s) / (s*t)
    const m = (t * u * k - h * u - this.c * s) / (s * t);
    
    if (debug) {
      console.log('\nComputed values:');
      console.log('  k=', k, 'l=', l, 'm=', m);
    }
    
    // Final result:
    // A = s*t
    const A = s * t;
    
    // B = j*u - (k*t + l*s)
    const B = j * u - (k * t + l * s);
    
    // C = k*l - j*m
    const C = k * l - j * m;
    
    if (debug) {
      console.log('\nBefore reduction:');
      console.log('  A=', A, 'B=', B, 'C=', C);
      console.log('  Discriminant check:', B*B - 4n*A*C, '===', this.discriminant, ':', (B*B - 4n*A*C) === this.discriminant);
    }
    
    const result = new ClassGroup(A, B, C, this.discriminant);
    result.reduce(debug);
    return result;
  }

  /**
   * Square this class group element
   */
  square(): void {
    const result = this.multiply(this);
    this.a = result.a;
    this.b = result.b;
    this.c = result.c;
  }

  /**
   * Repeated squaring (n times)
   */
  repeatedSquare(n: number | bigint): void {
    const count = typeof n === 'bigint' ? Number(n) : n;
    for (let i = 0; i < count; i++) {
      this.square();
    }
  }

  /**
   * Exponentiation by a BigInt
   */
  pow(exponent: bigint): void {
    if (exponent === 0n) {
      const id = this.identity();
      this.a = id.a;
      this.b = id.b;
      this.c = id.c;
      return;
    }
    
    if (exponent === 1n) return;
    
    const bits = exponent.toString(2);
    let result = this.clone();
    
    for (let i = 1; i < bits.length; i++) {
      result.square();
      if (bits[i] === '1') {
        result = result.multiply(this);
      }
    }
    
    this.a = result.a;
    this.b = result.b;
    this.c = result.c;
  }

  /**
   * Serialize to bytes with specified size (matches Rust GMP serialize)
   * targetSize is in bytes (half the total buffer size for a or b)
   */
  serialize(targetSize?: number): Uint8Array {
    // If no target size, calculate from discriminant
    let size: number;
    if (targetSize !== undefined) {
      size = targetSize;
    } else {
      // Calculate size from discriminant: (bitLength(-discriminant) + 16) >> 4
      const discBits = bitLength(-this.discriminant);
      size = (discBits + 16) >> 4;
    }
    
    // Total buffer size: size * 2 (for a and b)
    const totalSize = size * 2;
    const result = new Uint8Array(totalSize);
    
    // Serialize a into first half, b into second half
    // Each value is right-aligned within its half
    const aBytes = bigIntToBytes(this.a, size);
    const bBytes = bigIntToBytes(this.b, size);
    
    result.set(aBytes, 0);
    result.set(bBytes, size);
    
    return result;
  }

  /**
   * Deserialize from bytes
   */
  static fromBytes(bytes: Uint8Array, discriminant: bigint): ClassGroup {
    const size = bytes.length / 2;
    const aBytes = bytes.subarray(0, size);
    const bBytes = bytes.subarray(size);
    
    const a = bytesToBigInt(aBytes);
    const b = bytesToBigInt(bBytes);
    
    return ClassGroup.fromAbDiscriminant(a, b, discriminant);
  }

  /**
   * Check equality
   */
  equals(other: ClassGroup): boolean {
    return this.a === other.a && 
           this.b === other.b && 
           this.c === other.c &&
           this.discriminant === other.discriminant;
  }

  /**
   * Get the size in bits of the discriminant
   */
  static sizeInBits(discriminant: bigint): number {
    return bitLength(-discriminant);
  }
}

/**
 * Iterate squarings to compute powers efficiently
 */
export function iterateSquarings(
  x: ClassGroup,
  powersToCalculate: number[]
): Map<number, ClassGroup> {
  const powersCalculated = new Map<number, ClassGroup>();
  const sorted = [...powersToCalculate].sort((a, b) => a - b);
  
  const current = x.clone();
  let previousPower = 0;
  
  for (const currentPower of sorted) {
    const diff = currentPower - previousPower;
    current.repeatedSquare(diff);
    powersCalculated.set(currentPower, current.clone());
    previousPower = currentPower;
  }
  
  return powersCalculated;
}

