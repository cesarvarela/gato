import Gato from "./main/Gato";

declare module "*.png";

declare module "electron" {
    interface BrowserWindow {
        gato: Gato
    }
}
