/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2, X } from "lucide-react";
import Image from "next/image";
import Loading from "@/components/Shear/Loading";
import { DeleteModal } from "@/components/Modal/DeleteModal";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";

// 🔹 API Response Types
interface DeliveryAgent {
  _id: string;
  fullName: string;
  phone: string;
  area: string;
  age: number;
  nid: string;
  photo: string;
  status: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  total: number;
  data: DeliveryAgent[];
}

const RequestedBoy: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ApiResponse>({
    queryKey: ["requested-boy", statusFilter, debouncedSearch],
    queryFn: async () => {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.append("status", statusFilter);
      if (debouncedSearch) query.append("search", debouncedSearch);

      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_API_URL
        }/delivary/all-delivary-request?${query.toString()}`
      );
      if (!res.ok) throw new Error("Failed to fetch requested delivery boys");
      return res.json();
    },
  });

  // ✅ Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/delivary/delete-delivary-status/${id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Failed to delete delivery man");
      return res.json();
    },
    onSuccess: (data) => {
      setDeleteModalOpen(false);
      setSelectedId(null);
      queryClient.invalidateQueries({ queryKey: ["requested-boy"] });
      toast.success(data?.message || "Delivary Boy Delete successfully!");
    },
  });

  const confirmDelete = () => {
    if (!selectedId) return;
    deleteMutation.mutate(selectedId);
  };

  // ✅ Status update mutation
 const statusMutation = useMutation({
  mutationFn: async ({ id, status }: { id: string; status: string }) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/delivary/update-delivary-status/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }), // 👈 status + email পাঠাচ্ছি
      }
    );
    if (!res.ok) throw new Error("Failed to update status");
    return res.json();
  },
  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ["requested-boy"] });
    toast.success(data?.message || "Delivery Status Updated Successfully!");
  },
  onError: (err: any) => {
    toast.error(err.message || "Delivery status update failed!");
  },
});
  const handleStatusChange = (id: string, status: string) => {
    statusMutation.mutate({ id, status });
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <p className="text-red-500">⚠️ Error loading requests</p>
      </div>
    );

  const requestedBoys = response?.data || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex-wrap gap-4">
        <div className="flex-1 ">
          <h1 className="text-3xl font-bold text-gray-900">
            Requested Delivary Boy
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium">
              Requested Delivary Boy
            </span>
          </nav>
        </div>
        {/* Filter & Search */}
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-[250px]">
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        {requestedBoys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border text-center py-10">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No requests found
            </h3>
            <p className="text-gray-500">Try adjusting filters/search</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border mt-6 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-6 px-6 py-4 bg-gray-50 border-b">
              <div className="col-span-3 text-xs font-semibold uppercase">
                Full Name
              </div>
              <div className="col-span-2 text-xs font-semibold uppercase text-center">
                Phone
              </div>
              <div className="col-span-2 text-xs font-semibold uppercase text-center">
                Area
              </div>
              <div className="col-span-1 text-xs font-semibold uppercase text-center">
                Age
              </div>
              <div className="col-span-2 text-xs font-semibold uppercase text-center">
                Status
              </div>
              <div className="col-span-2 text-xs font-semibold uppercase text-end mr-10">
                Actions
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-100">
              {requestedBoys.map((boy: DeliveryAgent) => (
                <div
                  key={boy._id}
                  className="grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50"
                >
                  <div className="col-span-3 flex items-center gap-4">
                    <Image
                      width={56}
                      height={56}
                      src={boy.photo}
                      alt={boy.fullName}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {boy.fullName}
                      </h3>
                      <p className="text-sm text-gray-500">{boy.nid}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {boy.phone}
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {boy.area}
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {boy.age}
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    <Select
                      value={boy.status}
                      onValueChange={(val) => handleStatusChange(boy._id, val)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-3 mr-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 border-red-200"
                      onClick={() => {
                        setSelectedId(boy._id);
                        setDeleteModalOpen(true);
                      }}
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

export default RequestedBoy;
