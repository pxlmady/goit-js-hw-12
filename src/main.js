// main.js
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

// Отримання елементів сторінки за їх ідентифікаторами
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const gallery = document.getElementById("gallery");

// Ключ та базова URL для доступу до API Pixabay
const apiKey = "41962828-ff4c1ad2c8e7f95d6127e6141";
const baseUrl = "https://pixabay.com/api/";

// Функція для показу loader
const showLoader = () => {
  const loader = document.createElement('span');
  loader.classList.add('loader');
  document.body.appendChild(loader); // Додаємо loader до body
};

// Функція для приховання loader
const hideLoader = () => {
  const loader = document.querySelector('.loader');
  if (loader) {
    loader.remove();
  }
};

// Ініціалізація SimpleLightbox з налаштуваннями
const lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionSelector: 'img',
    captionType: 'attr',
    captionsData: 'title',
    captionPosition: 'bottom',
    animationSlide: false,
});

// Функція для відображення повідомлення про завантаження
function showLoadingNotification() {
  iziToast.info({
    title: "Info",
    message: "Loading...",
    position: "topCenter",
    timeout: 2000,
  });
}

// Обробник події для форми пошуку
searchForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();

    if (searchTerm === "") {
        iziToast.error({ title: "Error", message: "Please enter a search term" });
        return;
    }

    try {
        showLoadingNotification();
        showLoader();

        // Запит до API Pixabay для отримання зображень
        const response = await fetch(`${baseUrl}?key=${apiKey}&q=${searchTerm}&image_type=photo&orientation=horizontal&safesearch=true`);
        const data = await response.json();

        hideLoader();

        if (data.hits.length === 0) {
            iziToast.info({ title: "Info", message: "Sorry, there are no images matching your search query. Please try again!" });
        } else {
            // Вивід зображень та інформації про них у галереї
            gallery.innerHTML = "";

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
                gallery.appendChild(imageLink);
            });

            lightbox.refresh();
        }
    } catch (error) {
        hideLoader();
        iziToast.error({ title: "Error", message: "An error occurred while fetching images. Please try again later." });
        console.error("Error fetching images:", error);
    }
});
