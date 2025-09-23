"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

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

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
//   category: z.string().min(1, "Please select a category."),
  featuredImage: z.any().optional(),
  subImages: z
    .any()
    .optional()
    .refine((files) => !files || files.length <= 5, "Max 5 additional images."),
  isPublished: z.boolean().optional(),
});

export function EditBlog() {
  const { id } = useParams();
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;

  const [preview, setPreview] = useState<string | null>(null);
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<
    string | null
  >(null);
  const [existingSubImages, setExistingSubImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
    //   category: "",
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

  // Fetch blog by ID
  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ["blog", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/getsingleblog/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch blog");
      return res.json();
    },
  });

  // Reset form and set previews when blog data loads
  useEffect(() => {
    if (blogData?.success && blogData.data) {
      const data = blogData.data;

      form.reset({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        // category: data.category,
        featuredImage: null,
        subImages: null,
        isPublished: data.isPublished,
      });

      setExistingFeaturedImage(data.featuredImage?.url || null);
      setExistingSubImages(data.subImages?.map((img: any) => img.url) || []);
    }
  }, [blogData]);

  // Mutation to update blog
  const updateBlogMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/editblog/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update blog");
      }
      return res.json();
    },
    onSuccess: (data) =>
      toast.success(data.message || "Blog updated successfully"),
    onError: (error: any) => toast.error(error.message),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("slug", values.slug);
    formData.append("excerpt", values.excerpt);
    formData.append("content", values.content);
    // formData.append("category", values.category);
    formData.append("authorName", user?.name || "Admin");
    formData.append("authorId", user?.id || "");

    if (values.featuredImage) {
      formData.append("featuredImage", values.featuredImage);
    }

    if (values.subImages) {
      const files = Array.from(values.subImages as FileList);
      files.forEach((file) => formData.append("subImages", file));
    }

    if (values.isPublished !== undefined)
      formData.append("isPublished", values.isPublished.toString());

    updateBlogMutation.mutate(formData);
  };

  if (blogLoading) return <p>Loading blog data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Blog</h1>
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

          {/* <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.data?.length > 0 ? (
                      categories.data.map((cat: any) => (
                        <SelectItem key={cat._id} value={cat.categoryName}>
                          {cat.categoryName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No categories found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          /> */}

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
                {preview ? (
                  <div className="w-full h-64 mt-2 relative border border-gray-300 rounded">
                    <Image
                      src={preview}
                      alt="preview"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                ) : existingFeaturedImage ? (
                  <div className="w-full h-64 mt-2 relative border border-gray-300 rounded">
                    <Image
                      src={existingFeaturedImage}
                      alt="existing featured"
                      fill
                      className="object-cover rounded"
                      unoptimized
                    />
                  </div>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Sub Images */}
          {existingSubImages.length > 0 && (
            <div className="flex gap-2 mt-2">
              {existingSubImages.map((url, idx) => (
                <div
                  key={idx}
                  className="w-24 h-24 relative border border-gray-300 rounded"
                >
                  <Image
                    src={url}
                    alt={`subImage-${idx}`}
                    fill
                    className="object-cover rounded"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Update Blog
          </Button>
        </form>
      </Form>
    </div>
  );
}
