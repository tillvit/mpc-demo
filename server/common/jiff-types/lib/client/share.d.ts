
/**
 * Secret share class representing a shared secret value
 */
declare class SecretShare {
  constructor(value: number | Promise<number>, holders: Array<number | string>, threshold: number, Zp: number);

  /** The JIFF client instance this share belongs to */
  jiff: JIFFClient;

  /** Whether the share value is ready (not a promise) */
  ready: boolean;

  /** The value of the share (or a promise to it) */
  value: number | Promise<number>;

  /** Array of party IDs who hold shares of the corresponding secret */
  holders: Array<number | string>;

  /** The sharing threshold */
  threshold: number;

  /** The field prime under which the secret is shared */
  Zp: number;

  // Arithmetic operations
  /** Add a constant to this share */
  cadd(constant: number): SecretShare;

  /** Subtract a constant from this share */
  csub(constant: number): SecretShare;

  /** Multiply this share by a constant */
  cmult(constant: number): SecretShare;

  /** Add another share to this share */
  sadd(other: SecretShare, op_id?: string): SecretShare;

  /** Subtract another share from this share */
  ssub(other: SecretShare, op_id?: string): SecretShare;

  /** Multiply this share by another share */
  smult(other: SecretShare, op_id?: string): SecretShare;

  /** BGW multiplication with another share */
  smult_bgw(other: SecretShare, op_id?: string, reshare?: boolean): SecretShare;

  // Division operations
  /** Divide this share by a constant */
  cdiv(constant: number, op_id?: string): SecretShare;

  /** Divide this share by another share */
  sdiv(other: SecretShare, l?: number, op_id?: string): SecretShare;

  /** Modulo operation with another share */
  smod(other: SecretShare, op_id?: string): SecretShare;

  // Comparison operations
  /** Secret less than comparison */
  slt(other: SecretShare, op_id?: string): SecretShare;

  /** Secret less than or equal comparison */
  slteq(other: SecretShare, op_id?: string): SecretShare;

  /** Secret greater than comparison */
  sgt(other: SecretShare, op_id?: string): SecretShare;

  /** Secret greater than or equal comparison */
  sgteq(other: SecretShare, op_id?: string): SecretShare;

  /** Secret equality comparison */
  seq(other: SecretShare, op_id?: string): SecretShare;

  /** Secret inequality comparison */
  sneq(other: SecretShare, op_id?: string): SecretShare;

  /** Constant less than comparison */
  clt(constant: number, op_id?: string): SecretShare;

  /** Constant less than or equal comparison */
  clteq(constant: number, op_id?: string): SecretShare;

  /** Constant greater than comparison */
  cgt(constant: number, op_id?: string): SecretShare;

  /** Constant greater than or equal comparison */
  cgteq(constant: number, op_id?: string): SecretShare;

  /** Constant equality comparison */
  ceq(constant: number, op_id?: string): SecretShare;

  /** Constant inequality comparison */
  cneq(constant: number, op_id?: string): SecretShare;

  // Bitwise operations (for binary shares)
  /** XOR this share with a constant bit */
  cxor_bit(constant: number): SecretShare;

  /** XOR this share with another bit share */
  sxor_bit(other: SecretShare, op_id?: string): SecretShare;

  /** OR this share with a constant bit */
  cor_bit(constant: number): SecretShare;

  /** OR this share with another bit share */
  sor_bit(other: SecretShare, op_id?: string): SecretShare;

  /** Bitwise NOT of this share */
  not(): SecretShare;

  // Utility methods
  /** Open/reveal this share to specified parties */
  open(parties?: Array<number | string>, op_id?: string): Promise<number> | null;

  /** Check if a value is a constant */
  isConstant(value: any): boolean;

  /** Wait for both this share and another to be ready */
  when_both_ready<T>(other: SecretShare, callback: () => T): T | Promise<T>;

  /** Get the value of this share */
  valueOf(): number | Promise<number>;

  /** Log the value of this share (for debugging - leaks information!) */
  logLEAK(tag?: string, parties?: Array<number | string>, op_id?: string): Promise<number> | null;

  /** Handle promise resolution */
  promise_handler(value: number): number;

  /** Handle errors */
  error(error: string | Error): void;

  // Extension hooks
  /** Legacy operations object (used by extensions) */
  legacy?: { [operation: string]: (...args: any[]) => any };
}

export { SecretShare }
