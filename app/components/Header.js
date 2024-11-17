"use client";

import React, { useState } from "react";
import Image from "next/image";

function Header() {
    const [active, setActive] = useState("Home");

    return (
        <div className="border-b border-[#575553]">
            <nav className="flex items-center justify-between px-12 py-3">
                {/* Logo */}
                <div className="pl-5">
                    <Image
                        src="/logo.png" // Replace with your logo path
                        alt="Logo"
                        width={120} // Adjust size if needed
                        height={120}
                    />
                </div>

                <div className="pr-12">
                    {/* Menu Items */}
                    <ul className="flex space-x-16">
                        <li
                            className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${active === "Home" ? "border-b border-[#575553]" : ""
                                }`}
                            onClick={() => setActive("Home")}
                        >
                            Home
                        </li>
                        <li
                            className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${active === "About" ? "border-b border-[#575553]" : ""
                                }`}
                            onClick={() => setActive("About")}
                        >
                            About
                        </li>
                        <li
                            className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${active === "Work" ? "border-b border-[#575553]" : ""
                                }`}
                            onClick={() => setActive("Work")}
                        >
                            Work
                        </li>
                        <li
                            className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${active === "Services" ? "border-b border-[#575553]" : ""
                                }`}
                            onClick={() => setActive("Services")}
                        >
                            Services
                        </li>
                        <li
                            className={`cursor-pointer text-[#575553] text-sm font-medium pb-0.25 ${active === "Inquire" ? "border-b border-[#575553]" : ""
                                }`}
                            onClick={() => setActive("Inquire")}
                        >
                            Inquire
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    );
}

export default Header;
