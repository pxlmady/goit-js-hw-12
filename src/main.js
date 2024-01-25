// Імпортуємо необхідні бібліотеки та стилі
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Отримуємо посилання на необхідні DOM-елементи
const searchForm = document.getElementById("searchForm"); // Форма пошуку
const searchInput = document.getElementById("searchInput"); // Поле введення пошукового запиту
const gallery = document.getElementById("gallery"); // Галерея зображень
const loadMoreButton = document.getElementById("loadMoreButton"); // Кнопка "Load more"

// Ключ API та базовий URL для запитів до Pixabay API
const apiKey = "41962828-ff4c1ad2c8e7f95d6127e6141";
const baseUrl = "https://pixabay.com/api/";

// Кількість зображень на сторінці та поточна сторінка
const perPage = 40;
let currentPage = 1;
let firstLoad = true;

// Ініціалізація lightbox для відображення зображень
const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'title',
  captionPosition: 'bottom',
  animationSlide: false,
});

// Функція для показу завантажувача
function showLoader() {
  const loader = document.createElement('span');
  loader.classList.add('loader');
  document.body.appendChild(loader);
}

// Функція для приховання завантажувача
function hideLoader() {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
}

// Функція для показу сповіщення про завантаження
function showLoadingNotification() {
  iziToast.info({
    title: "Info",
    message: "Loading...",
    position: "topCenter",
    timeout: 2000,
  });
}

// Функція для показу кнопки "Load more"
function showLoadMoreButton() {
  loadMoreButton.style.display = "block";
}

// Функція для приховування кнопки "Load more"
function hideLoadMoreButton() {
  loadMoreButton.style.display = "none";
}

// Функція для показу повідомлення про завершення результатів пошуку
function showEndMessage() {
  iziToast.info({
    title: "Info",
    message: "We're sorry, but you've reached the end of search results.",
    position: "topCenter",
  });
}

// Функція для очищення галереї
function clearGallery() {
  gallery.innerHTML = "";
}

// Функція для асинхронного отримання та відображення даних
async function fetchData(searchTerm) {
  try {
    showLoadingNotification();
    showLoader();

    const response = await fetch(`${baseUrl}?key=${apiKey}&q=${searchTerm}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=${perPage}`);
    const data = await response.json();

    hideLoader();

    if (data.hits.length === 0) {
      iziToast.info({ title: "Info", message: "Sorry, there are no images matching your search query. Please try again!" });
    } else {
      if (!gallery) {
        console.error("Error fetching images: Gallery element is null");
        return;
      }

      const imagesToAdd = [];

      data.hits.forEach(image => {
        const imageLink = document.createElement("a");
        imageLink.href = image.largeImageURL;

        const imgElement = document.createElement("img");
        imgElement.src = image.webformatURL;
        imgElement.alt = image.tags;
        imgElement.title = `${image.tags}`;

        const detailsContainer = document.createElement("div");
        detailsContainer.classList.add("image-details");

        const likesElement = document.createElement("p");
        likesElement.textContent = `Likes: ${image.likes}`;

        const viewsElement = document.createElement("p");
        viewsElement.textContent = `Views: ${image.views}`;

        const commentsElement = document.createElement("p");
        commentsElement.textContent = `Comments: ${image.comments}`;

        const downloadsElement = document.createElement("p");
        downloadsElement.textContent = `Downloads: ${image.downloads}`;

        detailsContainer.appendChild(likesElement);
        detailsContainer.appendChild(viewsElement);
        detailsContainer.appendChild(commentsElement);
        detailsContainer.appendChild(downloadsElement);

        imageLink.appendChild(imgElement);
        imageLink.appendChild(detailsContainer);
        
        imagesToAdd.push(imageLink);
      });

      imagesToAdd.forEach(imageLink => {
        gallery.appendChild(imageLink);
      });

      lightbox.refresh();

      if (currentPage * perPage >= data.totalHits) {
        hideLoadMoreButton();
        showEndMessage();
      } else {
        showLoadMoreButton();
        if (!firstLoad) {
          // Получаем высоту одной карточки галереи
          const cardHeight = gallery.lastElementChild.getBoundingClientRect().height;
          // Прокручиваем страницу на высоту двух карточек галереи
          window.scrollBy({ top: cardHeight * 2, behavior: 'smooth' });
        } else {
          firstLoad = false;
        }
      }
    }
  } catch (error) {
    hideLoader();
    iziToast.error({ title: "Error", message: "An error occurred while fetching images. Please try again later." });
    console.error("Error fetching images:", error);
  }
}

// Додамо подію відправки форми для пошуку
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();

  if (searchTerm === "") {
    iziToast.error({ title: "Error", message: "Please enter a search term" });
    return;
  }

  currentPage = 1;
  firstLoad = true;
  clearGallery();
  fetchData(searchTerm);
});

// Додамо подію кліку на кнопці "Load more"
loadMoreButton.addEventListener("click", function () {
  currentPage++;
  fetchData(searchInput.value.trim());
});
