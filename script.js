// API1: https://github.com/lukePeavey/quotable
// API2: IP Geo Location (https://rapidapi.com/natkapral/api/ip-geo-location/endpoints)
// API3: Open Weather Map (https://rapidapi.com/community/api/open-weather-map?endpoint=53aa6041e4b00287471a2b62)
// API4: Google Places API
// API5: alarm?? Alert user time to sleep????

// show weather based on location

// Autocompletion on location

// Problem1: set mode (light/dark) for user in firebase not work
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
    promise.catch(e => console.log(e.message));
}

function timeOk() {
    // remove popup, display new Todo, add time slots...
    let wakeUpTime = $('#wakeUp').val();

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

/////////// Not work: relogin everytime?////////// may be combine with some user property?
function keepTheme() {
    let user = firebase.auth().currentUser;

    if (user != null) {
        let curUserEmail = user.email;
        let emailStr = curUserEmail.substring(0, curUserEmail.indexOf('@'));
        dbRefUsers.child(emailStr).child("isDark").on('value', function(snapshot) {
            let dark = snapshot.val();

            if (dark) {
                darkMode();
            } else {
                lightMode();
            };
        });
    }
}

function signup(e) {
    e.preventDefault();
    // TO DO: check for real email address
    let email = $('#txtEmail').val();
    let pass = $('#txtPassword').val();
    let auth = firebase.auth();
    let emailStr = `${email}`.substring(0, `${email}`.indexOf('@'));

    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.then(() => {
        dbRefUsers.child(emailStr).set({
            email: `${email}`,
            isDark: false
        });
    });
    promise.catch(e => console.log(e.message));
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
    $('body').css("background-color", "white");
    $('#date').css("color", "black");
    $('#quote').css("color", "black");
    $('#todos').css("color", "black");
}

function darkMode() {
    $('body').css("background-color", "black");
    $('#quote').css("color", "white");
    $('#date').css("color", "white");
    $('#todos').css("color", "white");
}

// load the web page
export function loadPage() {
    curDate(); // today's date
    randomQuote();
    calender();
    keepTheme();
    // newCompose();
    
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
	var totalDay = daysMonth(my_month, my_year); //获取该月总天数
	var firstDay = dayStart(my_month, my_year); //获取该月第一天是星期几
	var myclass;
	for(var i=1; i<firstDay; i++){ 
		str += "<li></li>"; //为起始日之前的日期创建空白节点
	}
	for(var i=1; i<=totalDay; i++){
		if((i<my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()) || my_year<my_date.getFullYear() || ( my_year==my_date.getFullYear() && my_month<my_date.getMonth())){ 
			myclass = " class='lightgrey'"; //当该日期在今天之前时，以浅灰色字体显示
		}else if (i==my_day && my_year==my_date.getFullYear() && my_month==my_date.getMonth()){
			myclass = " class='green greenbox'"; //当天日期以绿色背景突出显示
		}else{
			myclass = " class='darkgrey'"; //当该日期在今天之后时，以深灰字体显示
		}
		str += "<li"+myclass+">"+i+"</li>"; //创建日期节点
	}
	holder.innerHTML = str; //设置日期显示
	ctitle.innerHTML = month_name[my_month]; //设置英文月份显示
	cyear.innerHTML = my_year; //设置年份显示
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


// new Todo
// when, where (outside, indoor, address), how(walk, drive)
// check weather, map
// function newCompose() {
//     let todo = `
//         <div class="todoContainer" id="newCompose">
//             <form>
//                 <textarea id="event" rows="4" cols="70" placeholder="New Event"></textarea>
//                 <br>
//                 <br>

//                 <div id="time">
//                     <label for="starts">starts: </label>
//                     <input type="time" id="starts" name="starts">

//                     <label for="ends">ends: </label>
//                     <input type="time" id="ends" name="ends">
//                 </div>
                
//                 <div id="place">
//                     <p>Choose a place: </p>
//                     <input type="radio" id="home" name="place" value="Stay at home">
//                     <label for="home">Stay at home</label><br>
//                     <input type="radio" id="out" name="place" value="Go out">
//                     <label for="out">Go out</label>
//                 </div>
//                 <br>
//                 <br>

//                 <input id="location" placeholder="Enter a place" type="text"/>
//                 <br>
//                 <br>

//                 <textarea id="notes" rows="3" cols="70" placeholder="Add Notes"></textarea>
//                 <br>

//                 <div>
//                     <button class="but" id="submitTodo">Confirm</button>
//                     <button class="but" id="cancelNew">Cancel</button>
//                 </div>
//             </form>
//         </div>
//     `;

//     $('#header1').after(todo);
// }

// function showNewCompose(e) {
//     e.preventDefault();
//     let $compose = $('#compose');
//     $compose.replaceWith(newCompose());
// }

// Add composed todo to the list
function submitNewTodo(e) {
    e.preventDefault();
    // things to check: end time is after start time; check overlap event; location should require user current location and calculate
    // the time required; if outside then check weather: rain and temperature; sort based on starts time and
    // add to the list of events
    // check event, event cannot be empty

    let $todos = $('#todos');
    let starts = $('#starts').val();
    let ends = $('#ends').val();
    let place = $("input[name='place']:checked").val();
    let event = $('#event').val();
    let location = $('#location').val();
    let notes = $('#notes').val();

    // clear fields
    $('#newTodoForm')[0].reset();

    if (starts > ends) {
        alert('End time should be after start time.');
    }

    let loc = '';
    if (location !== '') {
        loc = `<div>Location: ${location}</div>`;
    }

    let not = '';
    if (notes !== '') {
        not = `<div>Notes: ${notes}</div>`;
    }

    let newTodo = `<div class="todo">
        <div>${event}</div>
        <div>from ${starts} to ${ends}</div>

        ${loc}
        ${not}
    </div>
    `;

    if (event === '') {
        alert('Please specify a new event.');
    } else {
        $todos.append(newTodo);
        // $('#newCompose').replaceWith(`<button class="but" id="compose">Click Here to Add A New Event</button>`);
    }
}

// empty that time slot
function deleteToDo() {

}

function cancelNewTodo() {
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
            <img src="${iconImg}" alt="Weather icon">
        </div>
        <table style="width:100%">
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



    // const result2 = await axios ({
    //     method: 'GET',
    //     url: 'https://community-open-weather-map.p.rapidapi.com/forecast',
    //     params: {
    //         q: `${cityCountry}`, 
    //         lat: `${lat}`,
    //         lon: `${lon}`
    //     },
    //     headers: {
    //       'x-rapidapi-key': '4226e9e8efmsh1ae9f1e95cd65b5p1a0519jsn2b7c0f60e348',
    //       'x-rapidapi-host': 'community-open-weather-map.p.rapidapi.com'
    //     }
    // }).catch(function (error) {
    //     console.error(error);
    // });

    // console.log(result2);
}

// make the calendar close
function collapse(e) {
    e.preventDefault();
    // add hide to calendar
    $('#cal').addClass('hide');
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
    for(let i=start_time; i<=end_time; i = i+60){
        formatted_time = convertHours(i);
        time_slots.push(formatted_time);
    }
    return time_slots;
}

function genTimeSlots(startTime) {
    let c = startTime.split(':');
    let start_time = c[0] + ":00";
    start_time = parseTime(start_time);
    let end_time = "24:00";
    end_time = parseTime(end_time);

    let slots = calculate_time_slot(start_time, end_time);

    let elems = '';

    for (let i = 0; i < slots.length; i++) {
        elems += `
            <tr>
                <td id="${slots[i]}">${slots[i]}</td>
            </tr>
        `;
    };

    $('#colNames').after(elems);
}

export async function load() {
    loadPage();
    let $root = $('#root');

    $('body').on('click', '#btnLogIn', login);
    $('body').on('click', '#btnSignUp', signup);
    $('body').on('click', '#btnLogOut', logout);
    // $('body').on('click', '#compose', showNewCompose);
    $('body').on('click', '#submitTodo', submitNewTodo);

    $root.on('click', '#prev', prevMonth);
    $root.on('click', '#next', nextMonth);
    $root.on('click', '#changeTheme', changeTheme);
    $root.on('click', '#ok', ok);
    $root.on('click', '#getWeather', curWeather);
    $root.on('click', '#viewCal', viewCalendar);
    $root.on('click', '#collapse', collapse);
    $root.on('click', '#close', timeOk);
    // $root.on('click', 'id of button', function);
}

$(function() {
    load();
});



// hourly timeinput
// when to go to bed, alarm api
// payment??