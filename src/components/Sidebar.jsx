import { SIDEBAR_SECTIONS } from "../data/docs";

export default function Sidebar({
  activeDoc,
  setActiveDoc,
  isOpen,
  setIsOpen,
}) {
  const handleItemClick = (id) => {
    setActiveDoc(id);
    if (setIsOpen) setIsOpen(false); // Close mobile menu on selection
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:flex-shrink-0 md:sticky md:top-14 md:h-[calc(100vh-56px)]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        overflow-y-auto py-5
      `}
      style={{
        background: "#111622",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        marginTop: isOpen ? "0" : "", // Ensures it starts below navbar if relative
      }}
    >
      {SIDEBAR_SECTIONS.map((section) => (
        <div key={section.title} className="mb-1">
          <div className="px-5 py-2 text-[10px] font-semibold text-[#5A6478] tracking-[1.2px] uppercase">
            {section.title}
          </div>
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full text-left px-5 py-1.5 text-[13px] cursor-pointer bg-transparent border-none transition-all border-l-2 ${
                activeDoc === item.id
                  ? "text-[#00D46A] bg-[rgba(0,212,106,0.06)] border-l-[#00D46A]"
                  : "text-[#A0ABBE] border-l-transparent hover:text-[#E8EDF5] hover:bg-[#161D2E]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}
