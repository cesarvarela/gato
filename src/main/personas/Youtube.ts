import { Confidence, IParseResult, IPersona, IYoutube, PersonaName } from "../../interfaces";
import isURL from "validator/lib/isURL";
import { handleApi } from "../../utils/bridge";
import settings from '../Settings'
import { google } from 'googleapis';
import YouTubeAuth from "../auth/YouTubeAuth";

const youtube = google.youtube('v3');

class Youtube implements IPersona {

    name: PersonaName = 'youtube'
    static instance: Youtube
    api: IYoutube
    authInstance: YouTubeAuth

    static async getInstance() {

        if (!Youtube.instance) {

            Youtube.instance = new Youtube()
            await Youtube.instance.init()
            return Youtube.instance
        }

        return Youtube.instance
    }

    async init() {
        // Initialize YouTube auth
        this.authInstance = await YouTubeAuth.getInstance();

        this.api = {
            getComments: async ({ v: videoId }) => {
                try {
                    // First attempt to use OAuth if authenticated
                    if (this.authInstance.isAuthenticated()) {
                        const auth = await this.authInstance.getAuthClient();
                        const youtubeClient = google.youtube({
                            version: 'v3',
                            auth
                        });

                        const { data: { items } } = await youtubeClient.commentThreads.list({
                            part: ["snippet,replies"],
                            order: "relevance",
                            videoId
                        });

                        return items;
                    } else {
                        // Fall back to API key if not authenticated
                        if (settings.store.youtube.key) {
                            const { data: { items } } = await youtube.commentThreads.list({
                                part: ["snippet,replies"],
                                order: "relevance",
                                videoId,
                                key: settings.store.youtube.key,
                            });
                            return items;
                        } else {
                            // If no API key either, prompt for authentication
                            const success = await this.authInstance.authenticate();
                            if (success) {
                                return this.api.getComments({ v: videoId });
                            }
                        }
                    }
                    return [];
                } catch (error) {
                    console.error("Error fetching comments: ", error);
                    return [];
                }
            },
            isAuthenticated: async () => {
                return this.authInstance.isAuthenticated();
            },
            authenticate: async () => {
                return this.authInstance.authenticate();
            },
            signOut: async () => {
                this.authInstance.signOut();
            }
        }

        handleApi('youtube', this.api)
    }

    async parse(q): Promise<IParseResult[]> {

        if (isURL(q, { host_whitelist: ['youtube.com', 'www.youtube.com', 'youtu.be'], require_protocol: false })) {

            try {
                let videoId = null;
                const parsed = new URL(q.startsWith('http') ? q : `https://${q}`);
                
                // Handle youtube.com URLs
                if (parsed.hostname.includes('youtube.com') && parsed.searchParams.has('v')) {
                    videoId = parsed.searchParams.get('v');
                } 
                // Handle youtu.be URLs
                else if (parsed.hostname === 'youtu.be') {
                    videoId = parsed.pathname.substring(1);
                }

                if (videoId) {
                    return [{ 
                        name: this.name, 
                        confidence: Confidence.VeryHigh, 
                        href: `gato://youtube?v=${videoId}` 
                    }];
                }
            }
            catch (e) {
                console.error(e)
            }
        }
        
        return [];
    }
}

export default Youtube