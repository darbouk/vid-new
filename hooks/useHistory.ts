import { useReducer, useCallback } from 'react';

type HistoryState<TState> = {
  past: TState[];
  present: TState;
  future: TState[];
};

type HistoryAction<TAction> = TAction & {
    type: 'UNDO' | 'REDO' | string;
    meta?: { skipHistory?: boolean };
};

export const useHistory = <TState, TAction>(
  reducer: (state: TState, action: TAction) => TState,
  initialState: TState
) => {
  const historyReducer = (
    state: HistoryState<TState>,
    action: HistoryAction<TAction>
  ) => {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO': {
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        return { past: newPast, present: previous, future: [present, ...future] };
      }
      case 'REDO': {
        if (future.length === 0) return state;
        const next = future[0];
        const newFuture = future.slice(1);
        return { past: [...past, present], present: next, future: newFuture };
      }
      default: {
        const newPresent = reducer(present, action);
        
        if (JSON.stringify(present) === JSON.stringify(newPresent)) {
          return state;
        }
        
        if (action.meta?.skipHistory) {
            return { ...state, present: newPresent };
        }

        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
    }
  };

  const [historyState, dispatch] = useReducer(historyReducer, {
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = historyState.past.length > 0;
  const canRedo = historyState.future.length > 0;

  const undo = useCallback(() => dispatch({ type: 'UNDO' } as HistoryAction<TAction>), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' } as HistoryAction<TAction>), []);

  return { 
    state: historyState.present, 
    dispatch, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  };
};