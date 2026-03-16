export default function PerfilPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Perfil de Usuario</h1>
      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-navy-100 text-navy-800 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-accent-yellow-500">
            U
          </div>
          <div>
            <h2 className="text-2xl font-bold text-navy-900">Información Personal</h2>
            <p className="text-gray-500">Gestiona tus datos y preferencias de cuenta</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 mt-4">
            <h3 className="text-lg font-semibold text-navy-800 mb-2">Detalles de la Cuenta</h3>
            <p className="text-sm text-gray-600 mb-4">Esta vista de perfil está en construcción según los requerimientos solicitados.</p>
            <div className="h-2 w-full bg-navy-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent-yellow-500 w-1/3 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
