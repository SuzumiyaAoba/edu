import { type ILogObj, Logger } from "tslog";

export const logger: Logger<ILogObj> = new Logger({
  // 0: silly, 1: trace, 2: debug, 3: info, 4: warn, 5: error, 6: fatal
  minLevel: 2,
});
