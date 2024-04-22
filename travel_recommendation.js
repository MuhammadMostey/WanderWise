// hides searchbar from navigation if true
function hideSearchBar(bool) {
  let searchBar = document.querySelector("#searchBar");
  if (bool) {
    searchBar.style.visibility = "hidden";
  } else {
    searchBar.style.visibility = "visible";
  }
}

// gets the file as html content, used by load function
async function getFile(url) {
  try {
    let file = await fetch(url);
    let html = await file.text();
    return html;
  } catch (error) {
    console.error("couldn't load content", error);
  }
}

// loads the content of provided html file
async function load(url) {
  try {
    let main = document.getElementById("main-content");
    main.innerHTML = await getFile(url);
    attachEventListeners();
  } catch (error) {
    console.error("couldn't load content", error);
  }
}

function attachEventListeners() {
  document.getElementById("homeBtn").addEventListener("click", function () {
    load("main.html");
    hideSearchBar(false);
  });

  document.getElementById("aboutUsBtn").addEventListener("click", function () {
    load("about_us.html");
    hideSearchBar(true);
  });

  document
    .getElementById("contactUsBtn")
    .addEventListener("click", function () {
      load("contact_us.html");
      hideSearchBar(true);
    });
}

attachEventListeners();

function bookButtonClick() {
  load("contact_us.html");
  hideSearchBar(true);
  return 0;
}

// fetches recommendations from the provided json file and returns it as js object
async function fetchRecommendations(jsonURL) {
  try {
    const file = await fetch(jsonURL);
    const jsObj = await file.json();
    return jsObj;
  } catch (error) {
    console.error("provide json file for the recommendations", error);
    throw error;
  }
  return 0;
}

function setDestination(card, des) {
  card.querySelector(".card-title").textContent = des.name;
  // card.querySelector(".card-localtime").textContent = getTime(des.timeZone);
  if (des.notFound == 1) {
    card.querySelector(".card-img").src = "";
    card.querySelector(".card-btn").style.display = "none";
  } else {
    card.querySelector(".card-img").src = des.imageUrl;
    card.querySelector(".card-description").textContent = des.description;
    card.querySelector(".card-btn").style.display = "flex";
  }
}

async function showRecommendations(location, country) {
  clearSearch(false);
  if (location == undefined) {
    location = [
      {
        name: "location you're searching for is not found. Try to search for another place 😃",
        found: false,
      },
    ];
  }

  let recommendationsDiv = document.getElementById("recommendations");

  // appending local-bar at the top of the results
  let localBar = document.createElement("div");
  localBar.classList.add("local-bar");
  if (country) {
    country == "brazil" ? (country = "America/Sao_Paulo") : (country = country);
    country == "australia"
      ? (country = "Australia/Sydney")
      : (country = country);
    console.log(country);
    localBar.innerHTML = getTime(country);
  } else {
    localBar.innerHTML = "Local time: search for a country to show local time";
  }

  recommendationsDiv.appendChild(localBar);

  location.forEach((des) => {
    getFile("result_card.html")
      .then((html) => {
        const newCard = document.createElement("div");
        newCard.innerHTML = html;
        recommendationsDiv.appendChild(newCard);
        setDestination(newCard, des); // Pass the new card and destination object
      })
      .catch((error) => console.error("fail to add destination card:", error));
  });
}

// search functionality
async function search() {
  // gets the input field value
  let searchedText = document
    .getElementById("search-input")
    .value.toLowerCase();

  // if the user typed something in the input field for search then it will work
  if (searchedText.length > 0) {
    // gets recommendations file as js object, uses fetchRecommendations async function returns json file after parsing it using fetch and then .json();
    const recommendations = await fetchRecommendations(
      "./travel_recommendation_api.json"
    );

    // matchingRecommendationsKeys var gets keys from destinations and if the value of search include the key
    // keys is array of keys from JS object passed to find function
    var matchingRecommendationsKeys = Object.keys(recommendations).find(
      (keys) => {
        return keys.includes(searchedText);
      }
    );

    // if the searched term is not a key, such as: countries, beaches, temples
    // else if the searched term is a key, such as: countries, beaches, temples
    if (!matchingRecommendationsKeys) {
      // if the searched term is a country in the countries array
      // else the searched term is not a country in the countries array

      // returns country object from the countries array based on
      let result = recommendations.countries.find((country) => {
        return country.name.toLowerCase().includes(searchedText);
      });

      if (result) {
        showRecommendations(result.cities, searchedText); // result.cities is array of objects each a city
      } else {
        showRecommendations(undefined, undefined);
      }
    } else {
      // to check
      if (matchingRecommendationsKeys == "countries") {
        showRecommendations(
          recommendations.countries.flatMap((x) => x.cities),
          undefined
        );
      } else {
        showRecommendations(
          recommendations[matchingRecommendationsKeys],
          undefined
        ); // arg is array of keys such as temples and beaches, recommendations["beaches"]
      }
    }
  }
}

// to check
function clearSearch(resetKeyWord = true) {
  document.querySelector("#recommendations").innerHTML = "";
  if (resetKeyWord) document.querySelector("#searchBar input").value = "";
}

function getTime(timeZone) {
  let localeTime;
  try {
    const options = {
      timeZone: timeZone,
      hour12: true,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    };
    localeTime = new Date().toLocaleTimeString("en-US", options);
    return `Local time: ${localeTime}`;
  } catch (error) {
    console.error("Invalid time zone:", timeZone);
    // Provide a default time zone or handle the error as needed
    localeTime = "Unknown time";
  }
  return `Local time: ${localeTime}`;
}

document.querySelector("#search").addEventListener("click", () => search());
document.querySelector("#searchBar input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    search();
  }
});
document.querySelector("#clear").addEventListener("click", () => clearSearch());
