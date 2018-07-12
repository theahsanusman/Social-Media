; let currentUserId;

function renderFriends(data, id, addBTN, alreadyFriend, chatBTN) {
    data.forEach(item => {
        console.log(item._id);
        document.getElementById(id).innerHTML += `
        <li class="eachFriendLI">
        <img class="eachFriendImg" src="${item.profilePic}" />
         ${item.name} Age: ${item.age} ${addBTN ? `<button onclick='addFriend("${item._id}")'>Add</button>` : ""}
         ${alreadyFriend ? '<button>Added</button>' : ''}
         ${chatBTN ? `<button onClick="startChat('${item._id}')">Chat</button>` : ''}
         </li>`
    });
}

function startChat(id) {
    getElement('#chatWindow').style.display = 'block';
    localStorage.setItem('friendId', id);
    renderPreviousMessages(id);
}

async function renderPreviousMessages(id) {
    axios.get(`/message?friendId=${id}`, { headers: { Authorization: await localStorage.getItem('token') } }).then(data => {
        data.data.messages.forEach(item => {
            currentUserId = data.data.userId;
            renderEachMessage(item, '#chatDiv', data.data.userId);
        })
    }).catch(err => {
        console.log(err);
    });
}

function renderEachMessage(message, id, currentUserId) {
    if (message.userId === currentUserId) {
        return getElement(id).innerHTML += `<li style="color: green;">${message.txt}</li>`;
    }
    getElement(id).innerHTML += `<li>${message.txt}</li>`;
}

async function addFriend(id) {
    axios.post('/friends/add', { friendId: id }, {
        headers: {
            Authorization: await localStorage.token
        }
    }).then(data => { console.log(data); }).catch(err => { console.log(err); })
}

function getElement(ref) {
    return document.querySelector(ref);
}


function signUp() {
    let name = getElement('#name').value,
        age = getElement('#age').value,
        profilePic = getElement('#profilePic').files[0],
        mobileNumber = Number(getElement('#mobileNumber').value),
        password = getElement('#password').value;

    var reader = new FileReader();

    reader.addEventListener("loadend", _ => {
        let base64Data = reader.result
        console.log(name, age, base64Data, mobileNumber, password);
        axios.post('/signUp', {
            name,
            age,
            profilePic: base64Data,
            mobileNumber,
            password
        }, {})
            .then((data, status) => {
                localStorage.setItem('token', data.data.token);
                window.location.replace('/dashboard.html');
            })
            .catch(err => {
                console.log('errrrrrrrrrrrrrrrr', err);
            })
    });

    reader.readAsDataURL(profilePic);

}

function logIn() {
    let mobileNumber = Number(getElement('#mobileNumber').value),
        password = getElement('#password').value;
    axios.post('/signIn', { mobileNumber, password })
        .then((data, status) => {
            localStorage.setItem('token', data.data.token);
            window.location.replace('/dashboard.html');
        })
        .catch(err => {
            console.log(err);
        });
}

async function findFriend() {
    let mobileNumber = getElement('#mobNumber').value;
    axios.get(`/friends/find?mobileNumber=${mobileNumber}`, {
        headers: {
            Authorization: await localStorage.getItem('token')
        }
    })
        .then((data, status) => {
            if (data.data.alreadyFriend) return renderFriends([data.data.foundFriend], 'foundFriends', false, data.data.alreadyFriend);
            renderFriends([data.data.foundFriend], 'foundFriends', true);
        })
        .catch(err => {
            console.log(err);
        });
}
(async function () {
    if (window.location.pathname.indexOf('dashboard') !== -1 || window.location.pathname.indexOf('chat') !== -1) {
        axios.get(`/friendss`, {
            headers: {
                Authorization: await localStorage.getItem('token')
            }
        }).then(data => {
            if (window.location.pathname.indexOf('chat') !== -1) renderFriends(data.data.friends, 'friends', false, false, true);
            else renderFriends(data.data.friends, 'friends');
        })
    }
})();

async function saveFeedBack() {
    let feedBack = getElement('#feedbackT').value;
    axios.post('/feedback', { message: feedBack }, {
        headers: {
            Authorization: await localStorage.getItem('token')
        }
    }).then(data => {
        getElement('#feedbackT').value = '';
    }).catch(err => {
        console.log(err);
    });
}
async function sendMessage() {
    let message = getElement('#message').value;
    axios.post('/message', { message, friendId: await localStorage.getItem('friendId') }, {
        headers: {
            Authorization: await localStorage.getItem('token')
        }
    }).then(data => {
        console.log(data);
        getElement('#message').value = '';
    }).catch(err => {
        console.log(err);
        getElement('#message').value = '';
    });
}

function post() {
    let desc = getElement('#description').value,
        imgFile = getElement('#img').files[0];
    var reader = new FileReader();

    reader.addEventListener("loadend", async _ => {
        let base64Data = reader.result
        axios.post('/posts', { desc, img: base64Data }, {
            headers: {
                Authorization: await localStorage.getItem('token')
            }
        }).then(data => {
            console.log(data);
        }).catch(err => {
            console.log(err);
        });
    });

    reader.readAsDataURL(imgFile);
}

var socket = io.connect("http://localhost:6900");
socket.emit("userInfo", { token: localStorage.getItem('token') })
socket.on('message', data => {
    renderEachMessage(data, '#chatDiv', currentUserId);
})

function renderPosts(data) {
    console.log(data[0])
    getElement('#posts').innerHTML = data.map(post => `<div class="eachPostContainer">
                        <div class="posterInfo">
                            <img src='${post.userId.profilePic}' class="eachPostOwnerPic" />
                            <p class="postOwnerName">${post.userId.name}</p>
                        </div>
                        <div class="postInfo">
                            <img src="${post.img}" class="eachPostImg" />
                            <p>${post.description}</p>
                        </div>
                    </div>`)
}

async function fetchPosts() {
    axios.get('/posts', { headers: { Authorization: await localStorage.getItem('token') } }).then(posts => {
        renderPosts(posts.data.posts);
    }).catch(err => {
        console.log(err);
    })
}