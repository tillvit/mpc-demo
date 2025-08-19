
import type JIFFClient from '../jiff-client.js'
import type { JIFFClientExtension } from './jiff-extension.js'

interface RestfulClientOptions {
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Flush interval in milliseconds */
  flushInterval?: number;
  /** Maximum batch size for messages */
  maxBatchSize?: number;
}

interface RestfulClientExtension extends JIFFClientExtension {
  name: 'restAPI';
  make_jiff(base_instance: JIFFClient, options?: RestfulClientOptions): JIFFClient;
}

declare interface JIFFClientRestful extends JIFFClient {
  /** Maximum batch size for REST messages */
  maxBatchSize: number;

  /** RESTful API methods */
  restFlush(): void;
  restPoll(): void;
}

export default RestfulClientExtension;

