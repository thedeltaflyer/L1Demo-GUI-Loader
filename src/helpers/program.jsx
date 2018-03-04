import { ipcRenderer } from 'electron';

const killProgram = () => {
  ipcRenderer.send('requst-mainprocess-kill-program');
};


const pollForTty = (advanced = false) => {
  ipcRenderer.send(`request-mainprocess-get-tty${advanced ? '-adv' : ''}`);
};


const pollForLastOptions = () => {
  ipcRenderer.send('request-mainprocess-get-last-options');
};


const getLastRun = () => {
  ipcRenderer.send('request-last-runtime');
};


export { killProgram, pollForTty, pollForLastOptions, getLastRun };
export default { killProgram, pollForTty, pollForLastOptions, getLastRun };
