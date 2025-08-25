export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  publicId: string;
  category: string;
  discountPrice: number;
  reviews: any[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface FoodResponse {
  status: boolean;
  message: string;
  allFood: Product[];
}
