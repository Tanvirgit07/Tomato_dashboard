import Header from "@/components/Header/Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import React from "react";

function layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="flex">
        <Sidebar />
        <div className="w-full mt-[80px] p-6">{children}</div>
      </div>
    </>
  );
}

export default layout;
