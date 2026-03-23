import * as lodash from "lodash";
import { v4 as uuid } from "uuid";
import commonConfig from "./config/common";
import Helper from "./utils/helper";

// reference manager
const helper = () => {
  return Helper;
};

export { lodash, commonConfig, uuid, helper };
