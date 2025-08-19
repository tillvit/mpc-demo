import type { SecretShare } from './lib/client/share.js'
import type JIFFClient from './lib/jiff-client.js'
import type JIFFServer from './lib/jiff-server.js'

import { JIFFClientExtension, JIFFServerExtension } from './ext/jiff-extension.js'

import BigNumberExtension from './ext/jiff-client-bignumber.js'
import DebuggingExtension from './ext/jiff-client-debugging.js'
import FixedPointExtension from './ext/jiff-client-fixedpoint.js'
import NegativeNumberExtension from './ext/jiff-client-negative.js'
import PerformanceExtension from './ext/jiff-client-performance.js'
import RestfulClientExtension from './ext/jiff-client-restful.js'
import WebSocketsClientExtension from './ext/jiff-client-websockets.js'

import RestfulServerExtension from './ext/jiff-server-restful.js'
import WebSocketsServerExtension from './ext/jiff-server-websockets.js'


// Import types for internal components
interface LinkedList<T = any> {
  add(item: T): any;
  remove(pointer: any): void;
  slice(pointer: any): void;
  head: any;
}

interface Deferred<T = any> {
  resolve(value?: T): void;
  reject(reason?: any): void;
  promise: Promise<T>;
}

interface Utils {
  [key: string]: any;
}

interface GuardedSocket {
  on(event: string, callback: (...args: any[]) => void): void;
  emit(event: string, data: any): void;
  safe_emit(event: string, data: string): void;
  connect(): void;
  safe_disconnect(free: boolean): Promise<void>;
  connected: boolean;
}

// Import types for internal components
interface LinkedList<T = any> {
  add(item: T): any;
  remove(pointer: any): void;
  slice(pointer: any): void;
  head: any;
}

interface Deferred<T = any> {
  resolve(value?: T): void;
  reject(reason?: any): void;
  then(callback: (value: T) => void): void;
}

interface Interval {
  is_free(id: number | string): boolean;
}



interface PerformanceOptions {
  /** URL to audio file for performance indication */
  url?: string;
  /** Element ID to attach audio element */
  elementId?: string;
}

declare module 'jiff-mpc' {
  export default JIFF = {
    JIFFServer: JIFFServer,
    JIFFClient: JIFFClient,
    JIFFClientBigNumber: BigNumberExtension,
    JIFFClientFixedpoint: FixedPointExtension,
    JIFFClientNegative: NegativeNumberExtension,
    JIFFClientRestful: RestfulClientExtension,
    JIFFClientWebSockets: WebSocketsClientExtension,
    JIFFClientDebugging: DebuggingExtension,
    JIFFClientPerformance: PerformanceExtension,
    JIFFServerBigNumber: BigNumberExtension,
    JIFFServerRestful: RestfulServerExtension,
    JIFFServerWebSockets: WebSocketsServerExtension,
  }
  export { BigNumberExtension, DebuggingExtension, FixedPointExtension, JIFFClient, JIFFClientExtension, JIFFServer, JIFFServerExtension, NegativeNumberExtension, PerformanceExtension, RestfulClientExtension, RestfulServerExtension, SecretShare, WebSocketsClientExtension, WebSocketsServerExtension }

}
export default JIFF;