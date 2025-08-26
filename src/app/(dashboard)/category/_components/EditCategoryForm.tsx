"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Image from "next/image";

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

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  categoryName: z
    .string()
    .min(2, { message: "Category name must be at least 2 characters." }),
  categorydescription: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(200, "Description must not exceed 200 characters"),
  image: z.any(),
});

export function EditCategoryForm() {
  const [preview, setPreview] = useState<string | null>();
  const params = useParams();
  const categoryId = params?.id;
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
      categorydescription: "",
      image: null,
    },
  });

 const { data: singleCategory, isLoading, isError } = useQuery({
  queryKey: ["ACategory", categoryId], // categoryId include করা ভালো cache জন্য
  queryFn: async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/singlecategory/${categoryId}`
    );

    if (!res.ok) {
      throw new Error("Failed to fetch category");
    }

    return res.json(); // response parse করা
  },
});

console.log(singleCategory)


useEffect(() => {
    if(singleCategory?.data){
        form.reset({
            categoryName: singleCategory?.data?.categoryName,
            categorydescription: singleCategory?.data?.categorydescription,
            image: singleCategory?.data?.image
        })

        setPreview(singleCategory?.data?.image)
    }
}, [singleCategory,form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Name + Description */}
          <div className="flex-1 space-y-6">
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categorydescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Description</FormLabel>
                  <FormControl>
                    <Controller
                      name="categorydescription"
                      control={form.control}
                      render={({ field: quillField }) => (
                        <ReactQuill
                          theme="snow"
                          value={quillField.value}
                          onChange={quillField.onChange}
                          placeholder="Category Description..."
                          className="min-h-[200px]"
                        />
                      )}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Right Column: Image Upload + Preview */}
          <div className="flex-1 space-y-6">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Image</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                        if (file) setPreview(URL.createObjectURL(file));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  {preview && (
                    <Image
                      src={preview}
                      width={300}
                      height={300}
                      alt="preview"
                      className="mt-4 rounded border border-gray-200 object-cover"
                    />
                  )}
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" className="mt-4">
          Submit
        </Button>
      </form>
    </Form>
  );
}
