import type JIFFClient from '../jiff-client.js'
import JIFFServer from '../jiff-server.js'
import type { JIFFClientExtension, JIFFServerExtension } from './jiff-extension.js'

declare interface BigNumberOptions {
  /** Custom modulus for big number operations */
  Zp?: any; // BigNumber
  /** Whether to check if Zp is prime */
  safemod?: boolean;
  /** Custom crypto handlers */
  crypto_handlers?: any;
  /** Hook overrides */
  hooks?: any;
}

declare interface JIFFClientBigNumber extends JIFFClient {
  /** BigNumber constructor */
  helpers: JIFFClient['helpers'] & {
    BigNumber: (value: any) => any;
    _BigNumber: any;
    mod: (x: any, y: any) => any;
    pow_mod: (a: any, b: any, n: any) => any;
    extended_gcd: (a: any, b: any) => any[];
    bLog: (value: any, base?: number) => number;
    random: (max?: any) => any;
    Zp_equals: (s1: any, s2: any) => boolean;
  };

  /** Enhanced Zp as BigNumber */
  Zp: any; // BigNumber

  /** Enhanced protocols with BigNumber support */
  protocols: JIFFClient['protocols'] & {
    bits: {
      bit_composition: (bits: any[]) => any;
      cgt: (bits: any[], constant: any, op_id?: string) => any;
    };
  };
}

declare interface BigNumberExtension extends JIFFClientExtension, JIFFServerExtension {
  name: 'bignumber';
  make_jiff(base_instance: JIFFClient, options?: BigNumberOptions): JIFFClient;
   make_jiff(base_instance: JIFFServer, options?: BigNumberOptions): JIFFServer;
  /** Sharing schemes for big numbers */
  sharing_schemes: {
    shamir_share: (jiff: any, secret: any, parties_list: any[], threshold: number, Zp: any) => Record<string | number, any>;
    shamir_reconstruct: (jiff: any, shares: any[]) => any;
  };
  /** Utility functions */
  utils: {
    is_prime: (p: any) => boolean;
  };
  /** Set dependencies */
  dependencies: (deps: { BigNumber?: any }) => void;
}

export default BigNumberExtension;

