
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import React from "react";
// import { SidebarTrigger } from "../ui/sidebar";
export interface Crumb {
  label: string;
  link?: string; // if undefined, will be treated as current page
}

interface CustomBreadcrumbProps {
  items: Crumb[];
}

export const XBreadcrumb: React.FC<CustomBreadcrumbProps> = ({ items }) => {
  if (!items.length) return null;

  const lastIndex = items.length - 1;

  return (
    <div className="flex items-center gap-2  mb-8 ">
      <Breadcrumb>
        <BreadcrumbList>
          {items.map((item, index) => (
            <React.Fragment key={item.label}>
              <BreadcrumbItem className={index !== lastIndex ? "hidden md:block" : ""}>
                {index === lastIndex || !item.link ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={item.link}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < lastIndex && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
