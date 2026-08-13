import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './ui/sidebar';
import logo from "@/assets/interloid-logo.png";

const SidebarTitle = () => {
  return (
          <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <a href="#">
              <img src={logo} alt="Interloid logo" className="h-8 w-auto object-contain"/>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Interloid</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
  )
}

export default SidebarTitle;