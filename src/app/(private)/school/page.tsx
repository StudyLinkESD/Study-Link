export default function SchoolOwnerDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Tableau de bord</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-2 text-lg font-medium">Statistiques à venir</h2>
          <p className="text-gray-600">Cette section contiendra les statistiques de votre école.</p>
        </div>
      </div>
    </div>
  );
}
