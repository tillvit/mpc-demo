
import type JIFFClient from '../jiff-client.js'

interface DebuggingOptions {
  /** Whether to enable detailed logging */
  verbose?: boolean;
  /** Custom logging function */
  logger?: (message: string, ...args: any[]) => void;
}

interface DebuggingExtension {
  name: 'debugging';
  make_jiff(base_instance: JIFFClient, options?: DebuggingOptions): JIFFClient;
}

export default DebuggingExtension;


