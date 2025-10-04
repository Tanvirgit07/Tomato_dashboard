"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  DollarSign,
  FileText,
  LogOut,
  ShoppingCart,
  Grip,
  ShoppingBasket,
  Scissors,
  MessageSquare,
  // Bell,
} from "lucide-react";
import Image from "next/image";
// import logoImage from "@/public/images/logo.svg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  {
    name: "Requested Products",
    href: "/requested-product",
    icon: LayoutDashboard,
  },
  {
    name: "Approved Products",
    href: "/approved-product",
    icon: LayoutDashboard,
  },
  { name: "Main Category", href: "/category", icon: Grip },
  { name: "Sub Category", href: "/sub-category", icon: ShoppingBasket },
  { name: "SR Category List", href: "/sr-category", icon: ShoppingBasket },
  {
    name: "SR Sub Category List",
    href: "/sr-sub-category",
    icon: ShoppingBasket,
  },

  { name: "Order", href: "/orders", icon: ShoppingCart },
  { name: "Offers", href: "/offer", icon: FileText },
  { name: "Requested Boy", href: "/rquested-boy", icon: MessageSquare },
  { name: "Requested Seller", href: "/requested-seller", icon: Scissors },

  {
    name: "Blog Management",
    href: "/blog",
    icon: DollarSign,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen sticky bottom-0 top-0 w-[350px] flex-col bg-[#212121] z-50">
      {/* Logo */}
      <div className="h-[80px] flex items-center justify-start shadow-md ml-3">
        <div className="text-2xl flex gap-1 font-bold text-blue-600 uppercase tracking-wider">
          <div className="h-[50px] w-[50px]">
            <Image
              src="/images/dashboardLogo.gif"
              alt=""
              height={200}
              width={200}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-green-500">
              T<span className="text-red-400">O</span>MAT
              <span className="text-red-400">O</span>
            </h1>
            <p className="text-white text-[10px]">Tomaot.LID</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-4 flex flex-col items-center justify-start px-3 overflow-y-auto mt-3">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex w-[90%] mx-auto items-center justify-start gap-2 space-y-1 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-white text-black"
                  : "text-slate-300 hover:bg-slate-600/50 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "h-6 w-6 transition-colors duration-200",
                  isActive ? "text-black" : ""
                )}
              />
              <span
                className={cn(
                  "font-normal text-base leading-[120%] transition-colors duration-200 text-center",
                  isActive ? "text-black font-medium" : ""
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout fixed at bottom */}
      <div className="p-3">
        <div className="flex items-center justify-start space-y-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-600/50 hover:text-white cursor-pointer">
          <LogOut className="h-5 w-5" />
          <span className="font-normal text-base leading-[120%]">Log Out</span>
        </div>
      </div>
    </div>
  );
}
