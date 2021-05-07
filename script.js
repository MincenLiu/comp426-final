// API1: https://github.com/lukePeavey/quotable
// API2: IP Geo Location (https://rapidapi.com/natkapral/api/ip-geo-location/endpoints)
// API3: Open Weather Map (https://rapidapi.com/community/api/open-weather-map?endpoint=53aa6041e4b00287471a2b62)
// API4: Google Places API
// API5: Dad Jokes (https://rapidapi.com/KegenGuyll/api/dad-jokes/endpoints)


// create database reference
const dbRefUsers = firebase.database().ref().child('users');

function login(e) {
    e.preventDefault();
    let email = $('#txtEmail').val();
    let pass = $('#txtPassword').val();
    let auth = firebase.auth();
    let emailStr = `${email}`.substring(0, `${email}`.indexOf('@'));

    // Log In
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.then(() => {
        $('#warning').html('');
        let footer = `<footer id="footer">
                        <small>Copyright &copy;2021 | Made With 🖥, ⌨️, and ❤️ by Mincen Liu. All rights reserved.</small>
                    </footer>`;
        if (!$('#footer').length) {
            $('body').append(footer);
        }
        $('#afterWakeUp').addClass('hide');     
        dbRefUsers.child(emailStr).child("isDark").on('value', function(snapshot) {
            let dark = snapshot.val();

            if (dark) {
                darkMode();
            } else {
                lightMode();
            };
        });

        let wakeUpPopUp = `
            <div id="popup" class="popup">
                <h2>What time did you wake up today?</h2>
                <input type="image" id="close" alt="Close" src="./assets/Check.png">
                <input type="time" id="wakeUp" name="wakeUp" required>
            </div>`;

        if (!$('#popup').length) {
            $('#weather').after(wakeUpPopUp);
        }
    });
    promise.catch(e => $('#warning').html(`Warning: ${e.message}`));
    //console.log(e.message)
}

function timeOk(e) {
    e.preventDefault();
    // remove popup, display new Todo, add time slots...
    let wakeUpTime = $('#wakeUp').val();
    $('#wakeUp').val() = '';

    if (wakeUpTime !== '') {
        $('#popup').remove();
        $('#afterWakeUp').removeClass('hide');
        genTimeSlots(wakeUpTime);
    } else {
        if (!$('#inputPlz').length) {
            $('#wakeUp').after('<p id="inputPlz">Please input your wakeup time.</p>');
        }
    }
}


// function keepTheme() {
//     let user = firebase.auth().currentUser;

//     if (user != null) {
//         let curUserEmail = user.email;
//         let emailStr = curUserEmail.substring(0, curUserEmail.indexOf('@'));
//         dbRefUsers.child(emailStr).child("isDark").on('value', function(snapshot) {
//             let dark = snapshot.val();

//             if (dark) {
//                 darkMode();
//             } else {
//                 lightMode();
//             };
//         });
//     }
// }


function signup(e) {
    e.preventDefault();
    // TO DO: check for real email address
    let email = $('#txtEmail').val();
    let pass = $('#txtPassword').val();
    let auth = firebase.auth();
    let emailStr = `${email}`.substring(0, `${email}`.indexOf('@'));

    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.then(() => {
        $('#warning').html('');
        let footer = `<footer id="footer">
                        <small>Copyright &copy;2021 | Made With 🖥, ⌨️, and ❤️ by Mincen Liu. All rights reserved.</small>
                    </footer>`;
        if (!$('#footer').length) {
            $('body').append(footer);
        }
        $('#afterWakeUp').addClass('hide');
        dbRefUsers.child(emailStr).set({
            email: `${email}`,
            isDark: false
        });

        let wakeUpPopUp = `
            <div id="popup" class="popup">
                <h2>What time did you wake up today?</h2>
                <input type="image" id="close" alt="Close" src="./assets/Check.png">
                <input type="time" id="wakeUp" name="wakeUp" required>
            </div>`;

        if (!$('#popup').length) {
            $('#weather').after(wakeUpPopUp);
        }
    });
    promise.catch(e => $('#warning').html(`Warning: ${e.message}`));
}

function logout(e) {
    e.preventDefault();
    firebase.auth().signOut();
    lightMode();
}

// Add a realtime listener
firebase.auth().onAuthStateChanged(firebaseUser => {
    if (firebaseUser) {
        console.log(firebaseUser);
        $('#btnLogOut').removeClass('hide');
        $('#root').removeClass('hide');

        $('#loggedin').addClass('hide');

    } else {
        console.log('not logged in');
        $('#btnLogOut').addClass('hide');
        $('#root').addClass('hide');

        $('#loggedin').removeClass('hide');
    }
});

