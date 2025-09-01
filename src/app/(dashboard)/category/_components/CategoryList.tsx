"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Shear/Loading";
import { ApiResponse, Category } from "@/Types/categoryTypes";

const CategoryList: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
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

  // Helper function to strip HTML tags from description
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

  const handleDelete = (categoryId: string) => {
    console.log("Delete", categoryId);
    // Add your delete logic here
  };

  if (isLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  if (isError) {
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
  }

  const categories = response?.data || [];

  return (
    <div className="">
      {/* Header Section */}
      <div className="">
        <div className="">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                Categories
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
            <div className="flex-shrink-0">
              <Link href="/category/add">
                <Button className="bg-red-500 cursor-pointer text-base hover:bg-red-600 text-white px-8 h-[50px] rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2">
                  <Plus className="!w-7 !h-7" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="">
        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No categories found
              </h3>
              <p className="text-gray-500 mb-6">
                Get started by creating your first category
              </p>
              <Link href="/category/add">
                <Button className="bg-red-500 hover:bg-red-600 text-white px-6  rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
            {/* Enhanced Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-6 px-6 py-4">
                <div className="col-span-4 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Category Name
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
                  Sub-Categorise
                </div>
                <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
                  Date Added
                </div>
                <div className="col-span-4 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">
                  Actions
                </div>
              </div>
            </div>

            {/* Enhanced Table Body */}
            <div className="divide-y divide-gray-100">
              {categories.map((category: Category, index) => (
                <div
                  key={category._id}
                  className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 transition-all duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                  }`}
                >
                  {/* Enhanced Category Name with Image */}
                  <div className="col-span-4 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-gray-100 ring-2 ring-gray-100">
                      <Image
                        width={56}
                        height={56}
                        src={category.image}
                        alt={category.categoryName}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                        {category.categoryName}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                        {stripHtml(category.categorydescription)}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Product Count */}
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold min-w-[40px] text-center">
                      {category.subCategory?.length || 0}
                    </div>
                  </div>

                  {/* Enhanced Date */}
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

                  <div className="col-span-4 flex items-center justify-center gap-3">
                    <Link href={`/category/edit/${category._id}`}>
                      <Button
                        variant="outline"
                        size="icon"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 rounded-lg shadow-sm"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 rounded-lg shadow-sm"
                      onClick={() => handleDelete(category._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with count */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Total{" "}
                  <span className="font-semibold text-gray-900">
                    {categories.length}
                  </span>{" "}
                  categories found
                </span>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>All categories loaded</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryList;
