export interface SubCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  publicId: string;
  __v: number;
}

export interface Category {
  _id: string;
  categoryName: string;
  categorydescription: string;
  image: string;
  publicId: string;
  subCategory: SubCategory[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}