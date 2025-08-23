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
import React, { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Dynamically import ReactQuill to prevent SSR error
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const formSchema = z.object({
  category_name: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters." }),
  category_description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters." }),
  category_image: z.any().optional(),
});

export function AddCategoryForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const routar = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category_name: "",
      category_description: "",
      category_image: null,
    },
  });

  const addCategoryMutation = useMutation({
    mutationFn: async (bodyData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/addcategory`,
        {
          method: "POST",
          headers: {
            // "Content-Type": "application/json",
          },
          body: bodyData,
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch category");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast.success(data.message);
      routar.push('/category')
    },

    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("categoryName", values?.category_name);
    formData.append("categorydescription", values?.category_description);
    formData.append("image", values?.category_image);
    addCategoryMutation.mutate(formData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Inputs */}
          <div className="flex-1 space-y-6">
            {/* Category Name */}
            <FormField
              control={form.control}
              name="category_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
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

            {/* Category Description */}
            <FormField
              control={form.control}
              name="category_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Description</FormLabel>
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
              name="category_image"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Category Image</FormLabel>
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
