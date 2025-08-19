
import type JIFFClient from '../jiff-client.js'
import { JIFFClientExtension } from './jiff-extension.js'

interface WebSocketsOptions {
  /** WebSocket server options */
  serverOptions?: any;
}

interface WebSocketsClientExtension extends JIFFClientExtension {
  name: 'websockets';
  make_jiff(base_instance: JIFFClient, options?: WebSocketsOptions): JIFFClient;
}

export default WebSocketsClientExtension;


