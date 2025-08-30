"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import dynamic from "next/dynamic";
import { useState } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

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

export function AddCategoryForm() {
  const [preview, setPreview] = useState<string | null>();
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryName: "",
      categorydescription: "",
      image: null,
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (bodyData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/addcategory`,
        {
          method: "POST",
          body: bodyData, // FormData পাঠানো
        }
      );

      if (!res.ok) {
        throw new Error("Category creation failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["category"] });
      toast.success(data.message || "Category Create Successfully !");
      router.push("/category");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const formData = new FormData();
    formData.append("categoryName", values?.categoryName);
    formData.append("categorydescription", values?.categorydescription);
    if (values?.image) {
      formData.append("image", values?.image);
    }

    createCategoryMutation.mutate(formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Name + Description */}
          <div className="w-[65%] space-y-6">
            <FormField
              control={form.control}
              name="categoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Category Name"
                      className="h-[50px]"
                      {...field}
                    />
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
                      className="border border-gray-300 rounded px-3 py-3 w-full"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                        if (file) setPreview(URL.createObjectURL(file));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="mt-4 h-[268px] w-full rounded border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                    {preview ? (
                      <Image
                        src={preview}
                        width={300}
                        height={300}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">
                        No image selected
                      </span>
                    )}
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            type="submit"
            className="mt-4 w-[120px] h-[50px] flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Submit
          </Button>
        </div>
      </form>
    </Form>
  );
}
