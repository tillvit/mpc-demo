
interface MailboxHooks {
  putInMailbox(jiff: JIFFServer, label: string, msg: any, computation_id: string, to_id: string | number): any;
  getFromMailbox(jiff: JIFFServer, computation_id: string, party_id: string | number): Array<{
    id: any;
    label: string;
    msg: any;
  }>;
  removeFromMailbox(jiff: JIFFServer, computation_id: string, party_id: string | number, mailbox_pointer: any): void;
  sliceMailbox(jiff: JIFFServer, computation_id: string, party_id: string | number, mailbox_pointer: any): void;
}

interface ServerHooks extends MailboxHooks {
  log(jiff: JIFFServer, ...args: any[]): void;
  beforeInitialization: Array<(jiff: JIFFServer, computation_id: string, msg: any, params: any) => void>;
  trackFreeIds(jiff: JIFFServer, party_count: number): Interval;
  onInitializeUsedId(jiff: JIFFServer, computation_id: string, party_id: string | number, party_count: number, msg: any): string | number;
  execute_array_hooks(hook_name: string, params: any[], return_index: number): any;
}

interface CryptoProviderHandlers {
  triplet(jiff: JIFFServer, computation_id: string, receivers_list: Array<string | number>, threshold: number, Zp: number, params: any): { secrets: number[] };
  quotient(jiff: JIFFServer, computation_id: string, receivers_list: Array<string | number>, threshold: number, Zp: number, params: any): { secrets: number[] };
  numbers(jiff: JIFFServer, computation_id: string, receivers_list: Array<string | number>, threshold: number, Zp: number, params: any): { secrets: number[] };
}

interface JIFFServerHandlers {
  initializeParty(computation_id: string, party_id: string | number, party_count: number, msg: any, _s1?: boolean): {
    success: boolean;
    error?: string;
    message?: any;
    party_id?: string | number;
  };
  share(computation_id: string, from_id: string | number, msg: any): { success: boolean; error?: string };
  open(computation_id: string, from_id: string | number, msg: any): { success: boolean; error?: string };
  custom(computation_id: string, from_id: string | number, msg: any): { success: boolean; error?: string };
  crypto_provider(computation_id: string, from_id: string | number, msg: any): { success: boolean; error?: string };
  free(computation_id: string, from_id: string | number, msg: any): { success: boolean; error?: string };
}

interface JIFFServerHelpers {
  random(max: number): number;
  number_to_bits(number: number, bitLength: number): number[];
  [key: string]: any;
}

interface JIFFServerOptions {
  hooks?: {
    beforeInitialization?: Array<(jiff: JIFFServer, computation_id: string, msg: any, params: any) => void>;
    [hookName: string]: any;
  };
  crypto_handlers?: Partial<CryptoProviderHandlers>;
  socketOptions?: any;
  sodium?: boolean;
  logs?: boolean;
}

interface ComputationMaps {
  /** Maps computation_id to array of registered party IDs */
  clientIds: Record<string, Array<string | number>>;
  /** Maps computation_id to interval object for tracking spare IDs */
  spareIds: Record<string, Interval>;
  /** Maps computation_id to maximum number of parties allowed */
  maxCount: Record<string, number>;
  /** Maps computation_id to party_id to public key */
  keys: Record<string, Record<string | number, any>>;
  /** Maps computation_id to private key */
  secretKeys: Record<string, any>;
  /** Maps computation_id to party_id to boolean indicating if party is free */
  freeParties: Record<string, Record<string | number, boolean>>;
}

interface SocketMaps {
  /** Maps computation_id to party_id to socket ID */
  socketId: Record<string, Record<string | number, string>>;
  /** Maps socket ID to computation_id */
  computationId: Record<string, string>;
  /** Maps socket ID to party_id */
  partyId: Record<string, string | number>;
}

/**
 * JIFF Server class for secure multi-party computation
 */
declare class JIFFServer {
  /**
   * Creates a new JIFF server instance
   * @param http - HTTP server instance
   * @param options - Configuration options
   */
  constructor(http: HttpServer, options?: JIFFServerOptions);

