import {
  AdminPageHeader,
  AdminRequestsLoading,
} from "@/features/admin/components/admin-workspace-ui";

export default function AdminAmlLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        title="AML screening"
        description="Screen an individual or business subject against sanctions and watchlist datasets and review the recorded history."
      />
      <AdminRequestsLoading label="Loading AML screening" />
    </div>
  );
}
