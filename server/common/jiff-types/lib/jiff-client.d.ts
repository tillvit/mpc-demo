import * as sodium from 'libsodium-wrappers'
import { SecretShare } from "./client/share.js"

interface JIFFClientHelpers {
  is_prime(n: number): boolean;
  random(max: number): number;
  mod(x: number, y: number): number;
  extended_gcd(a: number, b: number): { gcd: number; x: number; y: number };
  sort_ids(array: Array<number | string>): void;
  array_equals(arr1: any[], arr2: any[]): boolean;
  BigNumber(value: any): any;
  createDeferred<T = any>(): Deferred<T>;
  Zp_equals(share1: SecretShare, share2: SecretShare): boolean;
  magnitude(decimal_digits: number): number;
  bLog(value: number): number;
  [key: string]: any;
}



interface ClientHooks {
  // Lifecycle hooks (arrays)
  beforeShare: Array<(jiff: JIFFClient, secret: any, threshold: number, receivers_list: Array<number | string>, senders_list: Array<number | string>, Zp: number) => any>;
  afterComputeShare: Array<(jiff: JIFFClient, shares: any, threshold: number, receivers_list: Array<number | string>, senders_list: Array<number | string>, Zp: number) => any>;
  receiveShare: Array<(jiff: JIFFClient, sender_id: number | string, share: any) => any>;
  beforeOpen: Array<(jiff: JIFFClient, ...args: any[]) => any>;
  receiveOpen: Array<(jiff: JIFFClient, sender_id: number | string, share: any, Zp: number) => any>;
  afterReconstructShare: Array<(jiff: JIFFClient, ...args: any[]) => any>;
  createSecretShare: Array<(jiff: JIFFClient, share: SecretShare) => SecretShare>;
  beforeOperation: Array<(jiff: JIFFClient, label: string, msg: any) => any>;
  afterOperation: Array<(jiff: JIFFClient, label: string, msg: any) => any>;

  // Single hooks (functions)
  computeShares(jiff: JIFFClient, secret: number, parties_list: Array<number | string>, threshold: number, Zp: number): Record<number | string, number>;
  reconstructShare(shares: Array<{ value: number; sender_id: number | string; Zp: number }>, threshold: number): number;
  encryptSign(jiff: JIFFClient, message: string, public_key?: Uint8Array, secret_key?: Uint8Array): string;
  decryptSign(jiff: JIFFClient, cipher: string, secret_key?: Uint8Array, public_key?: Uint8Array): string;
  generateKeyPair(jiff: JIFFClient): { public_key: Uint8Array; secret_key: Uint8Array };
  parseKey(jiff: JIFFClient, keyString: string): Uint8Array | string;
  dumpKey(jiff: JIFFClient, key: Uint8Array): string;

  // Hook execution methods
  execute_array_hooks(hook_name: string, params: any[], return_index: number): any;
  execute_single_hook(hook_name: string, params: any[]): any;
}

interface ClientHandlers {
  connected(): void;
  initialized(msg: any): void;
  receive_share(json_msg: any): void;
  receive_open(json_msg: any): void;
  error(label: string, error: string | Error): void;
  store_public_keys(public_keys: Record<number | string, any>): void;
  build_initialization_message(): any;
  [key: string]: any;
}

interface ShareHelpers {
  [key: string]: any;
}

interface BitProtocols {
  [key: string]: any;
}

interface Protocols {
  bits: BitProtocols;
  [extensionName: string]: any;
}

interface PreprocessingMap {
  [key: string]: any;
}

interface PreprocessingAPI {
  preprocessing(type: string, count: number, op_id?: string | null, threshold?: number | null, receivers_list?: Array<number | string> | null, compute_list?: Array<number | string> | null, Zp?: number | null, ids?: string[] | null, params?: any): void;
  executePreprocessing(callback?: () => void): void;
  get_preprocessing(op_id: string): any;
  [key: string]: any;
}

interface PreprocessDaemon {
  [key: string]: any;
}

interface PreprocessingInstance {
  api: PreprocessingAPI;
  daemon: PreprocessDaemon;
  [key: string]: any;
}

interface Counters {
  gen_op_id(label: string, holders: Array<number | string>): string;
  gen_op_id2(label: string, receivers_list: Array<number | string>, senders_list: Array<number | string>): string;
  [key: string]: any;
}

interface JIFFClientOptions {
  /** The ID of this party */
  party_id?: number | string;

  /** Total number of parties in the computation */
  party_count?: number;

  /** Secret key for this party (libsodium format) */
  secret_key?: Uint8Array;

  /** Public key for this party (libsodium format) */
  public_key?: Uint8Array;

  /** Map of public keys for all parties */
  public_keys?: Record<number | string, Uint8Array>;

