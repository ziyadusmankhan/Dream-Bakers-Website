import { imagePath } from './products.js';
import { observeReveals } from './effects.js';

export function createCakeCard(product) {
  const card = document.createElement('article');
  card.className = 'cake-card';
  const photo = document.createElement('a');
  photo.className = 'cake-image';
  photo.href = `/order.html?cake=${encodeURIComponent(product.id)}`;
  photo.setAttribute('aria-label', `Customize ${product.title}`);
  const img = document.createElement('img');
  img.src = imagePath(product);
  img.srcset = `${imagePath(product, 400)} 400w, ${imagePath(product)} 640w, ${imagePath(product, 1000)} 1000w`;
  img.sizes = '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw';
  img.alt = product.alt; img.width = 640; img.height = 800;
  img.loading = 'lazy'; img.decoding = 'async';
  photo.append(img);
  const copy = document.createElement('div');
  copy.className = 'cake-copy';
  const category = document.createElement('p');
  category.className = 'cake-category'; category.textContent = product.category;
  const heading = document.createElement('h3'); heading.textContent = product.title;
  const description = document.createElement('p'); description.textContent = product.description;
  const link = document.createElement('a');
  link.href = photo.href; link.className = 'text-link'; link.textContent = 'Customize This Cake';
  link.setAttribute('aria-label', `Customize This Cake: ${product.title}`);
  copy.append(category, heading, description, link); card.append(photo, copy);
  return card;
}
export function renderProducts(container, products) {
  container.replaceChildren(...products.map(createCakeCard));
  observeReveals(container);
}
