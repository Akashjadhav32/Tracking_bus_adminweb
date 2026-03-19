export interface Stop {
  name: string;
  latitude: number;
  longitude: number;
  stopId?: string;
}

export interface Route {
  routeId: string;
  routeName: string;
  stops: Stop[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface LoginResponse {
  loginSuccess: boolean;
  adminId?: string;
  message?: string;
}

export interface FormData {
  email: string;
  password: string;
}

export interface Driver {
  driverId: string;
  name: string;
  phone: string;
  email: string;
  username: string;
  password: string;
  status: 'active' | 'inactive';
  assignedBusId: string | null;
  has_face_registered?: boolean;
  id?: string;
  assignedBus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DriverFormData {
  name: string;
  phone: string;
  email: string;
}
export interface Bus {
  busId: string;
  busNumber: string;
  capacity: number;
  driverId: string | null;
  routeId: string | null;
  status: 'active' | 'inactive';
  breakdownStatus?: boolean;
  breakdownReportedAt?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  route?: {
    _id: string;
    routeName: string;
    stops: Array<{
      name: string;
      lat: number;
      lng: number;
    }>;
  };
}

export interface BusFormData {
  busNumber: string;
  driverUsername: string;
  routeName: string;
  status: string;
}

export interface RouteWithPolyline {
  _id: string;
  routeName: string;
  geometry: string;
  distance: number;
  duration: number;
}