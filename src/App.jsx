import { useMemo, useState } from 'react';

const dagensDato = new Date().toISOString().split('T')[0];

const lagJobb = (adresse, poststed, status, prioritet, system) => ({
  adresse,
  poststed,
  status,
  prioritet,
  kommentar: '',
  system,
  sjekkliste: {
    rivning: false,
    tørk: false,
    dokumentasjon: false,
  },
  timeforing: {
    dato: dagensDato,
    fra: '',
    til: '',
    utforelse: '',
    type: 'Ordinær',
  },
});

const startJobber = [
  lagJobb('Bellevue 9B', 'Kristiansand', 'Venter avklaring', 'Lav', 'In4mo'),
  lagJobb('Fidjeåsen 35', 'Kristiansand', 'Pågående', 'Middels', 'MEPS'),
  lagJobb('Kjerrevaneset 62', 'Marnardal', 'Tørker', 'Middels', 'In4mo'),
  lagJobb('Bergshaven 10', 'Lillesand', 'Pågående', 'Høy', 'MEPS'),
  lagJobb('Bjørnebakken 49', 'Kristiansand', 'Ferdig', 'Lav', 'In4mo'),
  lagJobb('Bordalssvingen 34', 'Kristiansand', 'Pågående', 'Middels', 'MEPS'),
  lagJobb('Hånesveien 28', 'Mandal', 'Venter avklaring', 'Høy', 'In4mo'),
  lagJobb('Glåpeveien 15', 'Bjelland', 'Tørker', 'Lav', 'MEPS'),
];

const statuser = ['Venter avklaring', 'Tørker', 'Pågående', 'Ferdig'];

const statusStyles = {
  'Venter avklaring': 'bg-red-600 text-white',
  Tørker: 'bg-blue-600 text-white',
  Pågående: 'bg-yellow-300 text-slate-900',
  Ferdig: 'bg-green-500 text-white',
};

const prioritetStyles = {
  Høy: 'bg-red-500 text-white',
  Middels: 'bg-orange-400 text-slate-900',
  Lav: 'bg-yellow-200 text-slate-900',
};

const systemStyles = {
  In4mo: 'bg-black/30 text-white',
  MEPS: 'bg-white/30 text-black',
};

