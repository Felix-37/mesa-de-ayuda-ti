export default function UsuariosPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1">Administra los roles y accesos del personal al sistema.</p>
        </div>
        <button className="bg-navy-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-navy-700 transition flex items-center gap-2 shadow-sm">
          <span>+</span> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 text-center py-20 mt-4">
        <div className="w-20 h-20 bg-accent-yellow-100 text-accent-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Módulo en Desarrollo</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          La tabla de usuarios y la asignación de roles mediante la aplicación está en construcción. Actualmente puedes gestionar roles desde Supabase y Firebase directamente.
        </p>
      </div>
    </div>
  );
}
