import FileUploadSection from "@/components/FileUploadSection";
import MongoDBStatus from "@/components/MongoDBStatus";
import DataTable from "@/components/DataTable";

export default function Home() {
  return (
    <div className="h-screen flex flex-col">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 w-full bg-zinc-900/50 backdrop-blur-sm h-12 flex items-center px-4 border-b border-zinc-800">
        <MongoDBStatus />
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="flex h-full gap-8 justify-center items-center">
          <div className="w-full max-w-md">
            <FileUploadSection />
          </div>

          {/* White Divider */}
          <div className="h-64 w-px bg-zinc-400" />

          {/* Data Table */}
          <div className="w-full max-w-2xl">
            <DataTable />
          </div>
        </div>
      </main>
    </div>
  );
}
