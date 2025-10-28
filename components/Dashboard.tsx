import { Header } from "./Header";
import CalendarModule from "./CalendarModule";
import { ReportModule } from "./ReportModule";
import { SearchModule } from "./SearchModule";

export const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content - Two Column Layout 50/50 */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Column - Calendar Module (50%) */}
        <div className="w-1/2 p-6 pr-3">
          <CalendarModule />
        </div>
        
        {/* Right Column - Report & Search Modules (50%) */}
        <div className="w-1/2 p-6 pl-3 flex flex-col space-y-6">
          {/* Top Sub-module - Report Module */}
          <div className="flex-1">
            <ReportModule />
          </div>
          
          {/* Bottom Sub-module - Search Module */}
          <div className="flex-1">
            <SearchModule />
          </div>
        </div>
      </div>
    </div>
  );
};