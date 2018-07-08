function renderFriends(data, id, addBTN) {
    data.forEach(item => {
        console.log(item._id)
        document.getElementById(id).innerHTML += `
        <li class="eachFriendLI">
        <img class="eachFriendImg" src="${item.profilePic}" />
         ${item.name} Age: ${item.age} ${addBTN ? `<button onclick='addFriend("${item._id}")'>Add</button>` : ""}
         </li>`
    });
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

            renderFriends([data.data.friend], 'foundFriends', true);
        })
        .catch(err => {
            console.log(err);
        });
}
(async function () {
    axios.get(`/friendss`, {
        headers: {
            Authorization: await localStorage.getItem('token')
        }
    }).then(data => {
        console.log(data);
    })
})();