import {
  CheckCircle2,
  CircleAlert,
  Info,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

export function ToasterMessage(
  props: React.ComponentProps<typeof Sonner>,
) {
  return (
    <Sonner
      {...props}
      position="bottom-right"
      duration={4000}
      icons={{
        success: <CheckCircle2 className="size-5 text-emerald-600" />,
        error: <CircleAlert className="size-5 text-red-600" />,
        warning: <TriangleAlert className="size-5 text-amber-600" />,
        info: <Info className="size-5 text-blue-600" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!w-90 !bottom-30 !rounded-lg !border !px-4 !py-3 !shadow-lg !backdrop-blur-sm",
          title:
            "!text-sm !font-semibold !leading-5",
          description:
            "!mt-1 !text-xs !leading-4 !opacity-80",
          closeButton:
            "!left-auto !right-2 !top-2 !border-0 !bg-transparent !opacity-50 hover:!opacity-100",
          success:
            "!border-emerald-200 !bg-emerald-50 !text-emerald-800",
          error:
            "!border-red-200 !bg-red-50 !text-red-800",
          warning:
            "!border-amber-200 !bg-amber-50 !text-amber-800",
          info:
            "!border-blue-200 !bg-blue-50 !text-blue-800",
        },
      }}
    />
  );
}