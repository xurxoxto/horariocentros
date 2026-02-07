import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card } from '../components/ui';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorMessage } from '../components/ErrorMessage';
import {
  previewXadeImport,
  confirmXadeImport,
  previewXadeExport,
  downloadXadeExport,
  getXadeInfo,
} from '../services/api';
import type {
  XadeImportPreview,
  XadeImportConfirmResult,
  XadeExportPreview,
  XadeInfo,
} from '../types';

type ActiveTab = 'guide' | 'import' | 'export';
type ImportStep = 'upload' | 'preview' | 'confirm' | 'done';

export const XadePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('guide');
  const [xadeInfo, setXadeInfo] = useState<XadeInfo | null>(null);

  useEffect(() => {
    getXadeInfo().then(setXadeInfo).catch(() => {});
  }, []);

  const tabs = [
    { id: 'guide' as const, label: 'Guía XADE', icon: '📖' },
    { id: 'import' as const, label: 'Importar de XADE', icon: '📥' },
    { id: 'export' as const, label: 'Exportar para XADE', icon: '📤' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-4xl">🏛️</span>
            Integración XADE
          </h1>
          <p className="text-gray-500 mt-2">
            Importar e exportar datos entre HorarioCentros e o sistema XADE da Xunta de Galicia
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border border-gray-200 border-b-white -mb-px'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'guide' && <GuideTab workflow={xadeInfo?.workflow} />}
      {activeTab === 'import' && <ImportTab />}
      {activeTab === 'export' && <ExportTab />}
    </div>
  );
};

// ============================================================================
// GUIDE TAB
// ============================================================================