export default function App() {
  const [jobber, setJobber] = useState(startJobber);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [timeIndex, setTimeIndex] = useState(null);
  const [checkIndex, setCheckIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const endreStatus = (index, nyStatus) => {
    setJobber((prev) =>
      prev.map((jobb, i) => (i === index ? { ...jobb, status: nyStatus } : jobb)),
    );
  };

  const endreKommentar = (index, nyKommentar) => {
    setJobber((prev) =>
      prev.map((jobb, i) => (i === index ? { ...jobb, kommentar: nyKommentar } : jobb)),
    );
  };

  const endreSjekk = (index, felt) => {
    setJobber((prev) =>
      prev.map((jobb, i) =>
        i === index
          ? {
              ...jobb,
              sjekkliste: {
                ...jobb.sjekkliste,
                [felt]: !jobb.sjekkliste[felt],
              },
            }
          : jobb,
      ),
    );
  };

  const endreTimeforing = (index, felt, verdi) => {
    setJobber((prev) =>
      prev.map((jobb, i) =>
        i === index
          ? {
              ...jobb,
              timeforing: {
                ...jobb.timeforing,
                [felt]: verdi,
              },
            }
          : jobb,
      ),
    );
  };

  const filtrerteJobber = useMemo(() => {
    return jobber.filter((jobb) => {
      const matcherSok = `${jobb.adresse} ${jobb.poststed}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matcherStatus = statusFilter === 'Alle' || jobb.status === statusFilter;
      return matcherSok && matcherStatus;
    });
  }, [jobber, search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#2b4460] p-4 sm:p-6">
      <div className="mx-auto max-w-md">
        <div className="mb-4 text-center">
          <img src="/recover.png" alt="Recover logo" className="mx-auto h-10" />
        </div>

        <div className="mb-4 flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk adresse..."
            className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          />
        </div>

        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none"
          >
            <option value="Alle">Alle</option>
            {statuser.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          {filtrerteJobber.map((jobb) => {
            const førsteLinje = (jobb.kommentar || '').split('\n')[0];
            const index = jobber.findIndex(
              (item) => item.adresse === jobb.adresse && item.poststed === jobb.poststed,
            );

            return (
              <div
                key={`${jobb.adresse}-${jobb.poststed}`}
                className={`rounded-3xl p-4 ${statusStyles[jobb.status]}`}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setEditIndex(editIndex === index ? null : index)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="font-bold">{jobb.adresse}</div>
                    <div className="text-sm">{jobb.poststed}</div>

                    <div
                      className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs ${systemStyles[jobb.system]}`}
                    >
                      {jobb.system}
                    </div>

                    {førsteLinje ? (
                      <div className="mt-2 w-full truncate pr-2 text-xs text-black">💬 {førsteLinje}</div>
                    ) : null}
                  </button>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setCheckIndex(checkIndex === index ? null : index)}
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/30 text-xl"
                      aria-label="Åpne sjekkliste"
                    >
                      📋
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeIndex(timeIndex === index ? null : index)}
                      className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl shadow"
                      aria-label="Åpne timeliste"
                    >
                      ⏱️
                    </button>
                  </div>
                </div>

                {editIndex === index ? (
                  <div className="mt-3 space-y-2 rounded-2xl bg-white/20 p-3">
                    <select
                      value={jobb.status}
                      onChange={(e) => endreStatus(index, e.target.value)}
                      className="w-full rounded-xl bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                    >
                      {statuser.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <textarea
                      value={jobb.kommentar}
                      onChange={(e) => endreKommentar(index, e.target.value)}
                      placeholder="Kommentar"
                      className="w-full rounded-xl bg-white px-3 py-3 text-sm text-slate-900 outline-none"
                      rows={2}
                    />
                  </div>
                ) : null}

                {checkIndex === index ? (
                  <div className="mt-3 rounded-2xl bg-white p-3 text-black">
                    <div className="mb-2 font-semibold">Sjekkliste</div>
                    {['rivning', 'tørk', 'dokumentasjon'].map((felt) => (
                      <label key={felt} className="mb-2 flex items-center gap-2 last:mb-0">
                        <input
                          type="checkbox"
                          checked={jobb.sjekkliste[felt]}
                          onChange={() => endreSjekk(index, felt)}
                        />
                        <span className="capitalize">{felt}</span>
                      </label>
                    ))}
                  </div>
                ) : null}

                {timeIndex === index ? (
                  <div className="mt-3 space-y-2 rounded-2xl bg-white p-3 text-black">
                    <div className="font-semibold">Timeliste</div>

                    <select
                      value={jobb.timeforing.type}
                      onChange={(e) => endreTimeforing(index, 'type', e.target.value)}
                      className="w-full rounded-xl border px-3 py-3"
                    >
                      <option value="Ordinær">Ordinær</option>
                      <option value="Overtid 50%">Overtid 50%</option>
                      <option value="Overtid 100%">Overtid 100%</option>
                      <option value="Reise">Reise</option>
                      <option value="Ventetid">Ventetid</option>
                    </select>

                    <input
                      type="date"
                      value={jobb.timeforing.dato}
                      onChange={(e) => endreTimeforing(index, 'dato', e.target.value)}
                      className="w-full rounded-xl border px-3 py-3"
                    />

                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={jobb.timeforing.fra}
                        onChange={(e) => endreTimeforing(index, 'fra', e.target.value)}
                        className="w-full rounded-xl border px-3 py-3"
                      />
                      <input
                        type="time"
                        value={jobb.timeforing.til}
                        onChange={(e) => endreTimeforing(index, 'til', e.target.value)}
                        className="w-full rounded-xl border px-3 py-3"
                      />
                    </div>

                    <textarea
                      value={jobb.timeforing.utforelse}
                      onChange={(e) => endreTimeforing(index, 'utforelse', e.target.value)}
                      placeholder="Utførelse"
                      className="w-full rounded-xl border px-3 py-3"
                      rows={3}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
