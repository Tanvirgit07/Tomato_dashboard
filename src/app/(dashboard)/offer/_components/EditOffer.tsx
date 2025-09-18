/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Select from "react-select";
import { useParams } from "next/navigation";
import { useEffect } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { useSession } from "next-auth/react";

// ✅ Zod schema
const offerSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  discountPercentage: z
    .number()
    .min(0, { message: "Discount must be positive" }),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  offerType: z.enum(["percentage", "fixed"], {
    message: "Offer type is required",
  }),
  products: z.array(z.string()).optional(),
  image: z.instanceof(File).optional().nullable(),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface ProductOption {
  value: string;
  label: string;
}

export function EditOffer() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const user = session?.user as any;
  const token = user?.accessToken;
  console.log(token);

  // ✅ Fetch products
  const { data: productData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`
      );
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data as { _id: string; name: string }[];
    },
  });

  // ✅ Fetch offer by ID
  const { data: offerData, isLoading: loadingOffer } = useQuery({
    queryKey: ["offer", id],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/getsingleoffer/${id}`
      );
      if (!res.ok) throw new Error("Failed to fetch offer");
      const json = await res.json();
      return json.data;
    },
  });

  const updateOfferMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/offer/editoffer/${id}`, // `id` = offer ID
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`, // Content-Type দেওয়া যাবে না
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update offer");
      }

      const data = await res.json();
      return data;
    },
    onSuccess: (data) => {
      console.log("Offer updated successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["offer", id] }); // refresh single offer
      queryClient.invalidateQueries({ queryKey: ["offers"] }); // refresh offers list
    },
    onError: (error: any) => {
      console.error("Error updating offer:", error.message || error);
    },
  });

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: "",
      description: "",
      discountPercentage: 0,
      startDate: "",
      endDate: "",
      offerType: "percentage",
      products: [],
      image: null,
    },
  });

  const { watch, reset } = form;
  const selectedFile = watch("image");

  // ✅ Reset form when offer data loads
  useEffect(() => {
    if (offerData) {
      reset({
        title: offerData.title || "",
        description: offerData.description || "",
        discountPercentage: offerData.discountPercentage || 0,
        startDate: offerData.startDate ? offerData.startDate.split("T")[0] : "",
        endDate: offerData.endDate ? offerData.endDate.split("T")[0] : "",
        offerType: offerData.offerType || "percentage",
        // Convert products objects to array of IDs
        products: offerData.products
          ? offerData.products.map((p: any) => p._id)
          : [],
        image: null, // keep null (use preview for existing image)
      });
    }
  }, [offerData, reset]);

  function onSubmit(values: OfferFormValues) {
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("discountPercentage", String(values.discountPercentage));
    formData.append("startDate", values.startDate);
    formData.append("endDate", values.endDate);
    formData.append("offerType", values.offerType);
    values.products?.forEach((p) => formData.append("products", p));
    if (values.image) formData.append("image", values.image);

    updateOfferMutation.mutate(formData);
  }

  // ✅ Map products to react-select format
  const productOptions: ProductOption[] = productData
    ? productData.map((item) => ({
        value: item._id,
        label: item.name,
      }))
    : [];

  if (loadingProducts || loadingOffer) return <p>Loading...</p>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Mega Festival Offer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Discount */}
        <FormField
          control={form.control}
          name="discountPercentage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="20"
                  value={field.value}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Offer Type */}
        <FormField
          control={form.control}
          name="offerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Offer Type</FormLabel>
              <FormControl>
                <select {...field} className="border rounded px-3 py-2 w-full">
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Special discounts on selected products"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Products */}
        <FormField
          control={form.control}
          name="products"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Select Products</FormLabel>
              <Controller
                control={form.control}
                name="products"
                render={({ field: { onChange, value } }) => (
                  <Select
                    isMulti
                    options={productOptions}
                    value={productOptions.filter((option) =>
                      value?.includes(option.value)
                    )}
                    onChange={(selected) =>
                      onChange(selected.map((item) => item.value))
                    }
                  />
                )}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image */}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Offer Image</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => field.onChange(e.target.files?.[0] || null)}
                />
              </FormControl>
              {selectedFile && (
                <Image
                  width={300}
                  height={300}
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  className="mt-2 h-40 object-cover rounded"
                />
              )}
              {!selectedFile && offerData?.image && (
                <Image
                  width={300}
                  height={300}
                  src={offerData.image}
                  alt="existing"
                  className="mt-2 h-40 object-cover rounded"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="md:col-span-2">
          <Button type="submit" className="w-full">
            Update Offer
          </Button>
        </div>
      </form>
    </Form>
  );
}
