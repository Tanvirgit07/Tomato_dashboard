"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { any, z } from "zod";
import { useQuery } from "@tanstack/react-query";
import Select from "react-select";

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

// Zod schema
const offerSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  discountPercentage: any(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  offerType: z.enum(["percentage", "fixed"], { message: "Offer type is required" }),
  products: z.array(z.string()).optional(),
  image: z.any().optional(),
});

interface ProductOption {
  value: string;
  label: string;
}

export function EditOffer() {
  // Fetch products from API
  const { data: productData, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/food/getAllFood`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return json.data; // শুধু data array নিবো
    },
  });

  const form = useForm<z.infer<typeof offerSchema>>({
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

  const { watch, setValue } = form;
  const selectedFile = watch("image");

  function onSubmit(values: z.infer<typeof offerSchema>) {
    console.log("Form Values:", values);
  }

  // API data কে react-select এর জন্য map করা
  const productOptions: ProductOption[] = productData
    ? productData.map((item: any) => ({
        value: item._id,
        label: item.name,
      }))
    : [];

  if (isLoading) return <p>Loading products...</p>;

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
                <Input type="number" placeholder="20" {...field} />
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

        {/* Products (Multi-select) */}
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
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="preview"
                  className="mt-2 h-40 object-cover rounded"
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="md:col-span-2">
          <Button type="submit">Create Offer</Button>
        </div>
      </form>
    </Form>
  );
}