  /** Default modulus to use for computations */
  Zp?: number;

  /** Whether to automatically connect to server */
  autoConnect?: boolean;

  /** Custom hooks configuration */
  hooks?: Partial<ClientHooks>;

  /** Custom message listeners */
  listeners?: Record<string, (sender_id: number | string, message: string) => void>;

  /** Callback when connection is established */
  onConnect?: (jiff_instance: JIFFClient) => void;

  /** Error callback */
  onError?: (label: string, error: string | Error) => void;

  /** Whether to check if Zp is prime */
  safemod?: boolean;

  /** Whether to use server as crypto provider */
  crypto_provider?: boolean;

  /** Socket.IO specific options */
  socketOptions?: any;

  /** Whether to use encryption (set to false for debugging) */
  sodium?: boolean;

  /** Maximum consecutive initialization retry attempts */
  maxInitializationRetries?: number;

  /** Batch size for preprocessing tasks */
  preprocessingBatchSize?: number;

  /** Internal socket for server-side computations */
  __internal_socket?: any;
}

/**
 * JIFF Client class for secure multi-party computation
 */
declare class JIFFClient {
  /**
   * Creates a new JIFF client instance
   * @param hostname - Server hostname/IP and port
   * @param computation_id - Unique identifier for the computation
   * @param options - Configuration options
   */
  constructor(hostname: string, computation_id: string, options?: JIFFClientOptions);

  // Core properties
  /** Server hostname with protocol and port */
  readonly hostname: string;

  /** Computation identifier */
  readonly computation_id: string;

  /** Configuration options */
  readonly options: JIFFClientOptions;

  // State properties (private - use accessor methods)
  private __ready: boolean;
  private __initialized: boolean;

  // Public accessor methods
  /** Check if instance is ready to start computation */
  isReady(): boolean;

  /** Check if instance has successfully initialized with server */
  isInitialized(): boolean;

  // Core configuration
  /** Default modulus for this instance */
  Zp: number;

  /** ID of this party */
  id?: number | string;

  /** Total number of parties in computation */
  party_count?: number;

  // Cryptography
  /** Sodium cryptographic library instance */
  sodium_: typeof sodium | false;

  /** Map from party ID to public key */
  keymap: Record<number | string, Uint8Array>;

  /** Secret key of this party */
  secret_key?: Uint8Array;

  /** Public key of this party */
  public_key?: Uint8Array;

  /** Whether to use server as crypto provider */
  crypto_provider: boolean;

  // Communication
  /** Socket connection to server */
  socket: GuardedSocket;

  /** Messages waiting for public keys */
  messagesWaitingKeys: Record<number | string, Array<{ label: string; msg: any }>>;

  /** Custom message listeners */
  listeners: Record<string, (sender_id: number | string, message: string) => void>;

  /** Mailbox for custom messages received before listeners are set */
  custom_messages_mailbox: Record<string, Array<{ sender_id: number | string; message: string }>>;

  // State management
  /** Promise barriers for synchronization */
  barriers: Record<string, any>;

  /** Wait callbacks for synchronization */
  wait_callbacks: Array<any>;

  /** Initialization attempt counter */
  initialization_counter: number;

  /** Logs for debugging */
  logs: Array<any>;

  /** Map from operation ID to received shares */
  shares: Record<string, any>;

  /** Map from operation ID to deferred objects */
  deferreds: Record<string, Deferred>;

  /** Operation counters for generating unique IDs */
  counters: Counters;

  /** Prefix for operation IDs */
  op_id_seed: string;

  // Extension system
  /** Names of applied extensions */
  extensions: string[];

  /** Helper functions */
  helpers: JIFFClientHelpers;

  /** Internal share helper functions */
  share_helpers: ShareHelpers;

  /** Secret share constructor */
  SecretShare: typeof SecretShare;

  // Core components
  /** Hook system for customization */
  hooks: ClientHooks;

  /** Communication event handlers */
  handlers: ClientHandlers;

  /** Utility functions */
  utils: Utils;

  /** Protocol implementations */
  protocols: Protocols;

  // Preprocessing
  /** Preprocessing table for pre-computed values */
  preprocessing_table: Record<string, any>;

  /** Batch size for preprocessing tasks */
  preprocessingBatchSize: number;

  /** Map of preprocessing function dependencies */
  preprocessing_function_map: Record<string, any>;

  /** Default preprocessing protocols */
  default_preprocessing_protocols: Record<string, any>;

  /** Currently executing preprocessing tasks */
  currentPreprocessingTasks: LinkedList;

  /** Preprocessing completion callback */
  preprocessingCallback?: () => void;

