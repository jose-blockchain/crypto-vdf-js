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

import { ClassGroup, iterateSquarings } from './classgroup';
import { createDiscriminant } from './discriminant';
import { InvalidProof, InvalidIterations, VDF } from './types';
import { sha256, bytesToBigInt } from './utils';

/**
 * Select a reasonable cache size for Pietrzak proof generation
 */
function approximateI(t: number): number {
  const x = ((t / 2) / 8) * 2 * Math.LN2;
  const w = Math.log(x) - Math.log(Math.log(x)) + 0.25;
  return Math.round(w / (2 * Math.LN2));
}

/**
 * Generate all sum combinations of numbers
 */
function sumCombinations(numbers: number[]): number[] {
  let combinations = [0];
  
  for (const num of numbers) {
    const newCombinations = [...combinations];
    for (const combo of combinations) {
      newCombinations.push(num + combo);
    }
    combinations = newCombinations;
  }
  
  combinations.shift(); // Remove the initial 0
  return combinations;
}

/**
 * Calculate cache indices for proof generation
 */
function cacheIndicesForCount(t: number): number[] {
  const i = approximateI(t);
  let currT = t;
  const intermediateTs: number[] = [];
  
  for (let j = 0; j < i; j++) {
    currT >>= 1;
    intermediateTs.push(currT);
    if ((currT & 1) !== 0) {
      currT += 1;
    }
  }
  
  const cacheIndices = sumCombinations(intermediateTs);
  cacheIndices.sort((a, b) => a - b);
  cacheIndices.push(t);
  
  return cacheIndices;
}

/**
 * Generate r value using Fiat-Shamir heuristic
 */
function generateRValue(
  x: ClassGroup,
  y: ClassGroup,
  sqrtMu: ClassGroup,
  _intSizeBits: number
): bigint {
  const xBytes = x.serialize();
  const yBytes = y.serialize();
  const muBytes = sqrtMu.serialize();
  
  const hash = sha256(xBytes, yBytes, muBytes);
  return bytesToBigInt(hash.subarray(0, 16));
}

/**
 * Calculate the final iteration count for verification
 */
function calculateFinalT(t: number, delta: number): number {
  let currT = t;
  const ts: number[] = [];
  
  while (currT !== 2) {
    ts.push(currT);
    currT >>= 1;
    if ((currT & 1) === 1) {
      currT += 1;
    }
  }
  
  ts.push(2);
  ts.push(1);
  
  return ts[ts.length - delta];
}

/**
 * Generate a Pietrzak proof
 */
export function generateProof(
  x: ClassGroup,
  iterations: number,
  delta: number,
  powers: Map<number, ClassGroup>,
  intSizeBits: number
): ClassGroup[] {
  const identity = x.identity();
  const i = approximateI(iterations);
  const mus: ClassGroup[] = [];
  const rs: bigint[] = [];
  const xP = [x.clone()];
  let currT = iterations;
  const yP = [powers.get(currT)!.clone()];
  const ts: number[] = [];
  const finalT = calculateFinalT(iterations, delta);
  
  let roundIndex = 0;
  
  while (currT !== finalT) {
    const halfT = currT >> 1;
    ts.push(halfT);
    
    const denominator = 1 << (roundIndex + 1);
    
    let mu: ClassGroup;
    if (roundIndex < i) {
      mu = identity.clone();
      
      for (let numerator = 1; numerator < denominator; numerator += 2) {
        const numBits = 62 - Math.clz32(denominator);
        let rProd = 1n;
        
        for (let b = numBits - 1; b >= 0; b--) {
          if ((numerator & (1 << (b + 1))) === 0) {
            const idx = numBits - b - 1;
            if (idx < rs.length && rs[idx] !== undefined) {
              rProd *= rs[idx];
            }
          }
        }
        
        let tSum = halfT;
        for (let b = 0; b < numBits; b++) {
          if ((numerator & (1 << (b + 1))) !== 0) {
            tSum += ts[numBits - b - 1];
          }
        }
        
        const power = powers.get(tSum);
        if (power) {
          const powerClone = power.clone();
          powerClone.pow(rProd);
          mu = mu.multiply(powerClone);
        }
      }
    } else {
      mu = xP[xP.length - 1].clone();
      mu.repeatedSquare(halfT);
    }
    
    mus.push(mu.clone());
    const lastR = generateRValue(xP[0], yP[0], mu, intSizeBits);
    rs.push(lastR);
    
    const lastX = xP[xP.length - 1].clone();
    lastX.pow(BigInt(lastR));
    const muCopy = mu.clone();
    const newX = lastX.multiply(muCopy);
    xP.push(newX);
    
    mu.pow(BigInt(lastR));
    const newY = mu.multiply(yP[yP.length - 1]);
    yP.push(newY);
    
    currT >>= 1;
    if ((currT & 1) !== 0) {
      currT += 1;
      yP[yP.length - 1].square();
    }
    
    roundIndex++;
  }
  
  return mus;
}

