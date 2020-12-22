import { reactive } from 'vue';

interface MessageState {
  currentMessage: DisplayMessage | null;
  readonly errorLog: Array<Error>;
}

interface DisplayMessage {
  message: string;
  time: Date;
  isError: boolean;
}

const messageState = reactive<MessageState>({
  currentMessage: null,
  errorLog: [],
});

function displayMessage(message: string, error?: Error, delay = 5000) {
  if (messageState.currentMessage) return;
  messageState.currentMessage = {
    message,
    time: new Date(),
    isError: !!error,
  };

  if (error) console.error(error);
  setTimeout(() => {
    messageState.currentMessage = null;
    if (error) {
      messageState.errorLog.push(error);
    }
  }, delay);
}

function displayError(error: Error, delay = 5000) {
  displayMessage(error.message, error, delay);
}

export {
  messageState,
  displayError,
  displayMessage,
  DisplayMessage,
};
