import { MiscellaneousApi } from "./spec-client/api";

export * from "./options";

const api = new MiscellaneousApi();

api.getHealthCheck().then((res) => {
  console.log(res.data);
});
