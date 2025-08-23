"use client"
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";

interface SubCategory {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  publicId: string;
  __v: number;
}

interface Category {
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

interface ApiResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

function CategoryList() {
  const {
    data: apiResponse,
    isLoading,
    isError,
    error
  } = useQuery<ApiResponse>({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch data");
      }
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading categories...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
        <div className="flex items-center">
          <div className="text-red-600">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="ml-2 text-red-800 font-medium">Error loading categories</span>
        </div>
        <p className="mt-2 text-red-700">{(error as Error)?.message}</p>
      </div>
    );
  }

  const categories = apiResponse?.categories || [];

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <p className="text-blue-100 mt-1">
            Total Categories: {apiResponse?.count || 0}
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Subcategories
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category, index) => (
                <tr key={category._id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {category.categoryName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs">
                      {category.categorydescription.length > 50
                        ? `${category.categorydescription.substring(0, 50)}...`
                        : category.categorydescription}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={category.image}
                        alt={category.categoryName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {category.subCategory.map((sub) => (
                        <div
                          key={sub._id}
                          className="flex items-center space-x-3 p-2 bg-blue-50 rounded-md border border-blue-100"
                        >
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100">
                            <Image
                              src={sub.image}
                              alt={sub.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {sub.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {sub.description.length > 30
                                ? `${sub.description.substring(0, 30)}...`
                                : sub.description}
                            </p>
                          </div>
                        </div>
                      ))}
                      {category.subCategory.length === 0 && (
                        <span className="text-sm text-gray-400 italic">No subcategories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(category.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {categories.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryList;