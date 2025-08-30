"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

function SubCategoryList() {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sub-category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getallsubcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading subcategories...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-red-500 text-lg">Error loading subcategories</div>
      </div>
    );
  }

  const subCategories = response?.data || [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Subcategories</h1>
      {subCategories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No subcategories found
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subCategories.map((sub: any) => (
              <TableRow key={sub._id}>
                <TableCell>
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell className="max-w-xs">
                  <div dangerouslySetInnerHTML={{ __html: sub.description }} />
                </TableCell>
                <TableCell>
                  {sub.category?.categoryName || "N/A"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(sub.category?.createdAt).toLocaleDateString() || "-"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(sub.category?.updatedAt).toLocaleDateString() || "-"}
                </TableCell>
                <TableCell className="flex justify-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
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

export default SubCategoryList;
