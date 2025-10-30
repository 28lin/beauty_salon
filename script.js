const filterItems = document.querySelectorAll('.beauty-filter li');
const serviceItems = document.querySelectorAll('.beauty-service');
const beautyContent = document.getElementById('beauty-content');

filterItems.forEach((item) => {
  item.onclick = () => {
    filterItems.forEach((el) => el.classList.remove('active'));
    item.classList.add('active');

    const filterText = item.textContent.toLowerCase();

    serviceItems.forEach((service) => {
      const serviceTitle = service.querySelector('h4').textContent.toLowerCase();
      const serviceDescription = service.querySelector('p').textContent.toLowerCase();
      
      if (filterText === 'все категории услуг') {
        service.style.display = 'flex';
      } else if (filterText.includes('бров')) {
        // для бровей
        if (serviceTitle.includes('бров') || serviceDescription.includes('бров')) {
          service.style.display = 'flex';
        } else {
          service.style.display = 'none';
        }
      } else {
        if (serviceTitle.includes(filterText)) {
          service.style.display = 'flex';
        } else {
          service.style.display = 'none';
        }
      }
    });

    beautyContent.scrollIntoView({ behavior: 'instant' });
  };
});

const serviceField = document.getElementById('service');
const nameField = document.getElementById('name');
const phoneField = document.getElementById('phone');

document.getElementById('order-action').addEventListener('click', function () {
  const fields = [serviceField, nameField, phoneField];
  let hasError = false;

  fields.forEach((field) => {
    if (field.value.trim() === '') {
      field.style.borderColor = 'red';
      hasError = true;
    } else {
      field.style.borderColor = 'pink';
    }
  });

  if (phoneField.value.trim() !== '' && phoneField.value.trim().length < 10) {
      phoneField.style.borderColor = 'red';
      hasError = true;
      alert('Номер телефона должен состоять как минимум из 10 символов.');
  }

  if (!hasError) {
    alert('Спасибо за заявку! Мы скоро свяжемся с вами');
    fields.forEach((field) => (field.value = ''));
  }
});

const scrollToTopButton = document.getElementById('scrollToTop');

window.addEventListener('scroll', function() {
  if (window.pageYOffset > 300) {
    scrollToTopButton.classList.add('visible');
  } else {
    scrollToTopButton.classList.remove('visible');
  }
});

scrollToTopButton.addEventListener('click', function(e) {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

scrollToTopButton.addEventListener('click', function(e) {
  e.preventDefault();
});