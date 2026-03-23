import enums from "./enums";
import { default as config } from "./env/default";

const commonConfig = {
  ...config,
  ...enums
};

export default commonConfig;
