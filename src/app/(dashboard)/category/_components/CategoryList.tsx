"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";

function CategoryList() {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading categories...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">Error loading categories</div>
      </div>
    );
  }

  const categories = response?.data || [];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Categories</h2>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No categories found
        </div>
      ) : (
        <Table>
          <TableCaption>
            A list of all categories and their subcategories
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Category Image</TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <img
                    src={category.image}
                    alt={category.categoryName}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {category.categoryName}
                </TableCell>
                <TableCell className="max-w-xs">
                  <div
                    className="truncate"
                    title={category.categorydescription}
                  >
                    {category.categorydescription}
                  </div>
                </TableCell>
                <TableCell>
                  {category.subCategory && category.subCategory.length > 0 ? (
                    <div className="space-y-2">
                      {category.subCategory.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md"
                        >
                          <Image
                            width={200}
                            height={200}
                            src={sub.image}
                            alt={sub.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-sm">
                              {sub.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-32">
                              {sub.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      No subcategories
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </TableCell>
                {/* ✅ Actions Column */}
                <TableCell className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => console.log("Edit", category._id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => console.log("Delete", category._id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default CategoryList;
