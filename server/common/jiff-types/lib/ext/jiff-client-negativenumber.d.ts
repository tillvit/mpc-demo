
import type JIFFClient from '../jiff-client.js'
import type { JIFFClientExtension } from './jiff-extension.js'

interface NegativeNumberOptions {
  /** Offset for negative number representation */
  offset?: any; // BigNumber
  /** Whether to show warnings */
  warn?: boolean;
}

interface NegativeNumberExtension extends JIFFClientExtension {
  name: 'negativenumber';
  make_jiff(base_instance: JIFFClient, options?: NegativeNumberOptions): JIFFClient;
}

declare interface JIFFClientNegative extends JIFFClient {
  /** Offset for negative number representation */
  offset: any; // BigNumber
}

export default NegativeNumberExtension;


