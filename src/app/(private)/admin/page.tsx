export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-700">Statistiques à venir</h2>
          <p className="text-gray-500">Faire la page de stats ici</p>
        </div>
      </div>
    </div>
  );
}
