import { useMemo, useState } from 'react';

const dagensDato = new Date().toISOString().split('T')[0];

const lagJobb = (adresse, poststed, status, prioritet, system, ansvarlig, kalkulert, kostnad) => ({
  adresse,
  poststed,
  status,
  prioritet,
  kommentar: '',
  system,
  ansvarlig,
  kalkulert,
  kostnad,
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
  lagJobb('Bellevue 9B', 'Kristiansand', 'Venter avklaring', 'Lav', 'In4mo', 'Jonas', 18500, 13200),
  lagJobb('Fidjeåsen 35', 'Kristiansand', 'Pågående', 'Middels', 'MEPS', 'Tor', 26400, 17350),
  lagJobb('Kjerrevaneset 62', 'Marnardal', 'Tørker', 'Middels', 'In4mo', 'Jørn', 21900, 14800),
  lagJobb('Bergshaven 10', 'Lillesand', 'Pågående', 'Høy', 'MEPS', 'Jørn', 31200, 24100),
  lagJobb('Bjørnebakken 49', 'Kristiansand', 'Ferdig', 'Lav', 'In4mo', 'Jonas', 15800, 9600),
  lagJobb('Bordalssvingen 34', 'Kristiansand', 'Pågående', 'Middels', 'MEPS', 'Tor', 28700, 19500),
  lagJobb('Hånesveien 28', 'Mandal', 'Venter avklaring', 'Høy', 'In4mo', 'Jørn', 33400, 28900),
  lagJobb('Glåpeveien 15', 'Bjelland', 'Tørker', 'Lav', 'MEPS', 'Jonas', 14100, 8900),
];

const statuser = ['Venter avklaring', 'Tørker', 'Pågående', 'Ferdig'];
const menyvalg = ['Prosjekter', 'Timeoversikt', 'Prosjektmargin'];

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

const parseTidTilTimer = (fra, til) => {
  if (!fra || !til) return 0;
  const [fraT, fraM] = fra.split(':').map(Number);
  const [tilT, tilM] = til.split(':').map(Number);
  const fraMin = fraT * 60 + fraM;
  const tilMin = tilT * 60 + tilM;
  if (Number.isNaN(fraMin) || Number.isNaN(tilMin) || tilMin <= fraMin) return 0;
  return (tilMin - fraMin) / 60;
};

export default function App() {
  const [jobber, setJobber] = useState(startJobber);
  const [aktivMeny, setAktivMeny] = useState('Prosjekter');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Alle');
  const [ansvarligFilter, setAnsvarligFilter] = useState('Alle');
  const [timeIndex, setTimeIndex] = useState(null);
  const [checkIndex, setCheckIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [menyApen, setMenyApen] = useState(false);

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

  const ansvarlige = useMemo(() => {
    return ['Alle', ...new Set(jobber.map((jobb) => jobb.ansvarlig))];
  }, [jobber]);

  const filtrerteJobber = useMemo(() => {
    return jobber.filter((jobb) => {
      const matcherSok = `${jobb.adresse} ${jobb.poststed} ${jobb.ansvarlig}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matcherStatus = statusFilter === 'Alle' || jobb.status === statusFilter;
      const matcherAnsvarlig = ansvarligFilter === 'Alle' || jobb.ansvarlig === ansvarligFilter;
      return matcherSok && matcherStatus && matcherAnsvarlig;
    });
  }, [jobber, search, statusFilter, ansvarligFilter]);

  const timeoversikt = useMemo(() => {
    return jobber.reduce((acc, jobb) => {
      const ansvarlig = jobb.ansvarlig;
      const timer = parseTidTilTimer(jobb.timeforing.fra, jobb.timeforing.til);
      if (!acc[ansvarlig]) {
        acc[ansvarlig] = { timer: 0, saker: 0 };
      }
      acc[ansvarlig].timer += timer;
      acc[ansvarlig].saker += 1;
      return acc;
    }, {});
  }, [jobber]);

  const marginoversikt = useMemo(() => {
    return jobber.reduce((acc, jobb) => {
      const ansvarlig = jobb.ansvarlig;
      const marginKroner = jobb.kalkulert - jobb.kostnad;
      if (!acc[ansvarlig]) {
        acc[ansvarlig] = { kalkulert: 0, kostnad: 0, margin: 0, saker: 0 };
      }
      acc[ansvarlig].kalkulert += jobb.kalkulert;
      acc[ansvarlig].kostnad += jobb.kostnad;
      acc[ansvarlig].margin += marginKroner;
      acc[ansvarlig].saker += 1;
      return acc;
    }, {});
  }, [jobber]);

  const formatterKr = (tall) =>
    new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      maximumFractionDigits: 0,
    }).format(tall);

  const renderProsjekter = () => (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Søk adresse..."
          className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="Alle">Alle statuser</option>
          {statuser.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          value={ansvarligFilter}
          onChange={(e) => setAnsvarligFilter(e.target.value)}
          className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-slate-900 outline-none"
        >
          {ansvarlige.map((ansvarlig) => (
            <option key={ansvarlig} value={ansvarlig}>
              {ansvarlig === 'Alle' ? 'Alle ansvarlige' : ansvarlig}
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

                  <div className="mt-2 flex flex-wrap gap-2">
                    <div
                      className={`inline-block rounded-lg px-2 py-1 text-xs ${systemStyles[jobb.system]}`}
                    >
                      {jobb.system}
                    </div>
                    <div className="inline-block rounded-lg bg-white/25 px-2 py-1 text-xs text-white">
                      {jobb.ansvarlig}
                    </div>
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
                  >
                    📋
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeIndex(timeIndex === index ? null : index)}
                    className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xl shadow"
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
    </>
  );

  const renderTimeoversikt = () => (
    <div className="space-y-3">
      {Object.entries(timeoversikt).map(([ansvarlig, data]) => (
        <div key={ansvarlig} className="rounded-3xl bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-slate-900">{ansvarlig}</div>
              <div className="text-sm text-slate-500">{data.saker} prosjekter</div>
            </div>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
              <div className="text-xs text-slate-500">Timer</div>
              <div className="text-lg font-bold text-slate-900">{data.timer.toFixed(1)} t</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderProsjektmargin = () => (
    <div className="space-y-3">
      {Object.entries(marginoversikt).map(([ansvarlig, data]) => {
        const marginProsent = data.kalkulert > 0 ? (data.margin / data.kalkulert) * 100 : 0;
        return (
          <div key={ansvarlig} className="rounded-3xl bg-white p-4 shadow">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-slate-900">{ansvarlig}</div>
                <div className="text-sm text-slate-500">{data.saker} prosjekter</div>
              </div>
              <div className="rounded-2xl bg-green-100 px-3 py-2 text-right">
                <div className="text-xs text-slate-500">Margin</div>
                <div className="text-lg font-bold text-slate-900">{marginProsent.toFixed(1)}%</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-slate-100 p-3">
                <div className="text-slate-500">Kalkulert</div>
                <div className="font-semibold text-slate-900">{formatterKr(data.kalkulert)}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3">
                <div className="text-slate-500">Kostnad</div>
                <div className="font-semibold text-slate-900">{formatterKr(data.kostnad)}</div>
              </div>
              <div className="rounded-2xl bg-slate-100 p-3">
                <div className="text-slate-500">Bidrag</div>
                <div className="font-semibold text-slate-900">{formatterKr(data.margin)}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#2b4460] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 text-center md:text-left">
          <img src="/recover.png" alt="Recover logo" className="mx-auto h-10 md:mx-0" />
        </div>

        <div className="mb-4 flex justify-start">
          <button
            type="button"
            onClick={() => setMenyApen((prev) => !prev)}
            className="rounded-2xl bg-[#20364f] px-4 py-3 text-sm font-semibold text-white shadow-lg"
          >
            {menyApen ? 'Skjul meny' : 'Vis meny'}
          </button>
        </div>

        <div className="relative">
          {menyApen && (
            <div className="mb-4 rounded-3xl bg-[#20364f] p-3 shadow-lg md:absolute md:left-0 md:top-0 md:z-20 md:w-[220px]">
              <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-slate-300">
                Meny
              </div>
              <div className="space-y-2">
                {menyvalg.map((valg) => (
                  <button
                    key={valg}
                    type="button"
                    onClick={() => {
                      setAktivMeny(valg);
                      setMenyApen(false);
                    }}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                      aktivMeny === valg
                        ? 'bg-white text-slate-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {valg}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="md:pl-0">
            {aktivMeny === 'Prosjekter' && renderProsjekter()}
            {aktivMeny === 'Timeoversikt' && renderTimeoversikt()}
            {aktivMeny === 'Prosjektmargin' && renderProsjektmargin()}
          </div>
        </div>
      </div>
    </div>
  );
}
