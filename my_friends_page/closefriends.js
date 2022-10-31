const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users";
const SHOW_URL = BASE_URL + "/api/v1/users/";
const userData = [];
const userPerPage = 12
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const userList = document.querySelector("#user-list");
const paginator = document.querySelector('#paginator')
const closeFriendsList = JSON.parse(localStorage.getItem('closeFriendsList'))
let filteredUser = []

function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += ` <div class="card m-2" style="width: 12rem;" >
                    <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-modal-user-id="${item.id}"  data-bs-toggle="modal" data-bs-target="#user-modal">
                    <div class="card-body">
                      <h5 class="card-title">${item.name} ${item.surname}</h5>
                    </div>
                    <div class="p-3 d-flex justify-content-end">
                      <button type="button" class="btn btn-danger" data-id="${item.id}">x</button>
                    </div>  
                 </div>`;
  });
  userList.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / userPerPage)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function activePaginator(page) {
  const pageItemActive = document.querySelector('.page-item.active')
  if (pageItemActive) {
    pageItemActive.classList.remove('active')
  }

  const pageLinks = document.querySelectorAll('.page-link')
  pageLinks.forEach(item => {
    if (Number(item.dataset.page) === page) {
      item.parentElement.classList.add('active')
    }
  })
}

function getUserByPage(page) {
  const startIndex = (page - 1) * userPerPage
  const data = filteredUser.length ? filteredUser : closeFriendsList
  return data.slice(startIndex, startIndex + userPerPage)
}

function showModal(id) {
  const avatar = document.querySelector(".avatar");
  const userInfo = document.querySelector("#user-info");
  avatar.src = "";
  userInfo.innerHTML = "";
  axios.get(SHOW_URL + id).then((response) => {
    let data = response.data;
    avatar.src = response.data.avatar;
    userInfo.innerHTML = `<p>Name: ${data.name}</p>
              <p>Region: ${data.region}</p>
              <p>Gender: ${data.gender}</p>
              <p>Age: ${data.age}</p>
              <p>Email: ${data.email}</p>`;
  });
}

function removeCloseFriends(id) {
  const userIndex = closeFriendsList.findIndex((item) => item.id === id)
   let currentPage = Math.ceil(userIndex/ userPerPage)
    if (userIndex === 0) {
       currentPage = 1
    } else if ( userIndex % 12 === 0) {
      if (userIndex === closeFriendsList.length - 1) {
        currentPage = Math.ceil(userIndex / userPerPage) 
      } else {
        currentPage = currentPage + 1
      }
    }  
  closeFriendsList.splice(userIndex, 1)
  localStorage.setItem('closeFriendsList', JSON.stringify(closeFriendsList))
  renderUserList(getUserByPage(currentPage))
  renderPaginator(closeFriendsList.length)
  activePaginator(currentPage)
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUser = closeFriendsList.filter((item) => item.name.toLowerCase().includes(keyword) || item.surname.toLowerCase().includes(keyword))
  renderUserList(getUserByPage(1))
  renderPaginator(filteredUser.length)
  activePaginator(1)
})

userList.addEventListener("click", function onClick(event) {
  if (event.target.matches(".card-img-top")) {
    showModal(Number(event.target.dataset.modalUserId));
  } else if (event.target.matches('.btn-success')) {
    addToCloseFriends(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-danger')) {
    removeCloseFriends(Number(event.target.dataset.id))
  }
});

paginator.addEventListener('click', function onClick(event) {
  if (event.target.tagName !== 'A') {
    return
  }
  const targetPage = Number(event.target.dataset.page)
  renderUserList(getUserByPage(targetPage))
  activePaginator(targetPage)
})

renderUserList(getUserByPage(1))
renderPaginator(closeFriendsList.length) 
activePaginator(1)