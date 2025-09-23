/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Shear/Loading";
import { DeleteModal } from "@/components/Modal/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SRCategoryList: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // 🔹 Mutation for status change
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/update-status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleDeleteClick = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCategoryId) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/deletecategory/${selectedCategoryId}`,
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

      setDeleteModalOpen(false);
      setSelectedCategoryId(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="text-red-500 text-xl font-semibold mb-2">
              ⚠️ Error loading categories
            </div>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );

  // 🔹 Filter only pending & rejected
  const categories =
    response?.data.filter(
      (cat: any) => cat.status === "pending" || cat.status === "rejected"
    ) || [];

  return (
    <div className="">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Requested Category
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Categories</span>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <Select>
              <SelectTrigger className="w-[180px] !h-[50px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* <div>
            <Link href="/category/add">
              <Button className="bg-red-500 cursor-pointer text-base hover:bg-red-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                <Plus className="!w-7 !h-7" />
                Add Category
              </Button>
            </Link>
          </div> */}
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center py-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pending/rejected categories
            </h3>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 px-6 py-4">
                <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
                  Category Name
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Sub-Categories
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Date Added
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                  Status
                </div>
                <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase text-center">
                  Actions
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {categories.map((category: any, index: any) => (
                <div
                  key={category._id}
                  className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* Category Name */}
                  <div className="col-span-3 flex items-center gap-4">
                    <Image
                      width={56}
                      height={56}
                      src={category.image}
                      alt={category.categoryName}
                      className="w-14 h-14 rounded-xl object-cover shadow-md"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base truncate">
                        {category.categoryName}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {stripHtml(category.categorydescription)}
                      </p>
                    </div>
                  </div>

                  {/* Sub Category Count */}
                  <div className="col-span-2 flex items-center justify-center">
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {category.subCategory?.length || 0}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-sm font-medium text-gray-700 block">
                        {formatDate(category.createdAt)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(category.createdAt).toLocaleDateString(
                          "en-US",
                          { weekday: "short" }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center justify-center">
                    <Select
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({
                          id: category._id,
                          status: value,
                        })
                      }
                      defaultValue={category.status}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-center gap-3">
                    <Link href={`/category/edit/${category._id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                      onClick={() => handleDeleteClick(category._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default SRCategoryList;
