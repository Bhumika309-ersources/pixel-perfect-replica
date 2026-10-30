import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export interface Crumb {
  label: string;
  to?: string;
}

export function PageHeader({
  title,
  description,
  crumbs,
  actions,
}: {
  title: string;
  description?: string;
  crumbs: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="border-b bg-card/60 px-4 py-3.5 md:px-6">
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            return (
              <Fragment key={`${crumb.label}-${i}`}>
                <BreadcrumbItem>
                  {last || !crumb.to ? (
                    <BreadcrumbPage className="font-medium">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.to} className="text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!last && <BreadcrumbSeparator><ChevronRight className="h-3 w-3" /></BreadcrumbSeparator>}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
