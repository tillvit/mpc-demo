import type { JIFFServer } from '../jiff-server.js'
import { JIFFServerExtension } from './jiff-extension.js'

interface WebSocketsOptions {
  /** WebSocket server options */
  serverOptions?: any;
}

interface WebSocketsServerExtension extends JIFFServerExtension{
  name: 'websockets';
  make_jiff(base_instance: JIFFServer, options?: WebSocketsOptions): JIFFServer;
}

export default WebSocketsServerExtension;


