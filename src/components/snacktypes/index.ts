import { PersonaName } from "../../interfaces";
import Home from "./Home";
import Reader from "./Reader";
import Search from "./Search";
import YoutubeVideo from "./YoutubeVideo";

const map: Partial<Record<PersonaName, unknown>> = {
    home: Home,
    read: Reader,
    search: Search,
    youtube: YoutubeVideo,
}

export default map