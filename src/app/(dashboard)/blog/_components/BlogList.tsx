/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Loading from "@/components/Shear/Loading";
import { DeleteModal } from "@/components/Modal/DeleteModal";
import { toast } from "sonner";

const BlogList: React.FC = () => {
  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/getallblog`
      );
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return res.json();
    },
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (blogId: string) => {
    setSelectedBlogId(blogId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedBlogId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/blog/deleteblog/${selectedBlogId}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) throw new Error("Failed to delete blog");

      toast.success("Blog deleted successfully");
      setDeleteModalOpen(false);
      setSelectedBlogId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete blog");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl font-semibold mb-2">
            ⚠️ Error loading blogs
          </div>
          <p className="text-gray-600">Please try refreshing the page</p>
        </div>
      </div>
    );

  const blogs = response?.data || [];

  return (
    <div>
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
            <span className="text-gray-900 font-medium">Blogs</span>
          </nav>
        </div>
        <Link href="/blog/add">
          <Button className="bg-red-500 cursor-pointer hover:bg-red-600 text-white h-[40px] w-[130px] rounded-lg font-semibold shadow-lg flex items-center gap-2">
            <Plus className="!w-6 !h-6" />
            Add Blog
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="mt-10 bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-6 px-6 py-4">
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase">
              Featured Image
            </div>
            <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase">
              Title & Excerpt
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
              Category
            </div>
            <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase text-center">
              Author
            </div>
            {/* ✅ Actions at END */}
            <div className="col-span-3 text-xs font-semibold text-gray-600 uppercase text-end mr-5">
              Actions
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {blogs.map((blog: any, index: number) => (
            <div
              key={blog._id}
              className={`grid grid-cols-12 gap-6 px-6 py-5 hover:bg-gray-50 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              {/* Image */}
              <div className="col-span-2 flex items-center justify-center relative w-[100px] h-24">
                {blog.featuredImage?.url && (
                  <Image
                    src={blog.featuredImage.url}
                    alt={blog.title}
                    fill
                    className="object-cover rounded-lg"
                  />
                )}
              </div>

              {/* Title */}
              <div className="col-span-3 flex flex-col justify-center">
                <h3 className="font-semibold text-gray-900 truncate">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {blog.excerpt}
                </p>
              </div>

              {/* Category */}
              <div className="col-span-2 flex items-center justify-center">
                <span className="text-sm text-gray-700">{blog.category}</span>
              </div>

              {/* Author */}
              <div className="col-span-2 flex flex-col items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {blog.user.name}
                </span>
                <span className="text-xs text-gray-400">
                  {blog.user.email}
                </span>
              </div>

              {/* ✅ Actions END */}
              <div className="col-span-3 flex items-center justify-end gap-3">
                <Link href={`/blog/edit/${blog._id}`}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg"
                  onClick={() => handleDeleteClick(blog._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <DeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BlogList;
