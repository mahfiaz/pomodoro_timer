var cycleCount = 0;
var timer;

var audioWork = new Audio("back_to_work_Barbossa.mp3");
var audioBreak = new Audio("break_time.mp3");

var isBreak = false;
var isWork = false;

var start; // milliseconds
var end; // milliseconds
var length; // seconds
var remaining; // seconds

// Default lengths in minutes
var defaultPomodoro = 25;
var defaultLongBreak = 15;
var defaultShortBreak = 5;

var precision = true;
var pretickLength = 900;
var tickLength = 10;
var unpreciseTickLength = 5000;


function starting() {
    var time = Date.now();
    start = time;
    end = start + length * 1000;
    remaining = length;
    display();
    timer = window.setInterval(pretick, pretickLength);
}

function pretick() {
    clearInterval(timer);
    timer = window.setInterval(tick, tickLength);
}

function tick() {
    var time = Date.now();
    var diff = Math.floor((end - time) / 1000);

    if (diff != remaining) {
        remaining = diff;
        display();

        // Handle reaching zero
        if (diff <= 0) {
            ending();
            return;
        }

        clearInterval(timer);
        if (precision) {
            timer = window.setInterval(pretick, pretickLength);
        } else {
            // Calculate almost exact length for next tick
            var currentLen = (end - time - 100) % unpreciseTickLength;
            timer = window.setInterval(tick, currentLen);
        }
    }
}

function ending() {
    clearInterval(timer);

    if (isWork) {
        cycleCount += 1;
        pomodoro_break();
    }
    else if (isBreak) {
        pomodoro();
    }
}

function display() {
    var minutes = Math.floor(remaining / 60);
    var seconds = remaining % 60;
    if (minutes < 10) minutes = '0' + minutes;
    if (seconds < 10) seconds = '0' + seconds;
    document.getElementById('minutes').innerText = minutes;
    document.getElementById('seconds').innerText = seconds;

    var width = (length - remaining) / length;
    $('#progressbar').css('width', (width * 100) + '%');
}

function pomodoro() {
    isWork = true;
    isBreak = false;
    length = 60 * defaultPomodoro;
    $("#start").css("visibility", "hidden");
    $("#task").css("visibility", "visible");
    $("#time-left").css("visibility", "visible");
    $("#task").html("Get to work!");
    audioWork.play();
    starting();
}

function pomodoro_break() {
    isBreak = true;
    isWork = false;

    if (cycleCount % 4 != 0) {
        // Short break
        length = 60 * defaultShortBreak;
    } else {
        // Long break
        length = 60 * defaultLongBreak;
    }
    $("#task").html("Take a break!");
    audioBreak.play();
    starting();
}

function handleVisibilityChange() {
    precision = !document.hidden;
    if (precision) {
        tick();
    } else {
        clearInterval(timer);
        timer = window.setInterval(tick, unpreciseTickLength);
    }
}

window.onload = function() {
    document.addEventListener('visibilitychange', handleVisibilityChange, false);

    $('#pomodoro').click(pomodoro);
    $('#break').click(pomodoro_break);
};
