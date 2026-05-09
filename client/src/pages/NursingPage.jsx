import Sidebar from "../components/dashboards/visitors/Sidebar";
import NursingRecordsView from "../components/dashboards/visitors/NursingRecordsView";

export default function NursingPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-hidden">
        <NursingRecordsView />
      </div>
    </div>
  );
}