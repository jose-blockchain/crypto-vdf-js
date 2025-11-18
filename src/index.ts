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

export { InvalidProof, InvalidIterations, VDF, VDFParams } from './types';
export { PietrzakVDF, PietrzakVDFParams } from './pietrzak';
export { WesolowskiVDF, WesolowskiVDFParams } from './wesolowski';
export { createDiscriminant } from './discriminant';
export { ClassGroup } from './classgroup';

// Export precomputed discriminants (generated using Rust GMP for maximum performance)
export {
  DISCRIMINANT_256,
  DISCRIMINANT_512,
  DISCRIMINANT_1024,
  DISCRIMINANT_2048,
  getPrecomputedDiscriminant
} from './precomputed-discriminants';

