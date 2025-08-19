import type { JIFFClient } from './jiff-client.ts'
import type { JIFFServer } from './jiff-server.ts'

declare interface JIFFServerExtension {
  name: string;
  make_jiff(base_instance: JIFFClient | JIFFServer, options?: any): JIFFServer;
}

declare interface JIFFClientExtension {
  name: string;
  make_jiff(base_instance: JIFFClient | JIFFServer, options?: any): JIFFClient;
}

export { JIFFClientExtension, JIFFServerExtension }
