import { startTransition, useDeferredValue, useState } from 'react'
import type { AssessmentProject } from '../../core/schema/assessment'
import type { Question } from '../../core/schema/question'
import { validateProject } from '../../core/validation/validateProject'
import { exportBrightspaceCsv } from '../../export/brightspaceCsv/exportBrightspaceCsv'
import { parseDocxFile } from '../../ingest/docx/parseDocxBrowser'
import { parsePdfFile } from '../../ingest/pdf/parsePdfBrowser'
import type { IngestParseResult } from '../../ingest/shared/ingestTypes'
import type { StoredProjectSummary } from '../../storage/shared/repositoryTypes'
import {
  addChoiceToQuestion,
  addMatchingPairToQuestion,
  addQuestionToProject,
  changeQuestionTypeInProject,
  createDraftProject,
  createProjectStoreState,
  deleteQuestionFromProject,
  getSelectedQuestion,
  moveChoiceInQuestion,
  moveQuestionInProject,
  removeChoiceFromQuestion,
  removeMatchingPairFromQuestion,
  updateProjectMetadata,
  updateQuestionInProject,
} from '../state/projectStore'
import { initialUiStoreState, setActiveView, uiViews } from '../state/uiStore'
import { createFileProjectRepository } from '../../storage/local/fileProjectRepository'
import { ExportView } from './ExportView'
import { ProjectEditor } from './ProjectEditor'
import { ValidationView } from './ValidationView'

