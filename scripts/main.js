navInit();
filterInit();
buildContent();


// Enable nav interactivity
function navInit() {
    const summaryViewButton = document.querySelector('#summary-view-button');
    const byCountryViewButton = document.querySelector('#by-country-view-button');
    const summaryView = document.querySelector('#summary-view');
    const byCountryView = document.querySelector('#by-country-view');
    const byCountryViewDetails = document.querySelector('#by-country-view-details');
    const backToMapLink = document.querySelector('#back-to-map-link');

    summaryViewButton.addEventListener('click', () => {
        summaryView.classList.remove('hidden');
        summaryViewButton.classList.add('nav-button-active');
        byCountryView.classList.add('hidden');
        byCountryViewButton.classList.remove('nav-button-active');
        byCountryViewDetails.classList.add('hidden');
    });

    Array(byCountryViewButton, backToMapLink).forEach(elem => {
        elem.addEventListener('click', () => {
            byCountryView.classList.remove('hidden');
            byCountryViewButton.classList.add('nav-button-active');
            byCountryViewDetails.classList.add('hidden');
            summaryView.classList.add('hidden');
            summaryViewButton.classList.remove('nav-button-active');
        });
    });
};


// Enable country list filering
function filterInit() {
    const countryListSearch = document.querySelector('#country-list-search')
    const countryList = document.querySelector('#country-list')
    
    countryListSearch.addEventListener('keyup', () => {
        const filterValue = countryListSearch.value.toUpperCase();
        const countryListItems = countryList.querySelectorAll('li');

        countryListItems.forEach(item => {
            const itemValue = item.innerHTML;
            if (itemValue.toLocaleUpperCase().indexOf(filterValue) != -1) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}


// Build content based on data
async function buildContent() {
    const mapObject = document.querySelector('#world-map');

    // Await for data.json, alpha2.json and map loaded before proceeding
    const [data, alpha2, map] = await getData('data/data.json', 'data/alpha2.json', mapObject);

    buildSummaryLeft(data);
    buildByCountryMap(data, map);
    buildByCountryList(data, alpha2);
    byCountryInit(data, map, alpha2);
};


// Get data.json, alpha2.json and ensure map is loaded
async function getData(dataPath, alpha2Path, mapObject) {
    const [dataResp, alpha2Resp, ] = await Promise.allSettled([
        fetch(dataPath).then(res => res.json()),
        fetch(alpha2Path).then(res => res.json()),
        new Promise ((resolve) => {mapObject.addEventListener('load', resolve);})
    ]);
    return [dataResp.value, alpha2Resp.value, mapObject.contentDocument]
};

// Build Summary View left panel
function buildSummaryLeft(data) {
    const totalSampleCount = Object.values(data['summary']['country']).reduce((a, b) => a + b);
    document.querySelector('#total-sample-count').innerHTML = Number(totalSampleCount).toLocaleString();

    const totalCountryCount = Object.keys(data['summary']['country']).filter(e => e !== 'NaN').length;
    document.querySelector('#total-country-count').innerHTML = Number(totalCountryCount).toLocaleString();

    const totalYearValues = Object.keys(data['summary']['year_of_collection']).filter(e => e !== 'NaN');
    const totalYearValuesMin = Math.min(...totalYearValues);
    const totalYearValuesMax = Math.max(...totalYearValues);
    document.querySelector('#total-year-range-value').innerHTML = `${totalYearValuesMin} - ${totalYearValuesMax}`;
};


// Build By Country View Map
function buildByCountryMap(data, map) {
    const countries = Object.keys(data['country']);

    // Loop through countries with available data
    countries.forEach(country => {
        const countryGroup = map.querySelector(`#${country}`);
        // Highlight country
        countryGroup.classList.add('country-available');
    });
};


// Build By Country View List
function buildByCountryList(data, alpha2) {
    const countries = Object.keys(data['country']);
    const countryList = document.querySelector('#country-list');

    // Loop through countries with available data
    countries.forEach(country => {
        // Populate By Country View List
        const listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(alpha2[country]));
        listItem.setAttribute('id', `${country}-li`);
        countryList.appendChild(listItem);
    });
};

// Enable By Country View interactivity
function byCountryInit(data, map, alpha2) {
    const countries = Object.keys(data['country']);
    const countryTooltip = document.querySelector('#by-country-view-tooltip');
    const countryTooltipValue = document.querySelector('#by-country-view-tooltip-value');
    const byCountryView = document.querySelector('#by-country-view');
    const byCountryViewDetails = document.querySelector('#by-country-view-details');

    // Loop through countries with available data
    countries.forEach(country => {
        const countryGroup = map.querySelector(`#${country}`);
        const countryLabel = map.querySelector(`#${country}-label`);
        const countryListItem = document.querySelector(`#${country}-li`);

        // Highlight country and show tooltip when mouseover from map element or list element
        Array(countryGroup, countryListItem).forEach(elem => (elem.addEventListener('mouseover', () => {
            countryGroup.classList.add('country-active');
            countryLabel.classList.add('country-label-available');
            countryTooltipValue.innerHTML = `${Number(data['country'][country]['total']).toLocaleString()} Samples`;
            countryTooltip.classList.remove('hidden');
        })));

        // Un-highlight country and hide tooltip when mouseout from map element or list element
        Array(countryGroup, countryListItem).forEach(elem => (elem.addEventListener('mouseout', () => {
            countryGroup.classList.remove('country-active');
            countryLabel.classList.remove('country-label-available');
            countryTooltip.classList.add('hidden');
        })));

        // Enter details view when mouseclick from map element or list element
        Array(countryGroup, countryListItem).forEach(elem => (elem.addEventListener('click', (e) => {
            byCountryView.classList.add('hidden');
            byCountryViewDetails.classList.remove('hidden');

            const countryAlpha2 = getAlpha2(e.target);
            buildByCountryDetails(countryAlpha2, alpha2);
        })));
    });
};


// Extract country alpha2 code from different elements
function getAlpha2(elem) {
    if (elem.nodeName == 'LI') {
        return elem.id.split('-')[0]
    } else {
        while (elem.nodeName !== 'g') {
            elem = elem.parentNode
        }
        return elem.id
    };
}


// Build By Country Details 
function buildByCountryDetails(countryAlpha2, alpha2) {
    const byCountryViewTitle = document.querySelector('#by-country-view-details-title');
    byCountryViewTitle.innerHTML = alpha2[countryAlpha2]
    // TODO
};