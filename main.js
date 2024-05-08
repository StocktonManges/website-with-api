/* API Documentation: https://api.artic.edu/docs/ */

// The chosen data fields to view are listed after 'fields=' and separated by a comma.
const artAPI = fetch(
  "https://api.artic.edu/api/v1/artworks?ids=90334,268831,65678,160098,244905,268830,57191,23437,148369,151348,151100,16590,4105,59779,28868,66144,59882,90903,90064,94240&fields=artist_title,artwork_type_title,date_display,id,place_of_origin,image_id,title"
);

let artArray;
let iiif_url;
let sumOfArtworkTypes = {};
let collectionIdArr = [];
let favoritesIdArr = [];
let favsSortArray = [];
let colSortArray = [];

// Pulls information from the API.
const pullData = () => {
  return artAPI
    .then((data) => data.json())
    .then((object) => {
      artArray = object.data;
      iiif_url = object.config.iiif_url;
      for (const obj of artArray) {
        collectionIdArr.push(obj.id);
      }
    })
    .catch((err) => err);
};

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
        </div>`;
      }
    }
  }
};

const displaySumOfArtworkTypes = () => {
  for (const key in sumOfArtworkTypes) {
    document.getElementById("sum-totals").innerHTML += `
    <li>${key}: ${sumOfArtworkTypes[key]}</li>`;
  }
};

// Call the functions necessary to update appropriate idArray and
// sortArray variables once an art card switches groups.
function toggleFavorites() {
  const iconArray = Array.from(document.querySelectorAll(".icon-wrapper"));
  for (const icon of iconArray) {
    icon.addEventListener("click", (e) => {
      const artCard = e.target.parentElement;

      /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
      // Use the turnery operator to create an array of data that can be
      // placed in the repetitive code.
      const params =
        artCard.parentElement.classList[1] === "collection"
          ? [favoritesIdArr, "favorites"]
          : [collectionIdArr, "collection"];
      updateArtCardGroups(`.${params[1]}`, artCard);
      updateIdArrays(`.${params[1]}`, Number(artCard.id));
      const option = document.getElementById(`sort-${params[1]}`).value;
      updateSortArrayData(params[0], option, params[1]);
      /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    });
  }
}

// Updates the group arrays with the IDs of each art card they contain.
const updateIdArrays = (targetContainer, elmId) => {
  /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
  const arr =
    targetContainer === ".favorites"
      ? [collectionIdArr, favoritesIdArr]
      : [favoritesIdArr, collectionIdArr];

  arr[0].splice(arr[0].indexOf(elmId), 1);
  arr[1].push(elmId);
  /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
};

// Moves art card to new group and changes the heart icon.
const updateArtCardGroups = (targetContainer, elm) => {
  document.querySelector(targetContainer).appendChild(elm);
  const classes = elm.children[2].children[0].classList;
  classes.toggle("fa-regular", targetContainer !== ".favorites");
  classes.toggle("fa-solid", targetContainer === ".favorites");
};

// Takes the option from the 'select' element and returns the
// appropriate key for the objects in the 'artArray'.
function getObjectKey(option) {
  let key = "title";
  if (option === "artist") {
    key = "artist_title";
  } else if (option === "artwork type") {
    key = "artwork_type_title";
  } else if (option === "origin") {
    key = "place_of_origin";
  }
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
  group === "collection" ? (colSortArray = array) : (favsSortArray = array);
}

// Defines how the sort array is sorted.
function compare(a, b) {
  let x = a[1].toLowerCase();
  let y = b[1].toLowerCase();
  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  return 0;
}

// Reorders the appropriate sort array based on the data attribute of
// the sort direction button.
function reorderSortArray(group) {
  let direction = document.getElementById(`${group}-btn`).dataset.direction;

  /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
  const param = group === "collection" ? colSortArray : favsSortArray;

  param.sort(compare);
  direction === "a-z" ? null : param.reverse();
  /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
}

// Displays the art cards in the order dictated by the 'sortArray'.
function arrangeArtCards(sortArray, group) {
  reorderSortArray(group);
  for (const array of sortArray) {
    document
      .querySelector(`.${group}`)
      .appendChild(document.getElementById(array[0]));
  }
}

// Add event listeners to apply sort buttons.
const setListenersToButtons = () => {
  const applyButtons = Array.from(document.querySelectorAll(".apply-btn"));
  for (const button of applyButtons) {
    button.addEventListener("click", (e) => {
      const group = e.target.parentElement.id;
      group === "collection"
        ? arrangeArtCards(colSortArray, group)
        : arrangeArtCards(favsSortArray, group);
    });
  }
};

// Add event listeners to sort direction buttons.
const updateSortingButtonText = () => {
  const directionButtons = Array.from(
    document.querySelectorAll(".sort-direction-btn")
  );
  for (const button of directionButtons) {
    button.addEventListener("click", () => {
      /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
      const value = button.dataset.direction === "a-z" ? "z-a" : "a-z";
      button.dataset.direction = value;
      button.textContent = value.toUpperCase().split("").join(" "); // returns 'Z - A' instead of 'z-a'.
      /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    });
  }
};

// Add event listeners to the 'select' elements.
const setSelectListeners = () => {
  const sortList = Array.from(document.querySelectorAll(".sort-options"));
  for (const item of sortList) {
    item.addEventListener("click", (e) => {
      /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
      const params =
        e.target.id === "sort-collection"
          ? [collectionIdArr, "collection"]
          : [favoritesIdArr, "favorites"];

      updateSortArrayData(params[0], e.target.value, params[1]);
      /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/
    });
  }
};

// Changes 'null' values to 'unknown'.
const changeNullToUnknown = () => {
  for (const obj of artArray) {
    for (const index in obj) {
      obj[index] = obj[index] === null ? "unknown" : obj[index];
    }
  }
};

// Gets the sum total of art pieces per medium.
const getSumTotalOfArtTypes = () => {
  for (const obj of artArray) {
    let type = obj.artwork_type_title;
    type.slice(-1) === "s" ? null : (type += "s");
    !sumOfArtworkTypes[type]
      ? (sumOfArtworkTypes[type] = 1)
      : sumOfArtworkTypes[type]++;
  }
};

// Runs the webpage logic once data has been pulled from the API.
const pageSetup = async () => {
  await pullData();
  getSumTotalOfArtTypes();
  displaySumOfArtworkTypes();
  changeNullToUnknown();

  /*vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv*/
  // Calls 'displayArtCards' in a scalable method.
  const arrObj = {
    ".collection": [collectionIdArr, "fa-regular"],
    ".favorites": [favoritesIdArr, "fa-solid"],
  };

  Object.entries(arrObj).forEach(([key, value]) => {
    displayArtCards(value[0], key, value[1]);
  });
  /*^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^*/

  toggleFavorites();
  setSelectListeners();
  updateSortingButtonText();
  setListenersToButtons();
};

pageSetup();
