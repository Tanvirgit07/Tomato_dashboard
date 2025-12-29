/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ImagePlus, X, FileText, Upload, ChevronRight, ArrowLeft, Send, Image as ImageIconLucide } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  slug: z.string().min(2, "Slug must be at least 2 characters."),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters."),
  content: z.string().min(10, "Content must be at least 10 characters."),
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
  const [existingFeaturedImage, setExistingFeaturedImage] = useState<string | null>(null);
  const [existingSubImages, setExistingSubImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
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
        featuredImage: null,
        subImages: null,
        isPublished: data.isPublished,
      });

      setExistingFeaturedImage(data.featuredImage?.url || null);
      setExistingSubImages(data.subImages?.map((img: any) => img.url) || []);
    }
  }, [blogData, form]);

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

  if (blogLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Edit Blog
            </h1>
            <nav className="flex items-center text-sm text-gray-500 mt-2">
              <Link href="/dashboard" className="hover:text-gray-700">
                Dashboard
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <Link href="/blogs" className="hover:text-gray-700">
                Blogs
              </Link>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">Edit Blog</span>
            </nav>
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            {/* Basic Information Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-blue-50">
                  Update the essential details of your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold">Blog Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter an engaging title..."
                          className="border-slate-300 h-[45px] focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
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
                      <FormLabel className="text-slate-700 font-semibold">URL Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="url-friendly-slug"
                          className="border-slate-300 h-[45px] focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Used in the blog post URL. Use lowercase and hyphens.
                      </FormDescription>
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
                      <FormLabel className="text-slate-700 font-semibold">Excerpt</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Write a compelling summary..."
                          className="border-slate-300 h-[45px] focus:border-blue-500 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        A brief summary that appears in previews and search results.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Content Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content
                </CardTitle>
                <CardDescription className="text-indigo-50">
                  Update your blog post content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Controller
                          name="content"
                          control={form.control}
                          render={({ field }) => (
                            <div className="rounded-lg overflow-hidden border border-slate-200">
                              <ReactQuill
                                value={field.value}
                                onChange={field.onChange}
                                theme="snow"
                                placeholder="Write your amazing content here..."
                                className="h-[400px] bg-white"
                              />
                            </div>
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Featured Image Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <ImageIconLucide className="w-5 h-5" />
                  Featured Image
                </CardTitle>
                <CardDescription className="text-purple-50">
                  Update the main image for your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="featuredImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-12 h-12 mb-3 text-slate-400" />
                              <p className="mb-2 text-sm text-slate-600 font-medium">
                                Click to upload new featured image
                              </p>
                              <p className="text-xs text-slate-500">
                                PNG, JPG or WEBP (MAX. 800x400px)
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                field.onChange(file);
                                if (file) setPreview(URL.createObjectURL(file));
                              }}
                            />
                          </label>

                          {preview ? (
                            <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
                              <Image
                                src={preview}
                                alt="preview"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setPreview(null);
                                  field.onChange(null);
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                                New Image
                              </div>
                            </div>
                          ) : existingFeaturedImage ? (
                            <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-slate-200 shadow-md">
                              <Image
                                src={existingFeaturedImage}
                                alt="existing featured"
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div className="absolute bottom-2 left-2 bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-medium">
                                Current Image
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Existing Sub Images Display */}
            {existingSubImages.length > 0 && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg py-2.5">
                  <CardTitle className="flex items-center gap-2">
                    <ImagePlus className="w-5 h-5" />
                    Current Additional Images
                  </CardTitle>
                  <CardDescription className="text-pink-50">
                    These are your existing additional images
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingSubImages.map((url, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg border-2 border-slate-200 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                      >
                        <Image
                          src={url}
                          alt={`subImage-${idx}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                          <p className="text-white text-xs font-medium">Image {idx + 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-14">
              <div className="flex justify-end gap-4">
                <Link href="/requested-product">
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
              {updateBlogMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {updateBlogMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}