// change theme
function changeTheme() {
    if (!$('#modes').length) {
        let selection = `
            <div id="modes" class="dropdown-content">
                <input type="radio" id="light" name="theme" value="Light mode">
                <label for="light">Light mode</label><br>
                <input type="radio" id="dark" name="theme" value="Dark mode">
                <label for="dark">Dark mode</label>
                <button id="ok">Ok</button>
                <br>
            </div>`;

        $('#changeTheme').after(selection);
    }
}

// select a theme
function ok() {
    let theme = $("input[name='theme']:checked").val();
    $('#modes').remove();
    let user = firebase.auth().currentUser;
    let curUserEmail = user.email;
    let emailStr = curUserEmail.substring(0, curUserEmail.indexOf('@'));
    if (theme === 'Dark mode') {
        dbRefUsers.child(emailStr).update({
            isDark: true
        });
    } else {
        dbRefUsers.child(emailStr).update({
            isDark: false
        });
    }

    if (theme === 'Light mode') {
        lightMode();
    } else if (theme === 'Dark mode') {
        darkMode();
    }
}

function lightMode() {
    $('body').css("background-image", 'none');
    $('body').css("background-color", "#FFFACD");
    $('#weather').css("background-color", "");
    $('#todos').css("color", "black");
    $('#header1').css("color", "black");
}

function darkMode() {
    let imgUrl = 'assets/hk.jpg';
    $('body').css("background-image", 'url(' + imgUrl + ')');
    $('body').css("background-repeat", "repeat");
    $('body').css("background-position", "center");
    $('body').css("background-size", "cover");
    $('#todos').css("color", "white");
    $('#header1').css("color", "#00FF7F");
    $('#weather').css("background-color", "#ffffffaf");
}

// load the web page
export function loadPage() {
    curDate(); // today's date
    randomQuote();
    calender();

    let times = document.getElementsByClassName('t')[0];
    let fens = document.getElementsByClassName('fens')[0];

    let time = 30;
    let f = 0;
    times.innerText = 'Time left：' + time + 's！！';
    fens.innerText = 'Score：' + f + ' points';
}

function curDate() {
    let date = new Date();
    let yy = date.getFullYear();
    let mm = date.getMonth();
    let monthArr = ["January", "February","March", "April", "May", "June", "July", "August", "September", "October", "November","December"];
    mm = monthArr[mm];
    let dd = date.getDate();

    $('#date').html(`Today is ${mm} ${dd}, ${yy}.`);
}

async function randomQuote() {
    const result = await axios({
        method: 'GET',
        url: 'https://api.quotable.io/random'
    });

    let quote = result.data.content;
    let author = result.data.author;

    $('#quote').html(`"${quote}" -- ${author}`);
}

// Variables used in calender
var my_date = new Date();
var my_year = my_date.getFullYear();
var my_month = my_date.getMonth();
var my_day = my_date.getDate();

function calender() {
    var month_name = ["January","Febrary","March","April","May","June","July","Auguest","September","October","November","December"];

    var holder = document.getElementById("days");
    var ctitle = document.getElementById("calendar-title");
    var cyear = document.getElementById("calendar-year");

    var str = "";
	var totalDay = daysMonth(my_month, my_year); //number of days in a month
	var firstDay = dayStart(my_month, my_year); //which weekday the first day of the month is
	var myclass;
	for(var i=1; i<firstDay; i++){ 
		str += "<li></li>"; //add empty slots before the first day
	}
	for(var i=1; i<=totalDay; i++){
		if((i<my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()) || my_year<my_date.getFullYear() || ( my_year==my_date.getFullYear() && my_month<my_date.getMonth())){ 
			myclass = " class='lightgrey'"; //before today, grey
		}else if (i==my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()){
			myclass = " class='blue greenbox'"; //today, green
		}else{
			myclass = " class='darkgrey'"; //after today, dark grey
		}
		str += "<li"+myclass+">"+i+"</li>";
	}
	holder.innerHTML = str; //set date
	ctitle.innerHTML = month_name[my_month]; //set month
	cyear.innerHTML = my_year; //set year
}

function dayStart(month, year) {
	var tmpDate = new Date(year, month, 1);
	return (tmpDate.getDay());
}

