/* API Documentation: https://api.artic.edu/docs/ */

// The chosen data fields to view are listed after 'fields=' and separated by a comma.
const artAPI = fetch('https://api.artic.edu/api/v1/artworks?ids=90334,268831,65678,160098,244905,268830,57191,23437,148369,151348,151100,16590,4105,59779,28868,66144,59882,90903,90064,94240&fields=artist_title,artwork_type_title,date_display,id,place_of_origin,image_id,title');

/* TO DOs
- Store 'collectionIdArr' and 'favoritesIdArr' in local storage.
- Style the website.
*/

let artArray;
let iiif_url;
let sumOfArtworkTypes = {};
let collectionIdArr = [268831,65678,160098,244905,268830,57191,23437,148369,151348,151100,16590,4105,59779,28868,66144,90334,59882,90903,90064,94240];
let favoritesIdArr = [];
let favsSortArray = [];
let colSortArray = [];

// Pulls information from the API.
const pullData = () => {
  return artAPI
  .then(data => data.json())
  .then(object => {
    artArray = object.data;
    iiif_url = object.config.iiif_url;
  })
  .catch(err => err);
}

// Adds HTML to the appropriate group containers in order to display the
// art cards.
const displayArtCards = (idArray, classSelector, iconStyle) => {
  for (const id of idArray) {
    for (const artObj of artArray) {
      if (Object.values(artObj).includes(id)) {
        document.querySelector(classSelector).innerHTML += `
        <div id='${artObj.id}' class='art-card' data-medium='${artObj.artwork_type_title}'>
          <div class='img-wrapper'>
            <img src='${iiif_url}/${artObj.image_id}/full/300,/0/default.jpg' alt='art image'>
          </div>
          <div class='art-details'>
            <strong class='title'>${artObj.title}</strong>
            <div><strong>Artist:</strong> ${artObj.artist_title}</div>
            <div><strong>Time Period:</strong> ${artObj.date_display}</div>
            <div><strong>Origin:</strong> ${artObj.place_of_origin}</div>
            <div><strong>Artwork Type:</strong> ${artObj.artwork_type_title}</div>
          </div>
          <div class='icon-wrapper'>
            <i class="${iconStyle} fa-heart"></i>
          </div>
        </div>`
      }
    }
  }
}

const displaySumOfArtworkTypes = () => {
  for (const key in sumOfArtworkTypes) {
    document.getElementById('sum-totals').innerHTML += `
    <li>${key}: ${sumOfArtworkTypes[key]}</li>`
  }
}

// Adds event listener to heart icons to allow marking art cards as favorites.
function toggleFavorites() {
  const iconArray = Array.from(document.querySelectorAll('.icon-wrapper'));
  for (const icon of iconArray) {
    icon.addEventListener('click', (e) => {
      const artCard = e.target.parentElement;
      Array.from(artCard.parentElement.classList).includes('collection')
        ? updateArtCardGroups('.favorites', artCard) 
        : updateArtCardGroups('.collection', artCard);
    })
  }
}

// Updates and resorts the sort arrays after an art card switches groups.
function updateResortSortArrays(currSortArray, newSortArray, elmId, group) {
  for (const array of currSortArray) {
    if (array.includes(elmId)) {
      currSortArray.splice(currSortArray.indexOf(array), 1);
      newSortArray.push(array);
      reorderSortArray(group);
    }
  }
}

// Updates the group arrays with the IDs of each art card they contain.
const updateArrays = (targetContainer, elmId) => {
  if (targetContainer === '.favorites') {
    collectionIdArr.splice(collectionIdArr.indexOf(elmId), 1);
    favoritesIdArr.push(elmId);
    updateResortSortArrays(colSortArray, favsSortArray, elmId, targetContainer);
  } else {
    favoritesIdArr.splice(favoritesIdArr.indexOf(elmId), 1);
    collectionIdArr.push(elmId);
    updateResortSortArrays(favsSortArray, colSortArray, elmId, targetContainer);
  }
}

// Moves art card to new group and changes the heart icon.
const updateArtCardGroups = (targetContainer, elm) => {
  document.querySelector(targetContainer).appendChild(elm);
  const classes = elm.children[2].children[0].classList;
  classes.toggle('fa-regular', targetContainer !== '.favorites');
  classes.toggle('fa-solid', targetContainer === '.favorites');
  updateArrays(targetContainer, Number(elm.id));
}

