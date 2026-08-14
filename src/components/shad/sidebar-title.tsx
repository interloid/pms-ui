import logo from "@/assets/interloid-logo.png";
import { CustomSidebarTrigger } from "./customized-sidetrigger";

export default function SidebarTitle() {
  return (
    <div
      className="
        flex h-16 items-center justify-between gap-2 px-2 pb-2
        group-data-[collapsible=icon]:flex-col
        group-data-[collapsible=icon]:justify-center
        group-data-[collapsible=icon]:gap-1  
        group-data-[collapsible=icon]:items-center
      "
    >
      <a href="/dashboard" className="flex items-center gap-2">
        <img
          src={logo}
          alt="Interloid"
          className="
      h-8 w-auto object-contain
      group-data-[collapsible=icon]:h-8
      group-data-[collapsible=icon]:w-8
    "
        />

        <span
          className="
      font-bold
      group-data-[collapsible=icon]:hidden
    "
        >
          Interloid
        </span>
      </a>

      <CustomSidebarTrigger className="ml-autogroup-data-[collapsible=icon]:ml-0" />
    </div>
  );
}
