/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";
import Loading from "@/components/Shear/Loading";
import { DeleteModal } from "@/components/Modal/DeleteModal";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";

type FoodItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  image: string;
  publicId: string;
  category?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  status?: string;
  user?: {
    role: string;
  };
};

function ProductList() {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;
  console.log(token);

  // 🔹 ডিফল্ট selected status = "pending"
  const [selectedStatus, setSelectedStatus] = useState("pending");

  // ✅ Fetch food items with status filter
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["food-items", selectedStatus], // status dependency
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood?status=${selectedStatus}`
      );
      if (!res.ok) throw new Error("Failed to fetch food items");
      return res.json();
    },
  });

  const foodItems: FoodItem[] = response?.data || [];

  // ✅ Delete mutation
  const deleteProductMutation = useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/deletefood/${id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete food item");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Food item deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["food-items", selectedStatus],
      });
      setDeleteModalOpen(false);
      setSelectedId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Error deleting food item");
    },
  });

  // ✅ Status Update Mutation
  const updateStatusMutation = useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; status: string }
  >({
    mutationFn: async ({ id, status }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/foodstatusupdate/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update status");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Status updated successfully");
      queryClient.invalidateQueries({
        queryKey: ["food-items", selectedStatus],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Error updating status");
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedId) {
      deleteProductMutation.mutate(selectedId);
    }
  };

  const stripHtml = (html: string) => {
    if (typeof window === "undefined") return html;
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading food items
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Requested Products
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">
              Requested Products
            </span>
          </nav>
        </div>
        <div className="flex items-center gap-5">
          <div>
            {/* 🔹 Select দিয়ে status পরিবর্তন */}
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-[150px] !h-[40px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Link href="/approved-product/add">
              <Button className="bg-red-500 hover:bg-red-600 text-white h-[40px] w-[150px] rounded-lg font-semibold shadow-lg flex items-center gap-2">
                <Plus className="!w-5 !h-5" />
                Add Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main content */}
      {foodItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 mt-10">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No food items found
            </h3>
            <p className="text-gray-500 mb-6">
              Only {selectedStatus} products will show here
            </p>
            <Link href="/product/add">
              <Button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg inline-flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                <Plus className="w-5 h-5" />
                Add Food Item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-10">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">
                Food
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Category
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Price
              </div>
              <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">
                Discount
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Role
              </div>
              <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
                Actions
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {foodItems.map((item: any, index) => (
              <div
                key={item._id}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                }`}
              >
                {/* Food Info */}
                <div className="col-span-2 flex items-center gap-4">
                  <Image
                    width={56}
                    height={56}
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover shadow-md"
                  />
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-gray-900 text-base truncate">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {stripHtml(item.description)}
                    </p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    {item.category?.name || "N/A"}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-1 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    ${item.price}
                  </span>
                </div>

                {/* Discount */}
                <div className="col-span-1 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    {item.discountPrice}%
                  </span>
                </div>

                {/* Status Select */}
                <div className="col-span-2 flex items-center justify-center text-center">
                  <Select
                    value={item.status}
                    onValueChange={(value) =>
                      updateStatusMutation.mutate({
                        id: item._id,
                        status: value,
                      })
                    }
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

                {/* Role */}
                <div className="col-span-2 flex items-center justify-center text-center">
                  <span className="text-gray-700 font-medium">
                    {item.user?.role || "N/A"}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-center gap-3">
                  <Link href={`/approved-product/edit/${item._id}`}>
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
                    onClick={() => handleDeleteClick(item._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default ProductList;
