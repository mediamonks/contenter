import { reactive } from 'vue';

interface ErrorState {
  currentError: DisplayError | null;
  errorLog: Error[];
}

interface DisplayError {
  error: Error;
  time: Date;
}

const errorState = reactive<ErrorState>({
  currentError: null,
  errorLog: [],
});

function displayError(error: Error) {
  if (errorState.currentError) return;
  errorState.currentError = {
    error,
    time: new Date(),
  };

  console.error(error);

  setTimeout(() => {
    errorState.currentError = null;
    errorState.errorLog.push(error);
  }, 5000);
}

export {
  errorState,
  displayError,
  DisplayError,
};