// Takes the option from the 'select' element and returns the
// appropriate key for the objects in the 'artArray'.
function getObjectKey(option) {
  let key = 'title';
  if (option === 'artist') { key = 'artist_title' }
  else if (option === 'artwork type') { key = 'artwork_type_title'; }
  else if (option === 'origin') { key = 'place_of_origin'; }
  return key;
}

// Updates the appropriate 'sortArray' with arrays containing the id and
// the value of the desired detail of all art cards in the specified group.
function updateSortArrayData(idArray, option, group) {
  let array = [];
  const key = getObjectKey(option);
  for (const item of idArray) {
    for (const obj of artArray) {
      obj.id === item ? array.push([obj.id, obj[key]]) : null;
    }
  }
  group === 'collection' ? colSortArray = array : favsSortArray = array;
}

// Defines how the sort array is sorted.
function compare(a, b) {
  let x = a[1].toLowerCase();
  let y = b[1].toLowerCase();
  if (x < y) {return -1;}
  if (x > y) {return 1;}
  return 0;
}

// Reorders the appropriate sort array based on the data attribute of
// the sort direction button.
function reorderSortArray(group) {
  let direction = document.getElementById(`${group}-btn`).dataset.direction;
  if (group === 'collection') {
    colSortArray.sort(compare);
    direction === 'a-z' ? null : colSortArray.reverse();
  } else {
    favsSortArray.sort(compare);
    direction === 'a-z' ? null : favsSortArray.reverse();
  }
}

// Displays the art cards in the order dictated by the 'sortArray'.
function arrangeArtCards(sortArray, group) {
  reorderSortArray(group);
  for (const array of sortArray) {
    document.querySelector(`.${group}`).appendChild(document.getElementById(array[0]));
  }
}

// Runs the webpage logic once data has been pulled from the API.
const pageSetup = async () => {
  await pullData();
  
  // Gets the sum total of art pieces per medium.
  for (const obj of artArray) {
    let type = obj.artwork_type_title;
    type.slice(-1) === 's' ? null : type += 's';
    !sumOfArtworkTypes[type]
      ? sumOfArtworkTypes[type] = 1
      : sumOfArtworkTypes[type]++;
  }

  displaySumOfArtworkTypes();

  // Changes 'null' values to 'unknown'.
  for (const obj of artArray) {
    for (const index in obj) {
      obj[index] = obj[index] === null ? 'unknown' : obj[index];
    }
  }
  displayArtCards(collectionIdArr, '.collection', 'fa-regular');
  displayArtCards(favoritesIdArr, '.favorites', 'fa-solid');

  toggleFavorites();

  // Add event listeners to the 'select' elements.
  const sortList = Array.from(document.querySelectorAll('.sort-options'));
  for (const item of sortList) {
    item.addEventListener('click', (e) => {
      if (e.target.id === 'sort-collection') {
        updateSortArrayData(collectionIdArr, e.target.value, 'collection');
      } else {
        updateSortArrayData(favoritesIdArr, e.target.value, 'favorites');
      }
    })
  }

  // Add event listeners to sort direction buttons.
  const directionButtons = Array.from(document.querySelectorAll('.sort-direction-btn'));
  for (const button of directionButtons) {
    button.addEventListener('click', () => {
      if (button.dataset.direction === 'a-z') {
        button.dataset.direction = 'z-a';
        button.textContent = 'Z - A';
      } else {
        button.dataset.direction = 'a-z';
        button.textContent = 'A - Z';
      }
    })
  }

  // Add event listeners to apply sort buttons.
  const applyButtons = Array.from(document.querySelectorAll('.apply-btn'))
  for (const button of applyButtons) {
    button.addEventListener('click', (e) => {
      const group = e.target.parentElement.id
      reorderSortArray(group);
      let sortArray;
      group === 'collection'
        ? sortArray = colSortArray
        : sortArray = favsSortArray;
      for (const array of sortArray) {
        document.querySelector(`.${group}`).appendChild(document.getElementById(array[0]));
      }
    })
  }
}

pageSetup();