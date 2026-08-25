import type { ComponentType, ReactNode } from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";

type EmptyPageProps = {
  icon?: ComponentType<{
    className?: string;
  }>;
  title?: string;
  description?: string;
  children?: ReactNode;
};

export default function EmptyPage({
  icon: Icon,
  title = "Coming soon",
  description = "This page is currently under development.",
  children,
}: EmptyPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Empty>
        <EmptyHeader>
          {Icon && (
            <EmptyMedia variant="icon">
              <Icon className="size-6" />
            </EmptyMedia>
          )}
          <EmptyTitle>{title}</EmptyTitle>

          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>

        {children}
      </Empty>
    </div>
  );
}
