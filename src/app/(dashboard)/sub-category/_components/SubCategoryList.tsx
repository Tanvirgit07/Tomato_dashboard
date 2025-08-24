"use client";
import DeleteConfirmModal from "@/components/Shear/DeleteConfirmModal";
import { Button } from "@/components/ui/button";
import { MainSubCategory } from "@/Types/categoryTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { toast } from "sonner";

function SubCategoryList() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string>("");
  const queryClient = useQueryClient();

  const {
    data: subCategory,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["all-subcategory"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getallsubcategory`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch sub-category");
      }

      return res.json();
    },
  });

  const deleteSubCategoryMutation = useMutation({
    mutationFn: async (subCategoryId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/deleteSubCategory/${subCategoryId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete subcategory");
      }

      return await res.json();
    },
    onSuccess: (data) => {
      toast.success(data.massage || "Subcategory deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["all-subcategory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setIsOpenModal(true);
  };

  const confoirmDelete = () => {
    deleteSubCategoryMutation.mutate(selectedId);
    setIsOpenModal(false);
    setSelectedId('');
  };

  console.log(subCategory);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <h3 className="font-semibold">Error</h3>
        <p>Failed to load sub-categories. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Sub-Categories</h1>
              <p className="text-blue-100 mt-1">
                Manage and view all sub-categories
              </p>
            </div>
            <div>
              <Link href="/sub-category/add">
                <Button
                  type="button"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition duration-300 ease-in-out cursor-pointer"
                >
                  Add SubCategory
                </Button>
              </Link>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sub-Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Parent Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subCategory?.data?.map(
                  (item: MainSubCategory, index: string) => (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      {/* Image */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-16 w-16 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>

                      {/* Sub-Category Info */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm font-semibold text-gray-900">
                            {item.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {item._id.slice(-8)}
                          </div>
                        </div>
                      </td>

                      {/* Parent Category */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 border border-gray-200">
                            <img
                              src={item.category.image}
                              alt={item.category.categoryName}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.category.categoryName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.category.subCategory?.length || 0}{" "}
                              sub-categories
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4">
                        {/* <div className="text-sm text-gray-700 max-w-xs">
                          <p className="line-clamp-2">
                            {item.description || "No description available"}
                          </p>
                        </div> */}
                        <div
                          dangerouslySetInnerHTML={{
                            __html: item?.description,
                          }}
                        />
                      </td>

                      {/* Actions */}
                      <td className="flex gap-2 justify-center items-center">
                        <Link href={`/sub-category/edit/${item?._id}`}>
                          <div className="">
                            <SquarePen />
                          </div>
                        </Link>
                        <div
                          className="cursor-pointer"
                          onClick={() => handleDelete(item?._id)}
                        >
                          <Trash />
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {subCategory?.data?.length || 0} sub-categories
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        onClose={() => setIsOpenModal(false)}
        onConfirm={confoirmDelete}
        isOpen={isOpenModal}
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </div>
  );
}

export default SubCategoryList;