function downloadCsv(fileName: string, content: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

function isSupportedImportFile(file: File) {
  const lowerName = file.name.toLowerCase()
  return lowerName.endsWith('.docx') || lowerName.endsWith('.pdf')
}

async function parseImportFile(file: File): Promise<IngestParseResult> {
  const lowerName = file.name.toLowerCase()

  if (lowerName.endsWith('.docx')) {
    return parseDocxFile(file)
  }

  if (lowerName.endsWith('.pdf')) {
    return parsePdfFile(file)
  }

  throw new Error(`Unsupported import type for ${file.name}`)
}

function normalizedPromptKey(question: Question) {
  return question.prompt.toLowerCase().replace(/\s+/g, ' ').trim()
}

function importQuestionQualityScore(question: Question) {
  if (question.type === 'multiple_choice') {
    const populatedChoiceCount = question.choices.filter(
      (choice) => choice.text.trim().length > 0,
    ).length
    return 100 + populatedChoiceCount
  }

  if (question.type === 'matching') {
    return 98 + question.choices.length
  }

  if (question.type === 'true_false') {
    return 96 + question.choices.length
  }

  if (question.type === 'multi_select') {
    const populatedChoiceCount = question.choices.filter(
      (choice) => choice.text.trim().length > 0,
    ).length
    return 90 + populatedChoiceCount
  }

  if (question.type === 'ordering') {
    return 88 + question.choices.length
  }

  if (question.type === 'short_answer') {
    return 30
  }

  return 10
}

function appendIngestResultToProject(
  project: AssessmentProject,
  result: IngestParseResult,
): AssessmentProject {
  const sourceAlreadyLinked = project.sourceDocuments.some(
    (sourceDocument) =>
      sourceDocument.type === result.sourceDocument.type &&
      sourceDocument.name === result.sourceDocument.name &&
      sourceDocument.origin === result.sourceDocument.origin,
  )

  const mergedQuestions: Question[] = []
  const indexByPrompt = new Map<string, number>()

  function addOrUpgrade(question: Question) {
    const promptKey = normalizedPromptKey(question)
    const existingIndex = indexByPrompt.get(promptKey)

    if (existingIndex === undefined) {
      indexByPrompt.set(promptKey, mergedQuestions.length)
      mergedQuestions.push(question)
      return
    }

    const existingQuestion = mergedQuestions[existingIndex]
    if (
      importQuestionQualityScore(question) >
      importQuestionQualityScore(existingQuestion)
    ) {
      mergedQuestions[existingIndex] = question
    }
  }

  for (const existingQuestion of project.questions) {
    addOrUpgrade(existingQuestion)
  }

  for (const incomingQuestion of result.questions) {
    addOrUpgrade(incomingQuestion)
  }

  return {
    ...project,
    sourceDocuments: sourceAlreadyLinked
      ? project.sourceDocuments
      : [...project.sourceDocuments, result.sourceDocument],
    questions: mergedQuestions,
    updatedAt: new Date().toISOString(),
  }
}

type HomeBootstrapState = {
  currentProject: AssessmentProject
  savedProjects: StoredProjectSummary[]
  statusMessage: string
}

function bootstrapWorkspace(
  repository: ReturnType<typeof createFileProjectRepository>,
): HomeBootstrapState {
  const savedProjects = repository.list()

  if (savedProjects.length === 0) {
    return {
      currentProject: createDraftProject(),
      savedProjects,
      statusMessage: 'Ready for local editing.',
    }
  }

  const loadedProject = repository.load(savedProjects[0].projectId)

  if (!loadedProject) {
    return {
      currentProject: createDraftProject(),
      savedProjects,
      statusMessage: 'Local index contained an unreadable project. Opened a new draft.',
    }
  }

  return {
    currentProject: loadedProject,
    savedProjects,
    statusMessage: 'Ready for local editing.',
  }
}

export function Home() {
  const [repository] = useState(() => createFileProjectRepository())
  const [bootstrapState] = useState(() => bootstrapWorkspace(repository))
  const [currentProject, setCurrentProject] = useState<AssessmentProject | null>(
    bootstrapState.currentProject,
  )
  const [projectState, setProjectState] = useState(() =>
    createProjectStoreState(bootstrapState.currentProject),
  )
  const [uiState, setUiState] = useState(initialUiStoreState)
  const [savedProjects, setSavedProjects] = useState(bootstrapState.savedProjects)
  const [statusMessage, setStatusMessage] = useState(bootstrapState.statusMessage)
  const [isImportingSources, setIsImportingSources] = useState(false)
  const deferredProject = useDeferredValue(currentProject)
  const selectedQuestion = getSelectedQuestion(
    currentProject,
    projectState.selectedQuestionId,
  )
  const validationResult = deferredProject ? validateProject(deferredProject) : null
  const exportResult = deferredProject ? exportBrightspaceCsv(deferredProject) : null

  function applyProject(nextProject: AssessmentProject, selectedQuestionId?: string | null) {
    setCurrentProject(nextProject)
    setProjectState((state) =>
      createProjectStoreState(nextProject, selectedQuestionId ?? state.selectedQuestionId),
    )
  }

  function updateCurrentProject(updater: (project: AssessmentProject) => AssessmentProject) {
    setCurrentProject((project) => {
      if (!project) {
        return project
      }

      const nextProject = updater(project)
      setProjectState((state) =>
        createProjectStoreState(nextProject, state.selectedQuestionId),
      )

      return nextProject
    })
  }

  function createNewProject() {
    const draftProject = createDraftProject()
    startTransition(() => {
      setCurrentProject(draftProject)
      setProjectState(createProjectStoreState(draftProject))
      setUiState((state) => setActiveView(state, 'editor'))
    })
    setStatusMessage('Created a new unsaved draft project.')
  }

  function loadProject(projectId: string) {
    const loadedProject = repository.load(projectId)

    if (!loadedProject) {
      setSavedProjects(repository.list())
      setStatusMessage(`Project ${projectId} could not be loaded from local storage.`)
      return
    }

    startTransition(() => {
      setCurrentProject(loadedProject)
      setProjectState(createProjectStoreState(loadedProject))
      setUiState((state) => setActiveView(state, 'editor'))
    })
    setStatusMessage(`Loaded ${loadedProject.title}.`)
  }

  function saveCurrentProject() {
    if (!currentProject) {
      return
    }

    const savedProject = repository.save(currentProject)
    setSavedProjects(repository.list())
    applyProject(savedProject)
    setStatusMessage(`Saved ${savedProject.title} to local storage.`)
  }

  function deleteSavedProject(projectId: string) {
    repository.delete(projectId)
    const nextProjects = repository.list()
    setSavedProjects(nextProjects)

    if (currentProject?.projectId !== projectId) {
      setStatusMessage(`Deleted saved project ${projectId}.`)
      return
    }

    if (nextProjects.length === 0) {
      const draftProject = createDraftProject()
      applyProject(draftProject)
      setStatusMessage('Deleted the saved project and opened a new draft.')
      return
    }

    const replacementProject = repository.load(nextProjects[0].projectId)

    if (!replacementProject) {
      const draftProject = createDraftProject()
      applyProject(draftProject)
      setStatusMessage('Deleted the saved project. Replacement project failed to load.')
      return
    }

    applyProject(replacementProject)
    setStatusMessage(`Deleted the saved project and loaded ${replacementProject.title}.`)
  }

  function selectQuestion(questionId: string) {
    setProjectState((state) => ({
      ...state,
      selectedQuestionId: questionId,
    }))
  }

  function addQuestion(type: Question['type']) {
    if (!currentProject) {
      return
    }

    const result = addQuestionToProject(currentProject, type)
    applyProject(result.project, result.selectedQuestionId)
    setStatusMessage(`Added a ${type.replaceAll('_', ' ')} question.`)
  }

  function updateQuestion(questionId: string, updater: (question: Question) => Question) {
    updateCurrentProject((project) =>
      updateQuestionInProject(project, questionId, updater),
    )
  }

  function changeQuestionType(questionId: string, type: Question['type']) {
    updateCurrentProject((project) =>
      changeQuestionTypeInProject(project, questionId, type),
    )
    setStatusMessage(`Changed question type to ${type.replaceAll('_', ' ')}.`)
  }

  function deleteQuestion(questionId: string) {
    if (!currentProject) {
      return
    }

    const nextProject = deleteQuestionFromProject(currentProject, questionId)
    applyProject(nextProject)
    setStatusMessage('Deleted question from the draft.')
  }

  function moveQuestion(questionId: string, direction: 'up' | 'down') {
    updateCurrentProject((project) =>
      moveQuestionInProject(project, questionId, direction),
    )
  }

  function addChoice(questionId: string) {
    updateCurrentProject((project) => addChoiceToQuestion(project, questionId))
  }

  function removeChoice(questionId: string, choiceId: string) {
    updateCurrentProject((project) =>
      removeChoiceFromQuestion(project, questionId, choiceId),
    )
  }

  function moveChoice(questionId: string, choiceId: string, direction: 'up' | 'down') {
    updateCurrentProject((project) =>
      moveChoiceInQuestion(project, questionId, choiceId, direction),
    )
  }

  function addMatchingPair(questionId: string) {
    updateCurrentProject((project) => addMatchingPairToQuestion(project, questionId))
  }

  function removeMatchingPair(questionId: string, matchKey: string) {
    updateCurrentProject((project) =>
      removeMatchingPairFromQuestion(project, questionId, matchKey),
    )
  }

  function exportCsv() {
    if (!exportResult || exportResult.status !== 'success') {
      return
    }

    downloadCsv(exportResult.fileName, exportResult.content)
    setStatusMessage(`Downloaded ${exportResult.fileName}.`)
  }

  async function importSourceFiles(files: FileList | null) {
    if (!currentProject || !files || files.length === 0 || isImportingSources) {
      return
    }

    setIsImportingSources(true)
    try {
      const unsupportedFiles: string[] = []
      const failedFiles: Array<{ name: string; reason: string }> = []
      const results: IngestParseResult[] = []

      for (const file of Array.from(files)) {
        if (!isSupportedImportFile(file)) {
          unsupportedFiles.push(file.name)
          continue
        }

        try {
          const result = await parseImportFile(file)
          results.push(result)
        } catch (error) {
          const reason =
            error instanceof Error && error.message.trim().length > 0
              ? error.message.trim()
              : 'unknown parser error'
          failedFiles.push({ name: file.name, reason })
        }
      }

      if (results.length > 0) {
        let nextProject = currentProject
        let importedSelection: string | null = null

        for (const result of results) {
          if (!importedSelection && result.questions.length > 0) {
            importedSelection = result.questions[0].questionId
          }

          nextProject = appendIngestResultToProject(nextProject, result)
        }

        applyProject(nextProject, importedSelection)
      }

      const importedQuestionCount = results.reduce(
        (total, result) => total + result.questions.length,
        0,
      )
      const issueCount = results.reduce(
        (total, result) =>
          total +
          result.issues.filter((issue) => issue.severity === 'warning' || issue.severity === 'error').length,
        0,
      )

      const messageParts = [
        `Imported ${importedQuestionCount} draft questions from ${results.length} file(s).`,
      ]

      if (issueCount > 0) {
        messageParts.push(`${issueCount} import issue(s) flagged for review.`)
      }

      if (unsupportedFiles.length > 0) {
        messageParts.push(`${unsupportedFiles.length} file(s) skipped (unsupported type).`)
      }

      if (failedFiles.length > 0) {
        messageParts.push(`${failedFiles.length} file(s) failed to import.`)
        messageParts.push(
          failedFiles
            .slice(0, 2)
            .map((entry) => `${entry.name}: ${entry.reason}`)
            .join(' | '),
        )
      }

      setStatusMessage(messageParts.join(' '))
    } finally {
      setIsImportingSources(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Phase 4 Shell</p>
        <h1>Brightspace Assessment Factory</h1>
        <p>
          Edit canonical assessment data locally, validate before export, and
          produce Brightspace CSV from a saved project.
        </p>
        <div className="pill-row">
          <span className="pill">local-first</span>
          <span className="pill">review before export</span>
          <span className="pill">deterministic csv</span>
        </div>
        <div className="hero-toolbar">
          <button type="button" className="primary-button" onClick={createNewProject}>
            New project
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={saveCurrentProject}
            disabled={!currentProject}
          >
            Save locally
          </button>
          <p className="status-text">{statusMessage}</p>
        </div>
      </header>

      <nav className="view-tabs" aria-label="Workspace views">
        {uiViews.map((view) => (
          <button
            key={view}
            type="button"
            className={view === uiState.activeView ? 'tab-button active' : 'tab-button'}
            onClick={() => setUiState((state) => setActiveView(state, view))}
          >
            {view.replace(/^\w/, (value) => value.toUpperCase())}
          </button>
        ))}
      </nav>

      {uiState.activeView === 'editor' ? (
        <ProjectEditor
          activeProjectId={currentProject?.projectId ?? null}
          currentProject={currentProject}
          savedProjects={savedProjects}
          selectedQuestionId={projectState.selectedQuestionId}
          selectedQuestion={selectedQuestion}
          onCreateProject={createNewProject}
          onDeleteSavedProject={deleteSavedProject}
          onLoadProject={loadProject}
          onSaveProject={saveCurrentProject}
          onSelectQuestion={selectQuestion}
          onUpdateProjectMetadata={(updates) =>
            updateCurrentProject((project) => updateProjectMetadata(project, updates))
          }
          onAddQuestion={addQuestion}
          onChangeQuestionType={changeQuestionType}
          onDeleteQuestion={deleteQuestion}
          onMoveQuestion={moveQuestion}
          onUpdateQuestion={updateQuestion}
          onAddChoice={addChoice}
          onMoveChoice={moveChoice}
          onRemoveChoice={removeChoice}
          onAddMatchingPair={addMatchingPair}
          onRemoveMatchingPair={removeMatchingPair}
          onImportSourceFiles={importSourceFiles}
          isImportingSources={isImportingSources}
        />
      ) : null}

      {uiState.activeView === 'validation' ? (
        <ValidationView
          currentProject={currentProject}
          validationResult={validationResult}
        />
      ) : null}

      {uiState.activeView === 'export' ? (
        <ExportView
          currentProject={currentProject}
          exportResult={exportResult}
          onDownloadCsv={exportCsv}
        />
      ) : null}
    </main>
  )
}
