/* API Documentation: https://api.artic.edu/docs/ */

// The chosen data fields to view are listed after 'fields=' and separated by a comma.
const artAPI = fetch('https://api.artic.edu/api/v1/artworks?ids=90334,268831,65678,160098,244905,268830,57191,23437,148369,151348,151100,16590,4105,59779,28868,66144,59882,90903,90064,94240&fields=artist_title,artwork_type_title,date_display,id,place_of_origin,image_id,title');

/* TO DOs
--> 
*/

let artArray;
let iiif_url;
let collectionIdArr = [268831,65678,160098,244905,268830,57191,23437,148369,151348,151100,16590,4105,59779,28868,66144,90334,59882,90903,90064,94240];
let favoritesIdArr = [];

const createArtArray = () => {
  return artAPI
  .then(data => data.json())
  .then(object => {
    artArray = object.data;
    iiif_url = object.config.iiif_url;
  })
  .catch(err => err);
}

const displayArtCards = (idArray, classSelector, iconStyle) => {
  for (const id of idArray) {
    for (const artObj of artArray) {
      if (Object.values(artObj).includes(id)) {
        document.querySelector(classSelector).innerHTML += `
        <div id='${artObj.id}' class='art-card'>
          <div class='img-wrapper'>
            <img src='${iiif_url}/${artObj.image_id}/full/300,/0/default.jpg' alt='art image'>
          </div>
          <div class='art-details'>
            <strong>${artObj.title}</strong>
            <div>By: ${artObj.artist_title}, ${artObj.date_display}</div>
            <div>Origin: ${artObj.place_of_origin}</div>
            <div>Artwork Type: ${artObj.artwork_type_title}</div>
          </div>
          <div class='icon-wrapper'>
            <i class="${iconStyle} fa-heart"></i>
          </div>
        </div>`
      }
    }
  }
}

const updateIdArrays = (targetContainer, elmId) => {
  if (targetContainer === '.favorites') {
    collectionIdArr.splice(collectionIdArr.indexOf(elmId), 1);
    favoritesIdArr.push(elmId);
  } else {
    favoritesIdArr.splice(favoritesIdArr.indexOf(elmId), 1);
    collectionIdArr.push(elmId);
  }
}

const updateArtGroups = (targetContainer, elm) => {
  document.querySelector(targetContainer).appendChild(elm);
  const classes = elm.children[2].children[0].classList;
  classes.toggle('fa-regular', targetContainer !== '.favorites');
  classes.toggle('fa-solid', targetContainer === '.favorites');
  updateIdArrays(targetContainer, Number(elm.id));
}

const toggleFavorites = () => {
  const iconArray = Array.from(document.querySelectorAll('.icon-wrapper'));
  for (const icon of iconArray) {
    icon.addEventListener('click', (e) => {
      const artCard = e.target.parentElement;
      const artCardParent = artCard.parentElement;
      Array.from(artCardParent.classList).includes('collection') 
        ? updateArtGroups('.favorites', artCard) 
        : updateArtGroups('.collection', artCard);
    })
  }
}

const pageSetup = async () => {
  await createArtArray();
  displayArtCards(collectionIdArr, '.collection', 'fa-regular');
  displayArtCards(favoritesIdArr, '.favorites', 'fa-solid');
  toggleFavorites();
}

pageSetup();