import electron from 'electron';
import Gato from './Gato';

export interface Command {
    label: string;
    id: string;
    execute: (window?: electron.BrowserWindow) => Promise<void>;
}

const commands: Command[] = [
    {
        label: 'New Window',
        id: 'new',
        execute: async () => {
            await Gato.create({ q: 'gato://home' });
        },
    },
    {
        label: 'Close Window',
        id: 'close',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.close();
            }
        },
    },
    {
        label: 'Reopen Closed Window',
        id: 'reopen',
        execute: async () => {
            Gato.reopen();
        },
    },
    {
        label: 'Duplicate Window',
        id: 'duplicate',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.duplicate();
            }
        },
    },
    {
        label: 'Back',
        id: 'back',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.back();
            }
        },
    },
    {
        label: 'Forward',
        id: 'forward',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.forward();
            }
        },
    },
    {
        label: 'Reload',
        id: 'reload',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.reload();
            }
        },
    },
    {
        label: 'Open DevTools',
        id: 'openDevTools',
        execute: async (window) => {
            if (window) {
                const gato = Gato.getFocused();
                if (gato) gato.openDevTools();
            }
        },
    },
    {
        label: 'Quit',
        id: 'quit',
        execute: async () => {
            electron.app.quit();
        },
    },
];

export default commands;