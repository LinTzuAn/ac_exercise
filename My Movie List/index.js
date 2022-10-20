const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const modeControler = document.querySelector('#mode-controler')


function renderMovieList(data) {
  let rawHTML = ''
  if (dataPanel.dataset.display === 'list') {
    rawHTML += '<ul class="list-group">'
    data.forEach((item) => {
        rawHTML += `<li class="list-group-item d-flex justify-content-between align-items-center fs-4">${item.title} 
        <div>
          <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button type="button" class="btn btn-white btn-add-favorite text-danger" data-id="${item.id}"><i class="fa-regular fa-heart"></i></button>`
    })
    rawHTML += '</ul>'
  } else if (dataPanel.dataset.display === 'card') {
    data.forEach(item => {
      rawHTML += `<div class="col-sm-3">
      <div class="mb-2">
      <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">
                More
              </button>
              <button class="btn btn-light btn-add-favorite text-danger" data-id="${item.id}"><i class="fa-regular fa-heart"></i></button>
            </div>
          </div>
        </div>
      </div>`
    })
  }
  dataPanel.innerHTML = rawHTML
} 

function renderPaginator(amount) {
  const numberOFPages = Math.ceil(amount / MOVIES_PER_PAGE)

  let rawHTML =''
  for (let page = 1; page <= numberOFPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    paginator.innerHTML = rawHTML
  }
}
 
function activePaginator(page) {
  const pageItemActive = document.querySelector('.page-item.active')
  const pageLinks = document.querySelectorAll('.page-link')

  if (pageItemActive) {
    pageItemActive.classList.remove('active')
  }

  pageLinks.forEach((item) => {
    if (Number(item.dataset.page) === page) {
      item.parentElement.classList.add('active')
    }
  })
 
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  
  modalTitle.innerHTML = ''
  modalImage.innerHTML = ''
  modalDate.innerHTML = ''
  modalDescription.innerHTML = ''

  axios
  .get(INDEX_URL + id)
  .then((response) => {
    const data = response.data.results
    modalTitle.innerHTML = data.title
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="">`
    modalDate.innerHTML = 'Release Date: ' + data.release_date 
    modalDescription.innerHTML = data.description
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id )

  if (list.some((movie) => movie.id === id)) {
    return alert('This movie has already been added.')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies',JSON.stringify(list))
}

modeControler.addEventListener('click', function onControlerClicked(event) {
  const currentPage = Number(document.querySelector('.page-item.active').firstElementChild.dataset.page)
  if(event.target.matches('.card-mode')) {
    dataPanel.dataset.display = 'card'
    renderMovieList(getMoviesByPage(currentPage))
  } else if (event.target.matches('.list-mode')) {
    dataPanel.dataset.display = 'list'
    renderMovieList(getMoviesByPage(currentPage))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  } 
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
  activePaginator(1)
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const targetPage = (Number(event.target.dataset.page))
  renderMovieList(getMoviesByPage(targetPage))
  activePaginator(targetPage)
})

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
    activePaginator(1)
    
  })
  .catch((err) => console.log(err))

modeControler.style.cssText += 'cursor:pointer'