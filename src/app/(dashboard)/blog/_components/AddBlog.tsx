/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { ImagePlus, X, FileText, Tag, Image as ImageIconLucide, Upload, ChevronRight, ArrowLeft, Send } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Link from "next/link";

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
    <div className="min-h-screen">
      <div className="">
        {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Blogs
          </h1>
          <nav className="flex items-center text-sm text-gray-500 mt-2">
            <Link href="/dashboard" className="hover:text-gray-700">
              Dashboard
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            <span className="text-gray-900 font-medium"> Add Blogs</span>
          </nav>
        </div>
      </div>

        <Form {...form}>
          <div onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2 ">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-blue-50">
                  Enter the essential details of your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
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

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Category
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-slate-300 !h-[50px] w-full focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.data?.map((cat: any) => (
                            <SelectItem key={cat._id} value={cat.categoryName}>
                              {cat.categoryName}
                            </SelectItem>
                          )) || <p className="p-2 text-sm text-slate-500">No categories found</p>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Content
                </CardTitle>
                <CardDescription className="text-indigo-50">
                  Write your blog post content
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
                                placeholder="Start writing your amazing content here..."
                                className="min-h-[400px] bg-white"
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

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <ImageIconLucide className="w-5 h-5" />
                  Featured Image
                </CardTitle>
                <CardDescription className="text-purple-50">
                  Upload a main image for your blog post
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
                                Click to upload featured image
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

                          {preview && (
                            <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-blue-200 shadow-md">
                              <Image
                                src={preview}
                                alt="preview"
                                fill
                                className="object-cover"
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
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-t-lg py-2.5">
                <CardTitle className="flex items-center gap-2">
                  <ImagePlus className="w-5 h-5" />
                  Additional Images
                </CardTitle>
                <CardDescription className="text-pink-50">
                  Upload up to 5 supporting images
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="subImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="space-y-4">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col items-center justify-center">
                              <ImagePlus className="w-8 h-8 mb-2 text-slate-400" />
                              <p className="text-sm text-slate-600 font-medium">
                                Click to upload additional images
                              </p>
                              <p className="text-xs text-slate-500">Up to 5 images</p>
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files) {
                                  field.onChange(files);
                                  const previews = Array.from(files)
                                    .slice(0, 5)
                                    .map((f) => URL.createObjectURL(f));
                                  setAdditionalPreviews(previews);
                                }
                              }}
                            />
                          </label>

                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Array.from({ length: 5 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`aspect-square rounded-lg border-2 border-dashed relative flex items-center justify-center transition-all ${
                                  additionalPreviews[idx]
                                    ? "border-blue-300 bg-blue-50"
                                    : "border-slate-200 bg-slate-50"
                                }`}
                              >
                                {additionalPreviews[idx] ? (
                                  <>
                                    <Image
                                      src={additionalPreviews[idx]}
                                      alt={`sub-${idx}`}
                                      fill
                                      className="object-cover rounded-lg"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                                      <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                                        Image {idx + 1}
                                      </span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-center">
                                    <ImageIconLucide className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                                    <p className="text-xs text-slate-400">Slot {idx + 1}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

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
              {createBlogMutation.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {createBlogMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}