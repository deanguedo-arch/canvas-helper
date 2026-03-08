export const uiViews = ['editor', 'validation', 'export'] as const

export type UiView = (typeof uiViews)[number]

export type UiStoreState = {
  activeView: UiView
}

export const initialUiStoreState: UiStoreState = {
  activeView: 'editor',
}

export function setActiveView(state: UiStoreState, activeView: UiView): UiStoreState {
  return {
    ...state,
    activeView,
  }
}
