function getTopBarTemplate() {
    return `
        <div id="topInfoBar" class="top-bar">
            <div class="top-bar-left desktop-only">
                <button class="top-icon-btn" type="button" onclick="returnToStartScreen()" aria-label="Zurück">
                    <img src="./assets/img/8_coin/back.png" alt="Zurück">
                </button>

                <button id="audioToggleBtn" class="top-icon-btn audio-btn" type="button" onclick="switchAudioMode()" aria-label="Audio umschalten">
                    <img id="audioToggleIcon" src="./assets/img/8_coin/audio.png" alt="Audio">
                    <span id="audioMuteSlash" class="audio-mute-slash hidden-audio-slash"></span>
                </button>

                <button id="fullscreenBtn" class="top-icon-btn" type="button" onclick="mobileControls.toggleFullscreen()" aria-label="Vollbild">
                    <img src="./assets/img/8_coin/fullscreen.png" alt="Vollbild">
                </button>

                <button id="restartIconBtn" class="top-icon-btn" type="button" onclick="restartRoundDirectly()" aria-label="Neustart">
                    <img src="./assets/img/8_coin/neustart.png" alt="Neustart">
                </button>
            </div>

            <div class="mobile-menu-wrap mobile-only">
                <button id="mobileMenuToggle" class="top-icon-btn mobile-top-btn" type="button" onclick="toggleInfoMenu()" aria-label="Menü">☰</button>

                <div id="mobileInfoMenu" class="mobile-info-menu hidden-layer">
                    <button class="mobile-info-item" type="button" onclick="returnToStartScreen()" aria-label="Zurück">
                        <img src="./assets/img/8_coin/back.png" alt="Zurück">
                    </button>

                    <button class="mobile-info-item audio-btn" type="button" onclick="switchAudioMode()" aria-label="Audio umschalten">
                        <img id="mobileAudioToggleIcon" src="./assets/img/8_coin/audio.png" alt="Audio">
                        <span id="mobileAudioMuteSlash" class="audio-mute-slash hidden-audio-slash"></span>
                    </button>

                    <button class="mobile-info-item" type="button" onclick="mobileControls.toggleFullscreen()" aria-label="Vollbild">
                        <img src="./assets/img/8_coin/fullscreen.png" alt="Vollbild">
                    </button>

                    <button class="mobile-info-item" type="button" onclick="restartRoundDirectly()" aria-label="Neustart">
                        <img src="./assets/img/8_coin/neustart.png" alt="Neustart">
                    </button>

                    <button class="mobile-info-item" type="button" onclick="openLegalOverlayFromMenu()" aria-label="Impressum">ℹ</button>

                    <button class="mobile-info-item" type="button" onclick="openGuideOverlayFromMenu()" aria-label="Spielübersicht">
                        <img src="./assets/img/questioning.png" alt="Spielübersicht">
                    </button>
                </div>
            </div>
        </div>
    `;
}

function getStartButtonTemplate() {
    return `
        <div id="startScreenUi" class="start-screen-ui">
            <button id="startBtn" class="start-screen-btn" type="button">Start</button>
        </div>
    `;
}

function getBottomButtonsTemplate() {
    return `
        <div id="desktopBottomActions" class="desktop-bottom-actions desktop-only">
            <button class="bottom-action-btn" type="button" onclick="openLegalOverlay()">Impressum</button>
            <button class="bottom-action-btn" type="button" onclick="openGuideOverlay()">Spielübersicht</button>
        </div>
    `;
}