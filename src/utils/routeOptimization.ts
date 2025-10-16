/**
 * Route Optimization Utilities
 * Implements clustering and TSP algorithms for intelligent route assignment
 */

import { House, EmployeeLocation } from "@/types/map";

interface ClusteredRoute {
  clusterId: number;
  houses: House[];
  assignedEmployee: string | null;
  employeeDistance: number;
  orderedHouses: House[];
}

interface AssignmentResult {
  house_id: string;
  employee_id: string;
  route_order: number;
  cluster_id: number;
}

/**
 * Calculate distance between two lat/lng points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * K-means clustering to group nearby addresses
 */
function clusterAddresses(houses: House[], numClusters: number): House[][] {
  if (houses.length <= numClusters) {
    return houses.map(h => [h]);
  }

  // Initialize centroids randomly
  const centroids: Array<{ lat: number; lng: number }> = [];
  const usedIndices = new Set<number>();
  
  for (let i = 0; i < numClusters; i++) {
    let randomIndex: number;
    do {
      randomIndex = Math.floor(Math.random() * houses.length);
    } while (usedIndices.has(randomIndex));
    
    usedIndices.add(randomIndex);
    centroids.push({
      lat: houses[randomIndex].latitude,
      lng: houses[randomIndex].longitude,
    });
  }

  let clusters: House[][] = [];
  let iterations = 0;
  const maxIterations = 50;

  // K-means iterations
  while (iterations < maxIterations) {
    // Assign houses to nearest centroid
    clusters = Array.from({ length: numClusters }, () => []);
    
    for (const house of houses) {
      let minDistance = Infinity;
      let closestCluster = 0;
      
      for (let i = 0; i < centroids.length; i++) {
        const distance = calculateDistance(
          house.latitude,
          house.longitude,
          centroids[i].lat,
          centroids[i].lng
        );
        
        if (distance < minDistance) {
          minDistance = distance;
          closestCluster = i;
        }
      }
      
      clusters[closestCluster].push(house);
    }

    // Update centroids
    let converged = true;
    for (let i = 0; i < numClusters; i++) {
      if (clusters[i].length === 0) continue;
      
      const avgLat = clusters[i].reduce((sum, h) => sum + h.latitude, 0) / clusters[i].length;
      const avgLng = clusters[i].reduce((sum, h) => sum + h.longitude, 0) / clusters[i].length;
      
      if (Math.abs(centroids[i].lat - avgLat) > 0.0001 || Math.abs(centroids[i].lng - avgLng) > 0.0001) {
        converged = false;
      }
      
      centroids[i] = { lat: avgLat, lng: avgLng };
    }

    iterations++;
    if (converged) break;
  }

  return clusters.filter(c => c.length > 0);
}

/**
 * Assign each cluster to the nearest available employee
 */
function assignClustersToEmployees(
  clusters: House[][],
  employees: EmployeeLocation[]
): ClusteredRoute[] {
  const onlineEmployees = employees.filter(e => e.is_online);
  
  if (onlineEmployees.length === 0) {
    console.warn("No online employees available for assignment");
    return clusters.map((houses, idx) => ({
      clusterId: idx,
      houses,
      assignedEmployee: null,
      employeeDistance: Infinity,
      orderedHouses: houses,
    }));
  }

  const routes: ClusteredRoute[] = [];
  const employeeAssignmentCount = new Map<string, number>();

  for (const cluster of clusters) {
    if (cluster.length === 0) continue;

    // Calculate cluster centroid
    const centroidLat = cluster.reduce((sum, h) => sum + h.latitude, 0) / cluster.length;
    const centroidLng = cluster.reduce((sum, h) => sum + h.longitude, 0) / cluster.length;

    // Find nearest employee
    let nearestEmployee: EmployeeLocation | null = null;
    let minDistance = Infinity;

    for (const employee of onlineEmployees) {
      const distance = calculateDistance(
        centroidLat,
        centroidLng,
        employee.latitude,
        employee.longitude
      );

      // Prefer employees with fewer assignments
      const assignmentPenalty = (employeeAssignmentCount.get(employee.employee_id) || 0) * 0.5;
      const adjustedDistance = distance + assignmentPenalty;

      if (adjustedDistance < minDistance) {
        minDistance = distance;
        nearestEmployee = employee;
      }
    }

    if (nearestEmployee) {
      employeeAssignmentCount.set(
        nearestEmployee.employee_id,
        (employeeAssignmentCount.get(nearestEmployee.employee_id) || 0) + 1
      );

      routes.push({
        clusterId: routes.length,
        houses: cluster,
        assignedEmployee: nearestEmployee.employee_id,
        employeeDistance: minDistance,
        orderedHouses: [], // Will be filled by TSP
      });
    }
  }

  return routes;
}

/**
 * Optimize route order within a cluster using nearest neighbor TSP heuristic
 */
function optimizeRouteOrder(houses: House[], startLat: number, startLng: number): House[] {
  if (houses.length <= 1) return houses;

  const unvisited = [...houses];
  const route: House[] = [];
  
  let currentLat = startLat;
  let currentLng = startLng;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLat,
        currentLng,
        unvisited[i].latitude,
        unvisited[i].longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    currentLat = nearest.latitude;
    currentLng = nearest.longitude;
  }

  return route;
}

/**
 * Main function to optimize routes
 * Groups addresses by proximity and assigns to nearest employee with optimized order
 */
export function optimizeRoutes(
  houses: House[],
  employees: EmployeeLocation[]
): AssignmentResult[] {
  const onlineEmployees = employees.filter(e => e.is_online);
  
  if (houses.length === 0 || onlineEmployees.length === 0) {
    console.warn("Cannot optimize routes: no houses or online employees");
    return [];
  }

  // Determine optimal number of clusters (one per employee, but limit based on house count)
  const numClusters = Math.min(onlineEmployees.length, Math.ceil(houses.length / 5));

  // Step 1: Cluster addresses by proximity
  const clusters = clusterAddresses(houses, numClusters);

  // Step 2: Assign clusters to nearest employees
  const routes = assignClustersToEmployees(clusters, onlineEmployees);

  // Step 3: Optimize order within each route
  const assignments: AssignmentResult[] = [];
  
  for (const route of routes) {
    if (!route.assignedEmployee) continue;

    const employee = onlineEmployees.find(e => e.employee_id === route.assignedEmployee);
    if (!employee) continue;

    // Optimize route starting from employee's current location
    const orderedHouses = optimizeRouteOrder(
      route.houses,
      employee.latitude,
      employee.longitude
    );

    // Create assignments with route order
    orderedHouses.forEach((house, index) => {
      assignments.push({
        house_id: house.id,
        employee_id: route.assignedEmployee!,
        route_order: index + 1,
        cluster_id: route.clusterId,
      });
    });
  }

  return assignments;
}

/**
 * Calculate total route distance for analysis
 */
export function calculateRouteDistance(houses: House[]): number {
  if (houses.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 0; i < houses.length - 1; i++) {
    totalDistance += calculateDistance(
      houses[i].latitude,
      houses[i].longitude,
      houses[i + 1].latitude,
      houses[i + 1].longitude
    );
  }

  return totalDistance;
}
