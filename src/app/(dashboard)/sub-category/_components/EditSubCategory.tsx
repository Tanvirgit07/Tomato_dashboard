"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import "react-quill-new/dist/quill.snow.css";

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
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Select } from "@headlessui/react";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Category } from "@/Types/categoryTypes";
import { toast } from "sonner";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters." }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  image: z.any().optional(),
  category: z.string().nonempty("Category is required"),
});

export function EditSubCategory() {
  const [preview, setPreview] = useState<string | null>(null);
  const params = useParams();
  const subcategoryId = params.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      image: undefined,
      category: "",
    },
  });

  // Fetch single subcategory
  const { data: singleSubcategory } = useQuery({
    queryKey: ["singleSubcategory", subcategoryId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/getsinglesubcategory/${subcategoryId}`
      );

      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch subcategory");
        } catch {
          throw new Error(
            "Failed to fetch subcategory: Server returned non-JSON"
          );
        }
      }

      return res.json();
    },
  });

  const SubcategoryOne = singleSubcategory?.data;

  // Fetch all categories
  const { data: allCategory } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch categories");
        } catch {
          throw new Error(
            "Failed to fetch categories: Server returned non-JSON"
          );
        }
      }
      return res.json();
    },
  });
  const findCategory = allCategory?.categories || [];

  const updateSubCategoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/subcategory/editsubcategory/${subcategoryId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      const contentType = res.headers.get("content-type");
      if (!res.ok) {
        if (contentType?.includes("application/json")) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to update subcategory");
        } else {
          const text = await res.text();
          throw new Error(
            text || "Failed to update subcategory: non-JSON response"
          );
        }
      }

      if (contentType?.includes("application/json")) {
        return res.json();
      } else {
        return { message: await res.text() };
      }
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Subcategory updated successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Something went wrong");
    },
  });

  // Reset form with fetched subcategory data
  useEffect(() => {
    if (SubcategoryOne) {
      form.reset({
        name: SubcategoryOne.name,
        category: SubcategoryOne.category?._id,
        description: SubcategoryOne.description,
        image: undefined,
      });
      setPreview(SubcategoryOne.image);
    }
  }, [SubcategoryOne, form]);

  // Handle form submit
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("category", values.category);

    // Handle image: new file or existing image URL
    if (values.image) {
      formData.append("image", values.image);
    } else if (SubcategoryOne?.image) {
      formData.append("image", SubcategoryOne.image);
    }

    updateSubCategoryMutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Inputs */}
          <div className="flex-1 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-[50px]"
                      placeholder="Enter category name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Select
                      className="h-[50px]"
                      {...field}
                      aria-label="Category select"
                    >
                      <option value="">Select category</option>
                      {findCategory.map((item: Category) => (
                        <option key={item._id} value={item._id}>
                          {item.categoryName}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sub Category Description</FormLabel>
                  <FormControl>
                    <ReactQuill
                      theme="snow"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write category description..."
                      className="h-[250px] rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Side: Image Upload & Preview */}
          <div className="w-full md:w-1/3 space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Sub Category Image</FormLabel>
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
                        width={300}
                        height={300}
                        src={preview}
                        alt="Preview"
                        className="h-[270px] w-full object-cover rounded-md shadow-md border border-gray-200"
                      />
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="w-full md:w-[33%] mt-5 h-[50px] text-base cursor-pointer"
          >
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