function daysMonth(month, year) {
    var month_olympic = [31,29,31,30,31,30,31,31,30,31,30,31];
    var month_normal = [31,28,31,30,31,30,31,31,30,31,30,31];
	var tmp = year % 4;
	if (tmp == 0) {
		return (month_olympic[month]);
	} else {
		return (month_normal[month]);
	}
}

function prevMonth(e) {
    e.preventDefault();
	my_month--;
	if(my_month < 0){
		my_year--;
		my_month = 11;
	};

    calender();
}

function nextMonth(e) {
    e.preventDefault();
	my_month++;
	if(my_month > 11){
		my_year++;
		my_month = 0;
	};

    calender();
}

function viewCalendar(e) {
    e.preventDefault();
    $('#cal').removeClass('hide');
}


function viewGame(e) {
    e.preventDefault();
    $('#box').removeClass('hide');
}


// Add composed todo to the list
function submitNewTodo(e) {
    e.preventDefault();
    // things to check: end time is after start time; check overlap event; if outside then check weather: rain and temperature; sort based on starts time and
    // add to the list of events
    // check event, event cannot be empty

    let starts = $('#starts').val();
    console.log(starts);
    let ends = $('#ends').val();
    let event = $('#event').val();
    let location = $('#location').val();
    let notes = $('#notes').val();

    // check ends > starts
    let starts_num = parseTime(starts);
    let ends_num = parseTime(ends);

    let loc = '';
    if (location !== '') {
        loc = `<div>Location: ${location}</div>`;
    }

    let not = '';
    if (notes !== '') {
        not = `<div>Notes: ${notes}</div>`;
    }

    // add edit and delete, generate random color for its background
    let newTodo = `
    <div class="todo">
        <div>${event}</div>
        <div>from ${starts} to ${ends}</div>

        ${loc}
        ${not}
        </br>

        <input type="image" id="trash" alt="Delete" src="./assets/Delete.png" start="${starts}">
        <input type="image" id="check" alt="Check" src="./assets/Finish.jpeg" start="${starts}">
        <br>
    </div>
    `;

    let f = parseTime(starts);
    let t = parseTime(ends);

    let intervals = (t-f)/30;
    let randomColor = Math.floor(Math.random()*16777215).toString(16);
    randomColor = "#" + randomColor;

    if (event === '' || starts === '' || ends === '') {
        alert('Please specify a new event and when do you plan to do it.');
    } else if (starts_num >= ends_num) {
        alert('End time should be after start time.');
    } else {
        document.getElementById(`e-${starts}`).rowSpan = intervals + '';
        document.getElementById(`e-${starts}`).innerHTML = newTodo;
        document.getElementById(`e-${starts}`).style.gridColumn =  "auto /span " + intervals;
        document.getElementById(`e-${starts}`).style.backgroundColor =  randomColor;
        // $("#e-"+starts).append(newTodo);
        // $('#newCompose').replaceWith(`<button class="but" id="compose">Click Here to Add A New Event</button>`);
    }

    // clear fields
    $('#newTodoForm')[0].reset();
}

// empty that time slot, remove rowSpan attribute
function deleteAToDo(e) {
    e.preventDefault();
    let startTime = e.target.getAttribute('start');
    document.getElementById(`e-${startTime}`).innerHTML = '';
    document.getElementById(`e-${startTime}`).removeAttribute('rowSpan');
    document.getElementById(`e-${startTime}`).style.gridColumn = '';
    document.getElementById(`e-${startTime}`).style.backgroundColor = '';
}

// Strike through the contents within a todo
function completed(e) {
    e.preventDefault();
    let startTime = e.target.getAttribute('start');
    if (document.getElementById(`e-${startTime}`).hasAttribute('text-decoration')) {
        document.getElementById(`e-${startTime}`).removeAttribute('text-decoration');
        let eles = document.getElementById(`e-${startTime}`).querySelectorAll("div");
        for (let i = 0; i < eles.length; i++) {
            eles[i].style.textDecoration = '';
        };
    } else {
        document.getElementById(`e-${startTime}`).setAttribute('text-decoration', 'line-through');
        let eles = document.getElementById(`e-${startTime}`).querySelectorAll("div");
        for (let i = 0; i < eles.length; i++) {
            eles[i].style.textDecoration = 'line-through';
        };
    }
}

function cancelNewTodo(e) {
    e.preventDefault();
    // $('#newCompose').replaceWith(`<button class="but" id="compose">Click Here to Add A New Event</button>`);
    $('#newTodoForm')[0].reset();
}


