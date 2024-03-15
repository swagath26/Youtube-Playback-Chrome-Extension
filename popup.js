document.getElementById('custom-playback-link').addEventListener('click', () => {
    document.getElementById('time-stamps-section').style.display = 'none';
    document.getElementById('custom-playback-section').style.display = 'block';
    document.getElementById('time-stamps-link').classList.remove('active');
    document.getElementById('custom-playback-link').classList.add('active');
})

document.getElementById('time-stamps-link').addEventListener('click', () => {
    document.getElementById('custom-playback-section').style.display = 'none';
    document.getElementById('time-stamps-section').style.display = 'block';
    document.getElementById('time-stamps-link').classList.add('active');
    document.getElementById('custom-playback-link').classList.remove('active');
})

var videoId;

function extractVideoIdFromUrl(url) {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
}

let timeStamps = [];
let clips = [];
let playBackAll = false;

function secondsToTimeFormat(seconds, mode) {
    let formattedText = '';
    let hours = parseInt(seconds/3600);
    let min = parseInt((seconds%3600)/60);
    let sec = parseInt(seconds%60);
    let millisec =  parseInt((seconds - parseInt(seconds))*100);

    if (mode == 'display') formattedText = formattedText.concat( 
        hours == 0 ? '' : `${hours}:${min < 10 ? '0' : ''}`,
        min,
        sec < 10 ? ':0' : ':', sec,
        millisec < 10 ? ' : 0' : ' : ', millisec )
    else if (mode == 'duration') formattedText = formattedText.concat(
        hours == 0 ? '' : `${hours}h ${min == 0 ? '0m ' : ''}`,
        min == 0 ? '' : `${min}m `,
        sec, 's ',
        millisec, 'ms' )

    return formattedText;
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const videoURL = currentTab.url;
    videoId = extractVideoIdFromUrl(videoURL);

    var isplaying = null;

    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        let videoSettings = my_yt_data[videoId] || {};
        isplaying = videoSettings['isplaying'] || null;
    })

    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        let videoSettings = my_yt_data[videoId] || {};
        isplaying = videoSettings['isplaying'] || null;
        console.log(isplaying);
        timeStamps = videoSettings.time_stamps || [];
        clips = videoSettings.clips || [];

        timeStamps && timeStamps.map((element, index) => {
            document.getElementById('time-stamps-header-empty').style.display = 'none';
            document.getElementById('time-stamps-list').style.display = 'block';
            const timeStampCard = document.createElement('div');
            timeStampCard.id = `stamp${index}`;
            timeStampCard.className = 'time-stamp-card';
            timeStampCard.innerHTML = `
                <div class="time-stamp-text">
                    <h2 class="time-stamp-title"> Bookmark ${index+1} </h2>
                    <b class="time-stamp-info">${secondsToTimeFormat(element, 'display')}</b>
                </div>
            `;
            const timeStampsList = document.getElementById('time-stamps-list');
            timeStampsList.append(timeStampCard);

            const timeStampButton = document.createElement('button');
            timeStampButton.id = `button${index}`;
            timeStampButton.className = 'time-stamp-play-button';
            timeStampButton.innerHTML = `<svg width="20px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>`;
            timeStampCard.append(timeStampButton);
            timeStampButton.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'seekToTimestamp', timestamp: element });
            })

            const timeStampDeleteButton = document.createElement('button');
            timeStampDeleteButton.id = `delete_${index}`;
            timeStampDeleteButton.className = `delete_stamp`;
            timeStampDeleteButton.innerHTML = '<svg width="20px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>';
            timeStampCard.append(timeStampDeleteButton);
            timeStampDeleteButton.addEventListener('click', () => {
                let delete_buttons = document.getElementsByClassName('delete_stamp');
                let len = videoSettings.time_stamps.length;
                let ind = parseInt(timeStampDeleteButton.id.split('_')[1]);
                for (let i=ind; i<len; i++) {
                    videoSettings.time_stamps[i] = i!=len-1 ? videoSettings.time_stamps[i+1] : null;
                    delete_buttons[i].id = i==ind ? `delete_` : `delete_${i-1}`;
                }
                videoSettings.time_stamps.pop();
                my_yt_data[videoId] = videoSettings;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data }, () => {
                    timeStampCard.parentNode.removeChild(timeStampCard);
                    if(!(videoSettings.time_stamps.length)) {
                        document.getElementById('time-stamps-header-empty').style.display = 'flex';
                        document.getElementById('time-stamps-list').style.display = 'none';
                    };
                });
                
            })
        })

        const stopButton = document.createElement('button');
        stopButton.id = 'stop_button';
        stopButton.className = 'clip-off-button'
        stopButton.innerHTML = 'Stop';

        const playAll = document.getElementById('play-all');
        const playSingle = document.getElementById('play-single');

        playAll.addEventListener('click', () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
            my_yt_data[videoId]['isplaying'] = null;
            chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
            isplaying = null;
            stopButton.remove();
            chrome.tabs.sendMessage(tabs[0].id, { action: 'playbackAll', clips: clips, loopVideo: true });
        })

        playSingle.addEventListener('click', () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackAll'});
        })

        clips && clips.map((element, index) => {
            document.getElementById('clips-header-empty').style.display = 'none';
            document.getElementById('clips-header-nonempty').style.display = 'flex';
            document.getElementById('clips-list').style.display = 'block';
            const clipCard = document.createElement('div');
            clipCard.id = `clip-${index}`;
            clipCard.className = 'clip-card';
            clipCard.innerHTML = `
                <div class="clip-text">
                    <h2 class="clip-title"> Segment ${index+1} </h2> 
                    <p class="clip-info">${secondsToTimeFormat(element.start, 'display')} ----- ${secondsToTimeFormat(element.end, 'display')}</p>
                    <b>( ${secondsToTimeFormat(element.end - element.start, 'duration')} )</b>
                </div>
            `
            const clipsList = document.getElementById('clips-list');
            clipsList.append(clipCard);

            const clipButton = document.createElement('button');
            clipButton.id = `clip_button${index}`;
            clipButton.className = 'clip-play-button';
            clipButton.innerHTML = `<svg width="20px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z"/></svg>`;

            clipCard.append(clipButton);
            clipButton.addEventListener('click', () => {
                if (stopButton.parentNode) stopButton.parentNode.removeChild(stopButton);
                chrome.tabs.sendMessage(tabs[0].id, { action: 'playbackLoop', clip: element });
                my_yt_data[videoId]['isplaying'] = clipCard.id;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                isplaying = clipCard.id;
                clipCard.append(stopButton);
                stopButton.addEventListener('click', () => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                    my_yt_data[videoId]['isplaying'] = clipCard.id;
                    chrome.storage.local.set({ 'my_yt_pb' : my_yt_data});
                    isplaying = null;
                    stopButton.remove();
                });
            })

            const clipDeleteButton = document.createElement('button');
            clipDeleteButton.id = `clip_delete_${index}`;
            clipDeleteButton.innerHTML ='<svg width="20px" fill="white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg>';
            clipDeleteButton.className = 'delete_clips';
            clipCard.append(clipDeleteButton);
            clipDeleteButton.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackAll'});
                if (isplaying === clipCard.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                    my_yt_data[videoId]['isplaying'] = null;
                    chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                    isplaying = null;
                }
                else if (isplaying > clipCard.id) {
                    my_yt_data[videoId]['isplaying'] = isplaying = `clip-${parseInt(isplaying.split('-')[1])-1}`;
                    chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                }

                let clip_delete_buttons = document.getElementsByClassName('delete_clips');
                let len = videoSettings.clips.length;
                let ind = parseInt(clipDeleteButton.id.split('_')[2]);
                for (let i=ind; i<len; i++) {
                    videoSettings.clips[i] = i!=len-1 ? videoSettings.clips[i+1] : null;
                    clip_delete_buttons[i].id = i==ind ? `clip_delete_` : `clip_delete_${i-1}`;
                }
                videoSettings.clips.pop();
                my_yt_data[videoId] = videoSettings;

                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data }, () => {
                    clipCard.parentNode.removeChild(clipCard);
                    if(!(videoSettings.clips.length)) {
                        document.getElementById('clips-header-empty').style.display = 'flex';
                        document.getElementById('clips-header-nonempty').style.display = 'none';
                        document.getElementById('clips-list').style.display = 'none';
                    }
                });
            })
        })

        if(isplaying && !stopButton.parentNode) {
            document.getElementById(isplaying).append(stopButton);
            stopButton.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                my_yt_data[videoId]['isplaying'] = null;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                isplaying = null;
                stopButton.remove();
            });
        }
    })
});
