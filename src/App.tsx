import { Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Production from "./pages/Production";
import Orders from "./pages/Orders";
import Workforce from "./pages/Workforce";
import Finance from "./pages/Finance";
import Billing from "./pages/Billing";
import Payroll from "./pages/Payroll";
import Clients from "./pages/Clients";
import Exports from "./pages/Exports";
import CompetitorIntelligence from "./pages/CompetitorIntelligence";
import ShippingOptimizer from "./pages/ShippingOptimizer";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/production" element={<Production />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/workforce" element={<Workforce />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/exports" element={<Exports />} />
        <Route path="/competitor-intelligence" element={<CompetitorIntelligence />} />
        <Route path="/shipping-optimizer" element={<ShippingOptimizer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

export default App;