const GuideTab: React.FC<{ workflow?: string[] }> = ({ workflow: _workflow }) => {
  const steps = [
    {
      number: 1,
      title: 'Configurar a información en XADE',
      icon: '⚙️',
      description:
        'Asegúrate de que XADE ten aberto o novo curso escolar antes de descargar a información. Pode haber novos elementos (grupos, materias ou profesores), e as claves poden ter cambiado.',
      tip: 'Se o novo curso aínda non está aberto, consulta coa consellería de educación cando estará dispoñible.',
    },
    {
      number: 2,
      title: 'Descargar datos de XADE',
      icon: '📥',
      description:
        'Na aplicación "Xade Horarios", vai á pestaña "Descargas" e elixe o ano académico que corresponda. Descarga todos os datos e almacena os ficheiros .csv.',
      tip: 'Garda todos os ficheiros .csv na mesma carpeta para facilitar a importación.',
    },
    {
      number: 3,
      title: 'Importar datos en HorarioCentros',
      icon: '📋',
      description:
        'Usa a pestaña "Importar de XADE" para subir os ficheiros CSV descargados. O sistema detecta automaticamente o tipo de cada ficheiro (profesores, materias, grupos, aulas...).',
      tip: 'Podes subir un ficheiro ZIP con todos os CSV ou seleccionalos individualmente.',
    },
    {
      number: 4,
      title: 'Configurar e resolver o horario',
      icon: '🎯',
      description:
        'Cos datos xa cargados, configura os marcos horarios, restricións e preferencias. Crea as sesións lectivas de cada grupo e xera o horario.',
      tip: 'Usa o filtro de selección do grupo para ver só as materias do seu curso. Isto aforra tempo e evita erros.',
    },
    {
      number: 5,
      title: 'Exportar a solución',
      icon: '📤',
      description:
        'Usa a pestaña "Exportar para XADE" para xerar os ficheiros CSV co horario resolto. Podes xerar un ficheiro por grupo ou un ficheiro unificado.',
      tip: 'Revisa o preview antes de descargar para asegurarte de que todo é correcto.',
    },
    {
      number: 6,
      title: 'Subir a solución a XADE',
      icon: '🏛️',
      description:
        'Na aplicación "Xade Horarios", vai á pestaña "Subidas", elixe o ficheiro creado e pulsa "iniciar a carga".',
      tip: 'Asegúrate de que as claves de materias e profesores coinciden coas de XADE para evitar erros na subida.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro card */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl text-white shadow-lg">
            🏛️
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Guía de integración con XADE
            </h2>
            <p className="text-gray-600 mt-1">
              XADE é o sistema de xestión académica utilizado polos centros educativos de Galicia.
              Esta guía explica os pasos para intercambiar datos entre XADE e HorarioCentros.
            </p>
          </div>
        </div>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.number}>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-md">
                {step.number}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <span>{step.icon}</span>
                  {step.title}
                </h3>
                <p className="text-gray-600 mt-1">{step.description}</p>
                {step.tip && (
                  <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <span className="text-amber-500">💡</span>
                    <p className="text-sm text-amber-800">{step.tip}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Important notes */}
      <Card className="border-l-4 border-l-red-500">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span>⚠️</span> Notas importantes
        </h3>
        <ul className="mt-3 space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>É imprescindible que XADE teña aberto o novo curso escolar antes de descargar os datos iniciais.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Ao crear sesións lectivas, usa o filtro de selección do grupo para evitar asignar materias que non correspondan ao curso.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-1">•</span>
            <span>Se non se realiza a importación correctamente, haberá problemas ao subir o horario resolto a XADE.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

// ============================================================================
// IMPORT TAB
// ============================================================================

const ImportTab: React.FC = () => {
  const [step, setStep] = useState<ImportStep>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<XadeImportPreview | null>(null);
  const [confirmResult, setConfirmResult] = useState<XadeImportConfirmResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.toLowerCase().endsWith('.csv') || f.name.toLowerCase().endsWith('.zip')
    );
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      setError(null);
    }
  }, []);

  const handlePreview = async () => {
    if (files.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const result = await previewXadeImport(files);
      setPreview(result);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao previsualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (files.length === 0) return;
    try {
      setLoading(true);
      setError(null);
      const result = await confirmXadeImport(files);
      setConfirmResult(result);
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao importar');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFiles([]);
    setPreview(null);
    setConfirmResult(null);
    setError(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2">
        {[
          { id: 'upload', label: 'Subir ficheiros', num: 1 },
          { id: 'preview', label: 'Previsualizar', num: 2 },
          { id: 'confirm', label: 'Confirmar', num: 3 },
          { id: 'done', label: 'Finalizado', num: 4 },
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            {i > 0 && <div className={`w-12 h-0.5 ${['preview', 'confirm', 'done'].indexOf(step) >= i ? 'bg-blue-500' : 'bg-gray-300'}`} />}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s.id
                    ? 'bg-blue-500 text-white'
                    : ['preview', 'confirm', 'done'].indexOf(step) >= ['upload', 'preview', 'confirm', 'done'].indexOf(s.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {['preview', 'confirm', 'done'].indexOf(step) > ['upload', 'preview', 'confirm', 'done'].indexOf(s.id) ? '✓' : s.num}
              </div>
              <span className="text-sm text-gray-600 hidden sm:inline">{s.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}

      {/* Upload Step */}
      {step === 'upload' && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📁</span> Subir ficheiros de XADE
          </h3>
          <p className="text-gray-600 mb-4">
            Selecciona os ficheiros CSV descargados de XADE Horarios, ou un ficheiro ZIP con todos eles.
          </p>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
          >
            <div className="text-5xl mb-4">📄</div>
            <p className="text-lg font-medium text-gray-700">
              Arrastra os ficheiros aquí ou fai clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Ficheiros CSV ou ZIP de XADE Horarios
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ficheiros seleccionados:</h4>
              <div className="space-y-2">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <span className="text-xl">{file.name.endsWith('.zip') ? '📦' : '📄'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles(files.filter((_, idx) => idx !== i));
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePreview}
                className="mt-4 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
              >
                📋 Previsualizar datos
              </button>
            </div>
          )}

          {/* Expected files help */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Ficheiros esperados de XADE:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">•</span> profesores.csv
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">•</span> materias.csv
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500">•</span> grupos.csv
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">•</span> aulas.csv
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-500">•</span> cursos.csv
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-500">•</span> horario_base.csv
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preview Step */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span>🔍</span> Previsualización dos datos
            </h3>

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Profesores', count: preview.data.teachers.length, icon: '👨‍🏫', color: 'blue' },
                { label: 'Materias', count: preview.data.subjects.length, icon: '📚', color: 'green' },
                { label: 'Grupos', count: preview.data.groups.length, icon: '👥', color: 'amber' },
                { label: 'Aulas', count: preview.data.rooms.length, icon: '🚪', color: 'purple' },
              ].map((item) => (
                <div key={item.label} className={`bg-${item.color}-50 rounded-xl p-4 text-center`}>
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                  <div className="text-sm text-gray-600">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Files processed */}
            {preview.files_processed.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Ficheiros procesados:</h4>
                <div className="flex flex-wrap gap-2">
                  {preview.files_processed.map((f, i) => (
                    <span key={i} className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {preview.warnings.length > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">⚠️ Avisos ({preview.warnings.length}):</h4>
                <ul className="text-sm text-amber-700 space-y-1 max-h-40 overflow-y-auto">
                  {preview.warnings.map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Errors */}
            {preview.errors.length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-800 mb-2">❌ Erros ({preview.errors.length}):</h4>
                <ul className="text-sm text-red-700 space-y-1 max-h-40 overflow-y-auto">
                  {preview.errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          {/* Data preview tables */}
          {preview.data.teachers.length > 0 && (
            <PreviewTable
              title="Profesores"
              icon="👨‍🏫"
              headers={['Nome', 'Código', 'Departamento']}
              rows={preview.data.teachers.map((t) => [t.name, t.xade_code, t.department])}
            />
          )}

          {preview.data.subjects.length > 0 && (
            <PreviewTable
              title="Materias"
              icon="📚"
              headers={['Nome', 'Código', 'Horas/semana', 'Curso']}
              rows={preview.data.subjects.map((s) => [s.name, s.xade_code, String(s.hours_per_week), s.course])}
            />
          )}

          {preview.data.groups.length > 0 && (
            <PreviewTable
              title="Grupos"
              icon="👥"
              headers={['Nome', 'Código', 'Curso', 'Nº Alumnos']}
              rows={preview.data.groups.map((g) => [g.name, g.xade_code, g.course, String(g.num_students)])}
            />
          )}

          {preview.data.rooms.length > 0 && (
            <PreviewTable
              title="Aulas"
              icon="🚪"
              headers={['Nome', 'Código', 'Capacidade', 'Tipo']}
              rows={preview.data.rooms.map((r) => [r.name, r.xade_code, String(r.capacity), r.room_type])}
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setStep('upload')}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all"
            >
              ← Volver
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30"
            >
              ✓ Confirmar importación
            </button>
          </div>
        </div>
      )}

      {/* Done Step */}
      {step === 'done' && confirmResult && (
        <Card>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Importación completada</h3>
            <p className="text-gray-600 mb-6">
              Os datos de XADE foron importados correctamente en HorarioCentros.
            </p>

            {/* Created counts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-6">
              {Object.entries(confirmResult.created).map(([key, count]) => (
                <div key={key} className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-xl font-bold text-green-700">{count}</div>
                  <div className="text-xs text-green-600 capitalize">{key} creados</div>
                </div>
              ))}
            </div>

            {/* Skipped */}
            {confirmResult.summary.total_skipped > 0 && (
              <div className="mb-4 bg-amber-50 rounded-lg p-3 max-w-lg mx-auto">
                <p className="text-sm text-amber-700">
                  ⚠️ {confirmResult.summary.total_skipped} elementos xa existían e foron omitidos.
                </p>
              </div>
            )}

            {/* Warnings */}
            {confirmResult.warnings.length > 0 && (
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 text-left max-w-lg mx-auto">
                <h4 className="text-sm font-semibold text-amber-800 mb-2">
                  Avisos ({confirmResult.warnings.length}):
                </h4>
                <ul className="text-sm text-amber-700 space-y-1 max-h-32 overflow-y-auto">
                  {confirmResult.warnings.slice(0, 10).map((w, i) => (
                    <li key={i}>• {w}</li>
                  ))}
                  {confirmResult.warnings.length > 10 && (
                    <li className="font-medium">... e {confirmResult.warnings.length - 10} máis</li>
                  )}
                </ul>
              </div>
            )}

            <button
              onClick={handleReset}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-8 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30"
            >
              📥 Nova importación
            </button>
          </div>
        </Card>
      )}
    </div>
  );
};

// ============================================================================
// EXPORT TAB
// ============================================================================

const ExportTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<XadeExportPreview | null>(null);
  const [format, setFormat] = useState<'zip' | 'unified'>('zip');
  const [language, setLanguage] = useState<'gl' | 'es'>('gl');

  const loadPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await previewXadeExport();
      setPreview(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cargar preview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
  }, []);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      await downloadXadeExport(format, language, preview?.schedule_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao exportar');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !preview) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📤</span> Exportar horario para XADE
        </h3>
        <p className="text-gray-600 mb-6">
          Xera os ficheiros CSV co horario resolto para subir a XADE Horarios (pestaña "Subidas").
        </p>

        {error && <ErrorMessage message={error} onRetry={loadPreview} />}

        {preview?.status === 'no_schedule' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center">
            <div className="text-5xl mb-4">📅</div>
            <h4 className="text-lg font-semibold text-amber-800 mb-2">
              Non hai horarios xerados
            </h4>
            <p className="text-amber-700">
              {preview.message || 'Xera un horario primeiro antes de exportar para XADE.'}
            </p>
            {preview.entities && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {Object.entries(preview.entities).map(([key, count]) => (
                  <div key={key} className="bg-white rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-gray-700">{count}</div>
                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : preview?.status === 'ready' ? (
          <>
            {/* Preview info */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
              <h4 className="text-lg font-semibold text-green-800 mb-3">
                ✓ Horario listo para exportar
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-green-700">Total de sesións:</p>
                  <p className="text-2xl font-bold text-green-800">{preview.total_lessons}</p>
                </div>
                <div>
                  <p className="text-sm text-green-700">Grupos:</p>
                  <p className="text-2xl font-bold text-green-800">{preview.groups?.length || 0}</p>
                </div>
              </div>

              {preview.lessons_per_group && Object.keys(preview.lessons_per_group).length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-green-700 mb-2">Sesións por grupo:</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(preview.lessons_per_group).map(([group, count]) => (
                      <span key={group} className="bg-white text-green-800 text-xs px-3 py-1 rounded-full border border-green-200">
                        {group}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Export options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📦 Formato de exportación
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${format === 'zip' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="format"
                      value="zip"
                      checked={format === 'zip'}
                      onChange={() => setFormat('zip')}
                      className="text-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">ZIP (un ficheiro por grupo)</p>
                      <p className="text-xs text-gray-500">Recomendado para XADE</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${format === 'unified' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="format"
                      value="unified"
                      checked={format === 'unified'}
                      onChange={() => setFormat('unified')}
                      className="text-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">CSV unificado</p>
                      <p className="text-xs text-gray-500">Todos os grupos nun só ficheiro</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🌐 Idioma
                </label>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${language === 'gl' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="gl"
                      checked={language === 'gl'}
                      onChange={() => setLanguage('gl')}
                      className="text-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">Galego</p>
                      <p className="text-xs text-gray-500">Luns, Martes, Mércores...</p>
                    </div>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${language === 'es' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="language"
                      value="es"
                      checked={language === 'es'}
                      onChange={() => setLanguage('es')}
                      className="text-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">Castelán</p>
                      <p className="text-xs text-gray-500">Lunes, Martes, Miércoles...</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 px-6 rounded-xl font-medium text-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50"
            >
              {loading ? '⏳ Xerando...' : '📥 Descargar ficheiros para XADE'}
            </button>
          </>
        ) : null}
      </Card>

      {/* Instructions for upload */}
      <Card className="border-l-4 border-l-blue-500">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <span>📖</span> Como subir o horario a XADE
        </h3>
        <ol className="space-y-2 text-gray-600">
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
            <span>Entra na páxina de XADE e introduce as credenciais.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
            <span>Na aplicación "Xade Horarios", vai á pestaña "Subidas".</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
            <span>Elixe o ficheiro CSV creado por HorarioCentros.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
            <span>Pulsa en "iniciar a carga".</span>
          </li>
        </ol>
      </Card>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const PreviewTable: React.FC<{
  title: string;
  icon: string;
  headers: string[];
  rows: string[][];
}> = ({ title, icon, headers, rows }) => {
  const [expanded, setExpanded] = useState(false);
  const displayRows = expanded ? rows : rows.slice(0, 5);

  return (
    <Card>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
          <span>{icon}</span> {title}
          <span className="text-sm font-normal text-gray-500">({rows.length})</span>
        </h4>
        <span className="text-gray-400">{expanded ? '▲' : '▼'}</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map((h, i) => (
                <th key={i} className="text-left py-2 px-3 text-gray-600 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="py-2 px-3 text-gray-700">
                    {cell || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length > 5 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-center text-sm text-blue-500 hover:text-blue-600 py-2 mt-1"
          >
            Ver todos ({rows.length})
          </button>
        )}
      </div>
    </Card>
  );
};
