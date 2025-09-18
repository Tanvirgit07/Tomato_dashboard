"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight } from "lucide-react";
import Link from "next/link";
import Loading from "@/components/Shear/Loading";
import { DeleteModal } from "@/components/Modal/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = ["pending", "approved", "rejected"];

const RequestedSellerList: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seller"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/seller/get-seller`
      );

      if (!res.ok) throw new Error("Failed to fetch sellers");
      return res.json();
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  const handleDeleteClick = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSellerId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/seller/delete/${selectedSellerId}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to delete seller");
      setDeleteModalOpen(false);
      setSelectedSellerId(null);
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading sellers
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const sellers = response?.sellers || [];

  return (
    <div className="">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Requested Sellers
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Sellers</span>
          </nav>
        </div>
      </div>

      {/* Table */}
      <div className="mt-10 bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">Seller</div>
            <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">Rating</div>
            <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">Products</div>
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">Status</div>
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">Website</div>
            <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase text-center">Colors</div>
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {sellers.map((seller: any, index: number) => (
            <div
              key={seller._id}
              className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              {/* Seller Info */}
              <div className="col-span-3 flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-600 shadow-md">
                  {seller.logo || "S"}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-base truncate">{seller.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{seller.description}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="col-span-1 flex items-center justify-center">{seller.rating}</div>

              {/* Products */}
              <div className="col-span-1 flex items-center justify-center">{seller.products}</div>
              {/* Status */}
              <div className="col-span-2 flex items-center justify-center">
                <Select defaultValue={seller.status}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Website */}
              <div className="col-span-2 flex items-center justify-center">
                <Link
                  href={seller.website}
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm truncate max-w-[150px]"
                >
                  {seller.website}
                </Link>
              </div>

              {/* Colors */}
              <div className="col-span-1 flex items-center justify-center gap-1">
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: seller.color }}
                />
                <div
                  className="w-6 h-6 rounded-full border"
                  style={{ backgroundColor: seller.lightColor }}
                />
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDeleteClick(seller._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
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

export default RequestedSellerList;
