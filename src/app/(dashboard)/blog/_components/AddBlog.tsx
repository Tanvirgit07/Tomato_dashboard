"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
  category: z.string().min(1, "Please select a category."),
  featuredImage: z.any().optional(),
  subImages: z
    .any()
    .optional()
    .refine((files) => !files || files.length <= 5, "Max 5 additional images."),
  isPublished: z.boolean().optional(),
});

export function AddBlog() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;
  console.log(user)

  const [preview, setPreview] = useState<string | null>(null);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      category: "",
      featuredImage: null,
      subImages: null,
      isPublished: false,
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`
      );
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  // Mutation to create blog
  const createBlogMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/addblog`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create blog");
      }
      return res.json();
    },
    onSuccess: (data) => toast.success(data.message || "Blog created successfully"),
    onError: (error: any) => toast.error(error.message),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("slug", values.slug);
    formData.append("excerpt", values.excerpt);
    formData.append("content", values.content);
    formData.append("category", values.category);
    formData.append("authorName", user?.name || "Admin");
    formData.append("authorId", user?.id || "");

    if (values.featuredImage) formData.append("featuredImage", values.featuredImage);

    if (values.subImages) {
      const files = Array.from(values.subImages as FileList);
      files.forEach((file) => formData.append("subImages", file));
    }

    if (values.isPublished !== undefined)
      formData.append("isPublished", values.isPublished.toString());

    createBlogMutation.mutate(formData);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Add Blog</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter blog title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter unique slug" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Excerpt */}
          <FormField
            control={form.control}
            name="excerpt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt</FormLabel>
                <FormControl>
                  <Input placeholder="Short summary" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Content */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Controller
                    name="content"
                    control={form.control}
                    render={({ field }) => (
                      <ReactQuill
                        value={field.value}
                        onChange={field.onChange}
                        theme="snow"
                        placeholder="Write blog content here..."
                        className="min-h-[300px]"
                      />
                    )}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.data?.map((cat: any) => (
                      <SelectItem key={cat._id} value={cat.categoryName}>
                        {cat.categoryName}
                      </SelectItem>
                    )) || <p>No categories found</p>}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Featured Image */}
          <FormField
            control={form.control}
            name="featuredImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Featured Image</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      field.onChange(file);
                      if (file) setPreview(URL.createObjectURL(file));
                    }}
                  />
                </FormControl>
                {preview && (
                  <div className="w-full h-64 mt-2 relative border border-gray-300 rounded">
                    <Image src={preview} alt="preview" fill className="object-cover rounded" />
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Additional Images */}
          <FormField
            control={form.control}
            name="subImages"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Images (up to 5)</FormLabel>
                <FormControl>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files) {
                        field.onChange(files);
                        const previews = Array.from(files).slice(0, 5).map((f) => URL.createObjectURL(f));
                        setAdditionalPreviews(previews);
                      }
                    }}
                  />
                </FormControl>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-full h-40 border border-gray-300 rounded relative flex items-center justify-center bg-gray-50"
                    >
                      {additionalPreviews[idx] && (
                        <Image
                          src={additionalPreviews[idx]}
                          alt={`sub-${idx}`}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Add Blog
          </Button>
        </form>
      </Form>
    </div>
  );
}
