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
 * Pre-computed discriminants for testing.
 * These are verified prime numbers that satisfy discriminant requirements (p ≡ 7 mod 8).
 * Using known primes avoids expensive prime generation during tests.
 */

// Small verified prime discriminant for fast testing (40-bit, from Rust implementation)
// This is the actual output from createDiscriminant(0xaa, 40) in the Rust version
export const DISCRIMINANT_40 = -685_537_176_559n;

// 256-bit safe prime: 2^255 + 30839 (verified prime, 7 mod 8)
// Used for testing instead of dynamic generation
export const DISCRIMINANT_256 = -57896044618658097711785492504343953926634992332820282019728792003956564819967n;

// 256-bit safe prime: 2^255 + 81479 (verified prime, 7 mod 8)
// Different from DISCRIMINANT_256 for testing different values
export const DISCRIMINANT_256_BB = -57896044618658097711785492504343953926634992332820282019728792003956564870615n;

// 512-bit safe prime for larger tests (if needed)
export const DISCRIMINANT_512 = -6703903964971298549787012499102923063739682910296196688861780721860882015036773488400937149083451713845015929093243025426876941405973284973216824503042047n;

