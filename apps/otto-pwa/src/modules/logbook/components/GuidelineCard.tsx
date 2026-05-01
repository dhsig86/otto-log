import type { ENTOntologyEntry, OntologyGuideline } from '@otto/shared-types'
import type { ENTOntologyEngine } from '@otto/shared-ontology'

interface GuidelineCardProps {
  guideline:   OntologyGuideline
  procedureId: string
  engine:      ENTOntologyEngine
}

export function GuidelineCard({ guideline, procedureId, engine }: GuidelineCardProps) {
  const pubmedUrl = engine.buildPubMedQuery(procedureId)

  return (
    <div className="flex items-start justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-blue-800">{guideline.title}</p>
        <p className="text-xs text-blue-500 mt-0.5">
          {guideline.organization} · {guideline.year}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 items-end shrink-0">
        <a
          href={guideline.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
        >
          Ver guideline ↗
        </a>
        {pubmedUrl && (
          <a
            href={pubmedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
          >
            PubMed / MeSH ↗
          </a>
        )}
      </div>
    </div>
  )
}

// ── Bloco de guidelines inline (usado no formulário) ──────────────────────────
interface GuidelinesInlineProps {
  entry: ENTOntologyEntry | undefined
  engine: ENTOntologyEngine
}

export function GuidelinesInline({ entry, engine }: GuidelinesInlineProps) {
  if (!entry?.guidelines?.length) return null
  return (
    <div className="mt-3 flex flex-col gap-2">
      <p className="text-xs font-medium text-slate-500">📚 Guidelines disponíveis para este procedimento:</p>
      {entry.guidelines.map(g => (
        <GuidelineCard key={g.url} guideline={g} procedureId={entry.id} engine={engine} />
      ))}
    </div>
  )
}
