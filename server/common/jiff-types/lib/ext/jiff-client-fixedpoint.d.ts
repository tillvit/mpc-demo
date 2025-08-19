import type JIFFClient from '../jiff-client.js'
import type { JIFFClientBigNumber } from './jiff-client-bignumber.js'
import type { JIFFClientExtension } from './jiff-extension.js'

interface FixedPointOptions {
  /** Number of decimal digits */
  decimal_digits?: number;
  /** Number of integer digits */
  integer_digits?: number;
  /** Number of free digits */
  free_digits?: number;
  /** Custom modulus */
  Zp?: any; // BigNumber
  /** Whether to show warnings */
  warn?: boolean;
}

declare interface FixedPointExtension extends JIFFClientExtension {
  name: 'fixedpoint';
  make_jiff(base_instance: JIFFClient, options?: FixedPointOptions): JIFFClient;
}

declare interface JIFFClientFixedpoint extends JIFFClientBigNumber {
  /** Number of decimal digits */
  decimal_digits: number;
  /** Number of integer digits */
  integer_digits: number;
  /** Number of free digits */
  free_digits: number;
  /** Total digits available */
  total_digits: number;

  /** Enhanced helpers for fixed-point arithmetic */
  helpers: JIFFClientBigNumber['helpers'] & {
    magnitude: (digits: number) => any;
    fits_in_digits: (num: any) => boolean;
    format_as_float: (value: any) => any;
    format_as_fixed: (value: any) => any;
    to_fixed: (value: any) => any;
  };
}

export default FixedPointExtension;


