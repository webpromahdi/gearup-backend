export interface IRentalOrderPayload {
  gearItemId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface IRentalOrderPayload {
  gearItemId: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export type TOrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "PAID"
  | "PICKED_UP"
  | "RETURNED"
  | "CANCELLED";
