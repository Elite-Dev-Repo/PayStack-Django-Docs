import React, { useState } from "react";
import { Menu, X } from "lucide-react";

import Sidebar from "./Sidebar";

import Introduction from "./docs/Introduction";

import QuickStart from "./docs/QuickStart";

import Configuration from "./docs/Configuration";

import Transactions from "./docs/Transactions";

import Customers from "./docs/Customers";

import Refunds from "./docs/Refunds";

import DRFSetup from "./docs/DRFSetup";

import Serializers from "./docs/Serializers";

import ViewSets from "./docs/ViewSets";

import Plans from "./docs/Plans";

import Subscriptions from "./docs/Subscriptions";

import Webhooks from "./docs/Webhooks";

import WebSockets from "./docs/WebSockets";

import Splits from "./docs/Splits";

import Testing from "./docs/Testing";

import ErrorHandling from "./docs/ErrorHandling";
const DOC_COMPONENTS = {
  introduction: Introduction,
  quickstart: QuickStart,
  configuration: Configuration,
  transactions: Transactions,
  customers: Customers,
  refunds: Refunds,
  drf: DRFSetup,
  serializers: Serializers,
  viewsets: ViewSets,
  plans: Plans,
  subscriptions: Subscriptions,
  webhooks: Webhooks,
  websockets: WebSockets,
  splits: Splits,
  testing: Testing,
  errors: ErrorHandling,
};

export default function DocsPage({ activeDoc, setActiveDoc }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const DocComponent = DOC_COMPONENTS[activeDoc] || Introduction;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-56px)] relative">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-[#00D46A] text-black p-3 rounded-full shadow-lg border-none cursor-pointer"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Component */}
      <Sidebar
        activeDoc={activeDoc}
        setActiveDoc={setActiveDoc}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Overlay for mobile when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 min-w-0 px-6 py-8 md:px-14 md:py-12 max-w-[860px]">
        <DocComponent />
      </main>
    </div>
  );
}
