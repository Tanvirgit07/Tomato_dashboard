"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select } from "@headlessui/react";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MainCategory } from "@/Types/categoryTypes";
import { toast } from "sonner";

const formSchema = z.object({
  productName: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters." }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters." })
    .max(200, { message: "Description must not exceed 200 characters." }),
  price: z.coerce.number().optional(),
  discountPrice: z.coerce.number().optional(),
  category: z.string().nonempty("Category is required"),
  image: z.any().optional(),
});

export function AddProductForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      productName: "",
      description: "",
      price: 0,
      discountPrice: 0,
      category: "",
      image: null,
    },
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const category = categoryData?.categories || [];

  const createProductMutation = useMutation({
    mutationFn: async (bodyData: any) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/createFood`,
        {
          method: "POST",
          headers: {
            // "Content-Type": "application/json", // important if sending JSON
          },
          body:(bodyData), // convert JS object to JSON
        }
      );

      if (!res.ok) {
        throw new Error("Failed to create product");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Product create successfully!");
    },

    onError: (err) => {
      toast.error(err.message || "Product Create rejected !");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const formData = new FormData();
    formData.append("name", values?.productName),
      formData.append("description", values?.description),
      formData.append("price", (values.price || 0).toString());
    formData.append("discountPrice", (values.discountPrice || 0).toString());
    formData.append("image", values?.image);
    formData.append("category",values?.category)
    createProductMutation.mutate(formData);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg"
      >
        {/* Product Name */}
        <FormField
          control={form.control}
          name="productName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter product name"
                  className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-500 mt-1" />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter product description"
                  className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
              </FormControl>
              <FormMessage className="text-red-500 mt-1" />
            </FormItem>
          )}
        />

        {/* Price & Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Enter price"
                    className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 mt-1" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    placeholder="Enter discount"
                    className="rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                </FormControl>
                <FormMessage className="text-red-500 mt-1" />
              </FormItem>
            )}
          />
        </div>

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full h-[50px] border border-gray-300 rounded-md px-3 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {category.map((item: MainCategory) => (
                    <option key={item._id} value={item.categoryName}>
                      {item.categoryName}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage className="text-red-500 mt-1" />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Image</FormLabel>
              <FormControl>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition">
                  <span className="text-gray-500 mb-2">
                    Click or drop an image here
                  </span>
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      field.onChange(file);
                      setPreview(file ? URL.createObjectURL(file) : null);
                    }}
                  />
                  {field.value && (
                    <span className="text-sm text-gray-700">
                      {field.value.name}
                    </span>
                  )}
                </label>
              </FormControl>
              {preview && (
                <div className="mt-2">
                  <Image
                    src={preview}
                    alt="Preview"
                    width={300}
                    height={300}
                    className="h-[270px] w-full object-cover rounded-md shadow-md border border-gray-200"
                  />
                </div>
              )}
              <FormMessage className="text-red-500 mt-1" />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-1/3">
          Submit
        </Button>
      </form>
    </Form>
  );
}
