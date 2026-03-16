import dynamic from "next/dynamic";

const KanbanBoard = dynamic(
  () => import("@/components/features/kanban/KanbanBoard"),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
      </div>
    )
  }
);

export default function DashboardPage() {
  return <KanbanBoard />;
}
