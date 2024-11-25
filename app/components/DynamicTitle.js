"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function updateTitle(pathname) {
  const sectionTitles = {
    "/": "www.socialitup.in",
    "/about": "About -- www.socialitup.in",
    "/work": "Work -- www.socialitup.in",
    "/services": "Services -- www.socialitup.in",
    "/inquire": "Inquire -- www.socialitup.in",
  };

  return sectionTitles[pathname] || "www.socialitup.in";
}

export default function DynamicTitle() {
  const pathname = usePathname();

  useEffect(() => {
    document.title = updateTitle(pathname);
  }, [pathname]);

  return null;
}
