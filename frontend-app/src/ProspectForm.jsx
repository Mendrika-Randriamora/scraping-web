import { useState, useRef } from 'react';

export default function ProspectForm() {
  const [secteur, setSecteur] = useState('');
  const [ville, setVille] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(import.meta.env.VITE_N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secteur, ville }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const data = await res.json();
      // "All Entries" renvoie un tableau ; on gère aussi le cas d'un objet seul
      setResults(Array.isArray(data) ? data : [data]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Colonnes déduites dynamiquement des clés du premier résultat
  const columns = results.length > 0 ? Object.keys(results[0]) : [];

  // Colonnes à ne pas inclure dans l'export Excel (restent visibles dans le tableau)
  const EXCLUDED_EXPORT_COLUMNS = ['id', 'updatedAt'];

  const handleExportExcel = () => {
    if (!tableRef.current) return;

    // Clone la table pour ne pas modifier l'affichage réel à l'écran
    const clonedTable = tableRef.current.cloneNode(true);

    // Supprime les cellules (en-têtes + données) des colonnes exclues, sur le clone uniquement
    clonedTable.querySelectorAll('.excel-exclude').forEach((cell) => cell.remove());

    const workbook = XLSX.utils.table_to_book(clonedTable);

    const date = new Date().toISOString().slice(0, 10);
    const safeSecteur = secteur.trim().replace(/\s+/g, '-') || 'prospects';
    const safeVille = ville.trim().replace(/\s+/g, '-') || 'export';
    const filename = `${safeSecteur}_${safeVille}_${date}.xlsx`;

    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="container py-4">
      <h1 className="h4 mb-4">Recherche de prospects</h1>

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-5">
          <label htmlFor="secteur" className="form-label">Secteur</label>
          <input
            id="secteur"
            type="text"
            className="form-control"
            value={secteur}
            onChange={(e) => setSecteur(e.target.value)}
            placeholder="Ex: Immobilier"
            required
          />
        </div>

        <div className="col-md-5">
          <label htmlFor="ville" className="form-label">Ville</label>
          <input
            id="ville"
            type="text"
            className="form-control"
            value={ville}
            onChange={(e) => setVille(e.target.value)}
            placeholder="Ex: Antananarivo"
            required
          />
        </div>

        <div className="col-md-2 d-flex align-items-end">
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Envoi...
              </>
            ) : (
              'Rechercher'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <p className="text-muted">Aucun résultat pour l'instant.</p>
      )}

      {results.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-muted">{results.length} résultat(s)</span>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={handleExportExcel}
            >
              Exporter en Excel
            </button>
          </div>

          <div className="table-responsive">
            <table ref={tableRef} className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col}
                      scope="col"
                      className={EXCLUDED_EXPORT_COLUMNS.includes(col) ? 'excel-exclude' : undefined}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((item, idx) => (
                  <tr key={idx}>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className={EXCLUDED_EXPORT_COLUMNS.includes(col) ? 'excel-exclude' : undefined}
                      >
                        {String(item[col] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}