/**
 * Verify a Pietrzak proof
 */
export function verifyProof(
  xInitial: ClassGroup,
  yInitial: ClassGroup,
  proof: ClassGroup[],
  t: number,
  _delta: number,
  intSizeBits: number
): void {
  let x = xInitial.clone();
  let y = yInitial.clone();
  let currT = t;
  
  // Process each proof element
  for (const mu of proof) {
    const muCopy = mu.clone();
    const r = generateRValue(xInitial, yInitial, muCopy, intSizeBits);
    
    x.pow(BigInt(r));
    x = x.multiply(mu);
    
    const muCopy2 = mu.clone();
    muCopy2.pow(BigInt(r));
    y = y.multiply(muCopy2);
    
    currT >>= 1;
    if ((currT & 1) !== 0) {
      currT += 1;
      y.square();
    }
  }
  
  // After processing all proof elements, currT is the remaining iterations
  // For empty proof (low difficulty), currT == t
  // We need to check: x^(2^currT) == y
  const xFinal = x.clone();
  xFinal.pow(1n << BigInt(currT));
  
  if (!xFinal.equals(y)) {
    throw new InvalidProof();
  }
}

/**
 * Serialize proof and result
 */
function serialize(proof: ClassGroup[], y: ClassGroup, intSizeBits: number): Uint8Array {
  const size = Math.ceil((intSizeBits + 16) / 16);
  const elementLength = 2 * size;
  const totalLength = (proof.length + 1) * elementLength;
  const result = new Uint8Array(totalLength);
  
  const yBytes = y.serialize(size);
  result.set(yBytes, 0);
  
  for (let i = 0; i < proof.length; i++) {
    const proofBytes = proof[i].serialize(size);
    result.set(proofBytes, (i + 1) * elementLength);
  }
  
  return result;
}

/**
 * Deserialize proof from bytes
 */
function deserializeProof(
  proofBlob: Uint8Array,
  discriminant: bigint,
  length: number
): ClassGroup[] {
  const proofLength = proofBlob.length;
  const elementLength = length * 2;
  
  if (proofLength % elementLength !== 0) {
    throw new InvalidProof();
  }
  
  const numElements = proofLength / elementLength;
  const proof: ClassGroup[] = [];
  
  for (let i = 0; i < numElements; i++) {
    const offset = i * elementLength;
    const bytes = proofBlob.subarray(offset, offset + elementLength);
    proof.push(ClassGroup.fromBytes(bytes, discriminant));
  }
  
  return proof;
}

/**
 * Pietrzak VDF implementation
 */
export class PietrzakVDF implements VDF {
  constructor(public readonly intSizeBits: number) {}

  checkDifficulty(difficulty: number): void {
    if ((difficulty & 1) !== 0) {
      throw new InvalidIterations(
        `Pietrzak iterations must be an even number, not ${difficulty}`
      );
    }
    if (difficulty < 66) {
      throw new InvalidIterations(
        `Pietrzak proof-of-time must run for at least 66 iterations, not ${difficulty}`
      );
    }
  }

  async solve(challenge: Uint8Array, difficulty: number, discriminant?: bigint): Promise<Uint8Array> {
    this.checkDifficulty(difficulty);
    
    const disc = discriminant ?? createDiscriminant(challenge, this.intSizeBits);
    const x = ClassGroup.fromAbDiscriminant(2n, 1n, disc);
    
    const delta = 8;
    const powersToCalculate = cacheIndicesForCount(difficulty);
    const powers = iterateSquarings(x, powersToCalculate);
    
    const proof = generateProof(x, difficulty, delta, powers, this.intSizeBits);
    
    return serialize(proof, powers.get(difficulty)!, this.intSizeBits);
  }

  verify(challenge: Uint8Array, difficulty: number, allegedSolution: Uint8Array, discriminant?: bigint): void {
    this.checkDifficulty(difficulty);
    
    const disc = discriminant ?? createDiscriminant(challenge, this.intSizeBits);
    const x = ClassGroup.fromAbDiscriminant(2n, 1n, disc);
    
    const length = Math.ceil((this.intSizeBits + 16) / 16);
    
    if (allegedSolution.length < 2 * length) {
      throw new InvalidProof();
    }
    
    const resultBytes = allegedSolution.subarray(0, length * 2);
    const proofBytes = allegedSolution.subarray(length * 2);
    
    const proof = deserializeProof(proofBytes, disc, length);
    const y = ClassGroup.fromBytes(resultBytes, disc);
    
    verifyProof(x, y, proof, difficulty, 8, this.intSizeBits);
  }
}

/**
 * Pietrzak VDF parameters
 */
export class PietrzakVDFParams {
  constructor(public readonly intSizeBits: number) {}

  new(): PietrzakVDF {
    return new PietrzakVDF(this.intSizeBits);
  }
}

