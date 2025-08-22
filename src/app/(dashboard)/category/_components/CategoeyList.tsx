"use client"
import { useQuery } from "@tanstack/react-query";
import React from "react";

function CategoryList() {
  const { data: category, isLoading, isError, error } = useQuery({
    queryKey: ["category"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/category/allcategory`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch category");
      }

      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div className="text-red-500">{(error as Error).message}</div>;

  console.log(category);

  return (
    <div>
      {category?.map((item: any) => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}

export default CategoryList;
