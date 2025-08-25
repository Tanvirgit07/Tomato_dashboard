"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { Edit2, Trash2, Eye, Plus } from "lucide-react";
import React from "react";
import Link from "next/link";

interface Product {
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
}

interface ApiResponse {
  status: boolean;
  message: string;
  allFood: Product[];
}

function ProductList() {
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["product"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      return res.json();
    },
  });

  const productData = product?.allFood || [];

  const handleEdit = (productId: string) => {
    console.log("Edit product:", productId);
    // Add your edit logic here
  };

  const handleDelete = (productId: string) => {
    console.log("Delete product:", productId);
    // Add your delete logic here
    // You might want to show a confirmation dialog before deleting
  };

  const handleView = (productId: string) => {
    console.log("View product:", productId);
    // Add your view logic here
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("bn-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      watch: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      phone: "bg-green-100 text-green-800 hover:bg-green-200",
      laptop: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      tablet: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      default: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    };
    return colors[category.toLowerCase()] || colors.default;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading products...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-600">
            <span>⚠️ Failed to load products. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Product Management
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Manage your product inventory and track sales performance
            </CardDescription>
          </div>
           <Button asChild className="gap-2">
      <Link href="/product/add">
        <Plus className="h-4 w-4" />
        Add Product
      </Link>
    </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Products: {productData.length}</span>
          <span>•</span>
          <span>Last Updated: {new Date().toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead className="font-semibold">Product Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Discount</TableHead>
                <TableHead className="font-semibold">Reviews</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="text-center font-semibold w-[120px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <span className="text-2xl">📦</span>
                      <span>No products found</span>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                productData.map((item: Product) => (
                  <TableRow
                    key={item._id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell>
                      <Avatar className="h-12 w-12 rounded-lg">
                        <AvatarImage
                          src={item.image}
                          alt={item.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-gray-100">
                          {item.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-sm text-muted-foreground line-clamp-2 max-w-[200px]">
                          {item.description}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        // variant="secondary"
                        className={`capitalize ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.discountPrice > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {item.discountPrice}% off
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div
                        // variant={item.discountPrice > 0 ? "default" : "secondary"}
                        className="font-medium"
                      >
                        {item.discountPrice > 0
                          ? `${item.discountPrice}%`
                          : "No Discount"}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-medium">
                          {item.reviews.length > 0
                            ? item.reviews.length
                            : "No reviews"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(item._id)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                          title="View Product"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item._id)}
                          className="h-8 w-8 p-0 hover:bg-green-100 hover:text-green-600"
                          title="Edit Product"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item._id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProductList;
