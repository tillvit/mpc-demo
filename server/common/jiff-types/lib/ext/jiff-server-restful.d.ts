import type { JIFFServer } from '../jiff-server.js'
import { JIFFServerExtension } from './jiff-extension.js'

interface RestfulServerOptions {
  /** Express application instance */
  app: ExpressApp;
  /** Maximum batch size for messages */
  maxBatchSize?: number;
  /** Custom routes configuration */
  routes?: {
    /** Route for polling */
    poll?: string;
    /** Route for initialization */
    initialization?: string;
  };
}

interface RestfulServerExtension extends JIFFServerExtension {
  name: 'restAPI';
  make_jiff(base_instance: JIFFServer, options?: RestfulServerOptions): JIFFServer;
}

declare interface JIFFServerRestful extends JIFFServer {
  /** RESTful API state */
  restful: {
    maps: {
      tags: Record<string, Record<string | number, number>>;
      pendingMessages: Record<string, Record<string | number, any>>;
    };
    handlers: Record<string, (computation_id: string, from_id: string | number, msg: any) => any>;
    initializeParty: (msg: any) => any;
    handleMessage: (computation_id: string, from_id: string | number, messages: any[]) => any;
    dumpMailbox: (computation_id: string, party_id: string | number) => any;
    freeTag: (computation_id: string, party_id: string | number, tag: number) => void;
  };
}
export default RestfulServerExtension;


