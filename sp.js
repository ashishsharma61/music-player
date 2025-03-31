let currentAudio = null; // Track the currently playing audio
let songs = []; // Store song URLs globally
let currentIndex = -1; // Track current song index
let isPaused = false;
let play = document.getElementById("play");
let seekbar = document.querySelector(".seekbar"); // Seekbar element
let remaining = document.querySelector(".remaining"); // Progress bar inside seekbar
let songtime = document.querySelector(".songtime"); // Element to display song time
let songsTitle = [];
let volumeSlider = document.getElementById("volumeSlider");




async function getSongs(folder) {
    document.querySelector('.left').style.left = "0%";
    let a = await fetch(`http://127.0.0.1:5500/Music_Player/songs/${folder}`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    songsTitle = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
            songsTitle.push(element.title); // Use filename if title is empty
        }
    }
    let songsUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songsUl.innerHTML = ""; // Clear previous list

    songsTitle.forEach((title, index) => {
        let p = document.createElement("p");
        p.textContent = title;
        p.dataset.index = index; // Store index for mapping
        songsUl.appendChild(p);

        // Event Listener to play song on click
        p.addEventListener("click", function () {
            play.src = "pause.svg"
            playSong(index);
        });
    });
}






function playSong(index) {
    document.querySelector(".songinfo").innerHTML = songsTitle[index];
    let savedVolume = currentAudio ? currentAudio.volume : volumeSlider.value; // Save volume before changing song
    if (currentAudio) {
        currentAudio.pause(); // Pause the currently playing song
        currentAudio.currentTime = 0; // Reset time
    }
    currentAudio = new Audio(songs[index]);
    currentAudio.volume = savedVolume;
    currentAudio.play();
    currentIndex = index;
    isPaused = false;

    currentAudio.addEventListener("timeupdate", function () {
        let currentTime = formatTime(currentAudio.currentTime);
        let duration = formatTime(currentAudio.duration);
        let move = moving(currentAudio.duration, currentAudio.currentTime);
        remaining.style.width = `${move}%`; // Move progress bar
        songtime.textContent = `${currentTime} / ${duration}`;
    });

    volumeSlider.value = currentAudio.volume;

}












volumeSlider.addEventListener("input", function () {
    if (currentAudio) {
        currentAudio.volume = volumeSlider.value;
    }
});









play.addEventListener("click", function () {
    if (currentAudio) {
        if (isPaused) {
            currentAudio.play();
            play.src = "pause.svg"
        } else {
            currentAudio.pause();
            play.src = "play.svg"
        }
        isPaused = !isPaused;
    }
});

document.getElementById("previous").addEventListener("click", function () {
    if (currentIndex > 0) {
        playSong(currentIndex - 1);
    }
});

document.getElementById("next").addEventListener("click", function () {
    if (currentIndex < songs.length - 1) {
        playSong(currentIndex + 1);
    }
});






getSongs("other")











seekbar.addEventListener("click", function (e) {
    if (currentAudio) {
        let rect = seekbar.getBoundingClientRect(); // Get seekbar position
        let offsetX = e.clientX - rect.left; // Get click position
        let width = seekbar.clientWidth;
        let percent = offsetX / width; // Calculate percentage of bar clicked
        let newTime = percent * currentAudio.duration; // Convert to song time
        currentAudio.currentTime = newTime; // Set song position

        // Update Seekbar
        remaining.style.width = `${percent * 100}%`;
    }
});



document.addEventListener("keydown", function (event) {
    if (event.code === "Space") {
        event.preventDefault(); // Prevent page scrolling when spacebar is pressed
        if (currentAudio) {
            if (isPaused) {
                currentAudio.play();
                play.src = "pause.svg";
            } else {
                currentAudio.pause();
                play.src = "play.svg";
            }
            isPaused = !isPaused;
        }
    }
});

















function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

function moving(dSecond, cSecond) {
    return ((cSecond / dSecond) * 100);
}

document.querySelector('.plus').addEventListener('click', function (event) {
    // Check if the click happened near the ::before element (left side)
    if (event.offsetX < 25) { // Adjust based on icon size
        document.querySelector('.left').style.left = "0%";
    }
});

document.querySelector('.close-btn').addEventListener('click', function (event) {
    document.querySelector('.left').style.left = "-100%";

});