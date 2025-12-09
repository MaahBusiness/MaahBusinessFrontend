// Type declarations for JSX modules not yet converted to TypeScript

declare module "./components/Reports/Reports" {
  const Reports: React.ComponentType;
  export default Reports;
}

declare module "./components/Category/Category" {
  const Category: React.ComponentType;
  export default Category;
}

declare module "./components/Dashboard/Dashboard" {
  const Dashboard: React.ComponentType;
  export default Dashboard;
}

declare module "./components/invoice/Invoice" {
  const Invoice: React.ComponentType;
  export default Invoice;
}

declare module "./components/Notification/Notification" {
  const Notification: React.ComponentType;
  export default Notification;
}

declare module "./components/invoice/ArchiveManager" {
  interface ArchiveManagerProps {
    onBack?: () => void;
  }
  const ArchiveManager: React.ComponentType<ArchiveManagerProps>;
  export default ArchiveManager;
}

// Image declarations
declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.svg" {
  const src: string;
  export default src;
}

