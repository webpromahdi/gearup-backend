export type TGearItemPayload = {
  name: string;
  description: string;
  brand: string;
  pricePerDay: number;
  stock: number;
  image: string;
  address?: string;
  condition: "NEW" | "EXCELLENT" | "GOOD" | "FAIR" | "POOR";
  availability?: boolean;
  categoryId: string;
};

export interface IGearQuery {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  availability?: string;
}