  preprocessing(type: string, count: number, op_id?: string | null, threshold?: number | null, receivers_list?: Array<number | string> | null, compute_list?: Array<number | string> | null, Zp?: number | null, ids?: string[] | null, params?: any): void;
  executePreprocessing(callback?: () => void): void;
  get_preprocessing(op_id: string): any;

  // Promise handling
  /** Initialization promise */
  initPromise: Promise<void>;

  /** Resolve function for initialization promise */
  resolveInit: (value?: void) => void;

  /** Reject function for initialization promise */
  rejectInit: (reason?: any) => void;

  // Core API methods
  /**
   * Share a secret input among parties
   * @param secret - The secret to share
   * @param threshold - Minimum parties needed to reconstruct
   * @param receivers_list - Parties that will receive shares
   * @param senders_list - Parties that have secrets to share
   * @param Zp - Modulus for sharing
   * @param share_id - Unique identifier for this sharing operation
   * @returns Object mapping sender IDs to their secret shares
   */
  share(
    secret?: number,
    threshold?: number,
    receivers_list?: Array<number | string>,
    senders_list?: Array<number | string>,
    Zp?: number,
    share_id?: string
  ): Record<number | string, SecretShare>;

  /**
   * Share a 2D array among parties
   * @param array - The 2D array to share
   * @param lengths - Dimension specifications
   * @param threshold - Minimum parties needed to reconstruct
   * @param receivers_list - Parties that will receive shares
   * @param senders_list - Parties that have arrays to share
   * @param Zp - Modulus for sharing
   * @param share_id - Unique identifier for this operation
   * @returns Promise to object mapping sender IDs to their shared 2D arrays
   */
  share_2D_array(
    array?: any[][],
    lengths?: { rows: number; cols?: number } & Record<string, number> | Record<number | string, { rows: number; cols?: number }>,
    threshold?: number,
    receivers_list?: Array<number | string> | null,
    senders_list?: Array<number | string> | null,
    Zp?: number | null,
    share_id?: string
  ): Promise<Record<number | string, SecretShare[][]>>;

  /**
   * Share an N-dimensional array among parties
   * @param secrets - The N-dimensional array to share
   * @param skeletons - Pre-defined array structures for each sender
   * @param threshold - Minimum parties needed to reconstruct
   * @param receivers_list - Parties that will receive shares
   * @param senders_list - Parties that have arrays to share
   * @param Zp - Modulus for sharing
   * @param share_id - Unique identifier for this operation
   * @returns Object or Promise mapping sender IDs to their shared arrays
   */
  share_ND_array(
    secrets?: any,
    skeletons?: Record<number | string, any>,
    threshold?: number,
    receivers_list?: Array<number | string>,
    senders_list?: Array<number | string>,
    Zp?: number,
    share_id?: string
  ): Record<number | string, any> | Promise<Record<number | string, any>>;

  /**
   * Open a 1D array of secret shares
   * @param shares - Array of secret shares to open
   * @param parties - Parties that will receive the opened values
   * @param op_ids - Operation identifiers for tracking
   * @returns Promise to the opened array values
   */
  open_array(
    shares: SecretShare[],
    parties?: Array<number | string>,
    op_ids?: string | Record<number | string, string>
  ): Promise<number[]>;

  /**
   * Open an N-dimensional array of secret shares
   * @param shares - N-dimensional array of secret shares to open
   * @param receivers_list - Parties that will receive the opened values
   * @param senders_list - Parties that hold the shares
   * @param op_ids - Operation identifier
   * @returns Promise to the opened N-dimensional array
   */
  open_ND_array(
    shares: any,
    receivers_list?: Array<number | string>,
    senders_list?: Array<number | string>,
    op_ids?: string
  ): Promise<any>;

  /**
   * Internal share method (used by protocols)
   */
  internal_share(
    secret?: number,
    threshold?: number,
    receivers_list?: Array<number | string>,
    senders_list?: Array<number | string>,
    Zp?: number,
    share_id?: string
  ): Record<number | string, SecretShare>;

  /**
   * Open/reveal a secret share to specified parties
   * @param share - The share to open
   * @param parties - Parties that will receive the opened value
   * @param op_id - Unique identifier for this operation
   * @returns Promise to the opened value, or null if not a receiver
   */
  open(share: SecretShare, parties?: Array<number | string>, op_id?: string): Promise<number> | null;

  /**
   * Internal open method (used by protocols)
   */
  internal_open(share: SecretShare, parties?: Array<number | string>, op_id?: string): Promise<number> | null;

