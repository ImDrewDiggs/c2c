
import { EmployeeLocation, Location } from "@/types/map";

export interface EmployeeTrackerProps {
  employeeLocations?: EmployeeLocation[];
  currentLocation?: Location | null;
}

export { InternalEmployeeTracker } from "./InternalEmployeeTracker";
