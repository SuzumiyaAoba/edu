import { type ILogObj, Logger } from "tslog";

export const logger: Logger<ILogObj> = new Logger({
  minLevel: 3,
});
