
const Latex = ({ children, displayMode = false }) => {
    const [html, setHtml] = React.useState(children);
    React.useEffect(() => {
        if (window.katex) {
            setHtml(window.katex.renderToString(children, { throwOnError: false, displayMode }));
        }
    }, [children, displayMode]);
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const MOBILE_TARGET_WIDTH = 800;

const useScale = () => {
    const [scale, setScale] = React.useState(1);
    const [visualScale, setVisualScale] = React.useState(1);
    const [textScale, setTextScale] = React.useState(1);
    const [mobileScale, setMobileScale] = React.useState(1);
    const [textWidth, setTextWidth] = React.useState(35);

    React.useEffect(() => {
        const handleResize = () => {
            // Check for portrait mode (mobile/tablet vertical)
            const isPortrait = window.innerHeight / window.innerWidth > 0.75;

            if (isPortrait) {
                setScale(1);
                setVisualScale(1);
                setTextScale(1);

                // Mobile Scaling: Ensure content fits in narrow screens
                const targetWidth = MOBILE_TARGET_WIDTH;
                const padding = 0; 
                const availableWidth = window.innerWidth - padding;

                if (availableWidth < targetWidth) {
                    setMobileScale((availableWidth / targetWidth) * 0.97);
                } else {
                    setMobileScale(0.97);
                }
            } else {
                setMobileScale(1);
                // Scale based on 1440px width for landscape
                const s = window.innerWidth / 1440;
                setScale(s);

                // Calculate visual scale to fit height (fill vertical space)
                const effectiveH = window.innerHeight / s;
                const targetBaseH = 680; // Base height of visual content
                const baseVisualWidth = 907; // Base width (approx 4/3 of 680)

                // 1. Calculate ideal scale to fill height
                let idealVScale = effectiveH / targetBaseH;

                // 2. Calculate required width at this scale
                const reqWidth = baseVisualWidth * idealVScale;

                // 3. Calculate remaining width for text
                const availTextWidth = 1440 - reqWidth;
                let textWidthPercent = (availTextWidth / 1440) * 100;

                // 4. Check constraints (Text compressed?)
                const minTextWidthPercent = 30; // Minimum 30% width for text
                
                let finalVScale = idealVScale;
                let finalTextWidth = textWidthPercent;

                if (textWidthPercent < minTextWidthPercent) {
                    // Text is too compressed, clamp it
                    finalTextWidth = minTextWidthPercent;
                    
                    // Recalculate max allowed visual scale
                    const maxAvailVisualWidth = 1440 * (1 - (minTextWidthPercent / 100));
                    // Add a small buffer to prevent exact edge touching/rounding errors
                    const safeAvailWidth = maxAvailVisualWidth - 20; 
                    finalVScale = safeAvailWidth / baseVisualWidth;
                }

                // Apply values
                if (finalTextWidth > 50) finalTextWidth = 50;

                setTextWidth(finalTextWidth);
                
                // User Request: Reduce overall landscape visual scale by 5%
                const reducedScale = finalVScale * 0.95;
                setVisualScale(reducedScale);

                // Text Scale: Match visual scale but with floor
                setTextScale(Math.max(reducedScale, 0.75));
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return { scale, visualScale, textScale, mobileScale, textWidth };
};

const useAudioController = (curr) => {
    const audioRef = React.useRef(null);
    const transitionTimeoutRef = React.useRef(null);
    const isSpecialRef = React.useRef(false);
    const [isPlaying, setIsPlaying] = React.useState(false);

    // Audio Helpers
    // Audio Helpers
    const fadeAudioOut = (audio, duration = 1000) => {
        if (!audio) return;
        const steps = 20;
        const interval = duration / steps;
        // On iOS, volume property might be read-only or not affect playback, 
        // so we track logical volume locally to ensure the loop finishes and pauses.
        let localVol = audio.volume; 
        const volStep = localVol / steps;
        let currentStep = 0;
        
        const timer = setInterval(() => {
            currentStep++;
            localVol -= volStep;
            
            // Attempt to set volume (works on desktop/Android)
            if (localVol >= 0) {
                 try { audio.volume = localVol; } catch(e) {}
            }

            if (currentStep >= steps) {
                audio.pause();
                try { audio.volume = 0; } catch(e) {} // Ensure 0 if possible
                clearInterval(timer);
            }
        }, interval);
    };

    const fadeAudioIn = (audio, duration = 1000) => {
        if (!audio) return;
        try { audio.volume = 0; } catch(e) {}
        audio.play().catch(e => console.error("Audio play failed:", e));
        
        const steps = 20;
        const interval = duration / steps;
        const targetVol = 1;
        const volStep = targetVol / steps;
        let localVol = 0;
        let currentStep = 0;
        
        const timer = setInterval(() => {
           currentStep++;
           localVol += volStep;
           
           if (localVol <= 1) {
               try { audio.volume = localVol; } catch(e) {}
           }
           
           if (currentStep >= steps) {
               try { audio.volume = 1; } catch(e) {}
               clearInterval(timer);
           }
        }, interval);
    };

    const playTrack = (pageIndex, fadeInDuration = 1000) => {
        isSpecialRef.current = false;
        const trackNum = String(pageIndex + 1).padStart(2, '0');
        const audioPath = `source/${trackNum}.wav`;
        const audio = new Audio(audioPath);
        audio.dataset.pageIndex = pageIndex;
        audio.onended = () => setIsPlaying(false);
        
        audioRef.current = audio;
        fadeAudioIn(audio, fadeInDuration);
    };

    const playSpecialTrack = (url) => {
        isSpecialRef.current = true;
        
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }
        if (audioRef.current) {
            fadeAudioOut(audioRef.current, 500);
        }

        const audio = new Audio(url);
        audio.dataset.isSpecial = "true";
        audio.onended = () => {
            setIsPlaying(false);
            isSpecialRef.current = false;
        };
        
        audioRef.current = audio;
        setIsPlaying(true);
        // Special track starts immediately after fade out of previous (or overlap)
        setTimeout(() => fadeAudioIn(audio, 1000), 500); 
    };

    // Audio Playback Handler
    const togglePageAudio = () => {
        if (isPlaying) {
            // Pause
            setIsPlaying(false);
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
            if (audioRef.current) {
                fadeAudioOut(audioRef.current, 300);
            }
        } else {
            // Play
            setIsPlaying(true);
            
            // Check if we can resume current track
            if (audioRef.current) {
                const isCorrectPage = audioRef.current.dataset.pageIndex == curr;
                const isSpecial = isSpecialRef.current;
                
                if (isSpecial || isCorrectPage) {
                    if (audioRef.current.paused || audioRef.current.volume < 1) {
                        fadeAudioIn(audioRef.current, 500);
                    } else {
                        audioRef.current.play().catch(e => console.error(e));
                    }
                    return;
                }
            }
            
            // New track needed
            if (audioRef.current) {
                fadeAudioOut(audioRef.current, 500);
            }
            playTrack(curr, 1000);
        }
    };

    // Auto-switch audio on page change
    React.useEffect(() => {
        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }

        // If Special Audio is playing, ignore page switch
        if (isSpecialRef.current && isPlaying) {
            return;
        }

        if (isPlaying) {
            // 1. Fade out old immediately
            if (audioRef.current) {
                fadeAudioOut(audioRef.current, 1000);
            }
            
            // 2. Wait 1s before starting new
            transitionTimeoutRef.current = setTimeout(() => {
                playTrack(curr, 1000);
            }, 1000);
            
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                // Do not set audioRef.current to null immediately if we want to potentially resume?
                // But the previous code paused and cleaned up if silent.
                // "If silent, ensure everything is clean."
                // In togglePageAudio, if we resume, we check dataset.pageIndex.
                
                // If we set to null here, resume won't work.
                // Wait, previous code:
                // else { if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; } }
                // PROBABLY better to NOT set to null if we want to sustain the object for resume check?
                // But `togglePageAudio` logic: "Check if we can resume current track ... if (audioRef.current ...)"
                // If I set it to null here, logic says "New track needed". 
                // Let's stick to original logic: Clean up when stopping.
                audioRef.current = null;
            }
        }
        
        return () => {
             if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, [curr]); // Trigger on page change

    // Preload Audio
    React.useEffect(() => {
        const preload = (url) => {
            const audio = new Audio();
            audio.src = url;
            audio.load();
        };
        ['01','02','03','04','05','06','07','08','09','EX'].forEach(id => {
            preload(`source/${id}.wav`);
        });
    }, []);

    return { isPlaying, togglePageAudio, playSpecialTrack };
};
