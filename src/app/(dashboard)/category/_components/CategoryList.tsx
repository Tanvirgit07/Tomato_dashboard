"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Category } from "@/Types/categoryTypes";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DeleteModal } from "@/components/Modal/DeleteModal";

function CategoryList() {
  const [open, setOpen] = useState(false);
  const [categoryId,setCategoryId] = useState<null | string>(null);
  const queryClient = useQueryClient();
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

  const categoryDeleteMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/deletecategory/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to delete category");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data?.message);
      queryClient.invalidateQueries({queryKey: ['category']})
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const handleDelete = (id: string) => {
    setOpen(true)
    setCategoryId(id);
  };

  const handleClose = () => {
    setOpen(false)
    setCategoryId(null)
  }

  const confirmDelete = () => {
    if(categoryId){
      categoryDeleteMutation.mutate(categoryId)
    }
    handleClose()
  }

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
    <div className="">
      <div className="bg-white shadow-sm border-b border-gray-200 mb-10">
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  Add New Category
                </h1>
                <p className="text-gray-600 mt-1">
                  Create a new category for your products
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
              <Link href="/category/add">
                <Button size="sm" className="ml-2">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No categories found
        </div>
      ) : (
        <Table>
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
            {categories.map((category: Category) => (
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
                    dangerouslySetInnerHTML={{
                      __html: category?.categorydescription,
                    }}
                  />
                </TableCell>
                <TableCell>
                  {category?.subCategory.length
                    ? category?.subCategory?.length
                    : "0"}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {new Date(category.updatedAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex justify-center space-x-2">
                  <Link href={`/category/edit/${category?._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => console.log("Edit", category._id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleDelete(category?._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <DeleteModal open={open} onClose={handleClose} onConfirm={confirmDelete}/>
    </div>
  );
}

export default CategoryList;