// get user's current weather
async function curWeather() {
    // get user current location based on IP address
    const result1 = await axios({
        method: 'GET',
        url: 'https://ip-geo-location.p.rapidapi.com/ip/check',
        params: {format: 'json'},
        headers: {
          'x-rapidapi-key': '4226e9e8efmsh1ae9f1e95cd65b5p1a0519jsn2b7c0f60e348',
          'x-rapidapi-host': 'ip-geo-location.p.rapidapi.com'
        }
    }).catch(function (error) {
        console.error(error);
    });

    console.log(result1);
    let lat = result1.data.location.latitude;
    let lon = result1.data.location.longitude;
    let city = result1.data.city.name;
    let countryCode = result1.data.country.code;
    let zipCode = result1.data.postcode;
    let timeZone = result1.data.time.timezone;
    let curTime = result1.data.time.time;
    curTime = curTime.substring(0, 19);

    let cityCountry = city + ', ' + countryCode;
    console.log(cityCountry);

    let fullAddress = city + ', ' + result1.data.area.name + ", " + countryCode + " " + zipCode;

    // get current user's weather
    const curWeather = await axios ({
        method: 'GET',
        url: 'https://community-open-weather-map.p.rapidapi.com/weather',
        params: {
            q: `${cityCountry}`,
            lat: `${lat}`,
            lon: `${lon}`,
            units: 'imperial'
        },
        headers: {
            'x-rapidapi-key': '4226e9e8efmsh1ae9f1e95cd65b5p1a0519jsn2b7c0f60e348',
            'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com'
        }
    }).catch(function (error) {
        console.error(error);
    });

    console.log(curWeather);

    let temp = curWeather.data.main.temp;
    temp = temp + String.fromCharCode(176) + "F";
    let feelsLike = curWeather.data.main.feels_like;
    feelsLike = feelsLike + String.fromCharCode(176) + "F";
    let humidity = curWeather.data.main.humidity;
    humidity = humidity + "%";
    let descript = curWeather.data.weather[0].description;
    let iconCode = curWeather.data.weather[0].icon; // icon code
    let iconImg = "http://openweathermap.org/img/wn/" + `${iconCode}` + "@2x.png";

    $('#weatherContainer').empty();
    let weather = `
        <div>
            <h2>Now the weather in ${fullAddress} is ${descript}.</h2>
            <input type="image" id="cancelWeather" alt="Collapse" src="./assets/Close.png">
            <img src="${iconImg}" alt="Weather icon">
        </div>
        <table style="width:100%" class="wea">
            <tr>
                <th>TEMPERATURE</th>
                <th>HUMIDITY</th>
                <th>FEELS LIKE</th>
            </tr>
            <tr>
                <td>${temp}</td>
                <td>${humidity}</td>
                <td>${feelsLike}</td>
            </tr>
        </table>
        <div>Updated on: ${curTime}</div>
    `;

    $('#weatherContainer').html(weather);
}

// make the calendar close
function collapse(e) {
    e.preventDefault();
    // add hide to calendar
    $('#cal').addClass('hide');
}

function cancelShowWeather(e) {
    e.preventDefault();
    $('#weatherContainer').empty();
}

// add time slots in the table
function parseTime(s) {
    var c = s.split(':');
    return parseInt(c[0]) * 60 + parseInt(c[1]);
}

function convertHours(mins){
    var hour = Math.floor(mins/60);
    var mins = mins%60;
    var converted = pad(hour, 2)+':'+ pad(mins, 2);
    return converted;
}

function pad (str, max) {
    str = str.toString();
    return str.length < max ? pad("0" + str, max) : str;
}

function calculate_time_slot(start_time, end_time){
    let formatted_time;
    let time_slots = new Array();
    for(let i=start_time; i<=end_time; i = i+30){
        formatted_time = convertHours(i);
        time_slots.push(formatted_time);
    }
    return time_slots;
}

// generate time slots and time pickers
function genTimeSlots(startTime) {
    let c = startTime.split(':');
    let starti = c[0] + ":00";
    let start_time = parseTime(starti);
    let endti = "23:30";
    let end_time = parseTime(endti);

    let slots = calculate_time_slot(start_time, end_time);

    let elems = '';

    for (let i = 0; i < slots.length; i++) {
        elems += `
            <tr>
                <td id="t-${slots[i]}" class="times">${slots[i]}</td>
                <td id="e-${slots[i]}" class="events"></td>
            </tr>
        `;
    };

    $('#colNames').after(elems);
    $('#starts').timepicker({
        'minTime': `${starti}`,
	    'maxTime': "23:00",
        'timeFormat': 'HH:mm'
    });

    $('#ends').timepicker({
        'minTime': `${starti}`,
	    'maxTime': "23:30",
        'timeFormat': 'HH:mm',
    });
}


