import React, { useState } from "react";
import { BookOpen, Github, Menu, X } from "lucide-react";

export default function Navbar({ page, setPage, setActiveDoc }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  // Helper to close menu and change page
  const navigate = (p, doc = null) => {
    setPage(p);
    if (doc) setActiveDoc(doc);
    setIsOpen(false);
  };

  const navStyles = {
    background: "rgba(10,14,26,0.92)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 justify-between md:justify-start md:gap-8"
      style={navStyles}
    >
      {/* Logo Section */}
      <button
        onClick={() => navigate("landing")}
        className="flex items-center gap-2.5 font-semibold text-[15px] text-[#E8EDF5] hover:text-white transition-colors cursor-pointer bg-transparent border-none"
      >
        <span className="bg-[#00D46A] text-black text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
          PS
        </span>
        <span className="truncate">Paystack × Django</span>
      </button>

      {/* Mobile Toggle Button */}
      <button
        className="md:hidden text-[#E8EDF5] bg-transparent border-none cursor-pointer"
        onClick={toggleMenu}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 ml-auto">
        <button
          onClick={() => navigate("landing")}
          className={`text-[14px] cursor-pointer bg-transparent border-none transition-colors ${page === "landing" ? "text-[#00D46A]" : "text-[#A0ABBE] hover:text-[#E8EDF5]"}`}
        >
          Home
        </button>
        <button
          onClick={() => navigate("docs", "introduction")}
          className={`text-[14px] cursor-pointer bg-transparent border-none transition-colors flex items-center gap-1.5 ${page === "docs" ? "text-[#00D46A]" : "text-[#A0ABBE] hover:text-[#E8EDF5]"}`}
        >
          <BookOpen size={14} /> Docs
        </button>
        <a
          href="https://github.com/Elite-Dev-Repo/PayStack-Django-Docs"
          target="_blank"
          rel="noreferrer"
          className="text-[#A0ABBE] hover:text-[#E8EDF5] transition-colors"
        >
          <Github size={16} />
        </a>
        <button
          onClick={() => navigate("docs", "quickstart")}
          className="bg-[#00D46A] text-black text-[13px] font-semibold px-4 py-1.5 rounded-md cursor-pointer border-none hover:opacity-85 transition-opacity"
        >
          Get Started →
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="absolute top-14 left-0 right-0 flex flex-col p-6 gap-6 md:hidden border-b border-[rgba(255,255,255,0.06)]"
          style={navStyles}
        >
          <button
            onClick={() => navigate("landing")}
            className={`text-left text-[16px] bg-transparent border-none ${page === "landing" ? "text-[#00D46A]" : "text-[#A0ABBE]"}`}
          >
            Home
          </button>
          <button
            onClick={() => navigate("docs", "introduction")}
            className={`text-left text-[16px] bg-transparent border-none flex items-center gap-2 ${page === "docs" ? "text-[#00D46A]" : "text-[#A0ABBE]"}`}
          >
            <BookOpen size={18} /> Docs
          </button>
          <div className="flex items-center justify-between">
            <a
              href="https://github.com/Elite-Dev-Repo/PayStack-Django-Docs"
              target="_blank"
              rel="noreferrer"
              className="text-[#A0ABBE]"
            >
              <Github size={20} />
            </a>
            <button
              onClick={() => navigate("docs", "quickstart")}
              className="bg-[#00D46A] text-black text-[14px] font-semibold px-5 py-2 rounded-md border-none"
            >
              Get Started →
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
