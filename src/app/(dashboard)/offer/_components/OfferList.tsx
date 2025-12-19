/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { DeleteModal } from "@/components/Modal/DeleteModal";

function OfferList() {
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);

  const {
    data: offerData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["offerData"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/getalloffer`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch offers");
      }

      const data = await res.json();
      return data;
    },
  });

  const offerDeleteMutation = useMutation({
    mutationFn: async (offerId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/deleteoffer/${offerId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete offer");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["offerData"] });
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const handleDeleteClick = (id: string) => {
    setSelectedOfferId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedOfferId) return;

    offerDeleteMutation.mutate(selectedOfferId, {
      onSettled: () => {
        setDeleteModalOpen(false);
        setSelectedOfferId(null);
      },
    });
  };

  if (isLoading) return <p>Loading offers...</p>;
  if (isError)
    return (
      <p>
        Error: {error instanceof Error ? error.message : "Something went wrong"}
      </p>
    );

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            OFFERS
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link
              href="/dashboard"
              className="hover:text-gray-700 transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">Offers</span>
          </nav>
        </div>
        <Link href="/offer/add">
          <Button className="bg-red-500 text-white px-8 h-[40px] w-[150px] rounded-lg font-semibold shadow-lg hover:bg-red-600 hover:shadow-xl transition-all duration-200 flex items-center gap-2">
            <Plus className="!w-6 !h-6" />
            Add Offer
          </Button>
        </Link>
      </div>

      {/* Offer Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-100 rounded-t-lg">
            <tr>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Image
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Title
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Description
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Discount (%)
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Start Date
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                End Date
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Active
              </th>
              <th className="border-b px-6 py-3 text-left text-sm font-medium text-gray-700">
                Created By
              </th>
              <th className="border-b px-6 py-3 text-center text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {offerData?.data?.length > 0 ? (
              offerData.data.map((offer: any) => (
                <tr
                  key={offer._id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.image ? (
                      <Image
                        width={200}
                        height={200}
                        src={offer.image}
                        alt={offer.title}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.title}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.description}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.discountPercentage}%
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {new Date(offer.startDate).toLocaleDateString()}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {new Date(offer.endDate).toLocaleDateString()}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.isActive ? "Yes" : "No"}
                  </td>
                  <td className="border-b px-6 py-4 text-sm text-gray-700">
                    {offer.createdBy?.name} ({offer.createdBy?.email})
                  </td>
                  <td className="border-b px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Link href={`/offer/edit/${offer._id}`}>
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
                        onClick={() => handleDeleteClick(offer._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="border-b px-6 py-4 text-center text-gray-500"
                >
                  No offers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default OfferList;
