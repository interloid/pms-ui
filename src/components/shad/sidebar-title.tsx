import { Link } from "react-router-dom";
import logo from "@/assets/interloid-logo.png";
import { CustomSidebarTrigger } from "./custom-sidebar-trigger";

export default function SidebarTitle() {
  return (
    <div className="flex h-16 items-center justify-between gap-2 px-2 pb-2 pt-7 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-1 group-data-[collapsible=icon]:items-center">
      <Link
        to="/products"
        className="flex items-center gap-2 transition-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center"
      >
        <img
          src={logo}
          alt="Interloid"
          loading="lazy"
          className="h-8 w-auto shrink-0 object-contain group-data-[collapsible=icon]:size-8"
        />

        <span className="font-bold group-data-[collapsible=icon]:hidden">
          Interloid
        </span>
      </Link>

      <CustomSidebarTrigger className="shrink-0 transition-none group-data-[collapsible=icon]:ml-0" />
    </div>
  );
}