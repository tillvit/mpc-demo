import type { JIFFServer } from '../jiff-server.js'
import BigNumberExtension from './jiff-client-bignumber.js'

declare interface JIFFServerBigNumber extends JIFFServer {
  /** Enhanced helpers with BigNumber support */
  helpers: JIFFServer['helpers'] & {
    BigNumber: (value: any) => any;
    mod: (x: any, y: any) => any;
    random: (max: any) => any;
  };
}
export default BigNumberExtension;


