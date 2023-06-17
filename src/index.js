document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const gallery = document.querySelector('.gallery');
  const loadMoreBtn = document.querySelector('.load-more');
  const BASE_URL = 'https://pixabay.com/api/';
  const API_KEY = '37312100-865d32ca69dd36d98aea990c9';
  const PER_PAGE = 40;
  let currentPage = 1;
  let currentSearchQuery = '';
  let totalHits = 0;
  let totalPages = 0;
  let searchQuery = ''; 

  loadMoreBtn.style.display = 'none';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    searchQuery = e.target.elements.searchQuery.value.trim(); 
    if (searchQuery) {
      currentSearchQuery = searchQuery;
      currentPage = 1;
      totalHits = 0;
      gallery.innerHTML = '';
      await searchImages(searchQuery, currentPage);
    }
  });

  loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    currentPage = Math.min(currentPage, totalPages);
    try {
      await searchImages(currentSearchQuery, currentPage); 
    } catch (error) {
      console.error(error);
    }
  });

  async function searchImages(query, page) {
    const url = `${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(
      query
    )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${PER_PAGE}`;
    try {
      const response = await axios.get(url);
      const { data } = response;
      totalHits = data.totalHits;

      if (data.hits.length === 0) {
        if (currentPage === 1) {
          gallery.innerHTML = '';
        }
        showNotification(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        if (currentPage === 1) {
          gallery.innerHTML = '';
        }
        data.hits.forEach((image) => {
          const card = createImageCard(image);
          gallery.appendChild(card);
        });
        showLoadMoreButton(data.hits.length);
      }

      totalPages = Math.ceil(totalHits / PER_PAGE); 

      if (currentPage >= totalPages) {
        loadMoreBtn.style.display = 'none'; 
      } else {
        loadMoreBtn.style.display = 'block'; 
      }
    } catch (error) {
      console.error(error);
      showNotification('An error occurred while fetching images. Please try again later.');
    }
  }

  function createImageCard(image) {
    const card = document.createElement('div');
    card.classList.add('photo-card');

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');

    const likes = createInfoItem('Likes', image.likes);
    const views = createInfoItem('Views', image.views);
    const comments = createInfoItem('Comments', image.comments);
    const downloads = createInfoItem('Downloads', image.downloads);

    info.appendChild(likes);
    info.appendChild(views);
    info.appendChild(comments);
    info.appendChild(downloads);

    card.appendChild(img);
    card.appendChild(info);

    return card;
  }

  function createInfoItem(label, value) {
    const item = document.createElement('p');
    item.classList.add('info-item');
    item.innerHTML = `<b>${label}</b> <span>${value}</span>`;
    return item;
  }

  function showLoadMoreButton(length) {
  if (length < PER_PAGE) {
    loadMoreBtn.style.display = 'none'; 
  } else {
    loadMoreBtn.style.display = 'block'; 
  }
}
  

  function showNotification(message) {
    Notiflix.Notify.failure(message);
  }
});