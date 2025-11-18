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
 * An error indicating verification failure.
 * For security reasons, no additional information is provided on failure.
 */
export class InvalidProof extends Error {
  constructor() {
    super('Invalid proof');
    this.name = 'InvalidProof';
  }
}

/**
 * An error indicating an invalid number of iterations.
 */
export class InvalidIterations extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIterations';
  }
}

/**
 * VDF parameters interface.
 * Parameters represent public information that can be shared by all users.
 */
export interface VDFParams<T extends VDF> {
  /**
   * Creates an instance of this VDF from the given parameters.
   */
  new(): T;
}

/**
 * A Verifiable Delay Function (VDF).
 * 
 * VDFs are problems that require a certain amount of time to solve, even on a
 * parallel machine, but can be validated much more easily.
 */
export interface VDF {
  /**
   * Solve an instance of this VDF, with challenge `challenge` and difficulty `difficulty`.
   * 
   * @param challenge - An opaque byte string of arbitrary length
   * @param difficulty - The number of iterations (difficulty level)
   * @returns The proof as a Uint8Array
   * @throws {InvalidIterations} If the difficulty is invalid
   */
  solve(challenge: Uint8Array, difficulty: number): Promise<Uint8Array>;

  /**
   * Check that the difficulty is valid.
   * 
   * @param difficulty - The number of iterations to validate
   * @throws {InvalidIterations} If the difficulty is invalid
   */
  checkDifficulty(difficulty: number): void;

  /**
   * Verifies an alleged solution of this VDF.
   * 
   * @param challenge - The challenge used to generate the proof
   * @param difficulty - The number of iterations used
   * @param allegedSolution - The proof to verify
   * @throws {InvalidProof} If the proof is invalid
   */
  verify(challenge: Uint8Array, difficulty: number, allegedSolution: Uint8Array): void;
}

