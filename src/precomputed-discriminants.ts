/**
 * PRECOMPUTED DISCRIMINANTS
 * 
 * Generated using Rust GMP for maximum performance and correctness.
 * All discriminants satisfy the required mathematical properties:
 * - Negative value
 * - ≡ 1 (mod 4)
 * - ≡ 1 (mod 8)
 * 
 * These are used by default in VDF operations to avoid slow discriminant
 * generation in pure JavaScript. If you need a custom discriminant, you can
 * generate one using `createDiscriminant()`, but note that it will be much
 * slower than using these precomputed values.
 * 
 * @module precomputed-discriminants
 */

/**
 * 256-bit precomputed discriminant
 * Verified: negative=true, mod4=1, mod8=1
 */
export const DISCRIMINANT_256 = -94244082954491557865740412536462075406760295174154720908408968004709609548271n;

/**
 * 512-bit precomputed discriminant
 * Verified: negative=true, mod4=1, mod8=1
 */
export const DISCRIMINANT_512 = -10912719263555516626081817619913051189308497194612054199892649969394492965154537341486905636010302494787794424097802136687738577836545068909065368946489383n;

/**
 * 1024-bit precomputed discriminant
 * Verified: negative=true, mod4=1, mod8=1
 */
export const DISCRIMINANT_1024 = -146315643879136994077164142539876462956618437475013157930957523632143613543804489499996895614438510672259099870954269633116947935483418047595715763621692164466197491338766320249181593620257830302992235073778396501231700149403703708051553336866974228948650479452039534353135601770599774640364513437323733118839n;

/**
 * 2048-bit precomputed discriminant
 * Verified: negative=true, mod4=1, mod8=1
 */
export const DISCRIMINANT_2048 = -26303062852448400736455241923452966866482308096384395526310514160576340552167669914702164861501189976936903291433343112298979683878567507031460120718424968148112321203890679533268173205323118021787824265038783894900251958013721513975125740740384226483716789110232724060767180309775179644555783744334411473682484071980003044547327880606027550981774564700895172716910002024682691112770713054033516988084558900038033169769573762194878374136559592765643701858486495779123656786833373403008712143808258005782916092106755127391368771741011384961445588799674077333300198952471951793761208973147023330977523058710298812447471n;

/**
 * Get the default precomputed discriminant for a given bit size
 * @param bitSize - The bit size (256, 512, 1024, or 2048)
 * @returns The precomputed discriminant
 * @throws Error if the bit size is not supported
 */
export function getPrecomputedDiscriminant(bitSize: number): bigint {
  switch (bitSize) {
    case 256:
      return DISCRIMINANT_256;
    case 512:
      return DISCRIMINANT_512;
    case 1024:
      return DISCRIMINANT_1024;
    case 2048:
      return DISCRIMINANT_2048;
    default:
      throw new Error(
        `No precomputed discriminant for ${bitSize} bits. ` +
        `Supported sizes: 256, 512, 1024, 2048. ` +
        `Use createDiscriminant() to generate a custom one (slow).`
      );
  }
}

