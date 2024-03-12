const tools_div = document.createElement('div');
tools_div.classList.add("button-container-cus");

const tools_button = document.createElement('button');
tools_button.id = "play-button";

const tools_tip = document.createElement('div');
tools_tip.id = 'tooltip';
tools_tip.classList.add('tooltip');
tools_tip.innerHTML = 'Custom Playback';

const settings = document.createElement('div');
settings.id = 'settings';
settings.classList.add('settings');

var start_time, end_time;

settings.innerHTML = 
`
            <div>
                <div class="timestamp-section">
                    <button id="add-time-stamp">Add Time Stamp</button>
                </div>

                <div class="portion-section">

                    <div class="portion-row">
                        <div class="time-label-column">
                            <button id="start-button">Start</button>
                        </div>
                        <div class="time-column">
                            <b id="start-time-show">hh : mm : ss</b>
                        </div>
                        <div class="speed-column">
                            <button>1x</button>
                        </div>
                    </div>

                    <div class="portion-row">
                        <div class="time-label-column">
                            <button id="end-button">End</button>
                        </div>
                        <div class="time-column">
                            <b id="end-time-show">hh : mm : ss</b>
                        </div>
                        <div class="speed-column">
                            <button>1x</button>
                        </div>
                    </div>
                    <div class="save-row">
                        <button id="save-button">Save Clip</button>
                    </div>
                </div>
            </div>
`
;

tools_div.appendChild(tools_button);
tools_div.appendChild(tools_tip);
tools_div.appendChild(settings);

window.addEventListener('load', function() {
    const targetNode = document.querySelector('.ytp-right-controls');
    if (targetNode) {
        targetNode.prepend(tools_div);
    }
});

tools_button.classList.add("ytp-button");
tools_button.innerHTML = '<svg height="100%" width="100%" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="-7 -9 42 42"><path d="m18.613 6.215 1.579-1.579-2.828-2.828-1.579 1.579A8.969 8.969 0 0 0 13 2.23V0H9v2.23a8.969 8.969 0 0 0-2.785 1.157L4.636 1.808 1.808 4.636l1.579 1.579A8.965 8.965 0 0 0 2.23 9H0v4h2.23a8.977 8.977 0 0 0 1.156 2.785l-1.579 1.58 2.828 2.827 1.579-1.579A8.984 8.984 0 0 0 9 19.77V22h4v-2.23a8.991 8.991 0 0 0 2.785-1.156l1.579 1.579 2.828-2.827-1.579-1.58A8.953 8.953 0 0 0 19.769 13H22V9h-2.23a8.965 8.965 0 0 0-1.157-2.785zM12.5 13.028 9 15.038V7l3.5 2.01 3.5 2.009z"/></svg>';

tools_button.addEventListener('mouseover', () => {
    tools_tip.style.visibility = 'visible';
});
  
tools_button.addEventListener('mouseout', () => {
    tools_tip.style.visibility = 'hidden';
});

document.addEventListener('click', (event) => {
    const isClickInsideSettings = settings.contains(event.target);
    const isClickOnPlayButton = event.target === tools_button;

    if (!isClickInsideSettings && !isClickOnPlayButton) {
        settings.style.display = 'none';
    }
})

tools_button.addEventListener('click', () => {
    tools_tip.style.visibility = 'hidden';
    settings.style.display = (settings.style.display === 'block') ? 'none' : 'block';
});

const videoId = new URL(document.location.href).searchParams.get('v');

window.addEventListener('load', function() {
    const startButton = document.getElementById('start-button');
    const endButton = document.getElementById('end-button');
    startButton && startButton.addEventListener('click', (event) => {
        start_time = document.querySelector('.html5-main-video').currentTime;
        document.getElementById("start-time-show").innerHTML = `${parseInt(start_time/3600)} : ${parseInt((start_time%3600)/60)} : ${parseInt(start_time%60)}`;
    })
    endButton && endButton.addEventListener('click', () => {
        end_time = document.querySelector('.html5-main-video').currentTime;
        document.getElementById("end-time-show").innerHTML = `${parseInt(end_time/3600)} : ${parseInt((end_time%3600)/60)} : ${parseInt(end_time%60)}`;
    })
});

window.addEventListener('load', function() {
    const addTimeStampButton = document.getElementById('add-time-stamp');
    if (addTimeStampButton) {
        addTimeStampButton.addEventListener('click', () => {
            const player = document.querySelector('.html5-main-video');
            addTimeStamp(player.currentTime);
        });
    }
});

window.addEventListener('load', function() {
    const addClipButton = document.getElementById('save-button');
    if (addClipButton) {
        addClipButton.addEventListener('click', () => {
            addClip(start_time, end_time, 1);
            start_time = null;
            end_time = null;
            document.getElementById("start-time-show").innerHTML = 'hh : mm : ss';
            document.getElementById("end-time-show").innerHTML = 'hh : mm : ss';
        });
    }
});

var interval_fun;
var interval_fun2;

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const player = document.querySelector('.html5-main-video');
    if (message.action === 'seekToTimestamp') {
        // clearInterval(interval_fun);
        if (player) {
            player.currentTime = message.timestamp;
        } else {
            console.log('YouTube player element not found.');
        }
    }
    if (message.action === 'playbackLoop') {
        clearInterval(interval_fun);
        const video = document.querySelector('video');
        if (player) {
            player.currentTime = message.clip.start;
        } else {
            console.log('YouTube player element not found.');
        }
        function loopClip() {
            if (player.currentTime >= message.clip.end) {
                player.currentTime = message.clip.start;
            }
            if (player.currentTime < message.clip.start) {
                player.currentTime = message.clip.start;
            }
        }
        interval_fun = setInterval(loopClip, 100);
        // if (video) {
        //     video.playbackRate = 2.0;
        // }
        // else {
        //     console.log('YouTube video element not found.');
        // }
    }
    if (message.action === 'stopPlaybackLoop') {
        clearInterval(interval_fun);
    }
    if (message.action === 'playbackAll') {
        clearInterval(interval_fun);
                let i=0;
                if (player) {
                    player.currentTime = message.clips[i].start;
                } else {
                    console.log('YouTube player element not found.');
                }
                function loopClip2() {
                    if (player.currentTime >= message.clips[i].end) {
                        if(i == message.clips.length - 1) {
                            i = 0;
                            player.currentTime = message.clips[0].start;
                            // player.currentTime = message.clips[i].end;
                            // player.pause();
                        }
                        else {
                            i += 1;
                            player.currentTime = message.clips[i].start;
                        }
                    }
                    if (player.currentTime < message.clips[i].start) {
                        i == 0 ? i = 0 : i -= 1;
                        player.currentTime = message.clips[i].start;
                    }
                }
                interval_fun2 = setInterval(loopClip2, 100);
    }
    if (message.action === 'stopPlaybackAll') {
        clearInterval(interval_fun2);
    }
});

window.addEventListener('load', () => {
    clearInterval(interval_fun);
    clearInterval(interval_fun2);
})

function addTimeStamp(timestamp) {
    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        let videoSettings = my_yt_data[videoId] || {};
        videoSettings.time_stamps = videoSettings.time_stamps || [];
        videoSettings.time_stamps.push(timestamp);
        my_yt_data[videoId] = videoSettings;
        chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
    })
}

function addClip(start, end, speed) {
    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        let videoSettings = my_yt_data[videoId] || {};
        videoSettings.clips = videoSettings.clips || [];
        videoSettings.clips.push({'start': start, 'end': end, 'speed': speed});
        my_yt_data[videoId] = videoSettings;
        chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
    })
}