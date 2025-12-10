type Product = {
  id: number
  name: string
  price: number
  image: string
  rating: number
  category: string
  brand: string
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "SKULL PRINTED JACKET",
    price: 399,
    image: "https://i.pinimg.com/1200x/f3/0f/0d/f30f0d91fea92953aa9eb66c8177b016.jpg",
    rating: 4.8,
    category: "Jacket",
    brand: "Wink",
  },
  {
    id: 2,
    name: "BLACK HOODIE",
    price: 155,
    image: "https://i.pinimg.com/1200x/9e/fa/1c/9efa1c43d720d4f4a1aef2f775570b3b.jpg",
    rating: 4.2,
    category: "Hoodie",
    brand: "Uniqlo",
  },
  {
    id: 3,
    name: "ARM GLOVES",
    price: 250,
    image: "https://i.pinimg.com/1200x/21/bd/3a/21bd3ac4024631f48b915faf8692a085.jpg",
    rating: 4.5,
    category: "Gloves",
    brand: "Zara",
  },
  {
    id: 4,
    name: "TRACK PANTS",
    price: 150,
    image: "https://i.pinimg.com/736x/42/9c/e8/429ce897ccbaa3efc122d47ab18eebe5.jpg",
    rating: 4.9,
    category: "Pants",
    brand: "Wink",
  },
]