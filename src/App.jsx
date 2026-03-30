export default function App() {
  const jobber = [
    { adresse: "Bellevue 9B", poststed: "Kristiansand", status: "Venter avklaring", prioritet: "Lav" },
    { adresse: "Fidjeåsen 35", poststed: "Kristiansand", status: "Pågående", prioritet: "Middels" },
    { adresse: "Kjerrevaneset 62", poststed: "Marnardal", status: "Tørker", prioritet: "Middels" },
    { adresse: "Bergshaven 10", poststed: "Lillesand", status: "Pågående", prioritet: "Høy" },
    { adresse: "Bjørnebakken 49", poststed: "Kristiansand", status: "Ferdig", prioritet: "Lav" },
    { adresse: "Bordalssvingen 34", poststed: "Kristiansand", status: "Pågående", prioritet: "Middels" },
    { adresse: "Hånesveien 28", poststed: "Mandal", status: "Venter avklaring", prioritet: "Høy" },
    { adresse: "Glåpeveien 15", poststed: "Bjelland", status: "Tørker", prioritet: "Lav" },
  ];

  const statusStyles = {
    "Venter avklaring": "bg-red-600 text-white",
    "Tørker": "bg-blue-600 text-white",
    "Pågående": "bg-yellow-300 text-slate-900",
    "Ferdig": "bg-green-500 text-white",
  };

  const prioritetStyles = {
    "Høy": "bg-red-500 text-white",
    "Middels": "bg-orange-400 text-slate-900",
    "Lav": "bg-yellow-200 text-slate-900",
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 rounded-3xl bg-slate-900 p-5 text-white shadow-xl">
          <p className="text-sm text-slate-300">Mobiloversikt</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Forsikringsjobber</h1>
          <p className="mt-2 text-sm text-slate-300">
            Enkel oversikt over jobber med adresse, statusfarge og prioritet.
          </p>
        </div>

        <div className="space-y-3">
          {jobber.map((jobb) => (
            <div
              key={`${jobb.adresse}-${jobb.poststed}`}
              className={`w-full rounded-3xl p-5 text-left shadow-lg ${statusStyles[jobb.status]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold leading-tight">{jobb.adresse}</h2>
                  <p className="mt-1 text-sm opacity-90">{jobb.poststed}</p>
                </div>

                <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-bold ${prioritetStyles[jobb.prioritet]}`}>
                  {jobb.prioritet}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
