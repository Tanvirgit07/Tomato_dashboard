/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z, any } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import Select from "react-select";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ChevronRight, Upload, Percent, Calendar, Tag, Image as ImageIcon, ArrowLeft, Send } from "lucide-react";

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
import { toast } from "sonner";
import Image from "next/image";

// Zod schema
const offerSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  discountPercentage: any(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  offerType: z.enum(["percentage", "fixed"], { message: "Offer type is required" }),
  products: z.array(z.string()).optional(),
  image: z.any().optional(),
});

interface ProductOption {
  value: string;
  label: string;
}

export function AddOffer() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  // Fetch products
  const { data: productData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data;
    },
  });

  // Mutation
  const addOfferMutation = useMutation({
    mutationFn: async (values: z.infer<typeof offerSchema>) => {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description || "");
      formData.append("discountPercentage", String(values.discountPercentage));
      formData.append("startDate", values.startDate);
      formData.append("endDate", values.endDate);
      formData.append("offerType", values.offerType);

      if (values.products) {
        values.products.forEach((p) => formData.append("products[]", p));
      }

      if (values.image) {
        formData.append("image", values.image);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/createoffer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create offer");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success("Offer created successfully!");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.message || "Something went wrong");
    },
  });

  const form = useForm<z.infer<typeof offerSchema>>({
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

  const { watch } = form;
  const selectedFile = watch("image");

  function onSubmit(values: z.infer<typeof offerSchema>) {
    addOfferMutation.mutate(values);
  }

  // react-select options
  const productOptions: ProductOption[] = productData
    ? productData.map((item: any) => ({ value: item._id, label: item.name }))
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
            </div>
            <nav className="flex items-center text-sm text-gray-600">
              <Link href="/dashboard" className="hover:text-red-500 transition-colors">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-red-500 font-medium">Create Offer</span>
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
                          {...field}
                          type="number"
                          placeholder="20"
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
                              width={300} 
                              height={300}
                                src={URL.createObjectURL(selectedFile)}
                                alt="preview"
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
              {addOfferMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {addOfferMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}