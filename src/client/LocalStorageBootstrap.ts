import { LOCAL_ONLY_FORK } from "./LocalFork";
import { installRealmspanStorageIsolation } from "./LocalStorageIsolation";

if (
  LOCAL_ONLY_FORK &&
  typeof window !== "undefined" &&
  import.meta.env.MODE !== "test"
) {
  installRealmspanStorageIsolation();
}
