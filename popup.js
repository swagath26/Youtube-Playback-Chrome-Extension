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

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const videoURL = currentTab.url;
    videoId = extractVideoIdFromUrl(videoURL);

    var isplaying;

    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        isplaying = my_yt_data['isplaying'] || null;
    })

    chrome.storage.local.get('my_yt_pb', (data) => {
        let my_yt_data = data['my_yt_pb'] || {};
        let videoSettings = my_yt_data[videoId] || {};
        timeStamps = videoSettings.time_stamps || [];
        clips = videoSettings.clips || [];

        timeStamps && timeStamps.map((element, index) => {
            const timeStampCard = document.createElement('div');
            timeStampCard.id = `stamp${index}`;
            timeStampCard.style.height = '60px';
            timeStampCard.style.width = '100%';
            timeStampCard.innerHTML = `
                <h1>${Math.floor(element/3600)}:${Math.floor((element%3600)/60)}:${element%60}</h1>
            `
            const timeStampsList = document.getElementById('time-stamps-list');
            timeStampsList.append(timeStampCard);

            const timeStampButton = document.createElement('button');
            timeStampButton.id = `button${index}`;
            timeStampButton.innerHTML = 'Play';
            timeStampCard.append(timeStampButton);
            timeStampButton.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'seekToTimestamp', timestamp: element });
            })

            const timeStampDeleteButton = document.createElement('button');
            timeStampDeleteButton.id = `delete_${index}`;
            timeStampDeleteButton.className = `delete_stamp`;
            timeStampDeleteButton.innerHTML = 'Delete';
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
                });
            })
        })

        const stopButton = document.createElement('button');
        stopButton.id = 'stop_button';
        stopButton.innerHTML = 'Off';

        const playAll = document.getElementById('play-all');
        const playSingle = document.getElementById('play-single');

        playAll.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                my_yt_data['isplaying'] = null;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                isplaying = null;
                stopButton.remove();
                chrome.tabs.sendMessage(tabs[0].id, { action: 'playbackAll', clips: clips });
        })

        playSingle.addEventListener('click', () => {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackAll'});
        })

        clips && clips.map((element, index) => {
            const clipCard = document.createElement('div');
            clipCard.id = `clip${index}`;
            clipCard.style.height = '120px';
            clipCard.style.width = '100%';
            clipCard.innerHTML = `
                <h3>${Math.floor((element.start)/3600)}:${Math.floor(((element.start)%3600)/60)}:${(element.start)%60}</h3>
                <h3>${Math.floor((element.end)/3600)}:${Math.floor(((element.end)%3600)/60)}:${(element.end)%60}</h3>
            `
            const clipsList = document.getElementById('portions-list');
            clipsList.append(clipCard);

            const clipButton = document.createElement('button');
            clipButton.id = `clip_button${index}`;
            clipButton.innerHTML = 'Play';

            clipCard.append(clipButton);
            clipButton.addEventListener('click', () => {
                if (stopButton.parentNode) stopButton.parentNode.removeChild(stopButton);
                chrome.tabs.sendMessage(tabs[0].id, { action: 'playbackLoop', clip: element });
                my_yt_data['isplaying'] = clipCard.id;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                isplaying = clipCard.id;
                clipCard.append(stopButton);
                stopButton.addEventListener('click', () => {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                    my_yt_data['isplaying'] = clipCard.id;
                    chrome.storage.local.set({ 'my_yt_pb' : my_yt_data});
                    isplaying = null;
                    stopButton.remove();
                });
            })

            const clipDeleteButton = document.createElement('button');
            clipDeleteButton.id = `clip_delete_${index}`;
            clipDeleteButton.innerHTML = 'Delete';
            clipButton.className = 'delete_clips';
            clipCard.append(clipDeleteButton);
            clipDeleteButton.addEventListener('click', () => {
                if (isplaying === clipCard.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                    chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackAll'});
                    my_yt_data['isplaying'] = null;
                    chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                    isplaying = null;
                }

                let delete_buttons = document.getElementsByClassName('delete_clip');
                let len = videoSettings.clips.length;
                let ind = parseInt(clipDeleteButton.id.split('_')[1]);
                for (let i=ind; i<len; i++) {
                    videoSettings.clips[i] = i!=len-1 ? videoSettings.clips[i+1] : null;
                    delete_buttons[i].id = i==ind ? `clip_delete_` : `clip_delete_${i-1}`;
                }
                videoSettings.clips.pop();
                my_yt_data[videoId] = videoSettings;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data }, () => {
                    clipCard.parentNode.removeChild(clipCard);
                });
            })
        })

        if(isplaying && !stopButton.parentNode) {
            document.getElementById(isplaying).append(stopButton);
            stopButton.addEventListener('click', () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'stopPlaybackLoop'});
                my_yt_data['isplaying'] = null;
                chrome.storage.local.set({ 'my_yt_pb' : my_yt_data });
                isplaying = null;
                stopButton.remove();
            });
        }
    })
});