  // Core properties
  /** Configuration options passed to constructor */
  readonly options: JIFFServerOptions;

  /** HTTP server instance */
  readonly http: HttpServer;

  /** Socket.IO server instance */
  io: SocketIOServer;

  /** Sodium cryptographic library instance (if enabled) */
  sodium?: typeof sodium;

  /** Array of applied extension names */
  extensions: string[];

  // State management maps
  /** Maps for managing computation state */
  computationMaps: ComputationMaps;

  /** Maps for managing socket connections */
  socketMaps: SocketMaps;

  /** Maps computation_id to party_id to mailbox (LinkedList of messages) */
  mailbox: Record<string, Record<string | number, LinkedList>>;

  // Server-side computation support
  /** Maps computation_id to server-side computation instance */
  computation_instances_map: Record<string, JIFFClient>;

  /** Maps computation_id to deferred object for computation readiness */
  computation_instances_deferred: Record<string, Deferred>;

  // Crypto provider support
  /** Maps computation_id to operation_id to party_id to crypto data */
  cryptoMap: Record<string, Record<string, Record<string | number, {
    shares?: number[];
    values?: any;
  }>>>;

  // Core components
  /** Server hooks for customizing behavior */
  hooks: ServerHooks;

  /** Handlers for different types of messages */
  handlers: JIFFServerHandlers;

  /** Crypto provider handlers for preprocessing */
  cryptoProviderHandlers: CryptoProviderHandlers;

  /** Helper functions */
  helpers: JIFFServerHelpers;

  // Core methods
  /**
   * Initialize a new computation
   * @param computation_id - Unique identifier for the computation
   * @param party_id - ID of the party being initialized
   * @param party_count - Total number of parties in the computation
   */
  initComputation(computation_id: string, party_id: string | number, party_count: number): void;

  /**
   * Free/cleanup a computation and all associated resources
   * @param computation_id - Unique identifier for the computation to free
   */
  freeComputation(computation_id: string): void;

  /**
   * Initialize socket connections and event handlers
   */
  initSocket(): void;

  /**
   * Close all active socket connections
   */
  closeAllSockets(): void;

  /**
   * Create a server-side computation instance
   * @param computation_id - Unique identifier for the computation
   * @param options - Configuration options for the computation instance
   * @returns Promise that resolves to the computation instance
   */
  compute(computation_id: string, options?: any): JIFFClient;

  // Communication methods
  /**
   * Emit a message to a specific party
   * @param label - Message type/label
   * @param msg - Message content
   * @param computation_id - Computation identifier
   * @param to_id - Target party ID
   * @param callback - Optional callback for acknowledgment
   */
  emit(label: string, msg: any, computation_id: string, to_id: string | number, callback?: () => void): void;

  /**
   * Safely emit a message with automatic mailbox storage
   * @param label - Message type/label
   * @param msg - Message content
   * @param computation_id - Computation identifier
   * @param to_id - Target party ID
   */
  safe_emit(label: string, msg: any, computation_id: string, to_id: string | number): void;

  /**
   * Resend all pending messages from mailbox to a party
   * @param computation_id - Computation identifier
   * @param party_id - Target party ID
   */
  resend_mailbox(computation_id: string, party_id: string | number): void;

  // Extension management
  /**
   * Check if an extension is applied to this server
   * @param name - Extension name
   * @returns True if extension is applied
   */
  has_extension(name: string): boolean;

  /**
   * Check if an extension can be applied to this server
   * @param name - Extension name
   * @returns True if extension can be applied, or error message
   */
  can_apply_extension(name: string): boolean | string;

  /**
   * Apply an extension to this server
   * @param ext - Extension object with name and make_jiff function
   * @param options - Extension-specific options
   */
  apply_extension(ext: JIFFServerExtension, options?: any): void;

  /**
   * Called after an extension is successfully applied
   * @param name - Extension name
   * @param options - Extension options
   */
  extension_applied(name: string, options?: any): void;

  // Utility methods
  /**
   * Get a string representation of the server (for debugging)
   * @returns Object representation with sensitive data masked
   */
  repr(): object;
}

export default JIFFServer;
