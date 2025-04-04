
import { EmployeeLocation } from "@/types/map";

export interface EmployeeData {
  id: string;
  name: string;
  startTime: string;
  status: "active" | "inactive";
  lastActive: string;
  location: EmployeeLocation;
}
