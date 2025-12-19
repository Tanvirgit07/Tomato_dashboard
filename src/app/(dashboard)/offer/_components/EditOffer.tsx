/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ChevronRight, Upload, Percent, Calendar, Tag, Image as ImageIcon, Send, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useSession } from "next-auth/react";

// ✅ Zod schema
const offerSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  discountPercentage: z
    .number()
    .min(0, { message: "Discount must be positive" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  offerType: z.enum(["percentage", "fixed"], {
    message: "Offer type is required",
  }),
  products: z.array(z.string()).optional(),
  image: z.instanceof(File).optional().nullable(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface ProductOption {
  value: string;
  label: string;
}

export function EditOffer() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  // ✅ Fetch products
  const { data: productData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data as { _id: string; name: string }[];
    },
  });

  // ✅ Fetch offer by ID
  const { data: offerData, isLoading: loadingOffer } = useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/getsingleoffer/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch offer");
      const json = await res.json();
      return json.data;
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/editoffer/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update offer");
      }

      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Offer updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["offer", id] });
      queryClient.invalidateQueries({ queryKey: ["offers"] });
    },
    onError: (error: any) => {
      console.error("Error updating offer:", error.message || error);
    },
  });

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercentage: 0,
      startDate: "",
      endDate: "",
      offerType: "percentage",
      products: [],
      image: null,
    },
  });

  const { watch, reset } = form;
  const selectedFile = watch("image");

  // ✅ Reset form when offer data loads
  useEffect(() => {
    if (offerData) {
      reset({
        title: offerData.title || "",
        description: offerData.description || "",
        discountPercentage: offerData.discountPercentage || 0,
        startDate: offerData.startDate ? offerData.startDate.split("T")[0] : "",
        endDate: offerData.endDate ? offerData.endDate.split("T")[0] : "",
        offerType: offerData.offerType || "percentage",
        products: offerData.products
          ? offerData.products.map((p: any) => p._id)
          : [],
        image: null,
      });
    }
  }, [offerData, reset]);

  function onSubmit(values: OfferFormValues) {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("discountPercentage", String(values.discountPercentage));
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    formData.append("offerType", values.offerType);
    values.products?.forEach((p) => formData.append("products", p));
    if (values.image) formData.append("image", values.image);

    updateOfferMutation.mutate(formData);
  }

  // ✅ Map products to react-select format
  const productOptions: ProductOption[] = productData
    ? productData.map((item) => ({
        value: item._id,
        label: item.name,
      }))
    : [];

  // Custom styles for react-select
  const selectStyles = {
    control: (base: any) => ({
      ...base,
      minHeight: "48px",
      borderColor: "#d1d5db",
      "&:hover": {
        borderColor: "#ef4444",
      },
      "&:focus": {
        borderColor: "#ef4444",
        boxShadow: "0 0 0 1px #ef4444",
      },
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#fee2e2",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "#991b1b",
      fontWeight: 500,
    }),
    multiValueRemove: (base: any) => ({
      ...base,
      color: "#991b1b",
      "&:hover": {
        backgroundColor: "#fecaca",
        color: "#7f1d1d",
      },
    }),
  };

  if (loadingProducts || loadingOffer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading offer data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              
              <h1 className="text-3xl font-bold text-gray-900">Edit Offer</h1>
            </div>
            <nav className="flex items-center text-sm text-gray-600">
              <Link href="/dashboard" className="hover:text-red-500 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Edit Offer</span>
            </nav>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-red-500" />
                        Offer Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., Mega Festival Offer"
                          className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Discount */}
                <FormField
                  control={form.control}
                  name="discountPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Percent className="w-4 h-4 text-red-500" />
                        Discount Value
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="20"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Offer Type */}
                <FormField
                  control={form.control}
                  name="offerType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <Tag className="w-4 h-4 text-red-500" />
                        Offer Type
                      </FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="h-12 border border-gray-300 rounded-lg px-4 w-full focus:border-red-500 focus:ring-red-500 focus:outline-none transition-colors"
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Description (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Add a detailed description of your offer..."
                          className="min-h-[120px] border-gray-300 focus:border-red-500 focus:ring-red-500 resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Duration Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-red-500" />
                Offer Duration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        Start Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        End Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Products Selection Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
                Select Products
              </h2>

              <FormField
                control={form.control}
                name="products"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Choose products for this offer
                    </FormLabel>
                    <Controller
                      control={form.control}
                      name="products"
                      render={({ field: { onChange, value } }) => (
                        <Select
                          isMulti
                          options={productOptions}
                          value={productOptions.filter((option) =>
                            value?.includes(option.value)
                          )}
                          onChange={(selected) =>
                            onChange(selected.map((item) => item.value))
                          }
                          styles={selectStyles}
                          placeholder="Search and select products..."
                          className="mt-2"
                        />
                      )}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      You can select multiple products for this offer
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-red-500" />
                Offer Banner
              </h2>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Upload Banner Image
                    </FormLabel>
                    <FormControl>
                      <div className="mt-2">
                        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all duration-200">
                          {selectedFile ? (
                            <div className="relative w-full h-full group">
                              <Image
                                width={800}
                                height={400}
                                src={URL.createObjectURL(selectedFile)}
                                alt="preview"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <Upload className="w-10 h-10 text-white" />
                              </div>
                            </div>
                          ) : offerData?.image ? (
                            <div className="relative w-full h-full group">
                              <Image
                                width={800}
                                height={400}
                                src={offerData.image}
                                alt="existing"
                                className="w-full h-full object-cover rounded-xl"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <Upload className="w-10 h-10 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6">
                              <Upload className="w-12 h-12 text-gray-400 mb-3" />
                              <p className="text-sm text-gray-600 font-medium">
                                Click to upload offer banner
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                PNG, JPG up to 10MB
                              </p>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

             {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-14">
              <div className="flex justify-end gap-4">
                <Link href="/offer">
            <Button
              type="submit"
              className="mt-4 cursor-pointer w-[120px] h-[45px] flex items-center gap-2 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            </Link>

            <Button
              type="submit"
              className="mt-4 cursor-pointer w-[120px] h-[45px] flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {updateOfferMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {updateOfferMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}