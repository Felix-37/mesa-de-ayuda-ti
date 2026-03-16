export default function ConfigPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-navy-900 mb-6">Configuración del Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
        {[
          { title: "Apariencia", desc: "Ajusta los temas y colores" },
          { title: "Notificaciones", desc: "Administra las alertas por correo" },
          { title: "Seguridad", desc: "Verifica los registros de acceso" }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer border-t-4 border-t-navy-800">
            <h3 className="text-lg font-bold text-navy-900 mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-accent-yellow-50 border border-accent-yellow-200 rounded-xl p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-navy-900 mb-2">Sección en Construcción</h2>
          <p className="text-gray-700 text-sm">
            Los parámetros avanzados de configuración del sistema de tickets (colas, categorías personalizadas, SLAs) pronto estarán disponibles en este módulo.
          </p>
        </div>
        <div>
          <button className="bg-accent-yellow-500 text-navy-900 px-6 py-2 rounded-lg font-bold hover:bg-accent-yellow-400 transition shadow-sm" disabled>
            Próximamente
          </button>
        </div>
      </div>
    </div>
  );
}
