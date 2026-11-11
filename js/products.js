// Stable IDs link to actual supplied designs. Flavours and prices are separate.
export const products = [
  {id:'1',title:'Butterfly fairy cake',category:'Character cakes',image:'B1',description:'Pink frosting, butterfly wings and a fairy-inspired birthday topper.',alt:'Pink birthday cake with large blue and pink butterfly wings and a fairy topper'},
  {id:'2',title:'Lavender butterflies',category:'Floral & butterfly cakes',image:'B2',description:'A soft lavender finish with delicate butterfly decorations.',alt:'Lavender round cake decorated with purple butterflies'},
  {id:'3',title:'Princess Sofia cake',category:'Character cakes',image:'B3',description:'A purple princess dress design with a Sofia character topper.',alt:'Purple Princess Sofia birthday cake with a piped dress and butterfly toppers'},
  {id:'4',title:'Turquoise celebration',category:'Celebration cakes',image:'B4',description:'Turquoise piped swirls and silver-toned details.',alt:'Turquoise celebration cake with piped rosettes and silver decorations'},
  {id:'5',title:'Gold & pearl birthday',category:'Celebration cakes',image:'B5',description:'White textured frosting with gold and black sphere decorations.',alt:'White birthday cake with gold accents and black and gold sphere toppers'},
  {id:'6',title:'Blue daisy cake',category:'Floral & butterfly cakes',image:'B6',description:'Pale blue frosting, small daisies and a birthday message.',alt:'Pale blue round birthday cake decorated with white daisies'},
  {id:'7',title:'Pastel unicorn cake',category:'Character cakes',image:'B7',description:'A pastel blue unicorn design with butterflies and colorful spheres.',alt:'Pastel blue unicorn birthday cake with pink and purple spheres and butterflies'}
];
export function getProduct(id) { return products.find(product => product.id === String(id)); }
export function imagePath(product, width = 640) { return `/assets/cakes/optimized/${product.image}-${width}.webp`; }
