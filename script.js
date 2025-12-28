// 1.  Recupero le categorie e creo i pulsanti
fetch('https://fakestoreapi.com/products/categories')
    .then((informazioni) => {
        // console.log(informazioni);
        let result = informazioni.json();
        return result
    })
    .then(categories => {
        // console.log(categories);
        let nav = document.querySelector('nav')

        categories.forEach(category => {
            let button = document.createElement('button');
            button.textContent = category;
            button.addEventListener('click', () => products(category));
            nav.appendChild(button)
        });
    }).catch(err => console.error('Errore nel caricamento delle categorie', err));



// 2.  Scarico i prodotti dalla categoria selezionata

function products(category) {
    fetch(`https://fakestoreapi.com/products/category/${category}`)
        .then(informazioni => informazioni.json())
        .then(products => {
            // console.log(products)
            let main = document.querySelector('main');
            main.replaceChildren();

            products.forEach(product => {
                let article = document.createElement('article');

                let title = document.createElement('h2');
                title.textContent = product.title;

                let img = document.createElement('img');
                img.src = product.image;
                img.alt = product.title;
                img.width = '100';

                let description = document.createElement('p');
                description.textContent = product.description;

                let price = document.createElement('strong');
                price.textContent = `Prezzo: ${product.price}`;


                main.appendChild(article);
                article.append(title, description, img, price);
            })


        })
}