// Jokes
async function jokes(e) {
    e.preventDefault();
    const result = await axios({
        method: 'GET',
        url: 'https://dad-jokes.p.rapidapi.com/random/joke',
        params: {format: 'json'},
        headers: {
            'x-rapidapi-key': '4226e9e8efmsh1ae9f1e95cd65b5p1a0519jsn2b7c0f60e348',
            'x-rapidapi-host': 'dad-jokes.p.rapidapi.com'
        }
    }).catch(function (error) {
        console.error(error);
    });

    let setup = "- " + result.data.body[0].setup;
    let punch = "- " + result.data.body[0].punchline;

    $('#setup').html(setup);
    $('#punchline').html(punch);

    if (!$('#closeJoke').length) {
        $('#punchline').after('<input type="image" id="closeJoke" alt="Close" src="./assets/Close.png"</input>');
    }
}

function closeJoke(e) {
    e.preventDefault();

    $('#setup').empty();
    $('#punchline').empty();
    $('#closeJoke').remove();
}


// game: Beat Dook
function game(e) {
    e.preventDefault();
    let imgs = document.getElementsByClassName('bd');
    let btn = document.getElementById('start');
    let times = document.getElementsByClassName('t')[0];
    let fens = document.getElementsByClassName('fens')[0];
    
    let num = 0;
    let time = 30;
    let f=0;
    btn.style.visibility = 'hidden';
    times.innerText = 'Time left：' + time + 's！！';
    fens.innerText = 'Score：' + f + ' points';
    
    let t2 = setInterval(function () {
        num = Math.floor(Math.random() * imgs.length)
        for (let i = 0; i < imgs.length; i++) {
            imgs[i].style.visibility = 'hidden';
            imgs[i].src = './images/mouse.png';
        }
        imgs[num].style.visibility = 'visible';
        imgs[num].onclick = function (e) {
            e.preventDefault();
            this.src = './images/mouse2.png';
            f++;
            let that = this;
            setTimeout(function () {
                that.style.visibility = 'hidden'
            }, 200);
            fens.innerText = 'Score：' + f + ' points';
        }
    }, 1000);
    
    let t1 = setInterval(function () {
        times.innerText = 'Time left：' + time + 's！！'
        time--;
        if (time < 0) {
            clearInterval(t1);
            clearInterval(t2);
            btn.style.visibility = 'visible';
            for (let j = 0; j < imgs.length; j++) {
                imgs[j].style.visibility = 'hidden';
            };
        };

        if (btn.innerText == 'Start') {
            btn.innerText = 'Restart';
        };
    }, 1000);
}


function closeGame(e) {
    e.preventDefault();

    $('#box').addClass('hide');
}

export async function load() {
    loadPage();
    let $root = $('#root');

    $('body').on('click', '#btnLogIn', login);
    $('body').on('click', '#btnSignUp', signup);
    $('body').on('click', '#btnLogOut', logout);
    // $('body').on('click', '#compose', showNewCompose);
    $root.on('click', '#submitTodo', submitNewTodo);
    $root.on('click', '#cancelNew', cancelNewTodo);

    $root.on('click', '#prev', prevMonth);
    $root.on('click', '#next', nextMonth);
    $root.on('click', '#changeTheme', changeTheme);
    $root.on('click', '#ok', ok);
    $root.on('click', '#getWeather', curWeather);
    $root.on('click', '#viewCal', viewCalendar);
    $root.on('click', '#collapse', collapse);
    $root.on('click', '#cancelWeather', cancelShowWeather);
    $root.on('click', '#close', timeOk);

    // for a todo to be check or deleted
    $root.on('click', '#check', completed);
    $root.on('click', '#trash', deleteAToDo);
    
    // get joke
    $root.on('click', '#getJoke', jokes);
    // close joke
    $root.on('click', '#closeJoke', closeJoke);

    // view game
    $root.on('click', '#start', game);
    $root.on('click', '#viewGame', viewGame);
    // close game
    $root.on('click', '#closeGame', closeGame);

}

$(function() {
    load();
});