  /**
   * Reshare a secret under new threshold or to new parties
   * @param share - The share to reshare
   * @param threshold - New threshold
   * @param receivers_list - New receivers
   * @param senders_list - Current holders
   * @param Zp - Modulus
   * @param op_id - Operation identifier
   * @returns Reshared secret share
   */
  reshare(
    share: SecretShare,
    threshold?: number,
    receivers_list?: Array<number | string>,
    senders_list?: Array<number | string>,
    Zp?: number,
    op_id?: string
  ): SecretShare;

  /**
   * Receive shares from specified parties (for non-senders)
   * @param senders - Parties sending shares
   * @param threshold - Reconstruction threshold
   * @param Zp - Modulus
   * @param op_id - Operation identifier
   * @returns Promise to received shares
   */
  receive_share(
    senders: Array<number | string>,
    threshold?: number,
    Zp?: number,
    op_id?: string
  ): Promise<Record<number | string, SecretShare>>;

  /**
   * Receive opened values from specified parties
   * @param senders - Parties sending opened values
   * @param threshold - Reconstruction threshold
   * @param Zp - Modulus
   * @param op_id - Operation identifier
   * @returns Promise to reconstructed secret
   */
  receive_open(
    senders: Array<number | string>,
    threshold?: number,
    Zp?: number,
    op_id?: string
  ): Promise<number>;

  // Communication methods
  /**
   * Send a custom message to specified parties
   * @param tag - Message tag/type
   * @param message - Message content
   * @param parties - Target parties
   */
  emit(tag: string, parties: Array<number | string> | null, message: any): void;

  /**
   * Listen for custom messages with specified tag
   * @param tag - Message tag to listen for
   * @param handler - Message handler function
   */
  listen(tag: string, handler: (sender_id: number | string, message: string) => void): void;

  /**
   * Remove listener for specified tag
   * @param tag - Message tag
   */
  remove_listener(tag: string): void;

  // Connection management
  /**
   * Connect to the server
   */
  connect(): void;

  /**
   * Disconnect from the server
   */
  disconnect(safe = false, free = false, callback?: () => void): Promise<void>;

  /**
   * Initialize socket connection
   */
  initSocket(): void;

  /**
   * Establish socket connection
   * @param instance - JIFF client instance
   */
  socketConnect(instance: JIFFClient): void;

  // Utility methods
  /**
   * Seed operation ID generator for uniqueness
   * @param seed - Seed string
   */
  seed_ids(seed: string): void;

  /**
   * Get preprocessing values from server
   * @param operation - Operation type
   * @param receivers_list - Receiving parties
   * @param threshold - Threshold
   * @param Zp - Modulus
   * @param op_id - Operation ID
   * @param params - Additional parameters
   * @returns Promise to preprocessing result
   */
  from_crypto_provider(
    operation: string,
    receivers_list: Array<number | string>,
    threshold: number,
    Zp: number,
    op_id: string,
    params: any
  ): Promise<{ shares?: SecretShare[]; values?: any }>;

  /**
   * Add promise to barrier for synchronization
   * @param promise - Promise to add
   */
  add_to_barriers(promise: Promise<any>): void;

  // Extension management
  /**
   * Check if extension is applied
   * @param name - Extension name
   * @returns True if extension is applied
   */
  has_extension(name: string): boolean;

  /**
   * Check if extension can be applied
   * @param name - Extension name
   * @returns True if extension can be applied
   */
  can_apply_extension(name: string): boolean | string;

  /**
   * Apply an extension
   * @param ext - Extension object
   * @param options - Extension options
   */
  apply_extension(ext: JIFFClientExtension, options?: any): void;

  /**
   * Called after extension is applied
   * @param name - Extension name
   * @param options - Extension options
   */
  extension_applied(name: string, options?: any): void;

  /**
   * Wait until the public keys of these parties are known.
   * The public keys may be known before the parties connect (if provided in the options),
   * or they could be sent by the server after the parties connect.
   * Computation specified in the callback may assume that these parties are connected,
   * if they are not, the server will handle storing and relaying the needed messages
   * to them when they connect.
   * @param parties - an array of party ids to wait for, must explicitly include 's1' if callback must wait for the server.
   * @param callback - the function to execute when these parties are known.
   * @param wait_for_initialization - specifies whether to wait for initialization to be complete
   *                                   before executing the callback (even if parties are available).
   *                                   Set this to false if you do not need the party count and this
   *                                   party's id, or if you already have them, and you are certain
   *                                   they will be accepted by the server on initialization.
   */
  wait_for(parties: Array<number | string>, callback: (instance: JIFFClient) => void, wait_for_initialization = true): void;

  /**
   * Emits event to free up all the resources allocated for this party on the server.
   * It is best not to call this function directly, as it can break things if resources still need to be used.
   * Instead, use jiff.disconnect(safe, free, callback) to free after safely disconnecting.
   */
  free(): void;
}

export default JIFFClient;